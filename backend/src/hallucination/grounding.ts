import type { RAGResult } from "../rag/rag-engine.js";

export interface GroundingResult {
  verdict: "supported" | "unsupported" | "uncertain";
  supportingSourceIds: string[];
  overlapScore: number;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );
}

const STOPWORDS = new Set([
  "the", "and", "for", "are", "with", "from", "that", "this", "have",
  "has", "had", "was", "were", "been", "being", "but", "not", "any", "all",
]);

function meaningfulTokens(text: string): Set<string> {
  const toks = tokenize(text);
  const out = new Set<string>();
  for (const t of toks) if (!STOPWORDS.has(t)) out.add(t);
  return out;
}

export function groundClaim(claim: string, sources: RAGResult[]): GroundingResult {
  const claimTokens = meaningfulTokens(claim);
  if (claimTokens.size === 0) {
    return { verdict: "uncertain", supportingSourceIds: [], overlapScore: 0 };
  }

  let bestOverlap = 0;
  const supportingIds: string[] = [];
  for (const src of sources) {
    const srcTokens = meaningfulTokens(src.text);
    let common = 0;
    for (const t of claimTokens) if (srcTokens.has(t)) common++;
    const overlap = common / claimTokens.size;
    if (overlap > 0.35) {
      supportingIds.push(src.id);
    }
    if (overlap > bestOverlap) bestOverlap = overlap;
  }

  let verdict: GroundingResult["verdict"];
  if (bestOverlap >= 0.5 && supportingIds.length > 0) verdict = "supported";
  else if (bestOverlap >= 0.25) verdict = "uncertain";
  else verdict = "unsupported";

  return { verdict, supportingSourceIds: supportingIds, overlapScore: bestOverlap };
}
