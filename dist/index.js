import { v4 as uuidv4 } from "uuid";
import pkg from "@xenova/transformers";
const { pipeline, env } = pkg;
class Buntan {
    pipe = null;
    DB = new Map();
    repo_name = "rithwik-db/cleaned-e5-large-unsupervised-8";
    models_loaded = [];
    constructor(options = {}) {
        if (options?.remote == false) {
            env.localURL = options?.models_dir;
            env.remoteModels = false;
        }
        if (options?.remote_url) {
            env.remoteURL = `https://huggingface.co/${options?.remote_url}/resolve/main/onnx/quantized/`;
        }
        else {
            env.remoteURL =
                "https://huggingface.co/braintacles/onnx-models/resolve/main/onnx/quantized/";
        }
        if (options?.repo_name) {
            this.repo_name = options.repo_name;
        }
    }
    async init() {
        if (Array.isArray(this.repo_name)) {
            this.pipe = [];
            for (const repo of this.repo_name) {
                console.log(`Loading model from ${repo}`);
                this.pipe.push(await pipeline("embeddings", repo));
                this.models_loaded.push(repo);
            }
            console.log("Models loaded");
        }
        else {
            console.log(`Loading model from ${this.repo_name}`);
            this.pipe = await pipeline("embeddings", this.repo_name);
            this.models_loaded.push(this.repo_name);
            console.log("Model loaded");
        }
        return this;
    }
    create_or_get_collection(name) {
        if (!this.DB.has(name)) {
            this.DB.set(name, []);
        }
        return this.DB.get(name);
    }
    async insert_one(collection, data, metadata) {
        const vec = await this.embed_string(data);
        const doc = {
            _id: uuidv4(),
            embeddings: vec,
            data,
            metadata,
        };
        this.create_or_get_collection(collection)?.push(doc);
        return doc;
    }
    async insert_many(collection, docs) {
        const documents = await Promise.all(docs.map(async (doc) => {
            const vec = await this.embed_string(doc.data);
            return {
                _id: uuidv4(),
                embeddings: vec,
                data: doc.data,
                metadata: doc.metadata,
            };
        }));
        this.create_or_get_collection(collection)?.push(...documents);
        return documents;
    }
    async query_similarity(collection, data, options = {}) {
        const vec = await this.embed_string(data);
        let docs = this.create_or_get_collection(collection);
        if (!docs) {
            return [];
        }
        if (options?.filter) {
            if (Object.keys(options.filter).length > 0) {
                docs = docs.filter((doc) => {
                    let metadata = doc.metadata;
                    if (!metadata)
                        return false;
                    let keys = Object.keys(options.filter);
                    for (const key of keys) {
                        if (metadata[key] != options.filter[key]) {
                            return false;
                        }
                    }
                    return true;
                });
            }
        }
        let results = docs
            .map((doc) => {
            return {
                _id: doc._id,
                score: this.calculate_score(doc.embeddings, vec),
                data: doc.data,
                metadata: doc.metadata,
                embeddings: doc.embeddings
            };
        })
            .sort((a, b) => {
            if (Array.isArray(a.score)) {
                return (b.score.reduce((acc, val) => acc + val, 0) -
                    a.score.reduce((acc, val) => acc + val, 0));
            }
            return b.score - a.score;
        })
            .slice(0, options.top || 10);
        if (options.normalize) {
            const max = results.at(0)?.score;
            const min = results.at(-1)?.score;
            const range = max - min;
            results = results.map((x) => {
                if (Array.isArray(x.score)) {
                    return {
                        ...x,
                        score: x.score.map((y) => (y - min) / range),
                    };
                }
                return {
                    ...x,
                    score: x.score - min / range,
                };
            });
        }
        return results;
    }
    query_by_id(collection, id) {
        const docs = this.create_or_get_collection(collection);
        if (!docs)
            return null;
        return docs.find((doc) => doc._id === id);
    }
    query_by_metadata(collection, metadata) {
        const docs = this.create_or_get_collection(collection);
        if (!docs)
            return [];
        return docs.filter((doc) => {
            return Object.keys(metadata).every((key) => doc.metadata?.[key] === metadata[key]);
        });
    }
    delete_one(collection, id) {
        let docs = this.DB.get(collection);
        if (!docs)
            return null;
        docs = docs.filter((doc) => doc._id !== id);
        this.DB.set(collection, docs);
        return this.DB.get(collection);
    }
    delete_many(collection, ids) {
        let docs = this.DB.get(collection);
        if (!docs)
            return [];
        docs = docs.filter((doc) => !ids.includes(doc._id));
        this.DB.set(collection, docs);
        return this.DB.get(collection);
    }
    getMemoryUsage(unit) {
        // @ts-ignore
        if (typeof window !== "undefined") {
            const jsonString = JSON.stringify([...this.DB]);
            const encoder = new TextEncoder();
            const db_byteLength = encoder.encode(jsonString).length;
            if (!unit)
                return db_byteLength;
            return this.convertMemoryUsage(db_byteLength, unit);
        }
        const jsonString = JSON.stringify([...this.DB]);
        const db_byteLength = Buffer.byteLength(jsonString);
        if (!unit)
            return db_byteLength;
        return this.convertMemoryUsage(db_byteLength, unit);
    }
    convertMemoryUsage(bytes, unit) {
        const units = {
            b: 1,
            kb: 1024,
            mb: 1024 * 1024,
            gb: 1024 * 1024 * 1024,
        };
        const multiplier = units[unit];
        return bytes / multiplier;
    }
    async embed_string(str) {
        if (Array.isArray(this.pipe)) {
            const vecs = [];
            for (const pipe of this.pipe) {
                vecs.push(await pipe(str));
            }
            return vecs;
        }
        const vec = await this.pipe(str);
        return vec;
    }
    dot(arr1, arr2) {
        return arr1.reduce((acc, val, i) => acc + val * arr2[i], 0);
    }
    calculate_score(arr1, arr2) {
        if (Array.isArray(arr1)) {
            return arr1.map((x, i) => {
                if (Array.isArray(arr2)) {
                    return this.cos_sim(x.data, arr2[i].data);
                }
                else {
                    return this.cos_sim(x.data, arr2.data);
                }
            });
        }
        else {
            if (Array.isArray(arr2)) {
                return arr2.map((x) => {
                    return this.cos_sim(arr1.data, x.data);
                });
            }
            else {
                return this.cos_sim(arr1.data, arr2.data);
            }
        }
    }
    cos_sim(arr1, arr2) {
        // Calculate dot product of the two arrays
        const dotProduct = this.dot(arr1, arr2);
        // Calculate the magnitude of the first array
        const magnitudeA = this.magnitude(arr1);
        // Calculate the magnitude of the second array
        const magnitudeB = this.magnitude(arr2);
        // Calculate the cosine similarity
        const cosineSimilarity = dotProduct / (magnitudeA * magnitudeB);
        return cosineSimilarity;
    }
    magnitude(arr) {
        return Math.sqrt(arr.reduce((acc, val) => acc + val * val, 0));
    }
}
export { Buntan };
export default Buntan;
//# sourceMappingURL=index.js.map