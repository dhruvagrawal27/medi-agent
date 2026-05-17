import Groq from "groq-sdk";

export interface SelfConsistencyResult<T> {
  result: T;
  confidence: number;
  allResults: T[];
}

export async function selfConsistencyVote<T>(
  llm: Groq | null,
  prompt: string,
  extract: (response: string) => T,
  runs: number = 3,
  model: string = "openai/gpt-oss-120b",
  mockResponseFn?: () => T
): Promise<SelfConsistencyResult<T>> {
  const results: T[] = [];

  if (!llm) {
    for (let i = 0; i < runs; i++) {
      if (mockResponseFn) results.push(mockResponseFn());
    }
  } else {
    for (let i = 0; i < runs; i++) {
      try {
        const resp = await llm.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
        });
        const text = resp.choices?.[0]?.message?.content || "";
        results.push(extract(text));
      } catch {
        if (mockResponseFn) results.push(mockResponseFn());
      }
    }
  }

  const counts = new Map<string, { value: T; n: number }>();
  for (const r of results) {
    const key = JSON.stringify(r);
    const prev = counts.get(key);
    if (prev) prev.n++;
    else counts.set(key, { value: r, n: 1 });
  }

  let best: { value: T; n: number } | null = null;
  for (const entry of counts.values()) {
    if (!best || entry.n > best.n) best = entry;
  }
  const winner = best ?? { value: results[0], n: 1 };
  const confidence = winner.n / runs;

  return { result: winner.value, confidence, allResults: results };
}
