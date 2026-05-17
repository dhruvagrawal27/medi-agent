# ClinicalCopilot

> A medical decision support system built on **agentic AI** + **multi-agent
> orchestration** + **hybrid RAG** + **structured prompting** + **hallucination
> detection**. Six specialist AI agents collaborate to take a patient case and
> produce a triaged, evidence-cited, drug-safety-checked, SOAP-formatted clinical
> brief — with confidence scores on every claim.

This README is a tour. If you've never seen the project before, start here.

---

## 1. What this project actually does

You pick one of five fake patients on the left. You click **Analyze**. In
roughly 100–300 milliseconds, six AI agents run a coordinated pipeline that:

1. **Triages** the case (urgency 1–5, red flags)
2. **Searches the literature** (PubMed abstracts) for relevant evidence
3. **Checks pharmacology** (drug interactions, allergy cross-reactivity, renal dosing)
4. **Generates a ranked differential diagnosis** (top 5 ICD-10 candidates)
5. **Runs a safety/hallucination audit** on every claim made by every agent
6. **Summarizes** the case as a SOAP note + action plan + citations

The frontend shows all of this in tabs, plus the **agent trace** (every
Thought → Action → Observation step) and a **hallucination report** (which
claims are supported by retrieved evidence vs. flagged).

This is a *demonstration of the patterns* — agents, RAG, prompting strategies,
grounding. The medical data is mocked; the architecture is real.

---

## 2. The conceptual map — read this once

### 2.1 Agentic AI

An **agent** is an LLM with two extra things:

1. **Tools it can call** (functions that go fetch data, run a search, query a
   database). The LLM doesn't *do* the work — it *decides* which tool to call.
2. **A reasoning loop**. The agent loops: think → call tool → see result →
   think again → call another tool → … → produce an answer.

This is more powerful than a single LLM call because the agent can decompose a
task, fetch fresh information, and self-correct. Our agents follow the
**ReAct** loop (Reasoning + Acting):

```
Thought:    "I need to know if the patient's troponin is elevated."
Action:     getLabs
Action Input: { patientId: "P001" }
Observation: { troponin: 0.8 }
Thought:    "0.8 is well above 0.04 cutoff — strongly suggests MI."
Action:     searchPubMed
Action Input: { query: "troponin elevation MI threshold" }
Observation: [paper PMID 34521002...]
Thought:    "I have enough information."
Final Answer: { topDiagnosis: "Acute MI (NSTEMI)", confidence: 0.85 }
```

Every step is logged in the agent trace. The frontend renders this trace so
you can audit *why* the agent reached its conclusion.

### 2.2 Multi-agent systems

A single agent that "does everything" is brittle: its prompt becomes huge,
its tools list becomes long, and it loses focus. A **multi-agent system**
splits responsibility across specialists, each with:

- A narrow role (triage, literature, drugs, …)
- A small focused tool set
- Its own prompt style (zero-shot, CoT, ReAct, etc.)

An **orchestrator** runs them in sequence (or parallel), passing each agent
the upstream outputs as context. This mirrors how a hospital actually works:
triage nurse → resident → pharmacist → attending → quality reviewer →
chart-summarizer.

Our orchestrator also implements a **refinement loop**: if the Safety Agent
reports overall confidence below 0.6, the Diagnosis Agent re-runs with the
safety flags as additional context (max 2 iterations). This is "agentic
self-correction."

### 2.3 RAG (Retrieval-Augmented Generation)

LLMs hallucinate when they generate from parametric memory alone. **RAG**
fixes this by retrieving relevant documents from a corpus first, then giving
those documents to the LLM as context.

We use a **hybrid** RAG with three retrieval methods, picked per data type:

| Data type     | Retrieval method      | Why                                                              |
| ------------- | --------------------- | ---------------------------------------------------------------- |
| PubMed papers | Vector (cosine sim)   | Semantic — "chest pain" should match "anginal symptoms"          |
| Guidelines    | Vector                | Same — semantic match between clinical features and recommendations |
| ICD codes     | BM25 (keyword)        | Codes have short structured text; keywords win                   |
| Drug database | BM25 (keyword)        | Drug names are exact tokens; semantic is overkill                |
| Patient data  | GraphQL               | Structured queries: "give me drug interactions for these meds"   |

