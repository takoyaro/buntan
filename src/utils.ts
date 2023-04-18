import { IEmbedding } from "./Collection";

function dot(arr1: Float32Array, arr2: Float32Array): number {
	return arr1.reduce((acc, val, i) => acc + val * arr2[i], 0);
}

function cos_sim(arr1: IEmbedding, arr2: IEmbedding) {
	// Calculate dot product of the two arrays
	const dotProduct = dot(arr1.data, arr2.data);

	// Calculate the cosine similarity
	const cosineSimilarity = dotProduct / (arr1.magnitude * arr2.magnitude);

	return cosineSimilarity;
}

function calculate_score(arr1: IEmbedding, arr2: IEmbedding) {
	return cos_sim(arr1, arr2);
}

function magnitude(arr: Float32Array) {
	return Math.sqrt(arr.reduce((acc, val) => acc + val * val, 0));
}

function formatBytes(bytes: number, unit: "b" | "kb" | "mb" | "gb"): number {
	const units = {
		b: 1,
		kb: 1024,
		mb: 1024 * 1024,
		gb: 1024 * 1024 * 1024,
	};
	const multiplier = units[unit];
	return bytes / multiplier;
}

export { dot, cos_sim, calculate_score, magnitude, formatBytes };
