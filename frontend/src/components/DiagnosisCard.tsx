import { Differential } from "../types";

const probColor = (p: number) => {
  if (p >= 0.5) return "bg-green-500";
  if (p >= 0.25) return "bg-amber-500";
  return "bg-red-500";
};

export default function DiagnosisCard({
  differentials,
  topDiagnosis,
  confidence,
}: {
  differentials: Differential[];
  topDiagnosis: string;
  confidence: number;
}) {
  return (
    <div className="bg-white border-l-4 border-blue-600 rounded-lg shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-1">Top Diagnosis</div>
          <h3 className="text-2xl font-bold text-slate-900">{topDiagnosis}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Confidence</div>
          <div className="text-2xl font-bold text-slate-900">{Math.round(confidence * 100)}%</div>
        </div>
      </div>

      <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Differential</h4>
      <div className="space-y-3">
        {differentials.map((d) => (
          <div key={d.icdCode} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-semibold text-slate-900">
                {d.diagnosis} <span className="ml-2 text-xs font-mono text-slate-500">{d.icdCode}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{Math.round(d.probability * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-2 ${probColor(d.probability)}`} style={{ width: `${Math.max(2, d.probability * 100)}%` }} />
            </div>
            <div className="text-xs text-slate-600 mt-2">{d.reasoning}</div>
            {d.evidenceLinks.length > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Evidence:</span>{" "}
                {d.evidenceLinks.slice(0, 2).map((e, i) => (
                  <span key={i} className="mr-2">
                    [{e.source}:{e.sourceId}]
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