### 2.4 Vector embeddings + cosine similarity

A **vector embedding** is a list of numbers that represents the *meaning* of
a piece of text. Two pieces of text with similar meaning have vectors that
point in similar directions.

**Cosine similarity** measures how similar two vector directions are
(ignoring magnitude). It's the dot product divided by the product of the
norms — output is between -1 (opposite) and 1 (identical direction).

For *production*, you'd call a real embeddings API (OpenAI, Voyage, Cohere).
For *deterministic, offline, testable* development, we use a hand-rolled
hash-based TF-IDF-flavored embedding so the same input always produces the
same vector. The same algorithm runs in both the indexer and the query path,
so similar terms hash to overlapping coordinates and similarity works.

### 2.5 BM25 (vectorless RAG)

**BM25** is a probabilistic ranking function (the "best of the bag-of-words"
era — still the strongest non-neural retrieval baseline). It scores a
document for a query by:

```
score = Σ (over query terms) IDF(term) × (tf × (k1+1)) / (tf + k1 × (1 - b + b × dl/avgdl))
```

Plain English:

- A term that appears in *every* document is uninformative — `IDF` drives its
  contribution to ~0.
- A rare term that appears often in *this* document is a strong signal — `tf`
  drives the score up.
- Long documents are slightly penalized so they don't dominate just by having
  more words (`b` controls how strongly).
- `k1` (we use 1.5) controls how quickly term-frequency saturates.

BM25 is fast, explainable, deterministic, and good for keyword-heavy domains
like drug names and ICD codes.

### 2.6 GraphQL

REST endpoints return *whole resources*; clients then make many round trips
to assemble what they need. **GraphQL** lets the client specify exactly the
fields it wants in one query:

```graphql
{
  drugInteractions(medications: ["metformin", "lisinopril"]) {
    drug
    severity
    effect
  }
}
```

Agents use GraphQL when they need **structured, exact** data (drug
interactions, ICD lookups, contraindications). We expose it both as an
HTTP endpoint at `/graphql` (for the frontend and external clients) and as an
in-process client (`gqlClient`) the agents call directly without an HTTP
round-trip.

### 2.7 Prompting techniques — one paragraph each

Every prompting technique is just *a way of shaping the input* to make the
LLM more likely to produce the output you want.

- **Zero-shot.** Just describe the task. "Score urgency 1-5 from these
  symptoms." Fast, but inconsistent on complex tasks.
- **Few-shot.** Show 2-5 examples first. The LLM mimics the pattern. We
  ship 3 examples each for symptom extraction, drug-interaction assessment,
  and differential diagnosis.
- **Chain-of-Thought (CoT).** Ask the LLM to "think step by step" before
  answering. Forces it to write intermediate reasoning, which dramatically
  improves accuracy on multi-step problems. We use it for diagnosis.
- **ReAct (Reasoning + Acting).** CoT extended with tool calls. The model
  alternates between "Thought" steps and "Action" steps. This is the
  standard agent loop.
- **Self-consistency.** Run the same CoT prompt N times with non-zero
  temperature. Different runs reach different conclusions because of
  sampling. Take the majority vote — the modal answer is more robust than any
  single answer. We use it in the Diagnosis Agent (N=3).
- **Least-to-most.** Decompose a hard problem into a chain of easier
  sub-problems. Solve the first; feed it into the second; etc. We use it in
  the Summary Agent to build the SOAP note (Subjective → Objective →
  Assessment → Plan).
- **Generated knowledge.** Ask the LLM to recall relevant facts before
  attempting the task. The Summary Agent uses this implicitly when it brings
  in guideline recommendations before writing the plan.
- **Hallucination guard / grounding prompts.** Pass a claim plus the retrieved
  sources, and ask the LLM to label the claim as `supported`, `unsupported`,
  or `uncertain`, citing source indices. This is the core of our Safety
  Agent.

### 2.8 Hallucination detection

A **hallucination** is a claim that sounds plausible but isn't supported by
the evidence. We detect them in three stages:

1. **Claim extraction.** Scan agent outputs for factual claims (diagnoses,
   doses, lab values, guideline citations) using regex patterns.
