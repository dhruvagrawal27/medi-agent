import { BaseAgent, Tool, AgentInput } from "./base-agent.js";
import { ragEngine, RAGResult } from "../rag/rag-engine.js";

export interface CitedPaper {
  pmid: string;
  title: string;
  journal: string;
  year: number;
  citation: string;
  keyFinding: string;
  relevanceScore: number;
}

export interface LiteratureOutput {
  papers: CitedPaper[];
  keyFindings: string[];
  evidenceLevel: string;
  searchQuery: string;
}

export class LiteratureAgent extends BaseAgent {
  constructor() {
    super("LiteratureAgent");
  }

  protected defineTools(): Tool[] {
    return [
      {
        name: "searchPubMed",
        description: "Vector search PubMed abstracts",
        execute: async ({ query, topK }: { query: string; topK?: number }) => {
          return ragEngine.searchLiterature(query, topK ?? 5);
        },
      },
      {
        name: "filterByRelevance",
        description: "Re-rank results by medical relevance threshold",
        execute: async ({ results, threshold }: { results: RAGResult[]; threshold?: number }) => {
          const t = threshold ?? 0.05;
          return results.filter((r) => r.score >= t);
        },
      },
      {
        name: "extractKeyFindings",
        description: "Extract one-sentence key finding from a paper",
        execute: async ({ paper }: { paper: RAGResult }) => {
          const sentences = paper.text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 30);
          const findingSentence =
            sentences.find((s) => /CONCLUSION|results|reduced|increased|improved/i.test(s)) ||
            sentences[1] ||
            sentences[0] ||
            paper.text.slice(0, 200);
          return findingSentence.slice(0, 240);
        },
      },
      {
        name: "buildCitation",
        description: "Build APA-style citation from paper metadata",
        execute: async ({ meta }: { meta: any }) => {
          const authorList: string[] = meta.authors || [];
          const authors =
            authorList.length > 3
              ? `${authorList.slice(0, 3).join(", ")}, et al.`
              : authorList.join(", ");
          return `${authors} (${meta.year}). ${meta.title}. ${meta.journal}. PMID:${meta.pmid}.`;
        },
      },
    ];
  }

  protected async execute(input: AgentInput): Promise<{ result: LiteratureOutput; sources: RAGResult[] }> {
    const triage = input.upstream?.triage;
    const patient = input.patient;
    const symptomList = triage?.extractedSymptoms || patient?.symptoms || [];
    const query = symptomList.slice(0, 6).join(" ") + (input.query ? ` ${input.query}` : "");

    this.log({ thought: `Searching PubMed for: ${query}` });
    const raw: RAGResult[] = await this.callTool("searchPubMed", { query, topK: 5 });
    const filtered: RAGResult[] = await this.callTool("filterByRelevance", { results: raw, threshold: 0.05 });

    const papers: CitedPaper[] = [];
    const keyFindings: string[] = [];
    for (const r of filtered.slice(0, 5)) {
      const finding = await this.callTool("extractKeyFindings", { paper: r });
      const citation = await this.callTool("buildCitation", { meta: r.metadata });
      papers.push({
        pmid: r.metadata.pmid,
        title: r.metadata.title,
        journal: r.metadata.journal,
        year: r.metadata.year,
        citation,
        keyFinding: finding,
        relevanceScore: Math.round(r.score * 1000) / 1000,
      });
      keyFindings.push(finding);
    }

    let evidenceLevel = "Level III";
    if (papers.length >= 3 && papers.some((p) => p.journal.toLowerCase().includes("lancet") || p.journal.toLowerCase().includes("new england"))) {
      evidenceLevel = "Level I (RCT/meta-analysis available)";
    } else if (papers.length >= 2) {
      evidenceLevel = "Level II (cohort/observational)";
    }

    return {
      result: {
        papers,
        keyFindings,
        evidenceLevel,
        searchQuery: query,
      },
      sources: filtered,
    };
  }
}
