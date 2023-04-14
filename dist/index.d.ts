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
    query_similarity(collection: string, data: string, top?: number, normalize?: boolean): Promise<{
        _id: string;
        score: number | number[];
        data: string;
        metadata: Record<any, any> | undefined;
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
export default Buntan;
//# sourceMappingURL=index.d.ts.map