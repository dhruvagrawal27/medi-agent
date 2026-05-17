interface Props {
  value: number;
  label?: string;
}

export default function ConfidenceBadge({ value, label }: Props) {
  const pct = Math.round(value * 100);
  let color = "bg-red-100 text-red-700 border-red-300";
  if (value >= 0.8) color = "bg-green-100 text-green-700 border-green-300";
  else if (value >= 0.5) color = "bg-amber-100 text-amber-700 border-amber-300";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold ${color}`}>
      {label && <span className="opacity-70">{label}:</span>}
      {pct}%
    </span>
  );
}