2. **Grounding.** For each claim, compute lexical overlap against the
   retrieved source documents. If overlap ≥ 0.5, mark `supported`. If 0.25–0.5,
   `uncertain`. Below 0.25, `unsupported`.
3. **Confidence scoring.** Convert the verdict + overlap into a 0–1 score.
   Aggregate per-agent and per-pipeline. If overall confidence < 0.5 or > 3
   claims are flagged, trigger **human-review-required**.

The Safety Agent also looks for **inter-agent contradictions** (e.g., the
Diagnosis Agent says "bacterial meningitis" but the Triage Agent didn't
mention any of its features).

---

## 3. Tech stack

| Layer        | Tech                                  | Why                                                |
| ------------ | ------------------------------------- | -------------------------------------------------- |
| Runtime      | Node 20 + TypeScript (strict)         | Same language top to bottom                        |
| Backend HTTP | Express                               | Tiny, well-known                                   |
| GraphQL      | graphql-yoga                          | Modern, batteries-included GraphQL server          |
| LLM          | Groq SDK + `openai/gpt-oss-120b`      | Fast inference; OpenAI-compatible API surface      |
| Vector DB    | In-memory `VectorStore` (custom)      | Zero external deps; deterministic for tests       |
| Lexical RAG  | BM25 from scratch                     | No external deps; transparent math                 |
| Tests        | Vitest                                | Fast, ESM-native                                   |
| Smoke tests  | Bash + curl                           | Hits the live HTTP surface, language-agnostic      |
| Frontend     | React 18 + Vite + Tailwind            | Modern, instant HMR, utility-first styling         |

---

## 4. Project structure (annotated)

