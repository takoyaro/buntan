//@ts-ignore
import pkg from "@xenova/transformers";
const { pipeline, env } = pkg;
import Collection from "./Collection.js";
class Buntan {
    LOG_LEVEL = LogLevels.NONE;
    pipe = null;
    DB = new Map();
    repo_name = "sentence-transformers/all-MiniLM-L6-v2"; //"headlesstech/semantic_xlmr";
    constructor(options = {}) {
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
    collection(name) {
        if (!this.DB.has(name)) {
            this.DB.set(name, new Collection(this, name, this.pipe));
        }
        return this.DB.get(name);
    }
    /**
     * @description Drops the entire database
    */
    dropDatabase() {
        this.DB.clear();
        return this;
    }
    /**
     * @description Lists all collections in the database.
    */
    getCollectionNames() {
        return [...this.DB.keys()];
    }
    get log_level() {
        return this.LOG_LEVEL;
    }
}
export var LogLevels;
(function (LogLevels) {
    LogLevels[LogLevels["NONE"] = 0] = "NONE";
    LogLevels[LogLevels["INFO"] = 1] = "INFO";
    LogLevels[LogLevels["WARN"] = 2] = "WARN";
    LogLevels[LogLevels["ERROR"] = 3] = "ERROR";
    LogLevels[LogLevels["ALL"] = 4] = "ALL";
})(LogLevels || (LogLevels = {}));
export default Buntan;
//# sourceMappingURL=Buntan.js.map