import { CitedPaper } from "../types";

export default function LiteratureCard({ papers, evidenceLevel }: { papers: CitedPaper[]; evidenceLevel: string }) {
  return (
    <div className="bg-white border-l-4 border-emerald-600 rounded-lg shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">Literature</div>
          <h3 className="text-lg font-bold text-slate-900">{papers.length} relevant papers</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">{evidenceLevel}</span>
      </div>
      <div className="space-y-3">
        {papers.map((p) => (
          <div key={p.pmid} className="border-l-2 border-slate-200 pl-3">
            <div className="text-sm font-semibold text-slate-900">{p.title}</div>
            <div className="text-xs text-slate-500 mt-0.5">{p.journal} ({p.year}) • PMID:{p.pmid}</div>
            <div className="text-xs text-slate-700 mt-1.5 leading-relaxed">{p.keyFinding}</div>
          </div>
        ))}
        {papers.length === 0 && (
          <div className="text-sm text-slate-500 italic">No papers retrieved.</div>
        )}
      </div>
    </div>
  );
}
