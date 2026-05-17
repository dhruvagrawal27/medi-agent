import { useState } from "react";
import { AgentOutput } from "../types";
import ConfidenceBadge from "./ConfidenceBadge";

const agentColor: Record<string, string> = {
  TriageAgent: "border-rose-500 bg-rose-50",
  LiteratureAgent: "border-emerald-500 bg-emerald-50",
  PharmacologyAgent: "border-amber-500 bg-amber-50",
  DiagnosisAgent: "border-blue-500 bg-blue-50",
  SafetyAgent: "border-red-500 bg-red-50",
  SummaryAgent: "border-slate-600 bg-slate-50",
};

export default function AgentTrace({ outputs }: { outputs: AgentOutput[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {outputs.map((o, i) => {
        const color = agentColor[o.agentName] || "border-slate-400 bg-slate-50";
        const isOpen = open === `${o.agentName}-${i}`;
        return (
          <div key={i} className={`rounded-lg border-l-4 ${color} border-slate-200 border bg-white`}>
            <button
              className="w-full flex items-center justify-between p-3 text-left"
              onClick={() => setOpen(isOpen ? null : `${o.agentName}-${i}`)}
            >
              <div>
                <div className="font-semibold text-slate-900">{o.agentName}</div>
                <div className="text-xs text-slate-500">
                  {o.processingTimeMs}ms • {o.trace.length} steps • {o.ragSourcesUsed.length} sources
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ConfidenceBadge value={o.confidence} label="conf" />
                <span className="text-slate-400 text-lg">{isOpen ? "▾" : "▸"}</span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-slate-200 p-3 space-y-2 max-h-96 overflow-y-auto">
                {o.trace.map((s, idx) => (
                  <div key={idx} className="text-xs border-l-2 border-slate-200 pl-2">
                    <div><span className="font-semibold text-slate-700">Thought:</span> {s.thought}</div>
                    {s.action && <div><span className="font-semibold text-blue-700">Action:</span> {s.action}</div>}
                    {s.actionInput && (
                      <div className="font-mono text-[10px] text-slate-500 truncate">
                        Input: {JSON.stringify(s.actionInput).slice(0, 200)}
                      </div>
                    )}
                    {s.observation && (
                      <div className="font-mono text-[10px] text-emerald-700 truncate">
                        Obs: {s.observation.slice(0, 200)}
                      </div>
                    )}
                    {s.isFinal && s.finalAnswer && (
                      <div className="font-mono text-[10px] text-amber-700 truncate">
                        Final: {s.finalAnswer.slice(0, 200)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
