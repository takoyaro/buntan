import { expect, describe, it, beforeAll } from "vitest";
import { Buntan, Collection } from "../index.js";
import { download_model, model_exists } from "./utils.js";
import { IDocument, IEmbedding } from "../Collection.js";

describe("Buntan", async () => {
	const COLLECTION_NAME = "test";

	let insertedDocumentID = "";
	let collection: Collection;
	let doc: IDocument;
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

	it("Creates a collection if it doesn't exist", async () => {
		let _collection = buntan.collection(COLLECTION_NAME);
		expect(_collection).toBeInstanceOf(Collection);
		collection = _collection as Collection;
	});
	it("Inserts a document", async () => {
		const doc = await collection.insert_one("Hello world");
		insertedDocumentID = doc._id;
		expect(doc._id).toMatch(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/g);
	});
	it("Queryable by id", async () => {
		doc = collection.query_by_id(insertedDocumentID) as IDocument;
		expect(doc._id).toBe(insertedDocumentID);
	});
	it("Embedding has a size of 384", async () => {
		expect((doc.embeddings as IEmbedding).size).toBe(384);
	});
	it("Embedding has a type of Float32Array", async () => {
		expect((doc.embeddings as IEmbedding).data).toBeInstanceOf(
			Float32Array
		);
	});
	it("Queryable for similar documents", async () => {
		const result = await collection.query_similarity("Hello world");
		expect(result.length).toBe(1);
		expect(result[0].score).toBeGreaterThan(0);
	});
	it("Deletable by ID", async () => {
		collection.delete_one(insertedDocumentID);
		expect(collection.documents.length).toBe(0);
	});
	it("Inserts multiple documents", async () => {
		const docs = await collection.insert_many([
			{ data: "Hello world", metadata: { test: true } },
			{ data: "Hello world", metadata: { test: true } },
			{ data: "Hello world", metadata: { test: true } },
		]);
		expect(docs.length).toBe(3);
	});
	it("Queryable for similar documents", async () => {
		const result = await collection.query_similarity("Hello world");
		expect(result.length).toBe(3);
		expect(result[0].score).toBeGreaterThan(0);
	});
	it("Deletable by ID", async () => {
		let docs = collection.documents as IDocument[];
		collection.delete_many(docs.map(doc => doc._id));
		expect(collection.documents.length).toBe(0);
	});
});
