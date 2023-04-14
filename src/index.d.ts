declare module '@xenova/transformers';

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
