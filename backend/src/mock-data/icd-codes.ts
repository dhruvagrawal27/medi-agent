export interface ICDCode {
  code: string;
  description: string;
  category: string;
  commonSymptoms: string[];
  urgencyLevel: "emergent" | "urgent" | "routine";
}

export const MOCK_ICD_CODES: ICDCode[] = [
  // Cardiac
  { code: "I21.9", description: "Acute myocardial infarction, unspecified", category: "Cardiovascular", commonSymptoms: ["chest pain", "dyspnea", "diaphoresis", "left arm radiation", "nausea"], urgencyLevel: "emergent" },
  { code: "I21.0", description: "ST elevation MI of anterior wall", category: "Cardiovascular", commonSymptoms: ["chest pain", "dyspnea", "diaphoresis"], urgencyLevel: "emergent" },
  { code: "I21.4", description: "Non-ST elevation MI (NSTEMI)", category: "Cardiovascular", commonSymptoms: ["chest pain", "dyspnea", "fatigue"], urgencyLevel: "emergent" },
  { code: "I20.0", description: "Unstable angina", category: "Cardiovascular", commonSymptoms: ["chest pain", "dyspnea", "rest pain"], urgencyLevel: "emergent" },
  { code: "I20.9", description: "Angina pectoris, unspecified", category: "Cardiovascular", commonSymptoms: ["chest pain", "exertional dyspnea"], urgencyLevel: "urgent" },
  { code: "I25.10", description: "Atherosclerotic heart disease without angina", category: "Cardiovascular", commonSymptoms: ["fatigue", "dyspnea"], urgencyLevel: "routine" },
  { code: "I50.9", description: "Heart failure, unspecified", category: "Cardiovascular", commonSymptoms: ["dyspnea", "edema", "orthopnea", "fatigue"], urgencyLevel: "urgent" },
  { code: "I50.1", description: "Left ventricular failure", category: "Cardiovascular", commonSymptoms: ["dyspnea", "orthopnea", "PND"], urgencyLevel: "urgent" },
  { code: "I10", description: "Essential (primary) hypertension", category: "Cardiovascular", commonSymptoms: ["headache", "asymptomatic"], urgencyLevel: "routine" },
  { code: "I48.91", description: "Atrial fibrillation, unspecified", category: "Cardiovascular", commonSymptoms: ["palpitations", "dyspnea", "fatigue"], urgencyLevel: "urgent" },

  // Neurological / Infectious CNS
  { code: "G00.9", description: "Bacterial meningitis, unspecified", category: "Neurological", commonSymptoms: ["severe headache", "fever", "neck stiffness", "photophobia", "vomiting"], urgencyLevel: "emergent" },
  { code: "G00.1", description: "Pneumococcal meningitis", category: "Neurological", commonSymptoms: ["severe headache", "fever", "neck stiffness", "altered mental status"], urgencyLevel: "emergent" },
  { code: "G03.9", description: "Meningitis, unspecified", category: "Neurological", commonSymptoms: ["headache", "fever", "neck stiffness"], urgencyLevel: "emergent" },
  { code: "G04.90", description: "Encephalitis, unspecified", category: "Neurological", commonSymptoms: ["headache", "fever", "altered mental status", "seizure"], urgencyLevel: "emergent" },
  { code: "G91.2", description: "(Idiopathic) normal pressure hydrocephalus", category: "Neurological", commonSymptoms: ["gait instability", "urinary incontinence", "confusion", "memory loss"], urgencyLevel: "urgent" },
  { code: "G91.9", description: "Hydrocephalus, unspecified", category: "Neurological", commonSymptoms: ["headache", "gait disturbance", "confusion"], urgencyLevel: "urgent" },
  { code: "G43.909", description: "Migraine, unspecified", category: "Neurological", commonSymptoms: ["headache", "photophobia", "nausea"], urgencyLevel: "urgent" },
  { code: "G30.9", description: "Alzheimer's disease, unspecified", category: "Neurological", commonSymptoms: ["memory loss", "confusion", "behavioral changes"], urgencyLevel: "routine" },
  { code: "F03.90", description: "Unspecified dementia without behavioral disturbance", category: "Neurological", commonSymptoms: ["memory loss", "confusion"], urgencyLevel: "routine" },
  { code: "I63.9", description: "Cerebral infarction, unspecified (stroke)", category: "Neurological", commonSymptoms: ["weakness", "speech difficulty", "facial droop", "altered mental status"], urgencyLevel: "emergent" },
  { code: "G45.9", description: "Transient ischemic attack, unspecified", category: "Neurological", commonSymptoms: ["transient weakness", "speech difficulty", "vision changes"], urgencyLevel: "emergent" },

  // Endocrine
  { code: "E05.00", description: "Thyrotoxicosis with diffuse goiter (Graves')", category: "Endocrine", commonSymptoms: ["palpitations", "weight loss", "heat intolerance", "tremor", "anxiety"], urgencyLevel: "urgent" },
  { code: "E05.90", description: "Thyrotoxicosis, unspecified, without thyrotoxic crisis", category: "Endocrine", commonSymptoms: ["palpitations", "weight loss", "heat intolerance"], urgencyLevel: "urgent" },
  { code: "E05.91", description: "Thyrotoxicosis with thyrotoxic crisis (storm)", category: "Endocrine", commonSymptoms: ["palpitations", "fever", "altered mental status", "vomiting"], urgencyLevel: "emergent" },
  { code: "E06.3", description: "Autoimmune thyroiditis (Hashimoto's)", category: "Endocrine", commonSymptoms: ["fatigue", "weight gain", "cold intolerance"], urgencyLevel: "routine" },
  { code: "E03.9", description: "Hypothyroidism, unspecified", category: "Endocrine", commonSymptoms: ["fatigue", "weight gain", "cold intolerance", "constipation"], urgencyLevel: "routine" },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications", category: "Endocrine", commonSymptoms: ["polyuria", "polydipsia", "weight loss", "fatigue"], urgencyLevel: "routine" },
  { code: "E11.65", description: "Type 2 diabetes mellitus with hyperglycemia", category: "Endocrine", commonSymptoms: ["polyuria", "polydipsia", "blurred vision"], urgencyLevel: "urgent" },
  { code: "E10.10", description: "Type 1 diabetes mellitus with ketoacidosis", category: "Endocrine", commonSymptoms: ["nausea", "vomiting", "abdominal pain", "kussmaul respiration", "altered mental status"], urgencyLevel: "emergent" },

  // Hepatobiliary
  { code: "K80.50", description: "Calculus of bile duct without cholangitis", category: "Hepatobiliary", commonSymptoms: ["jaundice", "RUQ pain", "dark urine", "pruritus"], urgencyLevel: "urgent" },
  { code: "K80.30", description: "Calculus of bile duct with acute cholangitis", category: "Hepatobiliary", commonSymptoms: ["jaundice", "RUQ pain", "fever", "rigors"], urgencyLevel: "emergent" },
  { code: "K83.0", description: "Cholangitis", category: "Hepatobiliary", commonSymptoms: ["fever", "jaundice", "RUQ pain"], urgencyLevel: "emergent" },
  { code: "K80.20", description: "Calculus of gallbladder without cholecystitis", category: "Hepatobiliary", commonSymptoms: ["RUQ pain", "nausea", "fatty food intolerance"], urgencyLevel: "urgent" },
  { code: "K81.0", description: "Acute cholecystitis", category: "Hepatobiliary", commonSymptoms: ["RUQ pain", "fever", "Murphy's sign"], urgencyLevel: "urgent" },
  { code: "K71.10", description: "Toxic liver disease with hepatic necrosis", category: "Hepatobiliary", commonSymptoms: ["jaundice", "fatigue", "elevated transaminases"], urgencyLevel: "urgent" },
  { code: "K71.6", description: "Drug-induced liver injury (DILI)", category: "Hepatobiliary", commonSymptoms: ["jaundice", "fatigue", "nausea"], urgencyLevel: "urgent" },
  { code: "K72.00", description: "Acute hepatic failure without coma", category: "Hepatobiliary", commonSymptoms: ["jaundice", "coagulopathy", "encephalopathy"], urgencyLevel: "emergent" },
  { code: "B17.10", description: "Acute hepatitis C without hepatic coma", category: "Hepatobiliary", commonSymptoms: ["jaundice", "fatigue", "nausea"], urgencyLevel: "urgent" },

  // Metabolic / Electrolyte
  { code: "E87.1", description: "Hypo-osmolality and hyponatremia", category: "Metabolic", commonSymptoms: ["confusion", "nausea", "headache", "lethargy", "seizures"], urgencyLevel: "urgent" },
  { code: "E87.5", description: "Hyperkalemia", category: "Metabolic", commonSymptoms: ["palpitations", "muscle weakness", "asymptomatic"], urgencyLevel: "emergent" },
  { code: "E87.6", description: "Hypokalemia", category: "Metabolic", commonSymptoms: ["muscle weakness", "cramps", "palpitations"], urgencyLevel: "urgent" },
  { code: "E83.42", description: "Hypomagnesemia", category: "Metabolic", commonSymptoms: ["tremor", "muscle weakness", "tetany"], urgencyLevel: "urgent" },
  { code: "N18.3", description: "Chronic kidney disease, stage 3 (moderate)", category: "Renal", commonSymptoms: ["fatigue", "edema", "asymptomatic"], urgencyLevel: "routine" },
  { code: "N17.9", description: "Acute kidney failure, unspecified", category: "Renal", commonSymptoms: ["oliguria", "edema", "fatigue", "confusion"], urgencyLevel: "emergent" },
  { code: "E53.8", description: "Deficiency of other specified B group vitamins (B12)", category: "Nutritional", commonSymptoms: ["fatigue", "memory loss", "gait instability", "paresthesias"], urgencyLevel: "routine" },

  // General / Symptom-based
  { code: "R07.9", description: "Chest pain, unspecified", category: "Symptoms", commonSymptoms: ["chest pain"], urgencyLevel: "urgent" },
  { code: "R07.4", description: "Chest pain, unspecified (cardiac unconfirmed)", category: "Symptoms", commonSymptoms: ["chest pain"], urgencyLevel: "urgent" },
  { code: "R51.9", description: "Headache, unspecified", category: "Symptoms", commonSymptoms: ["headache"], urgencyLevel: "routine" },
  { code: "R50.9", description: "Fever, unspecified", category: "Symptoms", commonSymptoms: ["fever"], urgencyLevel: "urgent" },
  { code: "R11.2", description: "Nausea with vomiting, unspecified", category: "Symptoms", commonSymptoms: ["nausea", "vomiting"], urgencyLevel: "routine" },
  { code: "R10.11", description: "Right upper quadrant pain", category: "Symptoms", commonSymptoms: ["RUQ pain"], urgencyLevel: "urgent" },
  { code: "R17", description: "Unspecified jaundice", category: "Symptoms", commonSymptoms: ["jaundice"], urgencyLevel: "urgent" },
  { code: "R41.0", description: "Disorientation, unspecified", category: "Symptoms", commonSymptoms: ["confusion", "disorientation"], urgencyLevel: "urgent" },
  { code: "R26.9", description: "Unspecified abnormalities of gait and mobility", category: "Symptoms", commonSymptoms: ["gait instability", "falls"], urgencyLevel: "routine" },
];

export function getICD(code: string): ICDCode | undefined {
  return MOCK_ICD_CODES.find((c) => c.code === code);
}
