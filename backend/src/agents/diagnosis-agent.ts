import { BaseAgent, Tool, AgentInput } from "./base-agent.js";
import { ragEngine, RAGResult } from "../rag/rag-engine.js";
import { gqlClient } from "../graphql/client.js";

export interface EvidenceLink {
  source: "pubmed" | "guideline" | "icd";
  sourceId: string;
  excerpt: string;
}

export interface Differential {
  diagnosis: string;
  icdCode: string;
  probability: number;
  reasoning: string;
  evidenceLinks: EvidenceLink[];
}

export interface DiagnosisOutput {
  differentials: Differential[];
  topDiagnosis: string;
  topIcd: string;
  confidence: number;
  reasoning: string;
}

// Deterministic, evidence-driven differential generator. Works without an LLM
// using a rule-based scoring over the mock data, then runs three "reasonings"
// (with light perturbations) to provide a self-consistency vote.

interface DxCandidate {
  diagnosis: string;
  icd: string;
  score: number;
  features: string[];
}

function scoreCandidates(
  symptoms: string[],
  labs: Record<string, number>,
  history: string[]
): DxCandidate[] {
  const s = new Set(symptoms.map((x) => x.toLowerCase()));
  const h = new Set(history.map((x) => x.toLowerCase()));
  const candidates: DxCandidate[] = [];

  // Cardiac
  {
    let score = 0;
    const features: string[] = [];
    if (s.has("chest pain")) { score += 3; features.push("chest pain"); }
    if (s.has("left arm radiation")) { score += 3; features.push("arm radiation"); }
    if (s.has("diaphoresis")) { score += 2; features.push("diaphoresis"); }
    if (s.has("dyspnea")) { score += 1; features.push("dyspnea"); }
    if (s.has("nausea")) { score += 0.5; features.push("nausea"); }
    if ((labs.troponin ?? 0) > 0.04) { score += 4; features.push(`troponin ${labs.troponin}`); }
    if ((labs.bnp ?? 0) > 100) { score += 1; features.push(`bnp ${labs.bnp}`); }
    if (Array.from(h).some((x) => x.includes("diabetes"))) score += 1;
    if (Array.from(h).some((x) => x.includes("hypertension"))) score += 0.5;
    candidates.push({ diagnosis: "Acute MI (NSTEMI)", icd: "I21.4", score, features });
    candidates.push({ diagnosis: "Unstable angina", icd: "I20.0", score: Math.max(0, score - 2), features });
  }

  // Bacterial meningitis
  {
    let score = 0;
    const features: string[] = [];
    if (s.has("severe headache")) { score += 2.5; features.push("severe headache"); }
    if (s.has("neck stiffness")) { score += 3; features.push("neck stiffness"); }
    if (s.has("photophobia")) { score += 2; features.push("photophobia"); }
    if (s.has("fever")) { score += 1.5; features.push("fever"); }
    if (s.has("vomiting")) { score += 0.5; features.push("vomiting"); }
    if ((labs.wbc ?? 0) > 15) { score += 1.5; features.push(`wbc ${labs.wbc}`); }
    if ((labs.csf_wbc ?? 0) > 500) { score += 4; features.push(`CSF WBC ${labs.csf_wbc}`); }
    if ((labs.csf_glucose ?? 100) < 40) { score += 3; features.push(`CSF glucose ${labs.csf_glucose}`); }
    if ((labs.procalcitonin ?? 0) > 0.5) { score += 2; features.push(`PCT ${labs.procalcitonin}`); }
    candidates.push({ diagnosis: "Bacterial meningitis", icd: "G00.9", score, features });
    candidates.push({ diagnosis: "Viral meningitis", icd: "G03.9", score: Math.max(0, score - 4), features });
  }

  // NPH / dementia / electrolyte
  {
    let nph = 0;
    const features: string[] = [];
    if (s.has("gait instability")) { nph += 2; features.push("gait instability"); }
    if (s.has("urinary incontinence")) { nph += 2; features.push("urinary incontinence"); }
    if (s.has("confusion") || s.has("memory loss")) { nph += 1.5; features.push("cognitive decline"); }
    candidates.push({ diagnosis: "Normal pressure hydrocephalus", icd: "G91.2", score: nph, features: [...features] });

    let hypoNa = 0;
    const hypoF: string[] = [];
    if ((labs.sodium ?? 140) < 130) { hypoNa += 4; hypoF.push(`Na ${labs.sodium}`); }
    if (s.has("confusion")) { hypoNa += 1; hypoF.push("confusion"); }
    candidates.push({ diagnosis: "Hyponatremia-induced encephalopathy", icd: "E87.1", score: hypoNa, features: hypoF });

    let b12 = 0;
    const b12F: string[] = [];
    if ((labs.b12 ?? 400) < 200) { b12 += 3; b12F.push(`B12 ${labs.b12}`); }
    if (s.has("memory loss") || s.has("confusion")) { b12 += 1; b12F.push("cognitive symptoms"); }
    candidates.push({ diagnosis: "Vitamin B12 deficiency", icd: "E53.8", score: b12, features: b12F });
  }

  // Hyperthyroidism / Graves
  {
    let score = 0;
    const features: string[] = [];
    if (s.has("palpitations")) { score += 2; features.push("palpitations"); }
    if (s.has("weight loss")) { score += 2; features.push("weight loss"); }
    if (s.has("heat intolerance")) { score += 2; features.push("heat intolerance"); }
    if (s.has("tremor")) { score += 1.5; features.push("tremor"); }
    if (s.has("anxiety")) { score += 0.5; features.push("anxiety"); }
    if ((labs.tsh ?? 2) < 0.1) { score += 3; features.push(`TSH ${labs.tsh}`); }
    if ((labs.ft4 ?? 1.5) > 2.5) { score += 2; features.push(`fT4 ${labs.ft4}`); }
    if ((labs.trab ?? 0) > 1.5) { score += 3; features.push(`TRAb ${labs.trab}`); }
    candidates.push({ diagnosis: "Graves' disease (hyperthyroidism)", icd: "E05.00", score, features });
  }

  // Cholangitis / biliary obstruction / DILI
  {
    let score = 0;
    const features: string[] = [];
    if (s.has("jaundice")) { score += 2; features.push("jaundice"); }
    if (s.has("ruq pain")) { score += 2; features.push("RUQ pain"); }
    if (s.has("fever")) { score += 2; features.push("fever (Charcot)"); }
    if (s.has("dark urine")) { score += 1; features.push("dark urine"); }
    if (s.has("pruritus")) { score += 0.5; features.push("pruritus"); }
    if ((labs.bilirubin_total ?? 1) > 3) { score += 2; features.push(`bili ${labs.bilirubin_total}`); }
    if ((labs.alp ?? 100) > 300) { score += 2; features.push(`ALP ${labs.alp}`); }
    if ((labs.ggt ?? 50) > 200) { score += 1; features.push(`GGT ${labs.ggt}`); }
    candidates.push({ diagnosis: "Acute cholangitis (choledocholithiasis)", icd: "K80.30", score, features });

    let dili = 0;
    const dF: string[] = [];
    if ((labs.alt ?? 30) > 200) { dili += 2; dF.push(`ALT ${labs.alt}`); }
    if ((labs.ast ?? 30) > 200) { dili += 2; dF.push(`AST ${labs.ast}`); }
    if (s.has("jaundice")) { dili += 0.5; dF.push("jaundice"); }
    candidates.push({ diagnosis: "Drug-induced liver injury (NSAID)", icd: "K71.6", score: dili, features: dF });
  }

  return candidates
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);
}

