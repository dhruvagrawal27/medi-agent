import { describe, it, expect } from "vitest";
import { BM25Index } from "../src/rag/bm25.js";
import { ragEngine } from "../src/rag/rag-engine.js";

describe("BM25", () => {
  it("indexes documents", () => {
    const idx = new BM25Index();
    idx.addDocument("a", "the quick brown fox", {});
    idx.addDocument("b", "lazy dog sleeps", {});
    expect(idx.size()).toBe(2);
  });

  it("returns correct top result for exact keyword match", () => {
    const idx = new BM25Index();
    idx.addDocument("a", "metformin biguanide diabetes lactic acidosis", {});
    idx.addDocument("b", "atorvastatin statin hyperlipidemia", {});
    const r = idx.search("metformin diabetes", 5);
    expect(r[0].id).toBe("a");
  });

  it("scores higher for more keyword matches", () => {
    const idx = new BM25Index();
    idx.addDocument("a", "chest pain dyspnea diaphoresis nausea", {});
    idx.addDocument("b", "chest pain alone with nothing else", {});
    const r = idx.search("chest pain dyspnea diaphoresis", 2);
    expect(r[0].id).toBe("a");
    expect(r[0].score).toBeGreaterThan(r[1].score);
  });

  it("handles empty query gracefully", () => {
    const idx = new BM25Index();
    idx.addDocument("a", "some doc", {});
    expect(idx.search("", 5)).toEqual([]);
  });

  it("handles query with no matches", () => {
    const idx = new BM25Index();
    idx.addDocument("a", "metformin diabetes", {});
    expect(idx.search("entirelyunrelatedtopicxyz", 5)).toEqual([]);
  });

  it("search for meningitis symptoms returns relevant ICD code", async () => {
    const results = await ragEngine.searchICDCodes("severe headache neck stiffness fever photophobia", 5);
    expect(results.length).toBeGreaterThan(0);
    const codes = results.map((r) => r.metadata.code);
    expect(codes.some((c: string) => c.startsWith("G0"))).toBe(true);
  });
});
