import { describe, it, expect } from "vitest";
import { VectorStore } from "../src/rag/vector-store.js";
import { embed } from "../src/rag/embeddings.js";
import { ragEngine } from "../src/rag/rag-engine.js";

describe("VectorStore + RAG", () => {
  it("adds documents correctly", () => {
    const vs = new VectorStore();
    vs.add("d1", "patient with chest pain and dyspnea", { type: "case" });
    vs.add("d2", "patient with severe headache", { type: "case" });
    expect(vs.size()).toBe(2);
  });

  it("returns top-K results", () => {
    const vs = new VectorStore();
    vs.add("d1", "chest pain and dyspnea acute MI", {});
    vs.add("d2", "severe headache neck stiffness meningitis", {});
    vs.add("d3", "jaundice biliary obstruction RUQ pain", {});
    const results = vs.search("chest pain dyspnea", 2);
    expect(results.length).toBe(2);
    expect(results[0].id).toBe("d1");
  });

  it("cosine similarity ordering: most similar first", () => {
    const vs = new VectorStore();
    vs.add("d1", "chest pain radiating left arm diaphoresis", {});
    vs.add("d2", "completely different topic about gardening", {});
    const results = vs.search("chest pain diaphoresis arm", 2);
    expect(results[0].id).toBe("d1");
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it("metadata filtering works", () => {
    const vs = new VectorStore();
    vs.add("d1", "chest pain dyspnea", { type: "case" });
    vs.add("d2", "chest pain dyspnea", { type: "guideline" });
    const filtered = vs.search("chest pain dyspnea", 5, 0, { type: "guideline" });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("d2");
  });

  it("mock embeddings are deterministic", () => {
    const a = embed("chest pain and dyspnea");
    const b = embed("chest pain and dyspnea");
    expect(a).toEqual(b);
  });

  it("RAGEngine.searchLiterature returns results for chest pain", async () => {
    const results = await ragEngine.searchLiterature("chest pain troponin", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].source).toBe("pubmed");
  });

  it("RAGEngine.searchDrugs returns metformin", async () => {
    const results = await ragEngine.searchDrugs("metformin", 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.id === "metformin")).toBe(true);
  });

  it("RAGEngine hybridSearch combines sources", async () => {
    const results = await ragEngine.hybridSearch("meningitis ceftriaxone", ["vector", "bm25"]);
    expect(results.length).toBeGreaterThan(0);
    const sources = new Set(results.map((r) => r.source));
    expect(sources.size).toBeGreaterThanOrEqual(1);
  });
});
