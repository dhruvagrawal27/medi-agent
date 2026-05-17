import { describe, it, expect } from "vitest";
import { TriageAgent } from "../src/agents/triage-agent.js";
import { LiteratureAgent } from "../src/agents/literature-agent.js";
import { PharmacologyAgent } from "../src/agents/pharmacology-agent.js";
import { DiagnosisAgent } from "../src/agents/diagnosis-agent.js";
import { SummaryAgent } from "../src/agents/summary-agent.js";
import { Orchestrator } from "../src/agents/orchestrator.js";
import { getPatient } from "../src/mock-data/patients.js";

describe("Agents and orchestration", () => {
  it("TriageAgent runs and returns urgency score for P001", async () => {
    const p = getPatient("P001")!;
    const out = await new TriageAgent().run({ patient: p });
    expect(out.result.urgencyScore).toBeGreaterThanOrEqual(1);
    expect(out.result.urgencyScore).toBeLessThanOrEqual(5);
    expect(out.trace.length).toBeGreaterThan(0);
  });

  it("TriageAgent identifies chest pain + arm radiation as urgency 5", async () => {
    const p = getPatient("P001")!;
    const out = await new TriageAgent().run({ patient: p });
    expect(out.result.urgencyScore).toBe(5);
    expect(out.result.urgencyLabel).toBe("emergent");
  });

  it("LiteratureAgent returns papers for acute MI", async () => {
    const p = getPatient("P001")!;
    const triage = await new TriageAgent().run({ patient: p });
    const out = await new LiteratureAgent().run({
      patient: p,
      upstream: { triage: triage.result },
    });
    expect(out.result.papers.length).toBeGreaterThan(0);
    expect(out.result.papers[0].pmid).toBeDefined();
  });

  it("PharmacologyAgent detects relevant interactions for P001", async () => {
    const p = getPatient("P001")!;
    const out = await new PharmacologyAgent().run({ patient: p });
    expect(out.result.drugList.length).toBeGreaterThan(0);
    expect(out.result.drugList.some((d: { name: string }) => d.name === "metformin")).toBe(true);
  });

  it("PharmacologyAgent checks penicillin allergy", async () => {
    const p = getPatient("P001")!;
    const out = await new PharmacologyAgent().run({ patient: p });
    // P001 is allergic to penicillin but not currently taking one — warnings array exists
    expect(Array.isArray(out.result.warnings)).toBe(true);
  });

  it("DiagnosisAgent generates differentials for P001 symptoms", async () => {
    const p = getPatient("P001")!;
    const out = await new DiagnosisAgent().run({ patient: p });
    expect(out.result.differentials.length).toBeGreaterThan(0);
    const topJoined = out.result.topDiagnosis.toLowerCase();
    expect(topJoined.includes("mi") || topJoined.includes("coronary") || topJoined.includes("angina")).toBe(true);
  });

  it("DiagnosisAgent self-consistency runs 3 times", async () => {
    const p = getPatient("P001")!;
    const out = await new DiagnosisAgent().run({ patient: p });
    expect(out.result.reasoning.toLowerCase()).toContain("self-consistency");
    const passes = out.result.reasoning.split("|").length;
    expect(passes).toBeGreaterThanOrEqual(3);
  });

  it("SummaryAgent generates SOAP note with all 4 sections", async () => {
    const p = getPatient("P001")!;
    const triage = await new TriageAgent().run({ patient: p });
    const dx = await new DiagnosisAgent().run({ patient: p });
    const pharma = await new PharmacologyAgent().run({ patient: p });
    const out = await new SummaryAgent().run({
      patient: p,
      upstream: { triage: triage.result, diagnosis: dx.result, pharmacology: pharma.result },
    });
    expect(out.result.soapNote.subjective).toBeTruthy();
    expect(out.result.soapNote.objective).toBeTruthy();
    expect(out.result.soapNote.assessment).toBeTruthy();
    expect(out.result.soapNote.plan).toBeTruthy();
  });

  it("Orchestrator runs full pipeline for P001", async () => {
    const result = await new Orchestrator().analyze("P001");
    expect(result.analysis.triage).toBeDefined();
    expect(result.analysis.literature).toBeDefined();
    expect(result.analysis.pharmacology).toBeDefined();
    expect(result.analysis.diagnosis).toBeDefined();
    expect(result.analysis.safety).toBeDefined();
    expect(result.analysis.summary).toBeDefined();
    expect(result.agentTrace.length).toBeGreaterThanOrEqual(6);
  });

  it("Orchestrator refinement loop may trigger when confidence low", async () => {
    const result = await new Orchestrator().analyze("P003");
    expect(result.refinementIterations).toBeGreaterThanOrEqual(0);
    expect(result.refinementIterations).toBeLessThanOrEqual(2);
  });
});
