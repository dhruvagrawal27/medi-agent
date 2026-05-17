export function buildCoTPrompt(task: string, input: string): string {
  return `You are a senior clinical decision-support assistant.

TASK:
${task}

INPUT:
${input}

Let's think step by step using clinical reasoning:
1. Identify pertinent positives and negatives.
2. Group findings by organ system.
3. Generate a problem representation.
4. List the differential ordered by likelihood.
5. State which evidence rules each item in or out.
6. Provide the final answer with explicit confidence.

Walk through each step explicitly before giving the final answer in JSON.`;
}
