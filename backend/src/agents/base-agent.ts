import Groq from "groq-sdk";
import { CONFIG } from "../config.js";
import type { RAGResult } from "../rag/rag-engine.js";
import { extractClaims } from "../hallucination/detector.js";
import { scoreClaimConfidence, overallConfidence, VerifiedClaim } from "../hallucination/confidence-scorer.js";

export interface Tool {
  name: string;
  description: string;
  execute(params: any): Promise<any>;
}

export interface ReActStep {
  thought: string;
  action?: string;
  actionInput?: any;
  observation?: string;
  isFinal?: boolean;
  finalAnswer?: string;
}

export interface AgentInput {
  patient?: any;
  context?: any;
  query?: string;
  upstream?: Record<string, any>;
}

export interface AgentOutput {
  agentName: string;
  timestamp: string;
  processingTimeMs: number;
  ragSourcesUsed: string[];
  trace: ReActStep[];
  result: any;
  verifiedClaims: VerifiedClaim[];
  confidence: number;
}

export interface VerifiedOutput {
  verifiedClaims: VerifiedClaim[];
  confidence: number;
}

let _llm: Groq | null = null;
export function getLLM(): Groq | null {
  if (CONFIG.useMockLLM) return null;
  if (!_llm) {
    _llm = new Groq({ apiKey: CONFIG.groqApiKey });
  }
  return _llm;
}

export abstract class BaseAgent {
  protected name: string;
  protected tools: Tool[];
  protected trace: ReActStep[] = [];
  protected ragSourcesUsed: Set<string> = new Set();

  constructor(name: string) {
    this.name = name;
    this.tools = this.defineTools();
  }

  protected abstract defineTools(): Tool[];
  protected abstract execute(input: AgentInput): Promise<{ result: any; sources: RAGResult[] }>;

  async run(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();
    this.trace = [];
    this.ragSourcesUsed = new Set();

    this.log({ thought: `Starting ${this.name} with input ${JSON.stringify(Object.keys(input))}` });

    const { result, sources } = await this.execute(input);

    this.log({ thought: "Producing final answer.", isFinal: true, finalAnswer: JSON.stringify(result).slice(0, 400) });

    for (const s of sources) this.ragSourcesUsed.add(`${s.source}:${s.id}`);

    const verified = await this.verifyOutput(JSON.stringify(result), sources);

    return {
      agentName: this.name,
      timestamp: new Date().toISOString(),
      processingTimeMs: Date.now() - start,
      ragSourcesUsed: Array.from(this.ragSourcesUsed),
      trace: this.trace,
      result,
      verifiedClaims: verified.verifiedClaims,
      confidence: verified.confidence,
    };
  }

  protected log(step: ReActStep): void {
    this.trace.push(step);
  }

  protected async callTool(name: string, params: any): Promise<any> {
    const tool = this.tools.find((t) => t.name === name);
    if (!tool) {
      const err = `Unknown tool: ${name}`;
      this.log({ thought: err, action: name, actionInput: params, observation: err });
      throw new Error(err);
    }
    this.log({ thought: `Calling tool ${name}.`, action: name, actionInput: params });
    const result = await tool.execute(params);
    this.log({ thought: `Tool ${name} returned.`, observation: JSON.stringify(result).slice(0, 300) });
    return result;
  }

  protected async verifyOutput(output: string, sources: RAGResult[]): Promise<VerifiedOutput> {
    const claims = extractClaims(output);
    const verifiedClaims = claims.map((c) => scoreClaimConfidence(c.text, sources));
    const conf = overallConfidence(verifiedClaims);
    return { verifiedClaims, confidence: conf };
  }
}
