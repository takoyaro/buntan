import { LogLevels } from "./Buntan.js";
import { calculate_score, magnitude } from "./utils.js";
import { v4 as uuidv4 } from "uuid";
class Collection {
    LOG_LEVEL;
    PIPE;
    name;
    documents = [];
    constructor(db, name, pipe) {
        this.LOG_LEVEL = db.log_level;
        this.name = name;
        this.PIPE = pipe;
        if (this.LOG_LEVEL >= 1) {
            console.debug(`[Buntan][INFO] Created collection ${name}`);
        }
    }
    async embed_string(str) {
        let embedding = await this.PIPE(str);
        embedding.magnitude = magnitude(embedding.data);
        return embedding;
    }
    async load_collection(docs) {
        if (docs.every(doc => doc._id.length == 36 && doc.data.length > 0)) {
            if (docs.some(doc => !doc.embeddings)) {
                if (this.LOG_LEVEL >= 2) {
                    console.info(`[Buntan][WARN] Imported documents have no embeddings, embedding ${docs.length} documents...`);
                }
                docs = await Promise.all(docs.map(async (doc) => {
                    return {
                        ...doc,
                        embeddings: await this.embed_string(doc.data),
                    };
                }));
            }
            else {
                if (this.LOG_LEVEL == LogLevels.ALL) {
                    console.debug(`[Buntan][DEBUG] Imported documents have embeddings, skipping embedding...`);
                }
                docs = docs.map(doc => {
                    return {
                        ...doc,
                        embeddings: {
                            ...doc.embeddings,
                            data: new Float32Array(doc.embeddings.data),
                        },
                    };
                });
            }
            this.documents = docs;
        }
        else {
            if (this.LOG_LEVEL >= LogLevels.ERROR) {
                console.warn(`[Buntan][ERROR] Invalid documents passed to load_collection. Ignoring...`);
            }
        }
        return this;
    }
    async query_similarity(data, options = {}) {
        const vec = await this.embed_string(data);
        if (this.documents.length == 0) {
            if (this.LOG_LEVEL == LogLevels.ALL) {
                console.debug(`[Buntan][DEBUG] No documents in collection ${this.name}, returning empty array...`);
            }
            return [];
        }
        let results = [];
        if (options?.filter) {
            if (Object.keys(options.filter).length > 0) {
                let filter = options.filter;
                results = this.documents.filter(doc => {
                    /**
                     * * The filter currently only works on metadata. If a filter is passed but a document has no metadata, it will be ignored.
                     */
                    if (!doc.metadata)
                        return false;
                    let keys = Object.keys(filter);
                    for (const key of keys) {
                        if (doc.metadata[key] !=
                            options.filter[key]) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            if (this.LOG_LEVEL >= LogLevels.INFO) {
                console.info("[Buntan][INFO] Empty filter passed to query_similarity, returning all documents...");
            }
        }
        results = this.documents
            .map(doc => {
            return {
                _id: doc._id,
                score: calculate_score(doc.embeddings, vec),
                data: doc.data,
                metadata: doc.metadata,
                embeddings: doc.embeddings,
            };
        })
            .sort((a, b) => {
            return b.score - a.score;
        });
        if (options.normalize) {
            const max = results.at(0)?.score;
            const min = results.at(-1)?.score;
            const range = max - min;
            results = results.map(x => {
                return {
                    ...x,
                    score: x.score - min / range,
                };
            });
        }
        if (options.top) {
            return results.slice(0, options.top);
        }
        return results;
    }
    query_by_id(id) {
        if (this.documents.length == 0)
            return null;
        return this.documents.find(doc => doc._id === id);
    }
    query_by_metadata(metadata) {
        if (this.documents.length == 0)
            return [];
        return this.documents.filter(doc => {
            return Object.keys(metadata).every(key => doc.metadata?.[key] === metadata[key]);
        });
    }
    delete_one(id) {
        if (this.documents.length == 0)
            return null;
        this.documents = this.documents.filter(doc => doc._id !== id);
        return this.documents;
    }
    delete_many(ids) {
        if (this.documents.length == 0)
            return [];
        this.documents = this.documents.filter(doc => !ids.includes(doc._id));
        return this.documents;
    }
    async insert_one(data, metadata) {
        const doc = {
            _id: uuidv4(),
            embeddings: await this.embed_string(data),
            data,
            metadata,
        };
        this.documents.push(doc);
        return doc;
    }
    async insert_many(docs) {
        const documents = await Promise.all(docs.map(async (doc) => {
            return this.insert_one(doc.data, doc.metadata);
        }));
        return documents;
    }
}
export default Collection;
//# sourceMappingURL=Collection.js.map