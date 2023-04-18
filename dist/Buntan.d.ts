import Collection from "./Collection.js";
declare class Buntan {
    private LOG_LEVEL;
    private pipe;
    private DB;
    private repo_name;
    constructor(options?: IBuntanOptions);
    init(): Promise<this>;
    collection(name: string): Collection;
    /**
     * @description Drops the entire database
    */
    dropDatabase(): this;
    /**
     * @description Lists all collections in the database.
    */
    getCollectionNames(): string[];
    get log_level(): LogLevels;
}
export declare enum LogLevels {
    "NONE" = 0,
    "INFO" = 1,
    "WARN" = 2,
    "ERROR" = 3,
    "ALL" = 4
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
//# sourceMappingURL=Buntan.d.ts.map