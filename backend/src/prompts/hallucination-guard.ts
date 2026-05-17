export function buildGroundingPrompt(claim: string, sources: string[]): string {
  const sourceText = sources
    .map((s, i) => `[Source ${i + 1}] ${s}`)
    .join("\n\n");
  return `You are a clinical claim verifier. Determine whether the claim is supported by the provided sources.

CLAIM:
${claim}

SOURCES:
${sourceText || "(no sources provided)"}

Output JSON:
{
  "verdict": "supported" | "unsupported" | "uncertain",
  "supportingSourceIndices": [int],
  "explanation": "brief explanation",
  "confidence": float between 0 and 1
}

A claim is only "supported" if a source directly states or strongly implies it. If sources are silent or contradictory, return "uncertain". If the claim contradicts sources, return "unsupported".`;
}
