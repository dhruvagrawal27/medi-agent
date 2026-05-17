import { PatientSummary } from "../types";

interface Props {
  patients: PatientSummary[];
  selectedId: string | null;
  urgencyMap: Record<string, number>;
  onSelect: (id: string) => void;
}

const urgencyColor = (score?: number) => {
  if (!score) return "bg-slate-200 text-slate-600";
  if (score >= 5) return "bg-red-600 text-white";
  if (score >= 4) return "bg-orange-500 text-white";
  if (score >= 3) return "bg-amber-400 text-slate-900";
  return "bg-emerald-500 text-white";
};

export default function PatientSelector({ patients, selectedId, urgencyMap, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Patients</h2>
      {patients.map((p) => {
        const u = urgencyMap[p.id];
        const isActive = p.id === selectedId;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`w-full text-left p-3 rounded-lg border transition ${
              isActive
                ? "bg-blue-50 border-blue-400 ring-1 ring-blue-300"
                : "bg-white border-slate-200 hover:border-slate-400"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                <div className="text-xs text-slate-500">
                  {p.id} • {p.age}{p.gender[0]} • {p.bloodType}
                </div>
              </div>
              {u !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${urgencyColor(u)}`}>
                  U{u}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 mt-2 line-clamp-2">{p.chiefComplaint}</div>
          </button>
        );
      })}
    </div>
  );
}
