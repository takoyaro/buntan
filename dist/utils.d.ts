import { IEmbedding } from "./Collection";
declare function dot(arr1: Float32Array, arr2: Float32Array): number;
declare function cos_sim(arr1: IEmbedding, arr2: IEmbedding): number;
declare function calculate_score(arr1: IEmbedding, arr2: IEmbedding): number;
declare function magnitude(arr: Float32Array): number;
declare function formatBytes(bytes: number, unit: "b" | "kb" | "mb" | "gb"): number;
export { dot, cos_sim, calculate_score, magnitude, formatBytes };
//# sourceMappingURL=utils.d.ts.map