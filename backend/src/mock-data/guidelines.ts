export interface Recommendation {
  level: "IA" | "IB" | "IIA" | "IIB" | "III";
  text: string;
}

export interface ClinicalGuideline {
  id: string;
  title: string;
  organization: "ACC/AHA" | "IDSA" | "AAN" | "ETA" | "AASLD" | "WHO";
  year: number;
  condition: string;
  recommendations: Recommendation[];
  keywords: string[];
}

export const MOCK_GUIDELINES: ClinicalGuideline[] = [
  {
    id: "GL001",
    title: "2023 ACC/AHA Guideline for Management of Acute Coronary Syndromes",
    organization: "ACC/AHA",
    year: 2023,
    condition: "acute coronary syndrome",
    recommendations: [
      { level: "IA", text: "Aspirin 162-325 mg loading dose should be administered to all ACS patients without contraindication." },
      { level: "IA", text: "Dual antiplatelet therapy (aspirin + P2Y12 inhibitor) for at least 12 months post-ACS." },
      { level: "IA", text: "High-intensity statin therapy (atorvastatin 80 mg or rosuvastatin 40 mg) should be initiated within 24 hours." },
      { level: "IB", text: "Early invasive strategy (<24h) is recommended for NSTE-ACS with GRACE score >140 or troponin elevation." },
      { level: "IIA", text: "Beta-blockers within 24 hours in stable patients without contraindication." },
      { level: "IIA", text: "ACE inhibitor/ARB recommended in patients with LVEF <40%, hypertension, diabetes, or CKD." },
    ],
    keywords: ["ACS", "MI", "STEMI", "NSTEMI", "troponin", "DAPT", "PCI"],
  },
  {
    id: "GL002",
    title: "IDSA Practice Guidelines for Bacterial Meningitis 2023",
    organization: "IDSA",
    year: 2023,
    condition: "bacterial meningitis",
    recommendations: [
      { level: "IA", text: "Empiric antibiotics (ceftriaxone 2g IV q12h + vancomycin 15-20 mg/kg q8-12h) within 1 hour of suspicion." },
      { level: "IA", text: "Dexamethasone 0.15 mg/kg q6h x 4 days, given before or with first antibiotic dose for pneumococcal meningitis." },
      { level: "IA", text: "Lumbar puncture should not delay empiric antibiotics if any sign of increased ICP or contraindication present; perform CT first if indicated." },
      { level: "IB", text: "Add ampicillin if patient is >50 years old, immunocompromised, or alcoholic (Listeria coverage)." },
      { level: "IIA", text: "Continue antibiotics for 10-14 days for confirmed bacterial meningitis." },
    ],
    keywords: ["meningitis", "bacterial", "ceftriaxone", "vancomycin", "dexamethasone", "CSF"],
  },
  {
    id: "GL003",
    title: "AAN Practice Parameter: Idiopathic Normal Pressure Hydrocephalus",
    organization: "AAN",
    year: 2022,
    condition: "normal pressure hydrocephalus",
    recommendations: [
      { level: "IB", text: "Diagnostic evaluation should include MRI brain showing ventriculomegaly (Evans index >0.3) and clinical assessment of Hakim's triad." },
      { level: "IB", text: "Large-volume lumbar puncture (tap test) or extended lumbar drainage should be performed before considering shunting." },
      { level: "IIA", text: "Ventriculoperitoneal shunt may be offered to patients with positive tap test and predominant gait dysfunction." },
      { level: "IIA", text: "Comorbidities should be evaluated and treated before NPH diagnosis (B12 deficiency, hyponatremia, vascular dementia)." },
      { level: "III", text: "Programmable shunt valves may reduce overdrainage complications." },
    ],
    keywords: ["NPH", "hydrocephalus", "gait", "incontinence", "shunt", "tap test"],
  },
  {
    id: "GL004",
    title: "ETA Guidelines for the Management of Graves Hyperthyroidism 2023",
    organization: "ETA",
    year: 2023,
    condition: "hyperthyroidism",
    recommendations: [
      { level: "IA", text: "Initial treatment with antithyroid drugs (methimazole 10-30 mg/day) for 12-18 months." },
      { level: "IA", text: "TRAb measurement at baseline and end of antithyroid drug therapy to predict relapse." },
      { level: "IB", text: "Beta-blocker (propranolol 40 mg TID or atenolol 50 mg daily) for symptomatic relief until euthyroid." },
      { level: "IIA", text: "Radioiodine therapy is appropriate for relapse, contraindication to ATD, or patient preference." },
      { level: "IIA", text: "Thyroidectomy for large goiter, suspected malignancy, or pregnancy planning." },
      { level: "IIB", text: "Use propylthiouracil in first trimester pregnancy due to lower teratogenicity." },
    ],
    keywords: ["Graves", "hyperthyroidism", "methimazole", "TRAb", "propranolol", "radioiodine"],
  },
  {
    id: "GL005",
    title: "AASLD Guidance on Acute Cholangitis and Choledocholithiasis",
    organization: "AASLD",
    year: 2023,
    condition: "cholangitis",
    recommendations: [
      { level: "IA", text: "Empiric broad-spectrum antibiotics (piperacillin-tazobactam or ceftriaxone + metronidazole) within 1 hour of diagnosis." },
      { level: "IA", text: "Urgent ERCP within 24 hours for moderate/severe cholangitis with biliary drainage." },
      { level: "IB", text: "MRCP or EUS for diagnostic evaluation when ultrasound is inconclusive." },
      { level: "IIA", text: "Tokyo Guidelines should be used for severity grading." },
      { level: "IIA", text: "Laparoscopic cholecystectomy within 6 weeks for patients with gallstone disease after cholangitis resolution." },
    ],
    keywords: ["cholangitis", "choledocholithiasis", "ERCP", "jaundice", "Tokyo guidelines"],
  },
  {
    id: "GL006",
    title: "ACC/AHA Heart Failure Guideline 2022",
    organization: "ACC/AHA",
    year: 2022,
    condition: "heart failure",
    recommendations: [
      { level: "IA", text: "ACE inhibitor or ARB in all patients with HFrEF (LVEF <40%)." },
      { level: "IA", text: "Beta-blocker (metoprolol succinate, bisoprolol, or carvedilol) in HFrEF." },
      { level: "IA", text: "SGLT2 inhibitor (empagliflozin, dapagliflozin) in HFrEF and HFpEF." },
      { level: "IB", text: "Aldosterone antagonist (spironolactone) for NYHA II-IV HFrEF." },
      { level: "IIA", text: "Loop diuretic (furosemide) for symptomatic volume overload." },
    ],
    keywords: ["heart failure", "HFrEF", "ACE inhibitor", "beta-blocker", "SGLT2"],
  },
  {
    id: "GL007",
    title: "IDSA Guidelines for Antimicrobial Stewardship 2023",
    organization: "IDSA",
    year: 2023,
    condition: "antimicrobial stewardship",
    recommendations: [
      { level: "IA", text: "Verify penicillin allergy history before avoiding beta-lactams; skin testing if needed." },
      { level: "IA", text: "Cephalosporins are safe in most patients with non-anaphylactic penicillin allergy." },
      { level: "IB", text: "De-escalate antibiotics based on culture results within 48-72 hours." },
      { level: "IIA", text: "Use shortest effective duration of therapy." },
    ],
    keywords: ["antibiotics", "allergy", "stewardship", "penicillin", "cephalosporin"],
  },
  {
    id: "GL008",
    title: "WHO Guidelines for Diabetes Management 2023",
    organization: "WHO",
    year: 2023,
    condition: "diabetes mellitus",
    recommendations: [
      { level: "IA", text: "Metformin is first-line for type 2 diabetes unless contraindicated." },
      { level: "IA", text: "HbA1c target <7% for most adults, individualized." },
      { level: "IB", text: "ACE inhibitor or ARB for diabetic patients with hypertension or albuminuria." },
      { level: "IB", text: "Statin therapy for primary prevention in diabetics with cardiovascular risk factors." },
      { level: "IIA", text: "Consider SGLT2 inhibitor or GLP-1 agonist for patients with established CVD." },
    ],
    keywords: ["diabetes", "metformin", "HbA1c", "T2DM"],
  },
  {
    id: "GL009",
    title: "AASLD Drug-Induced Liver Injury Practice Guidance 2023",
    organization: "AASLD",
    year: 2023,
    condition: "drug-induced liver injury",
    recommendations: [
      { level: "IA", text: "Discontinue suspected hepatotoxic drug immediately when DILI is suspected." },
      { level: "IB", text: "Exclude other causes (viral hepatitis, autoimmune, biliary obstruction)." },
      { level: "IIA", text: "Monitor INR and bilirubin; consider liver transplantation referral if INR >1.5 with encephalopathy." },
      { level: "IIA", text: "N-acetylcysteine for acetaminophen toxicity." },
    ],
    keywords: ["DILI", "hepatotoxicity", "NSAID", "ibuprofen", "acetaminophen"],
  },
  {
    id: "GL010",
    title: "AAN Approach to Acute Confusion in the Elderly 2022",
    organization: "AAN",
    year: 2022,
    condition: "delirium and confusion",
    recommendations: [
      { level: "IA", text: "Evaluate for reversible causes: electrolyte imbalance (especially hyponatremia), infection, medications, B12 deficiency, thyroid dysfunction." },
      { level: "IA", text: "Review medication list for offenders: anticholinergics, benzodiazepines, opioids, diuretics." },
      { level: "IB", text: "Neuroimaging (CT/MRI) for new-onset confusion to exclude stroke, hemorrhage, hydrocephalus." },
      { level: "IIA", text: "Address underlying cause; avoid antipsychotics as first-line management." },
    ],
    keywords: ["confusion", "delirium", "elderly", "hyponatremia", "B12", "NPH"],
  },
];

export function getGuideline(id: string): ClinicalGuideline | undefined {
  return MOCK_GUIDELINES.find((g) => g.id === id);
}
