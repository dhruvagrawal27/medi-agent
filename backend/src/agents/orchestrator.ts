import { getPatient } from "../mock-data/patients.js";
import { CONFIG } from "../config.js";
import { TriageAgent } from "./triage-agent.js";
import { LiteratureAgent } from "./literature-agent.js";
import { PharmacologyAgent } from "./pharmacology-agent.js";
import { DiagnosisAgent } from "./diagnosis-agent.js";
import { SafetyAgent } from "./safety-agent.js";
import { SummaryAgent } from "./summary-agent.js";
import type { AgentOutput, ReActStep } from "./base-agent.js";

export interface FullAnalysis {
  patientId: string;
  patient: any;
  analysis: {
    triage: any;
    literature: any;
    pharmacology: any;
    diagnosis: any;
    safety: any;
    summary: any;
  };
  agentOutputs: AgentOutput[];
  agentTrace: ReActStep[][];
  hallucinationReport: {
    overallConfidence: number;
    flaggedClaims: any[];
    humanReviewRequired: boolean;
  };
  processingTimeMs: number;
  refinementIterations: number;
}

export class Orchestrator {
  async analyze(patientId: string, query?: string): Promise<FullAnalysis> {
    const start = Date.now();
    const patient = getPatient(patientId);
    if (!patient) throw new Error(`Patient ${patientId} not found`);

    const agentOutputs: AgentOutput[] = [];

    // Step 1: Triage
    const triage = await new TriageAgent().run({ patient, query });
    agentOutputs.push(triage);

    // Step 2: Literature
    const literature = await new LiteratureAgent().run({
      patient,
      query,
      upstream: { triage: triage.result },
    });
    agentOutputs.push(literature);

    // Step 3: Pharmacology
    const pharmacology = await new PharmacologyAgent().run({ patient, query });
    agentOutputs.push(pharmacology);

    // Step 4: Diagnosis
    let diagnosis = await new DiagnosisAgent().run({
      patient,
      query,
      upstream: { triage: triage.result, literature: literature.result },
    });
    agentOutputs.push(diagnosis);

    // Step 5: Safety
    let safety = await new SafetyAgent().run({
      patient,
      query,
      upstream: {
        patient,
        triage: triage.result,
        literature: literature.result,
        pharmacology: pharmacology.result,
        diagnosis: diagnosis.result,
      },
    });
    agentOutputs.push(safety);

    // Refinement: re-run diagnosis if confidence below threshold
    let refinements = 0;
    while (
      safety.result.overallConfidence < CONFIG.confidenceThreshold &&
      refinements < CONFIG.maxRefinementIterations
    ) {
      refinements++;
      diagnosis = await new DiagnosisAgent().run({
        patient,
        query,
        upstream: {
          triage: triage.result,
          literature: literature.result,
          previousDiagnosis: diagnosis.result,
          safetyFlags: safety.result.flaggedClaims,
        },
      });
      agentOutputs.push(diagnosis);

      safety = await new SafetyAgent().run({
        patient,
        query,
        upstream: {
          patient,
          triage: triage.result,
          literature: literature.result,
          pharmacology: pharmacology.result,
          diagnosis: diagnosis.result,
        },
      });
      agentOutputs.push(safety);
    }

    // Step 6: Summary
    const summary = await new SummaryAgent().run({
      patient,
      query,
      upstream: {
        triage: triage.result,
        literature: literature.result,
        pharmacology: pharmacology.result,
        diagnosis: diagnosis.result,
        safety: safety.result,
      },
    });
    agentOutputs.push(summary);

    return {
      patientId,
      patient,
      analysis: {
        triage: triage.result,
        literature: literature.result,
        pharmacology: pharmacology.result,
        diagnosis: diagnosis.result,
        safety: safety.result,
        summary: summary.result,
      },
      agentOutputs,
      agentTrace: agentOutputs.map((o) => o.trace),
      hallucinationReport: {
        overallConfidence: safety.result.overallConfidence,
        flaggedClaims: safety.result.flaggedClaims,
        humanReviewRequired: safety.result.humanReviewRequired,
      },
      processingTimeMs: Date.now() - start,
      refinementIterations: refinements,
    };
  }
}

export const orchestrator = new Orchestrator();
