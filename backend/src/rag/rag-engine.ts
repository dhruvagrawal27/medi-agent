import { VectorStore, SearchResult } from "./vector-store.js";
import { BM25Index, BM25Result } from "./bm25.js";
import { MOCK_PUBMED } from "../mock-data/pubmed.js";
import { MOCK_ICD_CODES } from "../mock-data/icd-codes.js";
import { MOCK_DRUGS } from "../mock-data/drugs.js";
import { MOCK_GUIDELINES } from "../mock-data/guidelines.js";

export type RetrievalSource = "vector" | "bm25" | "graphql";

export interface RAGResult {
  source: "pubmed" | "icd" | "drug" | "guideline";
  id: string;
  text: string;
  metadata: Record<string, any>;
  score: number;
  retrievalMethod: RetrievalSource;
}

export class RAGEngine {
  private literatureVector: VectorStore;
  private guidelinesVector: VectorStore;
  private icdBM25: BM25Index;
  private drugBM25: BM25Index;

  constructor() {
    this.literatureVector = new VectorStore();
    this.guidelinesVector = new VectorStore();
    this.icdBM25 = new BM25Index();
    this.drugBM25 = new BM25Index();
    this.seed();
  }

  private seed(): void {
    // PubMed → vector store
    for (const p of MOCK_PUBMED) {
      const text = `${p.title}. ${p.abstract} Keywords: ${p.keywords.join(", ")}. MeSH: ${p.meshTerms.join(", ")}.`;
      this.literatureVector.add(p.pmid, text, {
        type: "pubmed",
        pmid: p.pmid,
        title: p.title,
        authors: p.authors,
        journal: p.journal,
        year: p.year,
        keywords: p.keywords,
      });
    }

    // Guidelines → vector store
    for (const g of MOCK_GUIDELINES) {
      const text = `${g.title} (${g.organization}, ${g.year}). Condition: ${g.condition}. Recommendations: ${g.recommendations.map((r) => `[${r.level}] ${r.text}`).join(" ")}. Keywords: ${g.keywords.join(", ")}.`;
      this.guidelinesVector.add(g.id, text, {
        type: "guideline",
        id: g.id,
        title: g.title,
        organization: g.organization,
        year: g.year,
        condition: g.condition,
        recommendations: g.recommendations,
      });
    }

    // ICD → BM25
    for (const code of MOCK_ICD_CODES) {
      const text = `${code.code} ${code.description}. Category: ${code.category}. Symptoms: ${code.commonSymptoms.join(", ")}. Urgency: ${code.urgencyLevel}.`;
      this.icdBM25.addDocument(code.code, text, {
        type: "icd",
        code: code.code,
        description: code.description,
        category: code.category,
        commonSymptoms: code.commonSymptoms,
        urgencyLevel: code.urgencyLevel,
      });
    }

    // Drugs → BM25
    for (const drug of MOCK_DRUGS) {
      const text = `${drug.name} (${drug.genericName}) class ${drug.class}. Indications: ${drug.indications.join(", ")}. Contraindications: ${drug.contraindications.join(", ")}. Side effects: ${drug.sideEffects.join(", ")}.`;
      this.drugBM25.addDocument(drug.name, text, {
        type: "drug",
        name: drug.name,
        genericName: drug.genericName,
        class: drug.class,
        indications: drug.indications,
        contraindications: drug.contraindications,
        interactions: drug.interactions,
        sideEffects: drug.sideEffects,
        renalDosing: drug.renalDosing,
        hepaticDosing: drug.hepaticDosing,
      });
    }
  }

  async searchLiterature(query: string, topK: number = 5): Promise<RAGResult[]> {
    const results = this.literatureVector.search(query, topK);
    return results.map((r) => this.toRAGResult(r, "pubmed", "vector"));
  }

  async searchDrugs(query: string, topK: number = 5): Promise<RAGResult[]> {
    const results = this.drugBM25.search(query, topK);
    return results.map((r) => this.toRAGResult(r, "drug", "bm25"));
  }

  async searchICDCodes(query: string, topK: number = 5): Promise<RAGResult[]> {
    const results = this.icdBM25.search(query, topK);
    return results.map((r) => this.toRAGResult(r, "icd", "bm25"));
  }

  async searchGuidelines(query: string, condition: string = ""): Promise<RAGResult[]> {
    const q = `${condition} ${query}`.trim();
    const results = this.guidelinesVector.search(q, 5);
    return results.map((r) => this.toRAGResult(r, "guideline", "vector"));
  }

  async hybridSearch(
    query: string,
    sources: RetrievalSource[] = ["vector", "bm25"]
  ): Promise<RAGResult[]> {
    const out: RAGResult[] = [];
    if (sources.includes("vector")) {
      const lit = await this.searchLiterature(query, 3);
      const gl = await this.searchGuidelines(query, "");
      out.push(...lit, ...gl);
    }
    if (sources.includes("bm25")) {
      const icd = await this.searchICDCodes(query, 3);
      const drugs = await this.searchDrugs(query, 3);
      out.push(...icd, ...drugs);
    }
    return out.sort((a, b) => b.score - a.score);
  }

  private toRAGResult(
    r: SearchResult | BM25Result,
    source: RAGResult["source"],
    method: RetrievalSource
  ): RAGResult {
    return {
      source,
      id: r.id,
      text: r.text,
      metadata: r.metadata,
      score: r.score,
      retrievalMethod: method,
    };
  }
}

export const ragEngine = new RAGEngine();
