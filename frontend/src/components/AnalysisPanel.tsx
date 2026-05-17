import { useState } from "react";
import { FullAnalysis } from "../types";
import DiagnosisCard from "./DiagnosisCard";
import LiteratureCard from "./LiteratureCard";
import DrugInteractions from "./DrugInteractions";
import HallucinationReport from "./HallucinationReport";
import SOAPNote from "./SOAPNote";
import AgentTrace from "./AgentTrace";

type Tab = "overview" | "diagnosis" | "literature" | "medications" | "safety" | "soap" | "trace";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "diagnosis", label: "Diagnosis" },
  { id: "literature", label: "Literature" },
  { id: "medications", label: "Medications" },
  { id: "safety", label: "Safety Report" },
  { id: "soap", label: "SOAP Note" },
  { id: "trace", label: "Agent Trace" },
];

export default function AnalysisPanel({ analysis }: { analysis: FullAnalysis }) {
  const [tab, setTab] = useState<Tab>("overview");
  const a = analysis.analysis;

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-4 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-rose-500">
            <div className="text-xs uppercase font-semibold text-rose-600 mb-1">Triage</div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold">{a.triage.urgencyScore}/5</span>
              <span className="text-sm font-semibold uppercase">{a.triage.urgencyLabel}</span>
            </div>
            <div className="text-sm text-slate-700 mb-3">{a.triage.triageReasoning}</div>
            {a.triage.redFlags.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Red flags</div>
                <div className="flex flex-wrap gap-1">
                  {a.triage.redFlags.map((r) => (
                    <span key={r} className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DiagnosisCard
            differentials={a.diagnosis.differentials}
            topDiagnosis={a.diagnosis.topDiagnosis}
            confidence={a.diagnosis.confidence}
          />
          <HallucinationReport
            overallConfidence={a.safety.overallConfidence}
            flaggedClaims={a.safety.flaggedClaims}
            verifiedClaims={a.safety.verifiedClaims}
            humanReviewRequired={a.safety.humanReviewRequired}
            contradictions={a.safety.contradictions}
          />
          <DrugInteractions {...a.pharmacology} />
        </div>
      )}

      {tab === "diagnosis" && (
        <div className="space-y-4">
          <DiagnosisCard
            differentials={a.diagnosis.differentials}
            topDiagnosis={a.diagnosis.topDiagnosis}
            confidence={a.diagnosis.confidence}
          />
          <div className="bg-white p-4 rounded border border-slate-200">
            <div className="text-xs uppercase font-semibold text-slate-500 mb-2">Reasoning</div>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap">{a.diagnosis.reasoning}</pre>
          </div>
        </div>
      )}

      {tab === "literature" && (
        <LiteratureCard papers={a.literature.papers} evidenceLevel={a.literature.evidenceLevel} />
      )}

      {tab === "medications" && <DrugInteractions {...a.pharmacology} />}

      {tab === "safety" && (
        <HallucinationReport
          overallConfidence={a.safety.overallConfidence}
          flaggedClaims={a.safety.flaggedClaims}
          verifiedClaims={a.safety.verifiedClaims}
          humanReviewRequired={a.safety.humanReviewRequired}
          contradictions={a.safety.contradictions}
        />
      )}

      {tab === "soap" && (
        <SOAPNote
          note={a.summary.soapNote}
          summary={a.summary.clinicalSummary}
          plan={a.summary.actionPlan}
          citations={a.summary.citations}
        />
      )}

      {tab === "trace" && <AgentTrace outputs={analysis.agentOutputs} />}
    </div>
  );
}