```
clinicalcopilot/
├── README.md                              ← this file
├── package.json                           ← root workspace; runs both apps in parallel
├── .env                                   ← GROQ_API_KEY, GROQ_MODEL, PORT
├── smoke-test.sh                          ← 10-check live HTTP smoke test
│
├── backend/
│   ├── package.json                       ← backend deps (express, groq-sdk, graphql, vitest)
│   ├── tsconfig.json                      ← strict TS, ESM modules
│   ├── vitest.config.ts                   ← unit test runner config
│   │
│   ├── src/
│   │   ├── index.ts                       ← Express server: wires routes + GraphQL Yoga
│   │   ├── config.ts                      ← env loading + USE_MOCK_LLM flag
│   │   │
│   │   ├── mock-data/                     ← deterministic fake medical world
│   │   │   ├── patients.ts                ← 5 patients (P001–P005), each clinically rich
│   │   │   ├── pubmed.ts                  ← 30 mock PubMed abstracts (6 conditions)
│   │   │   ├── icd-codes.ts               ← 50 ICD-10 codes with symptoms + urgency
│   │   │   ├── drugs.ts                   ← 40 drugs with interactions + contraindications
│   │   │   └── guidelines.ts              ← 10 clinical guidelines (ACC/AHA, IDSA, …)
│   │   │
│   │   ├── rag/                           ← retrieval layer
│   │   │   ├── embeddings.ts              ← deterministic hash-TF-IDF "embeddings" + cosine
│   │   │   ├── vector-store.ts            ← add/search/filter in-memory vector DB
│   │   │   ├── bm25.ts                    ← BM25 keyword index with k1=1.5, b=0.75
│   │   │   └── rag-engine.ts              ← unified facade: PubMed (vec), drugs (bm25), …
│   │   │
│   │   ├── graphql/                       ← structured query layer
│   │   │   ├── schema.ts                  ← typeDefs (Patient, Drug, ICD, Guideline…)
│   │   │   ├── resolvers.ts               ← query logic (interactions, allergies, etc.)
│   │   │   └── client.ts                  ← in-process client agents use to avoid HTTP
│   │   │
│   │   ├── prompts/                       ← every prompting technique, one file each
│   │   │   ├── zero-shot.ts               ← buildZeroShotPrompt(task, context)
│   │   │   ├── few-shot.ts                ← buildFewShotPrompt + 3 medical example sets
│   │   │   ├── chain-of-thought.ts        ← "let's think step by step" scaffold
│   │   │   ├── react.ts                   ← Thought/Action/Observation loop format
│   │   │   ├── self-consistency.ts        ← N-run voting wrapper around any prompt
│   │   │   ├── least-to-most.ts           ← decomposition into ordered sub-problems
│   │   │   └── hallucination-guard.ts     ← "is this claim supported by these sources?"
│   │   │
│   │   ├── agents/                        ← the multi-agent system
│   │   │   ├── base-agent.ts              ← abstract BaseAgent: run(), tools, trace, verify
│   │   │   ├── triage-agent.ts            ← urgency 1–5, red flags, ICD candidates
│   │   │   ├── literature-agent.ts        ← PubMed vector search, citations, findings
│   │   │   ├── pharmacology-agent.ts      ← drug interactions, allergies, renal dosing
│   │   │   ├── diagnosis-agent.ts         ← differentials with self-consistency voting
│   │   │   ├── safety-agent.ts            ← claim grounding + contradiction detection
│   │   │   ├── summary-agent.ts           ← SOAP note + action plan + citations
│   │   │   └── orchestrator.ts            ← sequences agents + refinement loop
│   │   │
│   │   ├── hallucination/                 ← grounding & confidence scoring
│   │   │   ├── detector.ts                ← regex claim extraction from agent text
│   │   │   ├── grounding.ts               ← lexical overlap → supported/uncertain/unsupported
│   │   │   └── confidence-scorer.ts       ← verdict + overlap → 0–1 confidence
│   │   │
│   │   └── routes/                        ← Express HTTP routes
│   │       ├── health.ts                  ← GET /api/health
│   │       ├── patients.ts                ← GET /api/patients, /api/patients/:id
│   │       └── analyze.ts                 ← POST /api/analyze — kicks off orchestrator
│   │
│   └── tests/                             ← 41 unit tests in 6 files
│       ├── rag.test.ts                    ← 8 tests: vector store + RAG engine
│       ├── bm25.test.ts                   ← 6 tests: BM25 correctness
│       ├── agents.test.ts                 ← 10 tests: each agent + orchestrator
│       ├── hallucination.test.ts          ← 6 tests: extraction, grounding, safety
│       ├── graphql.test.ts                ← 5 tests: resolver correctness
│       └── prompts.test.ts                ← 6 tests: every prompt builder
│
└── frontend/
    ├── package.json                       ← React + Vite + Tailwind
    ├── vite.config.ts                     ← dev server + proxy to backend
    ├── tailwind.config.ts                 ← Tailwind config
    ├── index.html                         ← Vite entry
    └── src/
        ├── main.tsx                       ← React root
        ├── App.tsx                        ← sidebar + tabs + analyze button
        ├── styles.css                     ← Tailwind directives
        ├── types/index.ts                 ← TS types matching the analyze response
        └── components/
            ├── PatientSelector.tsx        ← left sidebar list of 5 patients with urgency
            ├── AnalysisPanel.tsx          ← 7-tab container for the results
            ├── DiagnosisCard.tsx          ← top diagnosis + ranked differential w/ bars
            ├── LiteratureCard.tsx         ← cited PubMed papers + evidence level
            ├── DrugInteractions.tsx       ← interactions, warnings, dose adjustments
            ├── HallucinationReport.tsx    ← traffic-light confidence + flagged claims
            ├── SOAPNote.tsx               ← S/O/A/P sections + action plan + citations
            ├── AgentTrace.tsx             ← collapsible accordion of every ReAct step
            └── ConfidenceBadge.tsx        ← reusable green/amber/red badge
```

---

## 5. Why each file exists — the tour

### 5.1 Mock data (`backend/src/mock-data/`)

These five files are the **simulated medical world**. They make the project
self-contained: no external API keys, no PubMed account, no proprietary
formulary. The data is medically plausible and cross-references itself —
e.g., patient P001's medications appear in `drugs.ts`, P002's CSF findings
match a `pubmed.ts` paper, the cholangitis guideline matches P005's labs.

This setup means **tests are deterministic** and the system **works without
network access**.

### 5.2 RAG layer (`backend/src/rag/`)

- **`embeddings.ts`** — Turns text into a 256-dimensional vector using a hash
  function over tokens (mini TF-IDF style). Deterministic: same input always
  produces the same vector. Includes `cosineSimilarity(a, b)` math.
