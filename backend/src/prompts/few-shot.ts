export interface Example {
  input: string;
  output: string;
}

export function buildFewShotPrompt(
  task: string,
  examples: Example[],
  input: string
): string {
  const exampleText = examples
    .map((e, i) => `Example ${i + 1}:\nInput: ${e.input}\nOutput: ${e.output}`)
    .join("\n\n");
  return `You are a senior clinical decision-support assistant.

TASK:
${task}

EXAMPLES:
${exampleText}

Now apply the same approach to:
Input: ${input}
Output:`;
}

export const SYMPTOM_EXTRACTION_EXAMPLES: Example[] = [
  {
    input:
      "Patient reports squeezing chest pressure radiating to the left jaw, with sweating and nausea, started 90 min ago.",
    output:
      '{"symptoms":["chest pressure","jaw radiation","diaphoresis","nausea"],"onset":"acute","duration":"90 minutes"}',
  },
  {
    input:
      "18-hour history of severe head pain, vomited twice, lights bother her, neck is stiff and febrile to 39.4C.",
    output:
      '{"symptoms":["severe headache","vomiting","photophobia","neck stiffness","fever"],"onset":"subacute","duration":"18 hours"}',
  },
  {
    input:
      "3-week progressive memory problems, falls, wets himself, no headache. Otherwise alert.",
    output:
      '{"symptoms":["memory loss","gait instability","urinary incontinence"],"onset":"subacute","duration":"3 weeks"}',
  },
];

export const DRUG_INTERACTION_EXAMPLES: Example[] = [
  {
    input: "Medications: warfarin, clarithromycin. Assess interaction.",
    output:
      '{"interaction":"severe","mechanism":"clarithromycin inhibits CYP3A4 and CYP2C9, raising warfarin levels","effect":"INR elevation, bleeding risk","action":"avoid combination; if necessary monitor INR closely"}',
  },
  {
    input: "Medications: lisinopril, furosemide, ibuprofen. Assess interaction.",
    output:
      '{"interaction":"moderate","mechanism":"triple whammy: ACE inhibitor + diuretic + NSAID","effect":"acute kidney injury risk","action":"discontinue ibuprofen; monitor creatinine"}',
  },
  {
    input: "Medications: metformin, iodine contrast. Assess interaction.",
    output:
      '{"interaction":"severe","mechanism":"contrast-induced nephrotoxicity can precipitate lactic acidosis with metformin","effect":"lactic acidosis","action":"hold metformin 48h after contrast; resume if creatinine stable"}',
  },
];

export const DIFFERENTIAL_EXAMPLES: Example[] = [
  {
    input:
      "58yo M, chest pain + left arm radiation + diaphoresis, troponin 0.8, hx DM/HTN.",
    output:
      '{"top3":[{"dx":"Acute MI (NSTEMI)","prob":0.85,"icd":"I21.4"},{"dx":"Unstable angina","prob":0.10,"icd":"I20.0"},{"dx":"Aortic dissection","prob":0.05,"icd":"I71.0"}]}',
  },
  {
    input:
      "34yo F, severe headache + photophobia + neck stiffness + fever 39.4, WBC 18.5.",
    output:
      '{"top3":[{"dx":"Bacterial meningitis","prob":0.82,"icd":"G00.9"},{"dx":"Viral meningitis","prob":0.13,"icd":"G03.9"},{"dx":"Subarachnoid hemorrhage","prob":0.05,"icd":"I60.9"}]}',
  },
  {
    input:
      "72yo M, 3-week confusion + gait instability + urinary incontinence, on furosemide, Na 128, B12 180.",
    output:
      '{"top3":[{"dx":"Hyponatremia-induced encephalopathy","prob":0.40,"icd":"E87.1"},{"dx":"Normal pressure hydrocephalus","prob":0.30,"icd":"G91.2"},{"dx":"B12 deficiency","prob":0.20,"icd":"E53.8"}]}',
  },
];
