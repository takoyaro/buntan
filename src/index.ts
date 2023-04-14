import { v4 as uuidv4 } from "uuid";
import pkg from "@xenova/transformers";

const { pipeline, env } = pkg;

class Buntan {
	private pipe: any = null;
	private DB: Map<string, IDocument[]> = new Map();
	private repo_name: string | string[] =
		"rithwik-db/cleaned-e5-large-unsupervised-8";
	public models_loaded: string[] = [];

	constructor(options: IBuntanOptions = {}) {
		if (options?.remote == false) {
			env.localURL = options?.models_dir;
			env.remoteModels = false;
		}
		if (options?.remote_url) {
			env.remoteURL = `https://huggingface.co/${options?.remote_url}/resolve/main/onnx/quantized/`;
		} else {
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
		} else {
			console.log(`Loading model from ${this.repo_name}`);
			this.pipe = await pipeline("embeddings", this.repo_name);
			this.models_loaded.push(this.repo_name);
			console.log("Model loaded");
		}
		return this;
	}

	public create_or_get_collection(name: string) {
		if (!this.DB.has(name)) {
			this.DB.set(name, []);
		}
		return this.DB.get(name);
	}

	public async insert_one(
		collection: string,
		data: string,
		metadata?: Record<any, any>
	): Promise<IDocument> {
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

	public async insert_many(
		collection: string,
		docs: { data: string; metadata: Record<string, any> }[]
	): Promise<IDocument[]> {
		const documents = await Promise.all(
			docs.map(async (doc) => {
				const vec = await this.embed_string(doc.data);
				return {
					_id: uuidv4(),
					embeddings: vec,
					data: doc.data,
					metadata: doc.metadata,
				};
			})
		);
		this.create_or_get_collection(collection)?.push(...documents);
		return documents;
	}

	public async query_similarity(
		collection: string,
		data: string,
        options:{
            filter?: Record<string, any>,
            top?: number,
            normalize?: boolean
        }={}
	) {
		const vec = await this.embed_string(data);
		let docs = this.create_or_get_collection(collection);
		if (!docs) {
			return [];
		}
        if(options?.filter){
            if (Object.keys(options.filter).length > 0) {
                docs = docs.filter((doc) => {
                    let metadata = doc.metadata;
                    if (!metadata) return false;
                    let keys = Object.keys(options.filter as Record<string, any>);
                    for (const key of keys) {
                        if (metadata[key] != (options.filter as Record<string,any>)[key]) {
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
					return (
						(b.score as number[]).reduce(
							(acc, val) => acc + val,
							0
						) -
						(a.score as number[]).reduce((acc, val) => acc + val, 0)
					);
				}
				return (b.score as number) - (a.score as number);
			})
			.slice(0, options.top || 10);
		if (options.normalize) {
			const max = results.at(0)?.score as number;
			const min = results.at(-1)?.score as number;
			const range = max - min;
			results = results.map((x) => {
				if (Array.isArray(x.score)) {
					return {
						...x,
						score: (x.score as number[]).map(
							(y) => (y - min) / range
						),
					};
				}
				return {
					...x,
					score: (x.score as number) - min / range,
				};
			});
		}
		return results;
	}

	public query_by_id(collection: string, id: string) {
		const docs = this.create_or_get_collection(collection);
		if (!docs) return null;
		return docs.find((doc) => doc._id === id);
	}

	public query_by_metadata(collection: string, metadata: Record<any, any>) {
		const docs = this.create_or_get_collection(collection);
		if (!docs) return [];
		return docs.filter((doc) => {
			return Object.keys(metadata).every(
				(key) => doc.metadata?.[key] === metadata[key]
			);
		});
	}

	public delete_one(collection: string, id: string) {
		let docs = this.DB.get(collection);
		if (!docs) return null;
		docs = docs.filter((doc) => doc._id !== id);
		this.DB.set(collection, docs);
		return this.DB.get(collection);
	}

	public delete_many(collection: string, ids: string[]) {
		let docs = this.DB.get(collection);
		if (!docs) return [];
		docs = docs.filter((doc) => !ids.includes(doc._id));
		this.DB.set(collection, docs);
		return this.DB.get(collection);
	}

	public getMemoryUsage(unit?: "b" | "kb" | "mb" | "gb"): number {
		// @ts-ignore
		if (typeof window !== "undefined") {
			const jsonString = JSON.stringify([...this.DB]);
			const encoder = new TextEncoder();
			const db_byteLength = encoder.encode(jsonString).length;
			if (!unit) return db_byteLength;
			return this.convertMemoryUsage(db_byteLength, unit);
		}
		const jsonString = JSON.stringify([...this.DB]);
		const db_byteLength = Buffer.byteLength(jsonString);
		if (!unit) return db_byteLength;
		return this.convertMemoryUsage(db_byteLength, unit);
	}

	private convertMemoryUsage(
		bytes: number,
		unit: "b" | "kb" | "mb" | "gb"
	): number {
		const units = {
			b: 1,
			kb: 1024,
			mb: 1024 * 1024,
			gb: 1024 * 1024 * 1024,
		};
		const multiplier = units[unit];
		return bytes / multiplier;
	}

	private async embed_string(
		str: string
	): Promise<IEmbedding | IEmbedding[]> {
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

	private dot(arr1: Float32Array, arr2: Float32Array): number {
		return arr1.reduce((acc, val, i) => acc + val * arr2[i], 0);
	}

	private calculate_score(
		arr1: IEmbedding | IEmbedding[],
		arr2: IEmbedding | IEmbedding[]
	) {
		if (Array.isArray(arr1)) {
			return arr1.map((x, i) => {
				if (Array.isArray(arr2)) {
					return this.cos_sim(x.data, arr2[i].data);
				} else {
					return this.cos_sim(x.data, arr2.data);
				}
			});
		} else {
			if (Array.isArray(arr2)) {
				return arr2.map((x) => {
					return this.cos_sim(arr1.data, x.data);
				});
			} else {
				return this.cos_sim(arr1.data, arr2.data);
			}
		}
	}
	private cos_sim(arr1: Float32Array, arr2: Float32Array) {
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

	private magnitude(arr: Float32Array) {
		return Math.sqrt(arr.reduce((acc, val) => acc + val * val, 0));
	}
}

interface IBuntanOptions{
    remote?:boolean,
    remote_url?:string,
    repo_name?:string|string[],
    models_dir?:string
}
interface IEmbedding {
    dims: [number,number],
    type: 'float32',
    data: Float32Array,
    size:number
}
interface IDocument {
    _id:string,
    embeddings:IEmbedding|IEmbedding[],
    data:string,
    metadata?:Record<any,any>
}
type TVecStr = [number,string]

export {Buntan,IBuntanOptions,IDocument,IEmbedding,TVecStr}
export default Buntan;
