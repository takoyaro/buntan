import { existsSync, mkdirSync, writeFileSync } from "fs";

const base_url =
	"https://huggingface.co/braintacles/onnx-models/resolve/main/onnx/quantized/headlesstech/semantic_xlmr/default/";
const base_path = "./models/quantized/headlesstech/semantic_xlmr/default/";
const model_files = [
	"config.json",
	"special_tokens_map.json",
	"tokenizer.json",
	"tokenizer_config.json",
	"vocab.txt",
	"model.onnx",
];

function mkdirRecursiveSync(dirPath: string) {
	const parts = dirPath.split("/");
	for (let i = 1; i <= parts.length; i++) {
		const segment = parts.slice(0, i).join("/");
		if (!existsSync(segment)) {
			mkdirSync(segment);
		}
	}
}

async function download_model() {
	mkdirRecursiveSync(base_path);
	//await for each file to be downloaded
	await Promise.all(
		model_files.map(async (file) => {
			const url = `${base_url}${file}`;
			//@ts-ignore
			const response = await fetch(url);
			const buffer = await response.arrayBuffer();
			writeFileSync(`${base_path}${file}`, Buffer.from(buffer));
		})
	);
}

function model_exists() {
	mkdirRecursiveSync(base_path);
	return model_files.every((file) => existsSync(`${base_path}${file}`));
}

export { download_model, model_exists };
