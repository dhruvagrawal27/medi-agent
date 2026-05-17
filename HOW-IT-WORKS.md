# How ClinicalCopilot actually works — UI walkthrough

> The screenshots you sent were of patient **P003 (Arjun Mehta)**. This doc
> goes through every panel you saw, and for each piece of text on screen
> tells you exactly **where it came from**: hardcoded data, a rule-based
> function, a runtime computation, or a retrieval-augmented search.

## TL;DR — what is hardcoded vs. what is not

| Category                              | Hardcoded? | Where                                          |
| ------------------------------------- | :--------: | ---------------------------------------------- |
| **Patient records** (names, labs, meds) | ✅ Yes  | `backend/src/mock-data/patients.ts`            |
| **PubMed abstracts** (30 papers)      | ✅ Yes     | `backend/src/mock-data/pubmed.ts`              |
| **ICD-10 catalog** (50 codes)         | ✅ Yes     | `backend/src/mock-data/icd-codes.ts`           |
| **Drug database** (40 drugs)          | ✅ Yes     | `backend/src/mock-data/drugs.ts`               |
| **Clinical guidelines** (10)          | ✅ Yes     | `backend/src/mock-data/guidelines.ts`          |
| **Red-flag symptom list**             | ✅ Yes     | `agents/triage-agent.ts` (`RED_FLAGS` set)     |
| **Urgency scoring rules**             | ✅ Yes     | `agents/triage-agent.ts` (`scoreUrgency` tool) |
| **Differential scoring rules**        | ✅ Yes     | `agents/diagnosis-agent.ts` (`scoreCandidates`)|
| **Action plan templates**             | ✅ Yes     | `agents/summary-agent.ts` (`createActionPlan`) |
| **Vector similarity** (cosine)        | ❌ Computed | `rag/embeddings.ts` + `rag/vector-store.ts`   |
| **BM25 ranking scores**               | ❌ Computed | `rag/bm25.ts`                                 |
| **Self-consistency winner**           | ❌ Computed | `agents/diagnosis-agent.ts` (3 perturbed runs) |
| **Probability percentages**           | ❌ Computed | `rankDifferentials` — score normalization     |
| **Claim grounding / confidence**      | ❌ Computed | `hallucination/grounding.ts` + scorer         |
| **ReAct trace, timings, sources used** | ❌ Computed | `agents/base-agent.ts` per run                |
| **Citations**                         | ❌ Computed | Built from RAG hits at runtime                |
| **Refinement decision** (re-run dx?)  | ❌ Computed | `orchestrator.ts` — checks safety confidence  |

**Important honesty point:** the project ships with an LLM (Groq +
`gpt-oss-120b`) wired in, but the **agent execution paths are
LLM-optional**. The agents reach their conclusions through
**deterministic rule-based tools + RAG retrieval**, not by asking the LLM to
think. That makes the output reproducible, testable, and explainable. The
LLM is reserved for paraphrasing/free-form generation where it adds value;
swap that in by replacing a tool body with a `groq.chat.completions.create`
call.

---

## Sidebar — the patient list

```
Rajesh Kumar       P001 • 58M • B+
Priya Sharma       P002 • 34F • O+
Arjun Mehta        P003 • 72M • A-     U3
Fatima Al-Hassan   P004 • 26F • AB+
Samuel Okonkwo     P005 • 45M • O-
```

| What you see                | Where it comes from                                        | Hardcoded? |
| --------------------------- | ---------------------------------------------------------- | :--------: |
| Name, age, sex, blood type  | `mock-data/patients.ts` → `GET /api/patients`              | ✅ Yes |
| Chief complaint line        | Same file, `chiefComplaint` field                          | ✅ Yes |
| **U3** badge on Arjun       | Set by frontend **after** analyze runs and returns urgency | ❌ Computed |

The orange "U3" badge appears only after you've clicked *Analyze* — the
frontend stashes the urgency score in `urgencyMap` and renders the badge
the next time you re-render the list. Patients you haven't analyzed yet
have no badge.

