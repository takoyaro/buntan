import { v4 as uuidv4 } from 'uuid';
import pkg from '@xenova/transformers';

const { pipeline,env } = pkg;

class Buntan {
    private pipe:any = null;
    private DB:Map<string,IDocument[]> = new Map();
    private repo_name:string|string[] = 'rithwik-db/cleaned-e5-large-unsupervised-8';
    public models_loaded:string[] = [];

    constructor(options:IBuntanOptions={}) {
        if (options?.remote==false) {
            env.localURL = options?.models_dir;
            env.remoteModels = false;
        }
        if (options?.remote_url) {
            env.remoteURL = `https://huggingface.co/${options?.remote_url}/resolve/main/onnx/quantized/`;
        }
        else{
            env.remoteURL = "https://huggingface.co/braintacles/onnx-models/resolve/main/onnx/quantized/"
        }
        if (options?.repo_name) {
            this.repo_name = options.repo_name;
        }
    }

    async init() {
        if(Array.isArray(this.repo_name)) {
            this.pipe = [];
            for (const repo of this.repo_name) {
                console.log(`Loading model from ${repo}`);
                this.pipe.push(await pipeline('embeddings', repo));
                this.models_loaded.push(repo);
            }
            console.log('Models loaded');
        } else {
            console.log(`Loading model from ${this.repo_name}`);
            this.pipe = await pipeline('embeddings', this.repo_name);
            this.models_loaded.push(this.repo_name);
            console.log('Model loaded');
        }
        return this;
    }

    public create_or_get_collection(name:string) {
        if (!this.DB.has(name)) {
            this.DB.set(name, []);
        }
        return this.DB.get(name);
    }

    public async insert(collection:string, data:string, metadata?:Record<any,any>):Promise<IDocument> {
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
                score: this.calculate_score(doc.embeddings, vec),
                data: doc.data,
                metadata: doc.metadata
            }
        }).sort((a,b) => {
            if (Array.isArray(a.score)) {
                return (b.score as number[]).reduce((acc, val) => acc + val, 0) - (a.score as number[]).reduce((acc, val) => acc + val, 0);
            }
            return (b.score as number) - (a.score as number);
        }).slice(0,top);
        if (normalize) {
            const max = results.at(0)?.score as number;
            const min = results.at(-1)?.score as number;
            const range = max - min;
            results = results.map((x) => {
                if (Array.isArray(x.score)) {
                    return {
                        ...x,
                        score: (x.score as number[]).map((y) => (y - min) / range)
                    }
                }
                return {
                    ...x,
                    score: (x.score as number) - min / range
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

    public getMemoryUsage(unit?: "b" | "kb" | "mb" | "gb"): number {
        // @ts-ignore
        if (typeof window !== 'undefined') {
            const jsonString = JSON.stringify([...this.DB]);
            const encoder = new TextEncoder();
            const db_byteLength = encoder.encode(jsonString).length;
            if(!unit) return db_byteLength;
            return this.convertMemoryUsage(db_byteLength,unit);
        } 
        const jsonString = JSON.stringify([...this.DB]);
        const db_byteLength = Buffer.byteLength(jsonString);
        if(!unit) return db_byteLength;
        return this.convertMemoryUsage(db_byteLength,unit);
    }

    private convertMemoryUsage(bytes:number,unit: "b" | "kb" | "mb" | "gb"): number {
      const units = {
        b: 1,
        kb: 1024,
        mb: 1024 * 1024,
        gb: 1024 * 1024 * 1024,
      };
      const multiplier = units[unit];
      return bytes / multiplier;
    }

    private async embed_string(str:string):Promise<IEmbedding|IEmbedding[]> {
        if (Array.isArray(this.pipe)) {
            const vecs = [];
            for (const pipe of this.pipe) {
                vecs.push(await pipe(str));
            }
            return vecs;
        }
        const vec = await this.pipe(str);
        return vec
    }

    private dot(arr1:Float32Array, arr2:Float32Array):number {
        return arr1.reduce((acc, val, i) => acc + val * arr2[i], 0);
    }

    private calculate_score(arr1:IEmbedding|IEmbedding[],arr2:IEmbedding|IEmbedding[]){
        if (Array.isArray(arr1)) {
            return arr1.map((x,i) => {
                if (Array.isArray(arr2)) {
                    return this.cos_sim(x.data, arr2[i].data)
                }
                else{
                    return this.cos_sim(x.data, arr2.data)
                }
            });
        }
        else{
            if (Array.isArray(arr2)) {
                return arr2.map((x) => {
                    return this.cos_sim(arr1.data, x.data)
                });
            }
            else{
                return this.cos_sim(arr1.data, arr2.data)
            }
        }
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