- **`vector-store.ts`** — Holds `{ id, text, metadata, embedding }` records.
  `search(query, topK, threshold, filter)` embeds the query, computes cosine
  similarity against every stored vector, filters by metadata if provided,
  and returns top-K. This is the semantic search backbone.
- **`bm25.ts`** — Pure BM25 from scratch (k1=1.5, b=0.75). Tokenizes,
  computes term frequencies and document frequencies, scores per the BM25
  formula. Used for keyword-heavy data.
- **`rag-engine.ts`** — Facade. Seeds the vector store with PubMed +
  guidelines, seeds BM25 with ICD codes + drugs, and exposes
  `searchLiterature / searchDrugs / searchICDCodes / searchGuidelines /
  hybridSearch`. Agents talk to *this*, not the underlying stores.

### 5.3 GraphQL layer (`backend/src/graphql/`)

- **`schema.ts`** — Type definitions (SDL): `Patient`, `Drug`, `ICDCode`,
  `ClinicalGuideline`, and 8 queries.
- **`resolvers.ts`** — How each query is answered. The interesting one is
  `drugInteractions(medications)` which does pairwise cross-checking through
  the drug database.
- **`client.ts`** — An in-process wrapper around the resolvers. Agents call
  this to avoid HTTP overhead; the same logic powers the public `/graphql`
  endpoint that the frontend and external tools use.

### 5.4 Prompts (`backend/src/prompts/`) — one file per technique

| File                       | Technique                | When this agent uses it                             |
| -------------------------- | ------------------------ | --------------------------------------------------- |
| `zero-shot.ts`             | Zero-shot                | Triage Agent — fast urgency scoring                |
| `few-shot.ts`              | Few-shot                 | Pharmacology Agent — drug interaction patterns      |
| `chain-of-thought.ts`      | CoT                      | Diagnosis Agent — multi-step clinical reasoning     |
| `react.ts`                 | ReAct                    | All agents — the standard tool-use loop            |
| `self-consistency.ts`      | Self-consistency vote    | Diagnosis Agent — 3 runs + majority vote            |
| `least-to-most.ts`         | Decomposition            | Summary Agent — SOAP S→O→A→P decomposition         |
| `hallucination-guard.ts`   | Grounding prompt         | Safety Agent — claim verification against sources   |

These are **builder functions**, not hardcoded prompts. You pass in the task
and inputs; you get a string ready to send to the LLM.

### 5.5 Agents (`backend/src/agents/`)

Every specialist agent inherits from `BaseAgent` which provides:

- A `run(input)` method (boilerplate timing, tracing, verification)
- A `tools` registry (each agent declares its own in `defineTools()`)
- A `callTool(name, params)` helper that auto-logs the ReAct step
- A `verifyOutput(text, sources)` method that runs the hallucination
  detector against the agent's own output

Each agent's `execute()` orchestrates its tools and produces a typed result
object. The result, the trace, the sources used, and the confidence score
are bundled into an `AgentOutput`.

**The orchestrator** (`orchestrator.ts`) runs them in sequence:

```
Triage  →  Literature  →  Pharmacology  →  Diagnosis  →  Safety
                                                              │
                          ┌───── if confidence < 0.6 ─────────┘
                          ↓ (max 2 iterations)
                     Diagnosis (refined)  →  Safety
                          │
                          ↓
                     Summary
```

### 5.6 Hallucination module (`backend/src/hallucination/`)

- **`detector.ts`** — `extractClaims(text)` runs regex patterns against agent
  output (diagnosis-shaped sentences, medication doses, lab values,
  guideline citations) to pull out individual factual claims.
- **`grounding.ts`** — `groundClaim(claim, sources)` computes the fraction
  of meaningful claim tokens that appear in at least one retrieved source.
  Returns `supported / uncertain / unsupported` plus the supporting source
  IDs.
- **`confidence-scorer.ts`** — Translates the grounding verdict + overlap
  score into a 0–1 confidence. Higher overlap = higher confidence.
  `overallConfidence(claims)` averages across all claims.

The Safety Agent consumes this trio plus a contradiction detector.

### 5.7 Express routes & server (`backend/src/routes/`, `index.ts`)