export class DiagnosisAgent extends BaseAgent {
  constructor() {
    super("DiagnosisAgent");
  }

  protected defineTools(): Tool[] {
    return [
      {
        name: "generateDifferentials",
        description: "Produce top 5 differential diagnoses",
        execute: async ({ symptoms, labs, history }: { symptoms: string[]; labs: any; history: string[] }) => {
          return scoreCandidates(symptoms, labs ?? {}, history ?? []);
        },
      },
      {
        name: "weightEvidence",
        description: "Score evidence supporting a diagnosis from retrieved docs",
        execute: async ({ diagnosis, docs }: { diagnosis: string; docs: RAGResult[] }) => {
          const target = diagnosis.toLowerCase();
          let support = 0;
          const links: EvidenceLink[] = [];
          for (const d of docs) {
            const text = d.text.toLowerCase();
            const targetTokens = target.split(/\s+/).filter((t) => t.length > 3);
            let hits = 0;
            for (const t of targetTokens) if (text.includes(t)) hits++;
            if (hits > 0) {
              support += hits;
              links.push({
                source: d.source as any,
                sourceId: d.id,
                excerpt: d.text.slice(0, 180),
              });
            }
          }
          return { support, links: links.slice(0, 3) };
        },
      },
      {
        name: "rankDifferentials",
        description: "Convert scores to probabilities and rank",
        execute: async ({ candidates }: { candidates: DxCandidate[] }) => {
          const top = candidates.slice(0, 5);
          const total = top.reduce((s, c) => s + c.score, 0) || 1;
          return top.map((c) => ({ ...c, probability: Math.round((c.score / total) * 100) / 100 }));
        },
      },
      {
        name: "selfConsistencyVote",
        description: "Run 3 independent reasoning passes and vote",
        execute: async ({ candidates }: { candidates: DxCandidate[] }) => {
          // 3 passes with slightly perturbed weights → pick majority top
          const top: string[] = [];
          for (let run = 0; run < 3; run++) {
            const noise = run === 0 ? 0 : run === 1 ? 0.1 : -0.1;
            const sorted = [...candidates]
              .map((c) => ({ ...c, score: c.score * (1 + noise * (c.score % 1)) }))
              .sort((a, b) => b.score - a.score);
            top.push(sorted[0]?.diagnosis ?? "unknown");
          }
          const counts: Record<string, number> = {};
          for (const t of top) counts[t] = (counts[t] || 0) + 1;
          const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          return { winner: winner[0], votes: winner[1], passes: top };
        },
      },
    ];
  }

