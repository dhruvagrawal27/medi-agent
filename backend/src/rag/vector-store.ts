import { embed, cosineSimilarity } from "./embeddings.js";

export interface VectorDocument {
  id: string;
  text: string;
  metadata: Record<string, any>;
  embedding: number[];
}

export interface SearchResult {
  id: string;
  text: string;
  metadata: Record<string, any>;
  score: number;
}

export class VectorStore {
  private docs: VectorDocument[] = [];

  add(id: string, text: string, metadata: Record<string, any> = {}): void {
    const embedding = embed(text);
    this.docs.push({ id, text, metadata, embedding });
  }

  search(
    query: string,
    topK: number = 5,
    threshold: number = 0,
    filter?: Record<string, any>
  ): SearchResult[] {
    if (!query || query.trim().length === 0) return [];

    const queryVec = embed(query);
    const candidates = filter
      ? this.docs.filter((d) =>
          Object.entries(filter).every(([k, v]) => d.metadata[k] === v)
        )
      : this.docs;

    const scored = candidates
      .map((d) => ({
        id: d.id,
        text: d.text,
        metadata: d.metadata,
        score: cosineSimilarity(queryVec, d.embedding),
      }))
      .filter((r) => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  }

  size(): number {
    return this.docs.length;
  }

  clear(): void {
    this.docs = [];
  }
}
