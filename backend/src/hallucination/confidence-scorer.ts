import type { RAGResult } from "../rag/rag-engine.js";
import { groundClaim } from "./grounding.js";

export interface VerifiedClaim {
  claim: string;
  claimType: string;
  confidence: number;
  verdict: "supported" | "unsupported" | "uncertain";
  supportingSourceIds: string[];
}

export function scoreClaimConfidence(
  claim: string,
  sources: RAGResult[]
): VerifiedClaim {
  const g = groundClaim(claim, sources);
  let confidence: number;
  if (g.verdict === "supported") {
    confidence = Math.min(1.0, 0.7 + g.overlapScore * 0.3);
  } else if (g.verdict === "uncertain") {
    confidence = 0.35 + g.overlapScore * 0.4;
  } else {
    confidence = Math.max(0.05, g.overlapScore);
  }
  return {
    claim,
    claimType: "general",
    confidence: Math.round(confidence * 100) / 100,
    verdict: g.verdict,
    supportingSourceIds: g.supportingSourceIds,
  };
}

export function overallConfidence(verifiedClaims: VerifiedClaim[]): number {
  if (verifiedClaims.length === 0) return 0.5;
  const sum = verifiedClaims.reduce((s, c) => s + c.confidence, 0);
  return Math.round((sum / verifiedClaims.length) * 100) / 100;
}
