import { BaseAgent, Tool, AgentInput } from "./base-agent.js";
import { ragEngine, RAGResult } from "../rag/rag-engine.js";

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface SummaryOutput {
  soapNote: SOAPNote;
  clinicalSummary: string;
  actionPlan: string[];
  urgentFlags: string[];
  citations: string[];
}

export class SummaryAgent extends BaseAgent {
  constructor() {
    super("SummaryAgent");
  }

  protected defineTools(): Tool[] {
    return [
      {
        name: "buildSOAPNote",
        description: "Build SOAP note from all upstream agent outputs",
        execute: async (payload: any) => {
          const { patient, upstream } = payload;
          const triage = upstream.triage;
          const dx = upstream.diagnosis;
          const pharma = upstream.pharmacology;
          const subjective = `${patient.age}yo ${patient.gender} (${patient.id}) presents with ${patient.chiefComplaint}. PMH: ${patient.history.join(", ") || "none"}. Meds: ${patient.currentMedications.join(", ") || "none"}. Allergies: ${patient.allergies.join(", ") || "NKDA"}.`;
          const objective = `Vitals: BP ${patient.vitals.bp}, HR ${patient.vitals.hr}, T ${patient.vitals.temp}C, RR ${patient.vitals.rr}, SpO2 ${patient.vitals.spo2}%. Labs: ${Object.entries(patient.labs).slice(0, 6).map(([k, v]) => `${k} ${v}`).join(", ")}.`;
          const assessment = `Urgency ${triage?.urgencyScore}/5 (${triage?.urgencyLabel}). Most likely: ${dx?.topDiagnosis} (${dx?.topIcd}), confidence ${(dx?.confidence ?? 0).toFixed(2)}. Differentials: ${(dx?.differentials ?? []).slice(0, 3).map((d: any) => `${d.diagnosis} (${(d.probability * 100).toFixed(0)}%)`).join("; ")}.`;
          const plan = `1) Address red flags: ${triage?.redFlags?.join(", ") || "none"}. 2) Pharmacology: ${pharma?.warnings?.length ? pharma.warnings.join("; ") : "no major warnings"}. 3) Workup per guideline.`;
          return { subjective, objective, assessment, plan };
        },
      },
      {
        name: "generateClinicalSummary",
        description: "Narrative clinical summary paragraph",
        execute: async (payload: any) => {
          const { patient, upstream } = payload;
          const dx = upstream.diagnosis;
          return `${patient.name} is a ${patient.age}-year-old ${patient.gender.toLowerCase()} presenting with ${patient.chiefComplaint}. Most likely diagnosis is ${dx?.topDiagnosis ?? "indeterminate"} based on ${(upstream.triage?.extractedSymptoms ?? []).slice(0, 4).join(", ")}. Recommended next step: confirmatory testing and treatment per current guidelines.`;
        },
      },
      {
        name: "createActionPlan",
        description: "Bullet action plan combining diagnosis and guidelines",
        execute: async ({ diagnosis, guidelines }: { diagnosis: string; guidelines: RAGResult[] }) => {
          const plan: string[] = [];
          const dxLower = (diagnosis || "").toLowerCase();
          if (dxLower.includes("mi") || dxLower.includes("coronary")) {
            plan.push("Aspirin 162-325 mg PO loading dose");
            plan.push("Atorvastatin 80 mg PO daily (high-intensity)");
            plan.push("Serial troponin and ECG monitoring");
            plan.push("Cardiology consult for early invasive strategy if GRACE >140");
          }
          if (dxLower.includes("meningitis")) {
            plan.push("Ceftriaxone 2g IV q12h + Vancomycin 15-20 mg/kg q8-12h immediately");
            plan.push("Dexamethasone 0.15 mg/kg q6h x 4 days (before/with first antibiotic dose)");
            plan.push("Lumbar puncture (after CT if indicated)");
            plan.push("Isolation precautions; contact tracing");
          }
          if (dxLower.includes("hyperthyroid") || dxLower.includes("graves")) {
            plan.push("Methimazole 15-30 mg/day PO");
            plan.push("Propranolol 40 mg PO TID for symptomatic relief");
            plan.push("TRAb confirmation and thyroid scan");
            plan.push("Endocrinology referral");
          }
          if (dxLower.includes("cholangitis") || dxLower.includes("biliary")) {
            plan.push("Piperacillin-tazobactam 4.5 g IV q6h");
            plan.push("Urgent ERCP within 24 hours");
            plan.push("Hepatobiliary surgery consult");
            plan.push("NPO, IV fluids, monitor LFTs");
          }
          if (dxLower.includes("hyponatr") || dxLower.includes("nph") || dxLower.includes("b12")) {
            plan.push("Sodium correction with cautious rate (<10 mEq/24h)");
            plan.push("Review and stop offending diuretic if applicable");
            plan.push("Replace vitamin B12 1000 mcg IM weekly");
            plan.push("MRI brain to evaluate for NPH");
          }
          if (plan.length === 0) plan.push("Targeted workup; consult relevant specialty.");
          return plan;
        },
      },
      {
        name: "formatForClinician",
        description: "Final clinician-ready output",
        execute: async (payload: any) => {
          return payload;
        },
      },
    ];
  }

  protected async execute(input: AgentInput): Promise<{ result: SummaryOutput; sources: RAGResult[] }> {
    const patient = input.patient;
    const upstream = input.upstream ?? {};

    const soapNote: SOAPNote = await this.callTool("buildSOAPNote", { patient, upstream });
    const clinicalSummary: string = await this.callTool("generateClinicalSummary", { patient, upstream });

    const guidelines = await ragEngine.searchGuidelines(
      upstream?.diagnosis?.topDiagnosis ?? "",
      ""
    );

    const actionPlan: string[] = await this.callTool("createActionPlan", {
      diagnosis: upstream?.diagnosis?.topDiagnosis ?? "",
      guidelines,
    });

    const urgentFlags: string[] = [];
    if (upstream?.triage?.urgencyScore >= 4) urgentFlags.push(`High urgency: ${upstream.triage.urgencyLabel}`);
    for (const f of upstream?.safety?.flaggedClaims ?? []) {
      urgentFlags.push(`Safety flag: ${f.claim.slice(0, 80)}`);
    }
    for (const w of upstream?.pharmacology?.warnings ?? []) urgentFlags.push(`Pharmacy: ${w}`);

    const citations: string[] = [];
    for (const p of upstream?.literature?.papers ?? []) citations.push(p.citation);
    for (const g of guidelines.slice(0, 2)) citations.push(`${g.metadata.title} (${g.metadata.organization}, ${g.metadata.year})`);

    return {
      result: { soapNote, clinicalSummary, actionPlan, urgentFlags, citations },
      sources: guidelines,
    };
  }
}
