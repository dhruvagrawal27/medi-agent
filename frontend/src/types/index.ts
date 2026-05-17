export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  chiefComplaint: string;
}

export interface Vitals {
  bp: string;
  hr: number;
  temp: number;
  rr: number;
  spo2: number;
}

export interface Patient extends PatientSummary {
  symptoms: string[];
  vitals: Vitals;
  labs: Record<string, number>;
  currentMedications: string[];
  allergies: string[];
  history: string[];
  smokingStatus: string;
  familyHistory: string[];
}

export interface EvidenceLink {
  source: string;
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

export interface CitedPaper {
  pmid: string;
  title: string;
  journal: string;
  year: number;
  citation: string;
  keyFinding: string;
  relevanceScore: number;
}

export interface DrugInteraction {
  drugs: string;
  severity: string;
  effect: string;
}

export interface VerifiedClaim {
  claim: string;
  confidence: number;
  verdict: "supported" | "unsupported" | "uncertain";
  supportingSourceIds: string[];
}

export interface FlaggedClaim {
  claim: string;
  reason: string;
  confidence: number;
  agent: string;
}

export interface ReActStep {
  thought: string;
  action?: string;
  actionInput?: any;
  observation?: string;
  isFinal?: boolean;
  finalAnswer?: string;
}

export interface AgentOutput {
  agentName: string;
  timestamp: string;
  processingTimeMs: number;
  ragSourcesUsed: string[];
  trace: ReActStep[];
  result: any;
  confidence: number;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface FullAnalysis {
  patientId: string;
  patient: Patient;
  analysis: {
    triage: {
      urgencyScore: number;
      urgencyLabel: string;
      redFlags: string[];
      extractedSymptoms: string[];
      probableICDRange: string[];
      triageReasoning: string;
    };
    literature: {
      papers: CitedPaper[];
      keyFindings: string[];
      evidenceLevel: string;
    };
    pharmacology: {
      interactions: DrugInteraction[];
      warnings: string[];
      adjustments: string[];
      safeAlternatives: string[];
      drugList: { name: string; class: string; indication: string }[];
    };
    diagnosis: {
      differentials: Differential[];
      topDiagnosis: string;
      topIcd: string;
      confidence: number;
      reasoning: string;
    };
    safety: {
      verifiedClaims: VerifiedClaim[];
      flaggedClaims: FlaggedClaim[];
      overallConfidence: number;
      humanReviewRequired: boolean;
      contradictions: any[];
    };
    summary: {
      soapNote: SOAPNote;
      clinicalSummary: string;
      actionPlan: string[];
      urgentFlags: string[];
      citations: string[];
    };
  };
  agentOutputs: AgentOutput[];
  agentTrace: ReActStep[][];
  hallucinationReport: {
    overallConfidence: number;
    flaggedClaims: FlaggedClaim[];
    humanReviewRequired: boolean;
  };
  processingTimeMs: number;
  refinementIterations: number;
}
