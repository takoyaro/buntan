//@ts-ignore
import pkg from "@xenova/transformers";
const { pipeline, env } = pkg;
import Collection from "./Collection.js";

class Buntan {
	private LOG_LEVEL: LogLevels = LogLevels.NONE;
	private pipe: any = null;
	private DB: Map<string, Collection> = new Map();
	private repo_name: string = "sentence-transformers/all-MiniLM-L6-v2"; //"headlesstech/semantic_xlmr";

	constructor(options: IBuntanOptions = {}) {
		env.remoteURL =
			"https://huggingface.co/braintacles/onnx-models/resolve/main/onnx/quantized/";
		if (options?.remote == false) {
			env.remoteModels = false;
			if (options?.models_dir) {
				env.localURL = options?.models_dir;
			}
		}
		if (options?.remote_url) {
			env.remoteURL = `https://huggingface.co/${options?.remote_url}/resolve/main/onnx/quantized/`;
		}
		if (options?.repo_name) {
			this.repo_name = options.repo_name;
		}
		if (options?.log_level) {
			this.LOG_LEVEL = options.log_level;
		}
	}

	async init() {
		this.pipe = await pipeline("embeddings", this.repo_name);
		return this;
	}

	public collection(name: string) {
		if (!this.DB.has(name)) {
			this.DB.set(name, new Collection(this, name, this.pipe));
		}
		return this.DB.get(name) as Collection;
	}

	/**
	 * @description Drops the entire database
	 */
	public dropDatabase() {
		this.DB.clear();
		return this;
	}

	/**
	 * @description Lists all collections in the database.
	 */
	public getCollectionNames() {
		return [...this.DB.keys()];
	}

	public get log_level(): LogLevels {
		return this.LOG_LEVEL;
	}
}
export enum LogLevels {
	"NONE",
	"INFO",
	"WARN",
	"ERROR",
	"ALL",
}
interface IBuntanOptions {
	remote?: boolean;
	remote_url?: string;
	repo_name?: string;
	models_dir?: string;
	log_level?: LogLevels;
}

export default Buntan;
export { IBuntanOptions };
