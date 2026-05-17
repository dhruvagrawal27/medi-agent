import { SOAPNote as SOAP } from "../types";

export default function SOAPNote({ note, summary, plan, citations }: { note: SOAP; summary: string; plan: string[]; citations: string[] }) {
  const Section = ({ title, body, color }: { title: string; body: string; color: string }) => (
    <div className={`border-l-4 ${color} bg-white rounded p-4 shadow-sm`}>
      <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">{title}</div>
      <div className="text-sm text-slate-800 whitespace-pre-line">{body}</div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="bg-white border-l-4 border-slate-600 rounded-lg shadow-sm p-5 mb-2">
        <div className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-1">Clinical Summary</div>
        <p className="text-sm text-slate-800 leading-relaxed">{summary}</p>
      </div>
      <Section title="S — Subjective" body={note.subjective} color="border-sky-500" />
      <Section title="O — Objective" body={note.objective} color="border-emerald-500" />
      <Section title="A — Assessment" body={note.assessment} color="border-amber-500" />
      <Section title="P — Plan" body={note.plan} color="border-red-500" />
      {plan.length > 0 && (
        <div className="bg-white border-l-4 border-blue-600 rounded p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Action Plan</div>
          <ol className="space-y-1.5 text-sm text-slate-800 list-decimal pl-5">
            {plan.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </div>
      )}
      {citations.length > 0 && (
        <div className="bg-slate-50 rounded p-4 border border-slate-200">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Citations</div>
          <ul className="space-y-1 text-xs text-slate-600">
            {citations.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
