import { BaseAgent, Tool, AgentInput } from "./base-agent.js";
import { ragEngine, RAGResult } from "../rag/rag-engine.js";
import { gqlClient } from "../graphql/client.js";

const RED_FLAGS = new Set([
  "chest pain",
  "left arm radiation",
  "dyspnea",
  "diaphoresis",
  "severe headache",
  "neck stiffness",
  "photophobia",
  "altered mental status",
  "confusion",
  "jaundice",
  "ruq pain",
  "weakness",
  "facial droop",
  "seizure",
  "fever",
]);

export interface TriageOutput {
  urgencyScore: 1 | 2 | 3 | 4 | 5;
  urgencyLabel: "routine" | "low" | "moderate" | "high" | "emergent";
  redFlags: string[];
  extractedSymptoms: string[];
  probableICDRange: string[];
  triageReasoning: string;
}

export class TriageAgent extends BaseAgent {
  constructor() {
    super("TriageAgent");
  }

  protected defineTools(): Tool[] {
    return [
      {
        name: "extractSymptoms",
        description: "Extract structured symptoms from free-text chief complaint",
        execute: async ({ text, symptoms }: { text: string; symptoms?: string[] }) => {
          if (symptoms && symptoms.length > 0) return symptoms;
          return text
            .toLowerCase()
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        },
      },
      {
        name: "scoreUrgency",
        description: "Score urgency 1-5 from symptoms and vitals",
        execute: async ({ symptoms, vitals }: { symptoms: string[]; vitals: any }) => {
          let score = 1;
          const reasons: string[] = [];
          const symLower = symptoms.map((s) => s.toLowerCase());

          const cardiac =
            symLower.includes("chest pain") &&
            (symLower.includes("left arm radiation") ||
              symLower.includes("diaphoresis") ||
              symLower.includes("dyspnea"));
          if (cardiac) {
            score = 5;
            reasons.push("Cardiac chest pain syndrome");
          }

          const meningitis =
            symLower.includes("severe headache") &&
            symLower.includes("neck stiffness") &&
            (symLower.includes("fever") || symLower.includes("photophobia"));
          if (meningitis) {
            score = 5;
            reasons.push("Meningitis triad present");
          }

          if (vitals?.spo2 !== undefined && vitals.spo2 < 92) {
            score = Math.max(score, 5);
            reasons.push("Severe hypoxia");
          }
          if (vitals?.hr !== undefined && vitals.hr > 120) {
            score = Math.max(score, 4);
            reasons.push("Tachycardia");
          }
          if (vitals?.temp !== undefined && vitals.temp >= 39.0) {
            score = Math.max(score, 4);
            reasons.push("High-grade fever");
          }
          if (symLower.includes("jaundice") && symLower.includes("fever")) {
            score = Math.max(score, 4);
            reasons.push("Possible cholangitis");
          }
          if (
            symLower.includes("palpitations") &&
            symLower.includes("weight loss") &&
            symLower.includes("tremor")
          ) {
            score = Math.max(score, 3);
            reasons.push("Hyperthyroidism suspected");
          }
          if (symLower.includes("confusion") || symLower.includes("altered mental status")) {
            score = Math.max(score, 3);
            reasons.push("Altered mentation");
          }

          const labels: TriageOutput["urgencyLabel"][] = ["routine", "low", "moderate", "high", "emergent"];
          return {
            score,
            label: labels[score - 1],
            justification: reasons.join("; ") || "Stable presentation",
          };
        },
      },
      {
        name: "mapToICD",
        description: "Map symptoms to candidate ICD-10 codes (BM25)",
        execute: async ({ symptoms }: { symptoms: string[] }) => {
          const query = symptoms.join(" ");
          const results = await ragEngine.searchICDCodes(query, 5);
          return results.map((r) => ({
            code: r.metadata.code,
            description: r.metadata.description,
            urgencyLevel: r.metadata.urgencyLevel,
          }));
        },
      },
      {
        name: "checkRedFlags",
        description: "Check symptoms against red-flag list",
        execute: async ({ symptoms }: { symptoms: string[] }) => {
          return symptoms.filter((s) => RED_FLAGS.has(s.toLowerCase()));
        },
      },
    ];
  }

  protected async execute(input: AgentInput): Promise<{ result: TriageOutput; sources: RAGResult[] }> {
    const patient = input.patient;
    this.log({ thought: `Assessing ${patient.id} (${patient.name}, ${patient.age}${patient.gender[0]}).` });

    const extractedSymptoms: string[] = await this.callTool("extractSymptoms", {
      text: patient.chiefComplaint,
      symptoms: patient.symptoms,
    });

    const urgency = await this.callTool("scoreUrgency", {
      symptoms: extractedSymptoms,
      vitals: patient.vitals,
    });

    const icdHits = await this.callTool("mapToICD", { symptoms: extractedSymptoms });
    const redFlags: string[] = await this.callTool("checkRedFlags", { symptoms: extractedSymptoms });

    const sources = await ragEngine.searchICDCodes(extractedSymptoms.join(" "), 5);

    const gqlIcd = gqlClient.searchICDBySymptoms(extractedSymptoms);

    const probableICDRange = [
      ...icdHits.map((i: any) => i.code),
      ...gqlIcd.slice(0, 3).map((i: any) => i.code),
    ];

    const result: TriageOutput = {
      urgencyScore: urgency.score,
      urgencyLabel: urgency.label,
      redFlags,
      extractedSymptoms,
      probableICDRange: Array.from(new Set(probableICDRange)).slice(0, 6),
      triageReasoning: `Urgency ${urgency.score}/5 (${urgency.label}). ${urgency.justification}. Red flags: ${redFlags.join(", ") || "none"}. Candidate ICD: ${probableICDRange.slice(0, 4).join(", ")}.`,
    };

    return { result, sources };
  }
}
