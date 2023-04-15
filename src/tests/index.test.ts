import { assert, expect, test, describe, it, beforeAll } from "vitest";
import Buntan, { IDocument, IEmbedding } from "../index.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { download_model, model_exists } from "./utils.js";

describe("Buntan", async () => {
	let buntan: Buntan;

	beforeAll(async () => {
		if (!model_exists()) {
			console.log("Downloading model...");
			await download_model();
		} else {
			console.log("Model exists");
		}
		buntan = await new Buntan({
			remote: false,
			models_dir: "./models/quantized",
		}).init();
	}, 20000);

	let insertedDocumentID = "";
	let doc: IDocument;
	it("Loads model", async () => {
		expect(buntan.models_loaded).toEqual(["headlesstech/semantic_xlmr"]);
	});
	it("Inserts a document", async () => {
		const doc = await buntan.insert_one("test", "Hello world");
		insertedDocumentID = doc._id;
		expect(doc._id).toMatch(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/g);
	});
	it("Has a collection", async () => {
		expect(buntan.create_or_get_collection("test")?.length).toBe(1);
	});
	it("Queryable by id", async () => {
		doc = buntan.query_by_id("test", insertedDocumentID) as IDocument;
		expect(doc._id).toBe(insertedDocumentID);
	});
	it("Embedding has a size of 1024", async () => {
		expect((doc.embeddings as IEmbedding).size).toBe(768);
	});
	it("Embedding has a type of Float32Array", async () => {
		expect((doc.embeddings as IEmbedding).data).toBeInstanceOf(
			Float32Array
		);
	});
	it("Queryable for similar documents", async () => {
		const result = await buntan.query_similarity("test", "Hello world");
		expect(result.length).toBe(1);
		expect(result[0].score).toBeGreaterThan(0);
	});
	it("Deletable by ID", async () => {
		buntan.delete_one("test", insertedDocumentID);
		expect(buntan.create_or_get_collection("test")?.length).toBe(0);
	});
	it("Inserts multiple documents", async () => {
		const docs = await buntan.insert_many("test", [
			{ data: "Hello world", metadata: { test: true } },
			{ data: "Hello world", metadata: { test: true } },
			{ data: "Hello world", metadata: { test: true } },
		]);
		expect(docs.length).toBe(3);
	});
	it("Queryable for similar documents", async () => {
		const result = await buntan.query_similarity("test", "Hello world");
		expect(result.length).toBe(3);
		expect(result[0].score).toBeGreaterThan(0);
	});
	it("Deletable by ID", async () => {
		let docs = buntan.create_or_get_collection("test") as IDocument[];
		buntan.delete_many(
			"test",
			docs.map((doc) => doc._id)
		);
		expect(buntan.create_or_get_collection("test")?.length).toBe(0);
	});
});
