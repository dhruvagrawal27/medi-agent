export interface BM25Result {
  id: string;
  text: string;
  metadata: Record<string, any>;
  score: number;
}

interface BM25Doc {
  id: string;
  text: string;
  metadata: Record<string, any>;
  tokens: string[];
  length: number;
  termFreq: Record<string, number>;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export class BM25Index {
  private docs: BM25Doc[] = [];
  private df: Record<string, number> = {};
  private avgDocLen: number = 0;
  private readonly k1 = 1.5;
  private readonly b = 0.75;

  addDocument(id: string, text: string, metadata: Record<string, any> = {}): void {
    const tokens = tokenize(text);
    const termFreq: Record<string, number> = {};
    const uniqueTerms = new Set<string>();
    for (const t of tokens) {
      termFreq[t] = (termFreq[t] || 0) + 1;
      uniqueTerms.add(t);
    }
    for (const term of uniqueTerms) {
      this.df[term] = (this.df[term] || 0) + 1;
    }
    this.docs.push({ id, text, metadata, tokens, length: tokens.length, termFreq });
    this.recomputeAvgLen();
  }

  private recomputeAvgLen(): void {
    if (this.docs.length === 0) {
      this.avgDocLen = 0;
      return;
    }
    const total = this.docs.reduce((s, d) => s + d.length, 0);
    this.avgDocLen = total / this.docs.length;
  }

  private idf(term: string): number {
    const n = this.docs.length;
    const df = this.df[term] || 0;
    return Math.log(1 + (n - df + 0.5) / (df + 0.5));
  }

  search(query: string, topK: number = 5): BM25Result[] {
    if (!query || query.trim().length === 0) return [];
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const scored: BM25Result[] = this.docs.map((doc) => {
      let score = 0;
      for (const term of queryTokens) {
        const tf = doc.termFreq[term] || 0;
        if (tf === 0) continue;
        const idf = this.idf(term);
        const numerator = tf * (this.k1 + 1);
        const denominator =
          tf + this.k1 * (1 - this.b + this.b * (doc.length / (this.avgDocLen || 1)));
        score += idf * (numerator / denominator);
      }
      return { id: doc.id, text: doc.text, metadata: doc.metadata, score };
    });

    return scored
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  size(): number {
    return this.docs.length;
  }

  clear(): void {
    this.docs = [];
    this.df = {};
    this.avgDocLen = 0;
  }
}
