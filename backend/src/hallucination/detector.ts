export interface ExtractedClaim {
  id: string;
  text: string;
  type: "diagnosis" | "medication" | "lab" | "guideline" | "general";
}

const CLAIM_PATTERNS = [
  { regex: /\b(diagnos\w+|differential|likely|suspected)\b[^.]+/gi, type: "diagnosis" as const },
  { regex: /\b(prescribe|administer|recommend|dose|mg|mcg|tablet)\b[^.]+/gi, type: "medication" as const },
  { regex: /\b(troponin|bnp|creatinine|wbc|hba1c|tsh|bilirubin|alt|ast|alp|csf)\b[^.]+/gi, type: "lab" as const },
  { regex: /\b(guideline|recommends?|recommendation|level\s+[ivab]+)\b[^.]+/gi, type: "guideline" as const },
];

export function extractClaims(text: string): ExtractedClaim[] {
  const seen = new Set<string>();
  const claims: ExtractedClaim[] = [];
  let idCounter = 0;

  for (const { regex, type } of CLAIM_PATTERNS) {
    const matches = text.matchAll(regex);
    for (const m of matches) {
      const claimText = m[0].trim().slice(0, 220);
      const key = claimText.toLowerCase();
      if (seen.has(key) || claimText.length < 12) continue;
      seen.add(key);
      claims.push({ id: `claim_${++idCounter}`, text: claimText, type });
    }
  }

  if (claims.length === 0) {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);
    for (const s of sentences.slice(0, 5)) {
      claims.push({ id: `claim_${++idCounter}`, text: s.slice(0, 220), type: "general" });
    }
  }
  return claims;
}
