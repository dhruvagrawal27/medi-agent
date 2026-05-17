import { describe, it, expect } from "vitest";
import { resolvers } from "../src/graphql/resolvers.js";

describe("GraphQL resolvers", () => {
  it("returns all 5 patients", () => {
    const patients = resolvers.Query.patients();
    expect(patients.length).toBe(5);
  });

  it("patient(id: P001) returns Rajesh Kumar", () => {
    const p = resolvers.Query.patient(null, { id: "P001" });
    expect(p?.name).toBe("Rajesh Kumar");
  });

  it("drugInteractions for metformin + lisinopril returns at least 0 entries (smoke)", () => {
    const interactions = resolvers.Query.drugInteractions(null, {
      medications: ["metformin", "lisinopril"],
    });
    expect(Array.isArray(interactions)).toBe(true);
  });

  it("searchICDBySymptoms for chest pain returns cardiac codes", () => {
    const icds = resolvers.Query.searchICDBySymptoms(null, {
      symptoms: ["chest pain", "dyspnea"],
    });
    expect(icds.length).toBeGreaterThan(0);
    const cats = icds.map((i: any) => i.category);
    expect(cats.some((c: string) => c === "Cardiovascular" || c === "Symptoms")).toBe(true);
  });

  it("checkContraindications detects penicillin with amoxicillin", () => {
    const warns = resolvers.Query.checkContraindications(null, {
      medications: ["amoxicillin"],
      allergies: ["penicillin"],
    });
    expect(warns.length).toBeGreaterThan(0);
    expect(warns[0].toLowerCase()).toContain("penicillin");
  });
});
