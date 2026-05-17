import { BaseAgent, Tool, AgentInput } from "./base-agent.js";
import { ragEngine, RAGResult } from "../rag/rag-engine.js";
import { extractClaims } from "../hallucination/detector.js";
import { scoreClaimConfidence, overallConfidence, VerifiedClaim } from "../hallucination/confidence-scorer.js";

export interface FlaggedClaim {
  claim: string;
  reason: string;
  confidence: number;
  agent: string;
}

export interface Contradiction {
  agentA: string;
  agentB: string;
  claimA: string;
  claimB: string;
}

export interface SafetyOutput {
  verifiedClaims: VerifiedClaim[];
  flaggedClaims: FlaggedClaim[];
  overallConfidence: number;
  humanReviewRequired: boolean;
  contradictions: Contradiction[];
}

export class SafetyAgent extends BaseAgent {
  constructor() {
    super("SafetyAgent");
  }

  protected defineTools(): Tool[] {
    return [
      {
        name: "extractClaims",
        description: "Pull factual claims from agent output text",
        execute: async ({ text }: { text: string }) => extractClaims(text),
      },
      {
        name: "verifyClaim",
        description: "Check if claim is supported by retrieved sources",
        execute: async ({ claim, sources }: { claim: string; sources: RAGResult[] }) =>
          scoreClaimConfidence(claim, sources),
      },
      {
        name: "scoreConfidence",
        description: "Score 0-1 confidence per claim using overlap",
        execute: async ({ claim, sources }: { claim: string; sources: RAGResult[] }) =>
          scoreClaimConfidence(claim, sources).confidence,
      },
      {
        name: "flagContradictions",
        description: "Find contradictions between agent outputs",
        execute: async ({ outputs }: { outputs: Record<string, any> }) => {
          const contradictions: Contradiction[] = [];
          const dxA = outputs?.diagnosis?.topDiagnosis?.toLowerCase() ?? "";
          const triageReason = outputs?.triage?.triageReasoning?.toLowerCase() ?? "";
          if (
            dxA.includes("meningitis") &&
            !(triageReason.includes("meningitis") || triageReason.includes("neck") || triageReason.includes("headache"))
          ) {
            contradictions.push({
              agentA: "DiagnosisAgent",
              agentB: "TriageAgent",
              claimA: `Top diagnosis: ${outputs.diagnosis.topDiagnosis}`,
              claimB: `Triage reasoning does not mention meningitis features`,
            });
          }
          return contradictions;
        },
      },
      {
        name: "escalateToHuman",
        description: "Decide if human review is required",
        execute: async ({ confidence, flaggedCount }: { confidence: number; flaggedCount: number }) => {
          return confidence < 0.5 || flaggedCount > 3;
        },
      },
    ];
  }

  protected async execute(input: AgentInput): Promise<{ result: SafetyOutput; sources: RAGResult[] }> {
    const outputs = input.upstream ?? {};
    const combinedText = JSON.stringify(outputs);
    this.log({ thought: "Extracting claims across all upstream agent outputs." });

    const claims = extractClaims(combinedText);
    const symptomsQuery: string =
      outputs?.triage?.extractedSymptoms?.join(" ") ||
      outputs?.patient?.symptoms?.join(" ") ||
      "";

    const sourceCollections = await Promise.all([
      ragEngine.searchLiterature(symptomsQuery, 5),
      ragEngine.searchGuidelines(symptomsQuery, ""),
      ragEngine.searchICDCodes(symptomsQuery, 5),
      ragEngine.searchDrugs(symptomsQuery, 3),
    ]);
    const allSources = sourceCollections.flat();

    const verifiedClaims = claims.map((c) => scoreClaimConfidence(c.text, allSources));
    const flagged: FlaggedClaim[] = verifiedClaims
      .filter((v) => v.verdict === "unsupported" || v.confidence < 0.4)
      .map((v) => ({
        claim: v.claim,
        reason: v.verdict === "unsupported" ? "No source support" : "Low overlap with retrieved evidence",
        confidence: v.confidence,
        agent: "multi-agent",
      }));

    const contradictions: Contradiction[] = await this.callTool("flagContradictions", { outputs });

    const overall = overallConfidence(verifiedClaims);
    const humanReview: boolean = await this.callTool("escalateToHuman", {
      confidence: overall,
      flaggedCount: flagged.length,
    });

    return {
      result: {
        verifiedClaims,
        flaggedClaims: flagged,
        overallConfidence: overall,
        humanReviewRequired: humanReview,
        contradictions,
      },
      sources: allSources,
    };
  }
}
