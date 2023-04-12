declare module '@xenova/transformers';

interface IEmbedding {
    dims: [number,number],
    type: 'float32',
    data: Float32Array,
    size:number
}
interface IDocument {
    _id:string,
    embeddings:IEmbedding,
    data:string,
    metadata?:Record<any,any>
}
type TVecStr = [number,string]