- `GET  /api/health`       — liveness + agent registry
- `GET  /api/patients`     — list of 5 patients (lightweight)
- `GET  /api/patients/:id` — single patient with full labs
- `POST /api/analyze`      — body `{ patientId, query? }` → full analysis
- `POST /graphql`          — GraphQL Yoga endpoint with playground

`index.ts` wires everything together and starts the server.

### 5.8 Tests (`backend/tests/`)

41 unit tests in 6 files, each one exercises one concept in isolation:

| File                     | What it proves                                                |
| ------------------------ | ------------------------------------------------------------- |
| `rag.test.ts`            | Vector store works, embeddings deterministic, RAG composable  |
| `bm25.test.ts`           | BM25 math correct, scoring order right                        |
| `prompts.test.ts`        | Every prompt builder emits the expected scaffolding           |
| `graphql.test.ts`        | Resolvers find what they should                               |
| `hallucination.test.ts`  | Claim extraction, grounding, contradiction detection          |
| `agents.test.ts`         | Each agent + the orchestrator + the refinement loop           |

Run with `npm test -w backend`. Tests use no network and run in <3s.

### 5.9 Smoke test (`smoke-test.sh`)

Unit tests verify *components*. Smoke tests verify *the running system*.
The script starts the server, hits 10 endpoints with curl, and checks the
JSON shape of the responses. This is what you run before a release to
confirm "yes, the whole machine boots and talks."

### 5.10 Frontend (`frontend/src/`)

`App.tsx` is the shell: header, sidebar (`PatientSelector`), main area
(`AnalysisPanel`). The analysis panel is **tab-based**:

- **Overview** — triage, top diagnosis, safety report, drugs at a glance
- **Diagnosis** — full ranked differential with evidence links
- **Literature** — cited PubMed papers with key findings
- **Medications** — interactions, warnings, dose adjustments
- **Safety Report** — confidence dial + flagged claims + contradictions
- **SOAP Note** — clinician-ready output (S/O/A/P + action plan + citations)
- **Agent Trace** — every ReAct step from every agent, collapsible

Tailwind is used for utility-first styling. Color conventions:

| Color  | Meaning                          |
| ------ | -------------------------------- |
| Blue   | Primary, diagnosis               |
| Green  | High confidence, safe            |
| Amber  | Moderate, caution                |
| Red    | Urgent, flagged, contraindicated |
| Slate  | Neutral, structural              |

---

## 6. End-to-end data flow for one analyze call

```
[Frontend]   click "Analyze Patient" for P001
   │
   │  POST /api/analyze  { patientId: "P001" }
   ▼
[routes/analyze.ts]
   │
   ▼
[Orchestrator.analyze("P001")]
   │
   ├── new TriageAgent().run({ patient })
   │     ├── tool: extractSymptoms        → ["chest pain", ...]
   │     ├── tool: scoreUrgency           → 5 / emergent
   │     ├── tool: mapToICD (BM25)        → [I21.9, I21.0, I20.0, ...]
   │     └── tool: checkRedFlags          → ["chest pain","arm radiation", ...]
   │
   ├── new LiteratureAgent().run(...)
   │     ├── tool: searchPubMed (vector)  → 5 papers
   │     ├── tool: filterByRelevance      → score threshold
   │     ├── tool: extractKeyFindings     → one-sentence summaries
   │     └── tool: buildCitation          → APA strings
   │
   ├── new PharmacologyAgent().run(...)
   │     ├── gql: drugInteractions(meds)
   │     ├── gql: checkContraindications(meds, allergies)
   │     ├── tool: renalDoseAdjust (creatinine 1.1 → adjustments)
   │     └── tool: checkContraindications(meds, conditions)
   │
   ├── new DiagnosisAgent().run(...)
   │     ├── tool: generateDifferentials  → score candidates by rules
   │     ├── tool: rankDifferentials      → normalize to probabilities
   │     ├── tool: selfConsistencyVote ×3 → majority winner
   │     └── tool: weightEvidence         → link each dx to source docs
   │
   ├── new SafetyAgent().run({ ...all upstream outputs })
   │     ├── extractClaims (regex over JSON of all agents' results)
   │     ├── for each claim: groundClaim + scoreClaimConfidence
   │     ├── flagContradictions across agents
   │     └── escalateToHuman if confidence < 0.5
   │
   ├── if safety.confidence < 0.6 and refinements < 2:
   │     → re-run DiagnosisAgent with safety flags as context
   │     → re-run SafetyAgent
   │
   └── new SummaryAgent().run({ ...everything })
         ├── buildSOAPNote               → S/O/A/P strings
         ├── generateClinicalSummary     → narrative paragraph
         ├── createActionPlan            → bulleted next steps
         └── formatForClinician          → final assembly
   │
   ▼
[response]   { patientId, patient, analysis: { triage, literature, pharmacology,
                diagnosis, safety, summary }, agentTrace, hallucinationReport,
                processingTimeMs, refinementIterations }
   │
   ▼
[Frontend]   AnalysisPanel renders all 7 tabs
```

