import Buntan from "./Buntan.js";
declare class Collection {
    private LOG_LEVEL;
    private PIPE;
    name: string;
    documents: IDocument[];
    constructor(db: Buntan, name: string, pipe: any);
    private embed_string;
    load_collection(docs: IDocument[]): Promise<Collection>;
    query_similarity(data: string, options?: {
        filter?: Record<string, any>;
        top?: number;
        normalize?: boolean;
    }): Promise<IScoredDocument[]>;
    query_by_id(id: string): IDocument | null | undefined;
    query_by_metadata(metadata: Record<any, any>): IDocument[];
    delete_one(id: string): IDocument[] | null;
    delete_many(ids: string[]): IDocument[];
    insert_one(data: string, metadata?: Record<any, any>): Promise<IDocument>;
    insert_many(docs: {
        data: string;
        metadata: Record<string, any>;
    }[]): Promise<IDocument[]>;
}
interface IEmbedding {
    data: Float32Array;
    size: number;
    magnitude: number;
}
interface IDocument {
    _id: string;
    embeddings: IEmbedding;
    data: string;
    metadata?: Record<any, any>;
}
interface IScoredDocument extends IDocument {
    score?: number;
}
export { IDocument, IEmbedding, IScoredDocument };
export default Collection;
//# sourceMappingURL=Collection.d.ts.map