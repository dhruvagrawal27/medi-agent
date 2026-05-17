export function buildLeastToMostPrompt(
  complexTask: string,
  subproblems: string[]
): string {
  const sub = subproblems
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");
  return `You are a senior clinical assistant using least-to-most decomposition.

COMPLEX TASK:
${complexTask}

Sub-problems (solve in order; each answer feeds the next):
${sub}

For each numbered sub-problem, provide:
- Sub-answer (brief)
- Why it matters for the final task

After all sub-answers, combine them into the final answer in JSON.`;
}
