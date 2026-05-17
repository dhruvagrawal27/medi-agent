import { FlaggedClaim, VerifiedClaim } from "../types";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  overallConfidence: number;
  flaggedClaims: FlaggedClaim[];
  verifiedClaims: VerifiedClaim[];
  humanReviewRequired: boolean;
  contradictions: any[];
}

export default function HallucinationReport({
  overallConfidence,
  flaggedClaims,
  verifiedClaims,
  humanReviewRequired,
  contradictions,
}: Props) {
  const trafficColor =
    overallConfidence >= 0.8
      ? "bg-green-500"
      : overallConfidence >= 0.5
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className="bg-white border-l-4 border-red-600 rounded-lg shadow-sm p-5">
      <div className="text-xs uppercase tracking-wider text-red-600 font-semibold mb-1">Safety Report</div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">Hallucination & confidence</h3>

      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${trafficColor}`}>
          {Math.round(overallConfidence * 100)}%
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Overall confidence</div>
          <div className="text-xs text-slate-500">
            {verifiedClaims.filter((v) => v.verdict === "supported").length} supported •{" "}
            {verifiedClaims.filter((v) => v.verdict === "uncertain").length} uncertain •{" "}
            {verifiedClaims.filter((v) => v.verdict === "unsupported").length} unsupported
          </div>
        </div>
      </div>

      {humanReviewRequired && (
        <div className="bg-red-50 border border-red-300 rounded-md p-3 mb-4 text-sm font-semibold text-red-800">
          Human review required
        </div>
      )}

      {contradictions.length > 0 && (
        <div className="mb-4">
          <div className="text-xs uppercase font-semibold text-slate-500 mb-2">Contradictions</div>
          <div className="space-y-2">
            {contradictions.map((c, i) => (
              <div key={i} className="text-xs p-2 bg-amber-50 border border-amber-300 rounded">
                <div><span className="font-semibold">{c.agentA}:</span> {c.claimA}</div>
                <div><span className="font-semibold">{c.agentB}:</span> {c.claimB}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {flaggedClaims.length > 0 && (
        <div className="mb-3">
          <div className="text-xs uppercase font-semibold text-red-600 mb-2">Flagged claims</div>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {flaggedClaims.slice(0, 8).map((f, i) => (
              <li key={i} className="text-xs p-2 border border-red-200 bg-red-50 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">{f.claim.slice(0, 120)}</span>
                  <ConfidenceBadge value={f.confidence} />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{f.reason}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <div className="text-xs uppercase font-semibold text-emerald-700 mb-2">Verified claims (sample)</div>
        <ul className="space-y-1 text-xs text-slate-700 max-h-40 overflow-y-auto">
          {verifiedClaims
            .filter((v) => v.verdict === "supported")
            .slice(0, 5)
            .map((v, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span className="flex-1">{v.claim.slice(0, 140)}</span>
                <ConfidenceBadge value={v.confidence} />
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
