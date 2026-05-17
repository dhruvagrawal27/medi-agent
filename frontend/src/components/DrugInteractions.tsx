import { DrugInteraction } from "../types";

const sevColor = (s: string) => {
  if (s === "contraindicated") return "bg-red-600 text-white";
  if (s === "severe") return "bg-red-500 text-white";
  if (s === "moderate") return "bg-amber-500 text-white";
  if (s === "mild") return "bg-slate-300 text-slate-900";
  return "bg-slate-200 text-slate-700";
};

interface Props {
  interactions: DrugInteraction[];
  warnings: string[];
  adjustments: string[];
  safeAlternatives: string[];
  drugList: { name: string; class: string; indication: string }[];
}

export default function DrugInteractions(p: Props) {
  return (
    <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow-sm p-5">
      <div className="text-xs uppercase tracking-wider text-amber-600 font-semibold mb-1">Pharmacology</div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">Medication safety</h3>

      {p.drugList.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Active medications</div>
          <div className="flex flex-wrap gap-2">
            {p.drugList.map((d) => (
              <span key={d.name} className="text-xs px-2 py-1 bg-slate-100 border border-slate-200 rounded">
                <span className="font-semibold">{d.name}</span> <span className="text-slate-500">({d.class})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {p.interactions.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-2">Interactions</div>
          <div className="space-y-2">
            {p.interactions.map((i, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 border border-slate-200 rounded">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${sevColor(i.severity)}`}>{i.severity}</span>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">{i.drugs}</div>
                  <div className="text-slate-600">{i.effect}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {p.warnings.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold uppercase text-red-600 mb-1">Warnings</div>
          <ul className="text-xs text-slate-700 list-disc pl-5 space-y-1">
            {p.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {p.adjustments.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Dose adjustments</div>
          <ul className="text-xs text-slate-700 list-disc pl-5 space-y-1">
            {p.adjustments.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {p.interactions.length === 0 && p.warnings.length === 0 && (
        <div className="text-sm text-emerald-700">No major interactions or warnings detected.</div>
      )}
    </div>
  );
}
