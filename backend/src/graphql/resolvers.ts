import { MOCK_PATIENTS, getPatient } from "../mock-data/patients.js";
import { MOCK_DRUGS, getDrug } from "../mock-data/drugs.js";
import { MOCK_ICD_CODES, getICD } from "../mock-data/icd-codes.js";
import { MOCK_GUIDELINES } from "../mock-data/guidelines.js";

export const resolvers = {
  Query: {
    patient: (_: any, { id }: { id: string }) => getPatient(id) || null,
    patients: () => MOCK_PATIENTS,

    drug: (_: any, { name }: { name: string }) => getDrug(name) || null,

    drugInteractions: (_: any, { medications }: { medications: string[] }) => {
      const interactions: { drug: string; severity: string; effect: string }[] = [];
      const seen = new Set<string>();
      for (let i = 0; i < medications.length; i++) {
        const drugA = getDrug(medications[i]);
        if (!drugA) continue;
        for (let j = 0; j < medications.length; j++) {
          if (i === j) continue;
          const targetName = medications[j].toLowerCase();
          for (const inter of drugA.interactions) {
            if (
              inter.drug.toLowerCase() === targetName ||
              targetName.includes(inter.drug.toLowerCase()) ||
              inter.drug.toLowerCase().includes(targetName)
            ) {
              const key = `${drugA.name}|${inter.drug}|${inter.severity}`;
              const revKey = `${inter.drug}|${drugA.name}|${inter.severity}`;
              if (!seen.has(key) && !seen.has(revKey)) {
                interactions.push({
                  drug: `${drugA.name} + ${inter.drug}`,
                  severity: inter.severity,
                  effect: inter.effect,
                });
                seen.add(key);
              }
            }
          }
        }
      }
      return interactions;
    },

    icdCode: (_: any, { code }: { code: string }) => getICD(code) || null,

    searchICDBySymptoms: (_: any, { symptoms }: { symptoms: string[] }) => {
      const symptomsLower = symptoms.map((s) => s.toLowerCase());
      const scored = MOCK_ICD_CODES.map((icd) => {
        let score = 0;
        for (const s of symptomsLower) {
          for (const cs of icd.commonSymptoms) {
            if (cs.toLowerCase().includes(s) || s.includes(cs.toLowerCase())) {
              score += 1;
            }
          }
        }
        return { icd, score };
      })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((s) => s.icd);
      return scored;
    },

    guidelines: (_: any, { condition }: { condition: string }) => {
      const c = condition.toLowerCase();
      return MOCK_GUIDELINES.filter(
        (g) =>
          g.condition.toLowerCase().includes(c) ||
          c.includes(g.condition.toLowerCase()) ||
          g.keywords.some((k) => k.toLowerCase().includes(c) || c.includes(k.toLowerCase()))
      );
    },

    checkContraindications: (
      _: any,
      { medications, allergies }: { medications: string[]; allergies: string[] }
    ) => {
      const warnings: string[] = [];
      const allergiesLower = allergies.map((a) => a.toLowerCase());

      for (const med of medications) {
        const drug = getDrug(med);
        if (!drug) continue;
        for (const allergy of allergiesLower) {
          if (
            drug.contraindications.some((ci) => ci.toLowerCase().includes(allergy))
          ) {
            warnings.push(`${drug.name} contraindicated due to ${allergy} allergy`);
          }
          if (
            allergy.includes("penicillin") &&
            (drug.class.toLowerCase().includes("penicillin") ||
              drug.name.toLowerCase().includes("amoxicillin") ||
              drug.name.toLowerCase().includes("piperacillin"))
          ) {
            warnings.push(`${drug.name} contraindicated: penicillin class with penicillin allergy`);
          }
          if (
            allergy.includes("sulfonamide") &&
            drug.contraindications.some((ci) => ci.toLowerCase().includes("sulfonamide"))
          ) {
            warnings.push(`${drug.name} contraindicated: sulfonamide hypersensitivity`);
          }
        }
      }
      return warnings;
    },
  },
};
