export function buildZeroShotPrompt(task: string, context: string): string {
  return `You are a senior clinical decision-support assistant.

TASK:
${task}

CONTEXT:
${context}

Provide a precise, evidence-based answer. Cite source IDs when available. Do not speculate beyond what the context supports.`;
}

export function zeroShotUrgencyPrompt(symptoms: string[], vitals: Record<string, any>): string {
  return buildZeroShotPrompt(
    "Assign an urgency score from 1 (routine) to 5 (immediate life threat) for this presentation. Output JSON {score:int, label:string, justification:string}.",
    `Symptoms: ${symptoms.join(", ")}.
Vitals: ${JSON.stringify(vitals)}.`
  );
}
