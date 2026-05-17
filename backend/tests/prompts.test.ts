import { describe, it, expect } from "vitest";
import { buildZeroShotPrompt } from "../src/prompts/zero-shot.js";
import { buildFewShotPrompt, SYMPTOM_EXTRACTION_EXAMPLES } from "../src/prompts/few-shot.js";
import { buildCoTPrompt } from "../src/prompts/chain-of-thought.js";
import { buildReActPrompt } from "../src/prompts/react.js";
import { buildGroundingPrompt } from "../src/prompts/hallucination-guard.js";
import { buildLeastToMostPrompt } from "../src/prompts/least-to-most.js";

describe("Prompt builders", () => {
  it("buildZeroShotPrompt includes task and context", () => {
    const p = buildZeroShotPrompt("Diagnose chest pain", "Patient has troponin 0.8");
    expect(p).toContain("Diagnose chest pain");
    expect(p).toContain("troponin 0.8");
  });

  it("buildFewShotPrompt includes all 3 examples", () => {
    const p = buildFewShotPrompt(
      "Extract symptoms",
      SYMPTOM_EXTRACTION_EXAMPLES,
      "test input"
    );
    expect(p).toContain("Example 1");
    expect(p).toContain("Example 2");
    expect(p).toContain("Example 3");
  });

  it("buildCoTPrompt includes step by step scaffold", () => {
    const p = buildCoTPrompt("Generate differentials", "chest pain");
    expect(p.toLowerCase()).toContain("step by step");
  });

  it("buildReActPrompt includes Thought/Action/Observation format", () => {
    const p = buildReActPrompt(
      "Find the drug",
      [{ name: "lookupDrug", description: "drug DB lookup" }],
      []
    );
    expect(p).toContain("Thought");
    expect(p).toContain("Action");
    expect(p).toContain("Observation");
  });

  it("buildGroundingPrompt includes all provided sources", () => {
    const p = buildGroundingPrompt("Aspirin is recommended for ACS", [
      "Aspirin loading dose for ACS",
      "Cephalosporins safe in most penicillin allergy",
    ]);
    expect(p).toContain("Source 1");
    expect(p).toContain("Source 2");
  });

  it("buildLeastToMostPrompt enumerates subproblems", () => {
    const p = buildLeastToMostPrompt("complex task", ["a", "b", "c"]);
    expect(p).toContain("1. a");
    expect(p).toContain("2. b");
    expect(p).toContain("3. c");
  });
});
