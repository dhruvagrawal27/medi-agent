import { BaseAgent, Tool, AgentInput } from "./base-agent.js";
import { ragEngine, RAGResult } from "../rag/rag-engine.js";
import { gqlClient } from "../graphql/client.js";
import { getDrug } from "../mock-data/drugs.js";

export interface PharmacologyOutput {
  interactions: { drugs: string; severity: string; effect: string }[];
  warnings: string[];
  adjustments: string[];
  safeAlternatives: string[];
  drugList: { name: string; class: string; indication: string }[];
}

export class PharmacologyAgent extends BaseAgent {
  constructor() {
    super("PharmacologyAgent");
  }

  protected defineTools(): Tool[] {
    return [
      {
        name: "lookupDrug",
        description: "GraphQL drug lookup",
        execute: async ({ name }: { name: string }) => gqlClient.drug(name),
      },
      {
        name: "checkInteractions",
        description: "Pairwise interaction checker via GraphQL",
        execute: async ({ medications }: { medications: string[] }) =>
          gqlClient.drugInteractions(medications),
      },
      {
        name: "checkAllergyCross",
        description: "Check allergy cross-reactivity",
        execute: async ({ medications, allergies }: { medications: string[]; allergies: string[] }) =>
          gqlClient.checkContraindications(medications, allergies),
      },
      {
        name: "renalDoseAdjust",
        description: "Suggest renal dose adjustments",
        execute: async ({ medications, creatinine }: { medications: string[]; creatinine?: number }) => {
          if (creatinine === undefined) return [];
          const adjustments: string[] = [];
          for (const med of medications) {
            const drug = getDrug(med);
            if (!drug) continue;
            if (drug.renalDosing && creatinine > 1.3) {
              adjustments.push(`${drug.name}: reduce dose; eGFR estimate compromised (Cr ${creatinine})`);
            }
          }
          return adjustments;
        },
      },
      {
        name: "checkContraindications",
        description: "Check drug contraindications against conditions",
        execute: async ({ medications, conditions }: { medications: string[]; conditions: string[] }) => {
          const warns: string[] = [];
          for (const med of medications) {
            const drug = getDrug(med);
            if (!drug) continue;
            for (const cond of conditions) {
              const cLow = cond.toLowerCase();
              for (const ci of drug.contraindications) {
                if (ci.toLowerCase().includes(cLow) || cLow.includes(ci.toLowerCase())) {
                  warns.push(`${drug.name} contraindicated in ${cond}`);
                }
              }
            }
          }
          return warns;
        },
      },
    ];
  }

  protected async execute(input: AgentInput): Promise<{ result: PharmacologyOutput; sources: RAGResult[] }> {
    const patient = input.patient;
    const meds: string[] = patient?.currentMedications || [];
    const allergies: string[] = patient?.allergies || [];
    const conditions: string[] = patient?.history || [];
    const creatinine: number | undefined = patient?.labs?.creatinine;

    this.log({ thought: `Checking ${meds.length} medications, ${allergies.length} allergies.` });

    const interactionsRaw = await this.callTool("checkInteractions", { medications: meds });
    const allergyWarns: string[] = await this.callTool("checkAllergyCross", {
      medications: meds,
      allergies,
    });
    const adjustments: string[] = await this.callTool("renalDoseAdjust", {
      medications: meds,
      creatinine,
    });
    const condWarns: string[] = await this.callTool("checkContraindications", {
      medications: meds,
      conditions,
    });

    const drugList: PharmacologyOutput["drugList"] = [];
    for (const m of meds) {
      const d = getDrug(m);
      if (d) {
        drugList.push({
          name: d.name,
          class: d.class,
          indication: d.indications[0] || "unspecified",
        });
      }
    }

    const drugSources = await ragEngine.searchDrugs(meds.join(" "), 6);

    const interactions = interactionsRaw.map((i: any) => ({
      drugs: i.drug,
      severity: i.severity,
      effect: i.effect,
    }));

    const safeAlternatives: string[] = [];
    if (interactions.some((i: any) => i.severity === "severe" || i.severity === "contraindicated")) {
      safeAlternatives.push("Consider non-interacting alternatives (e.g., pantoprazole for omeprazole; rosuvastatin for CYP3A4 statins).");
    }

    return {
      result: {
        interactions,
        warnings: [...allergyWarns, ...condWarns],
        adjustments,
        safeAlternatives,
        drugList,
      },
      sources: drugSources,
    };
  }
}
