import { v4 as uuidv4 } from 'uuid';
import pkg from '@xenova/transformers';
import readline from 'readline';

const { pipeline } = pkg;

class Buntan {
    private pipe:any = null;
    private DB:Map<string,IDocument[]> = new Map();
    constructor() {}

    async init() {
        this.pipe = await pipeline('embeddings','sentence-transformers/paraphrase-albert-base-v2');
        return this;
    }

    public create_or_get_collection(name:string) {
        if (!this.DB.has(name)) {
            this.DB.set(name, []);
        }
        return this.DB.get(name);
    }

    public async insert(collection:string, data:string, metadata?:Record<any,any>) {
        const vec = await this.embed_string(data);
        const doc = {
            _id: uuidv4(),
            embeddings: vec,
            data,
            metadata
        }
        this.create_or_get_collection(collection)?.push(doc);
        return doc;
    }

    public async query_similarity(collection:string, data:string, top:number = 10, normalize?:boolean) {
        const vec = await this.embed_string(data);
        const docs = this.create_or_get_collection(collection);
        if (!docs) {
            return [];
        }
        let results = docs.map((doc) => {
            return {
                _id: doc._id,
                score: this.cos_sim(doc.embeddings.data, vec.data),
                data: doc.data,
                metadata: doc.metadata
            }
        }).sort((a,b) => b.score - a.score).slice(0,top);
        if (normalize) {
            const max = results.at(0)?.score as number;
            const min = results.at(-1)?.score as number;
            const range = max - min;
            results = results.map((x) => {
                return {
                    ...x,
                    score: (x.score - min) / range
                }
            });
        }
        return results;
    }

    public query_by_id(collection:string, id:string) {
        const docs = this.create_or_get_collection(collection);
        if (!docs) return null;
        return docs.find((doc) => doc._id === id);
    }

    public query_by_metadata(collection:string, metadata:Record<any,any>) {
        const docs = this.create_or_get_collection(collection);
        if (!docs) return [];
        return docs.filter((doc) => {
            return Object.keys(metadata).every((key) => doc.metadata?.[key] === metadata[key]);
        });
    }

    public delete_by_id(collection:string, id:string) {
        const docs = this.create_or_get_collection(collection);
        if (!docs) return null;
        const idx = docs.findIndex((doc) => doc._id === id);
        if (idx === -1) return null;
        return docs.splice(idx,1)[0];
    }

    private async embed_string(str:string):Promise<IEmbedding> {
        const vec = await this.pipe(str);
        return vec
    }

    private dot(arr1:Float32Array, arr2:Float32Array):number {
        return arr1.reduce((acc, val, i) => acc + val * arr2[i], 0);
    }

    private cos_sim(arr1:Float32Array, arr2:Float32Array) {
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

    private magnitude(arr:Float32Array) {
        return Math.sqrt(arr.reduce((acc, val) => acc + val * val, 0));
    }
    
}

export default Buntan