---

## 7. How to run

```powershell
# install everything (uses npm workspaces)
npm install

# run backend (Express+GraphQL on :3001) and frontend (Vite on :5173) together
npm run dev
```

Then open:

- Frontend:  http://localhost:5173
- API:       http://localhost:3001/api/health
- GraphQL:   http://localhost:3001/graphql

### Other scripts

```powershell
npm test -w backend        # 41 unit tests
bash smoke-test.sh         # full 10-check live HTTP smoke test
npm run build              # production build of both apps
```

### Configuration (`.env`)

```
GROQ_API_KEY=...           # real Groq key, or "placeholder" for mock mode
GROQ_MODEL=openai/gpt-oss-120b
PORT=3001
```

When `GROQ_API_KEY=placeholder`, the system runs in **mock mode**: every
deterministic pipeline (RAG, scoring, ReAct traces, grounding) still runs
fully; only the optional LLM-paraphrasing layer is skipped. This is why the
tests pass regardless of whether you have a Groq key — the architecture
doesn't depend on the LLM for *correctness*, only for *natural-language
elaboration*.

---

## 8. Where to look first if you want to learn the patterns

| If you want to understand…   | Read these files in this order                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| How an agent works           | `prompts/react.ts` → `agents/base-agent.ts` → `agents/triage-agent.ts`                              |
| Multi-agent orchestration    | `agents/orchestrator.ts` (whole file is the diagram)                                                |
| Vector RAG                   | `rag/embeddings.ts` → `rag/vector-store.ts` → `rag/rag-engine.ts`                                   |
| BM25 (vectorless RAG)        | `rag/bm25.ts` (formula in the `search` method)                                                      |
| GraphQL                      | `graphql/schema.ts` → `graphql/resolvers.ts` → `graphql/client.ts`                                  |
| Self-consistency             | `prompts/self-consistency.ts` + the `selfConsistencyVote` tool in `agents/diagnosis-agent.ts`       |
| Hallucination detection      | `hallucination/detector.ts` → `grounding.ts` → `confidence-scorer.ts` → `agents/safety-agent.ts`    |
| The full picture             | `agents/orchestrator.ts` + `routes/analyze.ts` + `frontend/src/App.tsx`                             |

---

## 9. Glossary

- **Agent** — LLM + tools + a reasoning loop.
- **Tool** — A function the agent can call. The LLM picks which one.
- **ReAct** — Reasoning-Acting loop: Thought → Action → Observation, repeat.
- **RAG** — Retrieval-Augmented Generation. Fetch evidence, then generate.
- **Vector store** — Stores text + its embedding; supports similarity search.
- **Embedding** — A vector that represents a piece of text's meaning.
- **Cosine similarity** — How aligned two vectors are; range -1 to 1.
- **BM25** — A keyword-based document scoring function; the strongest non-neural baseline.
- **GraphQL** — A query language where the client picks the exact fields it wants.
- **Zero-shot / Few-shot / CoT / ReAct / Self-consistency / Least-to-most** — Prompting strategies; see §2.7.
- **Hallucination** — A confident-sounding LLM claim with no factual support.
- **Grounding** — Verifying that a claim is supported by retrieved sources.
- **Orchestrator** — The conductor; runs multiple agents in the right order.
- **Refinement loop** — Re-running an agent when its output fails a quality check.
- **SOAP note** — Standard clinical write-up: Subjective, Objective, Assessment, Plan.
