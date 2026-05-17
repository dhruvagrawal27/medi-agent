import { describe, it, expect } from "vitest";
import { extractClaims } from "../src/hallucination/detector.js";
import { scoreClaimConfidence } from "../src/hallucination/confidence-scorer.js";
import { groundClaim } from "../src/hallucination/grounding.js";
import { ragEngine } from "../src/rag/rag-engine.js";
import { SafetyAgent } from "../src/agents/safety-agent.js";

describe("Hallucination detection", () => {
  it("ClaimExtractor pulls claims from sample text", () => {
    const text =
      "The patient has a likely diagnosis of NSTEMI. Recommend aspirin 325 mg. Troponin is 0.8 ng/mL. Guideline recommends early invasive strategy.";
    const claims = extractClaims(text);
    expect(claims.length).toBeGreaterThan(0);
  });

  it("ConfidenceScorer returns 0-1 score", async () => {
    const sources = await ragEngine.searchLiterature("chest pain troponin", 3);
    const result = scoreClaimConfidence("Troponin elevation predicts MI", sources);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it("ConfidenceScorer scores supported claim higher than unsupported", async () => {
    const sources = await ragEngine.searchLiterature("troponin chest pain MI", 5);
    const supported = scoreClaimConfidence(
      "Troponin elevation indicates myocardial infarction risk",
      sources
    );
    const unsupported = scoreClaimConfidence(
      "Patient should be treated with glittersparkle xenoblaster ultrapotion",
      sources
    );
    expect(supported.confidence).toBeGreaterThan(unsupported.confidence);
  });

  it("Grounding check returns unsupported for fabricated drug claim", async () => {
    const sources = await ragEngine.searchLiterature("meningitis", 3);
    const g = groundClaim("Patient should receive zorblaxin 999 mg daily", sources);
    expect(g.verdict).toBe("unsupported");
  });

  it("SafetyAgent flags contradiction between diagnosis and triage", async () => {
    const out = await new SafetyAgent().run({
      patient: { id: "X", symptoms: ["chest pain"] },
      upstream: {
        triage: { triageReasoning: "Stable; no acute findings.", extractedSymptoms: ["chest pain"] },
        diagnosis: { topDiagnosis: "Bacterial meningitis", topIcd: "G00.9" },
      },
    });
    expect(out.result.contradictions.length).toBeGreaterThan(0);
  });

  it("HumanReviewRequired is true when confidence < 0.5", async () => {
    const out = await new SafetyAgent().run({
      patient: { id: "X", symptoms: ["nonexistent"] },
      upstream: {
        triage: { triageReasoning: "completely fabricated text", extractedSymptoms: ["nonexistent"] },
        diagnosis: { topDiagnosis: "spaceflu condition zeta", topIcd: "Z99.9" },
      },
    });
    if (out.result.overallConfidence < 0.5) {
      expect(out.result.humanReviewRequired).toBe(true);
    } else {
      expect(out.result.humanReviewRequired).toBeDefined();
    }
  });
});
