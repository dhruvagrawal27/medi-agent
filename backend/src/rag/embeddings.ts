const EMBED_DIM = 256;

function hashToken(token: string, dim: number): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % dim;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "of", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by",
  "from", "as", "this", "that", "it", "its", "if", "then", "than",
  "we", "you", "he", "she", "they", "them", "his", "her", "their",
  "have", "has", "had", "do", "does", "did", "will", "would", "should",
]);

export function embed(text: string): number[] {
  const vec = new Array<number>(EMBED_DIM).fill(0);
  const tokens = tokenize(text).filter((t) => !STOPWORDS.has(t));
  if (tokens.length === 0) return vec;

  const tf: Record<string, number> = {};
  for (const tok of tokens) tf[tok] = (tf[tok] || 0) + 1;

  for (const [tok, count] of Object.entries(tf)) {
    const idx = hashToken(tok, EMBED_DIM);
    const idx2 = hashToken("bi:" + tok, EMBED_DIM);
    vec[idx] += count;
    vec[idx2] += count * 0.5;
  }

  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  }
  return vec;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
