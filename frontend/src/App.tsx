import { useEffect, useState } from "react";
import { FullAnalysis, PatientSummary } from "./types";
import PatientSelector from "./components/PatientSelector";
import AnalysisPanel from "./components/AnalysisPanel";

export default function App() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urgencyMap, setUrgencyMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data: PatientSummary[]) => {
        setPatients(data);
        if (!selectedId && data[0]) setSelectedId(data[0].id);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const runAnalysis = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedId }),
      });
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      const data: FullAnalysis = await r.json();
      setAnalysis(data);
      setUrgencyMap((prev) => ({ ...prev, [selectedId]: data.analysis.triage.urgencyScore }));
    } catch (e: any) {
      setError(e?.message ?? "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">CC</div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900">ClinicalCopilot</div>
            <div className="text-[11px] text-slate-500">Medical Decision Support · Multi-Agent</div>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={!selectedId || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-md text-sm shadow-sm transition"
        >
          {loading ? "Analyzing..." : analysis ? "Re-run analysis" : "Analyze Patient"}
        </button>
      </header>

      <div className="flex-1 flex">
        <aside className="w-[280px] bg-slate-100 border-r border-slate-200 p-4 overflow-y-auto">
          <PatientSelector
            patients={patients}
            selectedId={selectedId}
            urgencyMap={urgencyMap}
            onSelect={(id) => {
              setSelectedId(id);
              setAnalysis(null);
            }}
          />
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          {!analysis && !loading && (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
              <div className="text-lg font-semibold text-slate-700 mb-2">Select a patient and click Analyze</div>
              <div className="text-sm">The orchestrator will run all six specialist agents and produce a SOAP-formatted clinical brief.</div>
            </div>
          )}
          {loading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg p-6 border border-slate-200 h-24" />
              ))}
              <div className="text-sm text-slate-500 text-center">Running triage → literature → pharmacology → diagnosis → safety → summary…</div>
            </div>
          )}
          {analysis && <AnalysisPanel analysis={analysis} />}
        </main>
      </div>
    </div>
  );
}