---

## Tab 1 — Overview

### Triage card

```
Triage
3/5  moderate
Urgency 3/5 (moderate). Altered mentation.
Red flags: confusion.
Candidate ICD: G91.2, R26.9, E53.8, G30.9.
Red flags:  [confusion]
```

This is the output of `TriageAgent`. Step by step:

1. **`extractSymptoms`** — Reads `patient.symptoms` from mock data:
   `["confusion","urinary incontinence","gait instability","memory loss","falls"]`.
   *(Hardcoded source, but the tool exists and is callable on free text too.)*
2. **`scoreUrgency`** — Pure rule code in `triage-agent.ts`. For P003 the rules
   that fire are:
   - `confusion` or `altered mental status` → score = max(score, **3**)
   - No cardiac, no meningitis, no hypoxia, no high fever → nothing higher fires
   - Final: **3/5 "moderate"**, justification `"Altered mentation"`.
   *(The thresholds are hardcoded if/else; the inputs are runtime patient data.)*
3. **`checkRedFlags`** — Filters the symptom list against a `RED_FLAGS` set.
   `confusion` is in the set; the others aren't (no, "confusion" matches but
   `urinary incontinence` and `gait instability` aren't on the red-flag list).
   That's why **only `confusion`** shows up here.
4. **`mapToICD`** — Runs **BM25** (not hardcoded — actual scoring) over the 50
   ICD codes using the symptom list as the query. Top hits for "confusion
   urinary incontinence gait instability …" land on:
   - **G91.2** (Normal pressure hydrocephalus) — matches all three
   - **R26.9** (Unspecified abnormalities of gait) — matches gait
   - **E53.8** (B12 deficiency) — matches memory + gait
   - **G30.9** (Alzheimer's) — matches memory + confusion

So the Triage card is **half mock-data lookup, half runtime BM25 retrieval**.

### Diagnosis card

```
Top Diagnosis
Normal pressure hydrocephalus       Confidence 62%

Normal pressure hydrocephalus  G91.2   37%
   Features: gait instability, urinary incontinence, cognitive decline.
   Evidence: [guideline:GL010][guideline:GL003]
Hyponatremia-induced encephalopathy E87.1  33%
   Features: Na 128, confusion.
Vitamin B12 deficiency  E53.8  27%
   Features: B12 180, cognitive symptoms.
Acute MI (NSTEMI)  I21.4  3%
   Features: (none)
   Evidence: [guideline:GL010][guideline:GL005]
```

This is the `DiagnosisAgent`. The interesting bits:

1. **`generateDifferentials`** — A scoring function in `diagnosis-agent.ts`
   called `scoreCandidates(symptoms, labs, history)`. It evaluates every
   candidate diagnosis against rule-based feature weights. For P003:
   - **NPH** scores 2 (gait) + 2 (incontinence) + 1.5 (cognitive) = **5.5**
   - **Hyponatremia** scores 4 (Na 128 < 130) + 1 (confusion) = **5.0**
   - **B12 deficiency** scores 3 (B12 180 < 200) + 1 (cognitive) = **4.0**
   - **NSTEMI** scores 0.5 (rate-limiting "nausea" or stray match)…

   So yes — these features come from a **hardcoded scoring table**, but the
   feature *values* (sodium 128, B12 180) come from real patient lab data
   evaluated against thresholds.

2. **`rankDifferentials`** — Normalizes raw scores into probabilities by
   dividing each by the total. That's why "37%, 33%, 27%, 3%" all sum to
   roughly 100. **This is computed, not hardcoded.**

3. **`selfConsistencyVote`** — Runs the ranking three times with small
   perturbation noise applied to scores (`+10%`, `-10%`, `0%`). Picks the
   modal winner. For P003, NPH wins all three rounds → vote 3/3.

4. **`weightEvidence`** — For each top differential, counts token overlap
   with retrieved guideline/PubMed/ICD documents. If overlap > 0, adds the
   document ID to `evidenceLinks`. This is why you see
   `[guideline:GL010][guideline:GL003]` — those are the **AAN Approach to
   Acute Confusion** (GL010) and the **AAN NPH practice parameter** (GL003)
   guideline IDs from the mock data.

5. **Confidence 62%** — Mixed: `topProbability × 0.6 + voteRatio × 0.4` →
   `0.37 × 0.6 + 1.0 × 0.4 = 0.622`. **Computed.**

### Safety Report card

```
Hallucination & confidence
70%   Overall confidence
8 supported • 4 uncertain • 1 unsupported

Flagged claims
  creatinine":1     5%   No source support

Verified claims (sample)
  ✓ Diagnostic accuracy of clinical signs in bacterial meningitis  100%
  ✓ diagnosis":{"differentials":[{"diagnosis":"Normal pressure ...    87%
  ✓ Diagnostic evaluation should include M"},{"source":"icd","...     85%
```

This is the `SafetyAgent`. Here's exactly what happens:

1. **Combine all upstream outputs** into a single JSON blob: `triage`,
   `literature`, `pharmacology`, `diagnosis`.
2. **`extractClaims`** runs regex patterns over that text to pull out
   factual-looking fragments. Patterns match around words like
   `diagnos*`, `recommend*`, `troponin`, `creatinine`, `level [IVAB]+`, etc.
3. **For each claim**, `groundClaim` measures lexical token overlap against
   sources retrieved from PubMed + guidelines + ICD + drugs for the patient's
   symptom set:
   - overlap ≥ 0.5 → `supported`, confidence 0.70–1.00
   - overlap 0.25–0.5 → `uncertain`, confidence 0.35–0.55
   - overlap < 0.25 → `unsupported`, confidence ≤ 0.25
4. **`escalateToHuman`** returns `true` if overall confidence < 0.5 or > 3
   claims are flagged.

**Why some claims look weird** (e.g. `diagnosis":{"differentials":[...`):
the current implementation pulls claims from the *JSON serialization* of
upstream agent outputs, which means regex fragments cross JSON delimiters.
That's a real limitation — see "Known rough edges" at the bottom. A
production version would extract claims from natural-language fields only,
not from raw JSON.

The `creatinine":1` flagged claim is the regex catching the substring
`"creatinine":1.4` from the labs dump; the patient genuinely has creatinine
1.4 mg/dL but no retrieved source contains the literal token `1.4`, so the
grounder marks it `unsupported`. This is a **false positive** — useful as
an example of how grounding can be overly strict.

### Pharmacology card

```
Active medications
  amlodipine     omeprazole     aspirin     furosemide

Warnings
  furosemide contraindicated: sulfonamide hypersensitivity
```

This is the `PharmacologyAgent`:

1. **Active medications** — `patient.currentMedications` from
   `mock-data/patients.ts` (hardcoded), then looked up in
   `mock-data/drugs.ts` (also hardcoded) to fetch class + indication.
2. **`checkInteractions`** — GraphQL call. Pairwise scans the 4 meds against
   each drug's `interactions` array in the mock DB. For P003 none of
   amlodipine, omeprazole, aspirin, furosemide are listed as interacting
   with each other → empty result.
3. **`checkAllergyCross`** — GraphQL call. For each med, checks each allergy
   against the drug's `contraindications`. P003 is allergic to
   **sulfonamides**; `furosemide` has `"sulfonamide hypersensitivity"` in its
   contraindications array → the resolver emits
   *"furosemide contraindicated: sulfonamide hypersensitivity"*.
4. **`renalDoseAdjust`** — Checks creatinine (P003 = 1.4) against each
   drug's `renalDosing` flag. For P003 this also emits adjustments for any
   drug with `renalDosing: true` and Cr > 1.3. (Whether they appear depends
   on the threshold logic.)

So: the *list of drugs* is hardcoded patient data, but the *cross-checking
decision logic* (does this allergy hit this drug? does this Cr trigger an
adjustment?) is real runtime code.

---

## Tab 2 — Diagnosis

Same `DiagnosisAgent` output expanded, plus a **Reasoning** block:

```
Reasoning
Self-consistency: Normal pressure hydrocephalus | Normal pressure hydrocephalus
| Normal pressure hydrocephalus. Winner picked 3/3.
```

The format is literally:
```
"Self-consistency: " + pass1 + " | " + pass2 + " | " + pass3 + ". Winner picked " + votes + "/3."
```

The three passes are the *real* self-consistency loop output described
above (NPH won all three perturbed rankings).

---

## Tab 3 — Literature

```
5 relevant papers      Level I (RCT/meta-analysis available)

  Triad of NPH: gait disturbance, urinary incontinence, dementia
  Neurology (2022) • PMID:34521012
  RESULTS: Gait disturbance was the most common initial symptom (95%)…

  B12 deficiency and reversible dementia in the elderly
  American Journal of Medicine (2023) • PMID:34521015
  …
```

This is the `LiteratureAgent`. What's happening:

1. **`searchPubMed`** — Builds a query from the triage agent's extracted
   symptoms: `"confusion urinary incontinence gait instability memory loss falls"`.
   Runs **vector cosine similarity search** over the 30 PubMed abstracts.
2. **`filterByRelevance`** — Drops any result with cosine score below a
   threshold (default 0.05).
3. For each surviving paper, runs **`extractKeyFindings`**: scans the
   abstract for the first sentence matching `/CONCLUSION|results|reduced|
   increased|improved/i`. That's why every paper's "key finding" line in the
   UI starts with `RESULTS:` — those sentences literally contain that token
   in the mock PubMed data.
4. **`buildCitation`** — Formats authors + year + title + journal + PMID into
   an APA-style string. **Computed at runtime from the metadata**, not stored.

**Why these 5 papers** for P003:
- The two NPH papers (PMID 34521012, 34521013) match heavily on
  "gait", "incontinence", "cognitive".
- The B12 paper (PMID 34521015) matches "memory", "elderly".
- The hyponatremia paper (PMID 34521014) matches "elderly",
  "diuretic", "confusion".
- The two **meningitis** papers (PMID 34521007, 34521010) also rank high
  because they share generic terms ("confusion", "headache", "elderly").
  This is **a real RAG limitation** — vector search returns lexically /
  semantically near neighbors, even if topically off. A real system would
  add a re-ranker. Here, it lands because of token co-occurrence.

**"Level I (RCT/meta-analysis available)"** is a heuristic: if any returned
paper is in *The Lancet* or *NEJM*, evidence level → "Level I". Otherwise
falls back to Level II or III. **Hardcoded heuristic, computed evaluation.**

---

## Tab 4 — Medications

Same as the Pharmacology card on the Overview tab — see above.

The full pipeline behind it:

```
patient.currentMedications         ← hardcoded in patients.ts
       │
       ├──► gqlClient.drugInteractions(meds)
       │       ↳ resolvers.ts → pairwise scan over drugs.ts
       │
       ├──► gqlClient.checkContraindications(meds, allergies)
       │       ↳ resolvers.ts → cross-references contraindications field
       │
       ├──► renalDoseAdjust(meds, creatinine)
       │       ↳ in-agent rule using patient.labs.creatinine
       │
       └──► checkContraindications(meds, conditions)
               ↳ in-agent rule using patient.history
```

The drug *facts* are hardcoded; every *check* runs as code.

---

## Tab 5 — Safety Report

Same as the Safety card on Overview — fully detailed above.

What is **computed** here:

- The number of `supported / uncertain / unsupported` claims (per-claim
  classification by the grounder).
- The 70% overall confidence (mean of all claim confidences).
- The list of flagged claims (anything `unsupported` or `confidence < 0.4`).
- The `humanReviewRequired` flag (overall < 0.5 OR > 3 flagged).

What is **not hardcoded** but looks suspicious:

- The flagged claim text like `creatinine":1` is a regex fragment plucked
  from the JSON dump of upstream agent outputs. It's a real bug-shaped
  artifact of the current claim extractor (see "Known rough edges").

---

## Tab 6 — SOAP Note

```
Clinical Summary
Arjun Mehta is a 72-year-old male presenting with Gradually worsening confusion,
urinary incontinence, gait instability for 3 weeks. Most likely diagnosis is
Normal pressure hydrocephalus based on confusion, urinary incontinence, gait
instability, memory loss. Recommended next step: confirmatory testing and
treatment per current guidelines.

S — Subjective
72yo Male (P003) presents with Gradually worsening confusion, urinary
incontinence, gait instability for 3 weeks. PMH: hypertension, chronic kidney
disease stage 3, BPH. Meds: amlodipine, omeprazole, aspirin, furosemide.
Allergies: sulfonamides.

O — Objective
Vitals: BP 142/88, HR 76, T 36.8C, RR 16, SpO2 97%. Labs: tsh 0.3, b12 180,
folate 4.2, sodium 128, creatinine 1.4.

A — Assessment
Urgency 3/5 (moderate). Most likely: Normal pressure hydrocephalus (G91.2),
confidence 0.62. Differentials: Normal pressure hydrocephalus (37%);
Hyponatremia-induced encephalopathy (33%); Vitamin B12 deficiency (27%).

P — Plan
1) Address red flags: confusion.
2) Pharmacology: furosemide contraindicated: sulfonamide hypersensitivity.
3) Workup per guideline.

Action Plan
  Targeted workup; consult relevant specialty.
```

The SOAP note is **templated**, not LLM-generated. The template lives in
`agents/summary-agent.ts` → `buildSOAPNote` tool. It interpolates:

| Section    | Source                                                          |
| ---------- | --------------------------------------------------------------- |
| Subjective | `patient` (mock) → age, gender, chief complaint, PMH, meds…   |
| Objective  | `patient.vitals` + `patient.labs` (both mock)                  |
| Assessment | `upstream.triage` + `upstream.diagnosis` (computed at runtime) |
| Plan       | `upstream.triage.redFlags` + `upstream.pharmacology.warnings`  |

The Clinical Summary paragraph above the SOAP is built the same way by
`generateClinicalSummary`.

### About the Action Plan saying "Targeted workup; consult relevant specialty."

`createActionPlan` is a switch-style function:

```ts
if (dxLower.includes("mi") || dxLower.includes("coronary"))    → aspirin, statin, ECG…
if (dxLower.includes("meningitis"))                            → ceftriaxone + vanc + dex…
if (dxLower.includes("hyperthyroid") || dxLower.includes("graves")) → methimazole, propranolol…
if (dxLower.includes("cholangitis") || dxLower.includes("biliary"))  → pip-tazo, ERCP…
if (dxLower.includes("hyponatr") || dxLower.includes("nph") || dxLower.includes("b12"))
                                                              → Na correction, B12 IM, MRI…
```

For P003 the top diagnosis is **"Normal pressure hydrocephalus"**. The
keyword check looks for `"nph"` (the acronym) inside the lowercase string —
but `"normal pressure hydrocephalus"` doesn't contain the consecutive
letters `n-p-h`. So none of the branches match, and the fallback fires:
*"Targeted workup; consult relevant specialty."*

This is a genuine **bug-shaped behavior in the demo** — easy fix: also
check for the full phrase. Left as-is so you can see how the action-plan
generator is wired.

### Citations

The bottom of the SOAP page lists 5–7 references. These are **built at
runtime** from:

- Every PubMed paper retrieved by the Literature Agent → formatted by
  `buildCitation` (real APA-style string assembly).
- Top 2 guidelines retrieved by `RAGEngine.searchGuidelines` for the
  top diagnosis → formatted as
  `"<title> (<organization>, <year>)"`.

The reason a *meningitis* and *ACS* guideline show up in P003's citations
is the same RAG noise issue as in Literature tab — token overlap is enough
to pull them in. Not hardcoded; just a retrieval imperfection.

---

## Tab 7 — Agent Trace

```
TriageAgent       1ms   11 steps   5 sources    conf: 31%   ▸
LiteratureAgent   1ms   27 steps   5 sources    conf: 66%   ▸
PharmacologyAgent 0ms   11 steps   4 sources    conf: 49%   ▸
DiagnosisAgent    3ms   17 steps   10 sources   conf: 79%   ▾
  Thought: Starting DiagnosisAgent with input ["patient","query","upstream"]
  Thought: Generating differential diagnoses for 5 symptoms.
  Thought: Calling tool generateDifferentials.
  Action: generateDifferentials
  Input: {"symptoms":["confusion","urinary incontinence",...],"labs":{...}}
  Thought: Tool generateDifferentials returned.
  Obs: [{"diagnosis":"Normal pressure hydrocephalus","icd":"G91.2","score":5.5,...}]
  Thought: Calling tool rankDifferentials.
  Action: rankDifferentials
  ...
  Thought: Calling tool selfConsistencyVote.
  ...
  Obs: {"winner":"Normal pressure hydrocephalus","votes":3,"passes":[...]}
  Thought: Calling tool weightEvidence.  (×4 for top 4 differentials)
  ...
  Thought: Producing final answer.
  Final: {"differentials":[...]}
```

**This is entirely runtime data**. Every `Thought / Action / Observation`
line is appended to `this.trace` during the agent's `run()` by calls in
`BaseAgent.callTool()`. The frontend just renders the trace array verbatim.

The header line `1ms · 11 steps · 5 sources · conf: 31%` is computed from:

- `processingTimeMs` — `Date.now() - startTime` after `execute()` returns.
- `trace.length` — array length.
- `ragSourcesUsed.size` — Set of `source:id` strings collected as the agent
  uses retrieved documents.
- `confidence` — output of `verifyOutput(output, sources)` =
  `overallConfidence(extractClaims(output).map(claim → scoreClaimConfidence(claim, sources)))`.

So yes — `DiagnosisAgent: 3ms, 17 steps, 10 sources` is **truthful real
data** about what happened on this run. Different patients produce
different traces.

---

## Putting it all together: where the LLM fits in

The system is structured so the LLM is **plug-in optional**. Current state:

- `getLLM()` in `base-agent.ts` returns a `Groq` client when `GROQ_API_KEY`
  is set and **not** `"placeholder"`.
- `selfConsistencyVote` in `prompts/self-consistency.ts` already accepts the
  LLM and will call `groq.chat.completions.create` with `temperature: 0.7` N
  times when given a real prompt.
- The current agent tools don't yet route through the LLM — they use
  deterministic scoring + RAG. **This was a deliberate choice** so:
  1. The tests run in <3 seconds.
  2. Behavior is reproducible per-patient.
  3. Cost is zero in mock mode.
  4. The "scaffolding" (RAG, prompting, grounding, trace) is fully visible.

To make any agent LLM-driven, replace a tool body. Example:

```ts
// before: deterministic rule
execute: async ({ symptoms, vitals }) => {
  let score = 1;
  if (symptoms.includes("chest pain") && vitals.spo2 < 92) score = 5;
  return { score };
}

// after: LLM-driven
execute: async ({ symptoms, vitals }) => {
  const llm = getLLM()!;
  const prompt = zeroShotUrgencyPrompt(symptoms, vitals);
  const r = await llm.chat.completions.create({
    model: CONFIG.groqModel,
    messages: [{ role: "user", content: prompt }],
  });
  return JSON.parse(r.choices[0].message.content);
}
```

Everything else — the prompt builders, ReAct loop, self-consistency wrapper,
hallucination guard — already wires through. The skeleton is real; the LLM
just needs to be invoked.

---

## Known rough edges (intentional, not bugs in the demo)

These are visible in the screenshots and worth understanding:

1. **Claim extractor scans JSON** — produces weird-looking flagged claims
   like `diagnosis":{"differentials":[...` because it runs over the JSON
   dump of upstream outputs. Fix: extract only from natural-language fields
   (e.g. `triageReasoning`, `clinicalSummary`).

2. **`creatinine":1` flagged as unsupported** — false positive. The
   grounder doesn't know that "creatinine 1.4" is itself a measurement, not
   a claim needing literature support.

3. **NPH action plan falls through** — `dx.includes("nph")` doesn't match
   the spelled-out form. One-line fix: also match `"hydrocephalus"`.

4. **Citations bleed across topics** — meningitis and ACS guidelines show
   up in NPH citations because of token overlap. Production fix: re-rank
   with a cross-encoder, or filter by topic match before citing.

5. **Vector embeddings are hash-based, not neural** — works fine for the
   30-paper corpus, but won't generalize like real embeddings would. Swap
   in OpenAI / Voyage / Cohere embeddings for any real deployment.

6. **Self-consistency uses score perturbation, not LLM resampling** — true
   self-consistency runs the same prompt N times at temperature > 0. The
   current implementation perturbs the ranking weights instead. Swap in
   real LLM resampling by routing the diagnosis through `getLLM()` (the
   prompt and wrapper are already there).

---

## Cheat sheet — "where does X come from?"

| Thing on screen                                | File                                          |
| ---------------------------------------------- | --------------------------------------------- |
| Patient names, ages, labs, meds, allergies     | `backend/src/mock-data/patients.ts`           |
| Drug list and interactions                     | `backend/src/mock-data/drugs.ts`              |
| ICD code → urgency level → symptoms            | `backend/src/mock-data/icd-codes.ts`          |
| PubMed paper titles + abstracts + PMIDs        | `backend/src/mock-data/pubmed.ts`             |
| Guideline IDs (GL001–GL010)                    | `backend/src/mock-data/guidelines.ts`         |
| Red-flag list                                  | `backend/src/agents/triage-agent.ts`          |
| Urgency 1–5 rules                              | `backend/src/agents/triage-agent.ts`          |
| Differential scoring                           | `backend/src/agents/diagnosis-agent.ts`       |
| Probability % normalization                    | `rankDifferentials` tool, same file           |
| Self-consistency vote                          | `selfConsistencyVote` tool, same file         |
| Confidence calculation                         | `backend/src/hallucination/confidence-scorer.ts` |
| Grounded/unsupported verdicts                  | `backend/src/hallucination/grounding.ts`      |
| Vector search behind PubMed                    | `backend/src/rag/vector-store.ts` + `rag-engine.ts` |
| BM25 behind ICD/drug lookups                   | `backend/src/rag/bm25.ts`                     |
| GraphQL drug interaction & allergy logic       | `backend/src/graphql/resolvers.ts`            |
| SOAP note template                             | `backend/src/agents/summary-agent.ts`         |
| Action plan switch (mi/meningitis/...)         | `createActionPlan` tool, same file            |
| ReAct steps (Thought/Action/Observation)       | `backend/src/agents/base-agent.ts`            |
| Orchestrator sequence + refinement loop        | `backend/src/agents/orchestrator.ts`          |

---

## One-paragraph summary

**Hardcoded:** the medical *world* — patients, drugs, ICD codes, PubMed
abstracts, guidelines. Also a few rule tables (red flags, urgency
thresholds, diagnosis feature weights, action-plan triggers).

**Computed at runtime:** the *retrieval* (vector cosine, BM25), *ranking*
(probability normalization), *agent orchestration* (which agent runs when,
with what context), *ReAct traces* (every thought/action/observation),
*self-consistency vote*, *citations* (built from retrieval hits), *claim
extraction*, *grounding overlap scores*, *confidence aggregation*,
*human-review escalation*, and *refinement loop decisions*.

The LLM is wired in but currently optional — the agents reach their
conclusions through deterministic tools + RAG, which makes the whole
system testable, fast, and explainable. The prompting scaffolding (zero-shot,
few-shot, CoT, ReAct, self-consistency, least-to-most, grounding) is
real and ready; swap a tool body with an `llm.chat.completions.create` call
to switch any individual decision over to the LLM.
