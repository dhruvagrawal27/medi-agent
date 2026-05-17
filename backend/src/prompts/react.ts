export interface ReActStep {
  thought: string;
  action?: string;
  actionInput?: any;
  observation?: string;
  isFinal?: boolean;
  finalAnswer?: string;
}

export interface ToolDescription {
  name: string;
  description: string;
}

export function buildReActPrompt(
  task: string,
  tools: ToolDescription[],
  history: ReActStep[]
): string {
  const toolList = tools
    .map((t) => `- ${t.name}: ${t.description}`)
    .join("\n");

  const historyText = history
    .map((step, i) => {
      const parts = [`Step ${i + 1}:`, `Thought: ${step.thought}`];
      if (step.action) parts.push(`Action: ${step.action}`);
      if (step.actionInput !== undefined)
        parts.push(`Action Input: ${JSON.stringify(step.actionInput)}`);
      if (step.observation) parts.push(`Observation: ${step.observation}`);
      if (step.isFinal && step.finalAnswer)
        parts.push(`Final Answer: ${step.finalAnswer}`);
      return parts.join("\n");
    })
    .join("\n\n");

  return `You are a senior clinical agent using the ReAct framework.

TASK:
${task}

AVAILABLE TOOLS:
${toolList}

FORMAT (repeat as needed):
Thought: <your reasoning>
Action: <tool_name>
Action Input: <JSON>
Observation: <tool result>

When done, emit:
Thought: I have enough information.
Final Answer: <JSON>

HISTORY:
${historyText || "(empty - this is the first step)"}

What is your next step?`;
}