  protected async execute(input: AgentInput): Promise<{ result: DiagnosisOutput; sources: RAGResult[] }> {
    const patient = input.patient;
    const symptoms = input.upstream?.triage?.extractedSymptoms ?? patient?.symptoms ?? [];
    const labs = patient?.labs ?? {};
    const history = patient?.history ?? [];

    this.log({ thought: `Generating differential diagnoses for ${symptoms.length} symptoms.` });

    const candidates: DxCandidate[] = await this.callTool("generateDifferentials", {
      symptoms,
      labs,
      history,
    });

    const litSources: RAGResult[] = input.upstream?.literatureSources ?? [];
    const allSources: RAGResult[] = [...litSources];

    const guidelineSources = await ragEngine.searchGuidelines(symptoms.join(" "), "");
    allSources.push(...guidelineSources);

    const icdSources = await ragEngine.searchICDCodes(symptoms.join(" "), 5);
    allSources.push(...icdSources);

    const ranked = await this.callTool("rankDifferentials", { candidates });

    const vote = await this.callTool("selfConsistencyVote", { candidates: ranked });

    const differentials: Differential[] = [];
    for (const c of ranked.slice(0, 5)) {
      const ev = await this.callTool("weightEvidence", { diagnosis: c.diagnosis, docs: allSources });
      differentials.push({
        diagnosis: c.diagnosis,
        icdCode: c.icd,
        probability: c.probability,
        reasoning: `Features: ${c.features.join(", ")}.`,
        evidenceLinks: ev.links,
      });
    }

    const top = differentials[0];
    const winnerObj = differentials.find((d) => d.diagnosis === vote.winner) ?? top;
    const consistencyConf = vote.votes / 3;

    return {
      result: {
        differentials,
        topDiagnosis: winnerObj?.diagnosis ?? "indeterminate",
        topIcd: winnerObj?.icdCode ?? "R69",
        confidence: Math.min(1, (winnerObj?.probability ?? 0) * 0.6 + consistencyConf * 0.4),
        reasoning: `Self-consistency: ${vote.passes.join(" | ")}. Winner picked ${vote.votes}/3.`,
      },
      sources: allSources,
    };
  }
}
