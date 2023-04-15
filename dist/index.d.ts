declare class Buntan {
    private pipe;
    private DB;
    private repo_name;
    models_loaded: string[];
    constructor(options?: IBuntanOptions);
    init(): Promise<this>;
    create_or_get_collection(name: string): IDocument[] | undefined;
    insert_one(collection: string, data: string, metadata?: Record<any, any>): Promise<IDocument>;
    insert_many(collection: string, docs: {
        data: string;
        metadata: Record<string, any>;
    }[]): Promise<IDocument[]>;
    query_similarity(collection: string, data: string, options?: {
        filter?: Record<string, any>;
        top?: number;
        normalize?: boolean;
    }): Promise<{
        _id: string;
        score: number | number[];
        data: string;
        metadata: Record<any, any> | undefined;
        embeddings: IEmbedding | IEmbedding[];
    }[]>;
    query_by_id(collection: string, id: string): IDocument | null | undefined;
    query_by_metadata(collection: string, metadata: Record<any, any>): IDocument[];
    delete_one(collection: string, id: string): IDocument[] | null | undefined;
    delete_many(collection: string, ids: string[]): IDocument[] | undefined;
    getMemoryUsage(unit?: "b" | "kb" | "mb" | "gb"): number;
    private convertMemoryUsage;
    private embed_string;
    private dot;
    private calculate_score;
    private cos_sim;
    private magnitude;
}
interface IBuntanOptions {
    remote?: boolean;
    remote_url?: string;
    repo_name?: string | string[];
    models_dir?: string;
}
interface IEmbedding {
    dims: [number, number];
    type: "float32";
    data: Float32Array;
    size: number;
}
interface IDocument {
    _id: string;
    embeddings: IEmbedding | IEmbedding[];
    data: string;
    metadata?: Record<any, any>;
}
type TVecStr = [number, string];
export { Buntan, IBuntanOptions, IDocument, IEmbedding, TVecStr };
export default Buntan;
//# sourceMappingURL=index.d.ts.map