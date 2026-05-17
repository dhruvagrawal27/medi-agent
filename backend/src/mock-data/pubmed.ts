export interface PubMedAbstract {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  year: number;
  keywords: string[];
  meshTerms: string[];
}

export const MOCK_PUBMED: PubMedAbstract[] = [
  // ===== MI / ACS (6 papers) =====
  {
    pmid: "34521001",
    title: "Early invasive versus conservative management in acute coronary syndrome: 5-year outcomes",
    abstract:
      "BACKGROUND: In patients presenting with non-ST elevation acute coronary syndrome (NSTE-ACS), the optimal timing of invasive coronary angiography remains debated. METHODS: We randomized 4140 patients to early invasive (<24h) versus selective invasive strategy. Primary endpoint was composite of death, MI, or rehospitalization at 5 years. RESULTS: Early invasive strategy reduced primary endpoint (17.3% vs 21.4%, HR 0.81, 95% CI 0.70-0.93, p=0.003). Mortality benefit was significant in patients with elevated troponin (>0.1 ng/mL) and GRACE score >140. Bleeding complications were similar between groups. CONCLUSION: Early invasive management improves outcomes in high-risk NSTE-ACS patients, particularly those with troponin elevation and high GRACE scores.",
    authors: ["Smith JR", "Patel A", "Kumar V", "Johnson L"],
    journal: "New England Journal of Medicine",
    year: 2023,
    keywords: ["acute coronary syndrome", "NSTEMI", "invasive strategy", "troponin", "GRACE"],
    meshTerms: ["Acute Coronary Syndrome", "Myocardial Infarction", "Coronary Angiography"],
  },
  {
    pmid: "34521002",
    title: "Troponin elevation thresholds and 30-day mortality in chest pain patients",
    abstract:
      "OBJECTIVE: To determine the prognostic value of high-sensitivity troponin levels in patients presenting with chest pain. METHODS: Prospective cohort of 12,500 patients with chest pain. Troponin measured at 0, 3, and 6 hours. RESULTS: Patients with peak troponin >0.5 ng/mL had 8.2% 30-day mortality compared to 0.4% in those <0.04 ng/mL. Levels between 0.04-0.5 ng/mL conferred intermediate risk. Combined with ECG changes (ST depression or T-wave inversion), elevated troponin predicted MI with sensitivity 94% and specificity 89%. CONCLUSION: High-sensitivity troponin combined with ECG and clinical features provides robust risk stratification in chest pain.",
    authors: ["Chen W", "Roberts M", "Singh K"],
    journal: "Circulation",
    year: 2022,
    keywords: ["troponin", "chest pain", "myocardial infarction", "risk stratification"],
    meshTerms: ["Troponin", "Chest Pain", "Myocardial Infarction"],
  },
  {
    pmid: "34521003",
    title: "Dual antiplatelet therapy duration after PCI in diabetic patients",
    abstract:
      "BACKGROUND: Diabetic patients have higher risk of stent thrombosis. We compared 12 vs 30 months of dual antiplatelet therapy (DAPT) after drug-eluting stent placement. RESULTS: In 3200 diabetic patients, extended DAPT reduced stent thrombosis (0.4% vs 1.2%, p=0.01) but increased major bleeding (2.8% vs 1.5%, p=0.04). No mortality difference. CONCLUSION: Extended DAPT in diabetics requires individualized bleeding risk assessment.",
    authors: ["Tanaka H", "Williams D", "Ahmad F"],
    journal: "Journal of the American College of Cardiology",
    year: 2023,
    keywords: ["DAPT", "diabetes", "PCI", "stent thrombosis", "bleeding"],
    meshTerms: ["Antiplatelet Agents", "Diabetes Mellitus", "Percutaneous Coronary Intervention"],
  },
  {
    pmid: "34521004",
    title: "BNP and NT-proBNP as predictors of adverse outcome in acute MI",
    abstract:
      "PURPOSE: Evaluate prognostic role of natriuretic peptides in patients with acute myocardial infarction. METHODS: 2800 acute MI patients had BNP measured within 24 hours of admission. RESULTS: BNP >400 pg/mL was associated with 22% 1-year mortality compared to 4% in BNP <100 pg/mL. BNP added incremental prognostic value beyond LV ejection fraction and GRACE score. CONCLUSION: BNP is a powerful, independent predictor of mortality in acute MI.",
    authors: ["Kowalski P", "Diaz E", "Mehta S"],
    journal: "European Heart Journal",
    year: 2022,
    keywords: ["BNP", "myocardial infarction", "prognosis", "natriuretic peptides"],
    meshTerms: ["Natriuretic Peptide, Brain", "Myocardial Infarction", "Prognosis"],
  },
  {
    pmid: "34521005",
    title: "Diabetes mellitus and cardiovascular risk: a meta-analysis",
    abstract:
      "OBJECTIVE: To quantify cardiovascular risk in type 2 diabetes. We pooled data from 102 prospective studies (n=698,782). RESULTS: Type 2 diabetes doubled risk of coronary heart disease (HR 2.00), ischemic stroke (HR 2.27), and vascular death (HR 2.32). HbA1c >7% conferred progressively higher risk. Diabetic patients with chest pain should be considered high-risk for acute coronary events. CONCLUSION: Diabetes is a major independent cardiovascular risk factor warranting aggressive primary prevention.",
    authors: ["Anderson R", "Lim J", "Brown P"],
    journal: "The Lancet",
    year: 2021,
    keywords: ["diabetes", "cardiovascular disease", "HbA1c", "myocardial infarction"],
    meshTerms: ["Diabetes Mellitus, Type 2", "Cardiovascular Diseases", "Risk Factors"],
  },
  {
    pmid: "34521006",
    title: "Diaphoresis and arm radiation as predictors of acute MI in chest pain",
    abstract:
      "BACKGROUND: Classic symptoms of MI include chest pain with diaphoresis and left arm radiation. We assessed the diagnostic value of these features. METHODS: 5400 ED chest pain patients evaluated prospectively. RESULTS: Left arm radiation increased MI likelihood (LR+ 2.3), diaphoresis (LR+ 2.0), and both combined (LR+ 4.7). However, absence of these features did not exclude MI (sensitivity 41-48%). CONCLUSION: Classic symptoms increase pretest probability of MI but absence does not rule it out; objective testing remains essential.",
    authors: ["Greene M", "Hassan O", "Liu Y"],
    journal: "Annals of Emergency Medicine",
    year: 2023,
    keywords: ["chest pain", "diaphoresis", "arm radiation", "MI diagnosis"],
    meshTerms: ["Myocardial Infarction", "Chest Pain", "Diagnosis"],
  },

  // ===== Bacterial Meningitis (5 papers) =====
  {
    pmid: "34521007",
    title: "Diagnostic accuracy of clinical signs in bacterial meningitis",
    abstract:
      "BACKGROUND: Classic triad of fever, neck stiffness, and altered mental status is incomplete in many bacterial meningitis cases. METHODS: Prospective study of 696 adults with suspected meningitis. RESULTS: Triad present in only 44% of confirmed bacterial meningitis cases. Sensitivity of jolt accentuation 21%, Kernig sign 5%, Brudzinski 5%. However, at least one of fever, neck stiffness, or altered mental status present in 95%. CONCLUSION: Combination of any three features is sensitive; classic signs lack sensitivity. Low threshold for lumbar puncture is essential.",
    authors: ["van de Beek D", "Brouwer MC", "Thwaites GE"],
    journal: "The Lancet",
    year: 2021,
    keywords: ["bacterial meningitis", "Kernig", "Brudzinski", "diagnosis"],
    meshTerms: ["Meningitis, Bacterial", "Physical Examination", "Diagnosis"],
  },
  {
    pmid: "34521008",
    title: "CSF parameters in bacterial vs viral meningitis",
    abstract:
      "OBJECTIVE: To define CSF cutoffs distinguishing bacterial from viral meningitis. METHODS: Analysis of 1450 CSF samples from confirmed meningitis cases. RESULTS: CSF WBC >1000/mm3 (sensitivity 76%, specificity 96% for bacterial), CSF glucose <40 mg/dL (sensitivity 70%, specificity 98%), CSF/serum glucose ratio <0.4 (sensitivity 80%, specificity 98%), CSF protein >200 mg/dL (sensitivity 65%, specificity 95%). CONCLUSION: Combined CSF parameters reliably differentiate bacterial from viral meningitis.",
    authors: ["Sanchez J", "Petersen R", "Yousef A"],
    journal: "Clinical Infectious Diseases",
    year: 2022,
    keywords: ["meningitis", "CSF analysis", "bacterial", "viral"],
    meshTerms: ["Meningitis", "Cerebrospinal Fluid", "Diagnosis, Differential"],
  },
  {
    pmid: "34521009",
    title: "Empiric antibiotic therapy in suspected bacterial meningitis: time to treatment",
    abstract:
      "BACKGROUND: Delay in antibiotic administration worsens outcomes in bacterial meningitis. METHODS: Retrospective analysis of 2100 cases. RESULTS: Each hour of delay increased mortality by 12.6% (p<0.001). Ceftriaxone plus vancomycin should be started within 1 hour of suspicion, ideally before lumbar puncture if delay anticipated. Dexamethasone given prior to or with first antibiotic dose reduced unfavorable outcomes by 19%. CONCLUSION: Empiric ceftriaxone + vancomycin + dexamethasone should be administered immediately in suspected bacterial meningitis.",
    authors: ["Mendoza C", "Tan KH", "O'Brien S"],
    journal: "JAMA",
    year: 2023,
    keywords: ["meningitis", "antibiotics", "ceftriaxone", "dexamethasone", "time-to-treatment"],
    meshTerms: ["Meningitis, Bacterial", "Anti-Bacterial Agents", "Dexamethasone"],
  },
  {
    pmid: "34521010",
    title: "Procalcitonin in differentiating bacterial from viral CNS infections",
    abstract:
      "OBJECTIVE: To assess serum procalcitonin in meningitis diagnosis. METHODS: 850 patients with suspected meningitis. RESULTS: Procalcitonin >0.5 ng/mL had sensitivity 90%, specificity 95% for bacterial meningitis. Values >2 ng/mL essentially confirmed bacterial etiology. CRP >100 mg/L also useful but less specific. CONCLUSION: Procalcitonin is a reliable biomarker for bacterial vs viral CNS infections.",
    authors: ["Petrov N", "Salame G", "Wong R"],
    journal: "European Journal of Clinical Microbiology",
    year: 2022,
    keywords: ["procalcitonin", "meningitis", "biomarker", "bacterial infection"],
    meshTerms: ["Procalcitonin", "Meningitis", "Biomarkers"],
  },
  {
    pmid: "34521011",
    title: "Photophobia, headache and neck stiffness: clinical decision rules in meningitis",
    abstract:
      "BACKGROUND: We developed and validated a clinical decision rule for suspected meningitis. METHODS: Derivation cohort of 920 patients, validation in 580. RESULTS: Combination of fever >38.5C, severe headache, photophobia, neck stiffness, and altered mental status (any 3 of 5) had sensitivity 96%, specificity 71% for bacterial meningitis. Inflammatory markers (WBC >15, CRP >100) further increased likelihood. CONCLUSION: Bedside clinical features remain valuable and should prompt urgent CSF analysis and empiric treatment.",
    authors: ["Robinson F", "Khan I", "Carter J"],
    journal: "BMJ",
    year: 2023,
    keywords: ["meningitis", "photophobia", "headache", "clinical decision rule"],
    meshTerms: ["Meningitis", "Headache", "Photophobia", "Decision Support Techniques"],
  },

  // ===== Normal Pressure Hydrocephalus (4 papers) =====
  {
    pmid: "34521012",
    title: "Triad of NPH: gait disturbance, urinary incontinence, dementia",
    abstract:
      "BACKGROUND: Normal pressure hydrocephalus (NPH) presents with Hakim's triad: gait apraxia, urinary incontinence, and cognitive decline. METHODS: Review of 1820 NPH cases. RESULTS: Gait disturbance was the most common initial symptom (95%), followed by cognitive changes (78%) and incontinence (60%). Complete triad present in only 48% at diagnosis. MRI showed ventriculomegaly (Evans index >0.3) and DESH pattern. Tap test improved gait in 73% of responders. CONCLUSION: NPH should be considered in elderly patients with gait disturbance even without complete triad.",
    authors: ["Kitagaki H", "Halperin J", "Relkin N"],
    journal: "Neurology",
    year: 2022,
    keywords: ["NPH", "hydrocephalus", "gait", "incontinence", "dementia"],
    meshTerms: ["Hydrocephalus, Normal Pressure", "Gait Disorders, Neurologic", "Dementia"],
  },
  {
    pmid: "34521013",
    title: "VP shunt outcomes in normal pressure hydrocephalus",
    abstract:
      "OBJECTIVE: To evaluate ventriculoperitoneal shunt outcomes in NPH. METHODS: Cohort of 612 NPH patients post-shunt. RESULTS: Gait improvement in 72% at 1 year, cognitive improvement in 56%, incontinence improvement in 64%. Predictors of response: positive tap test, shorter symptom duration (<3 years), absence of cerebrovascular disease. Complication rate 11%. CONCLUSION: VP shunting benefits a majority of carefully selected NPH patients.",
    authors: ["Toma AK", "Watkins L", "Kitchen N"],
    journal: "Journal of Neurosurgery",
    year: 2023,
    keywords: ["NPH", "VP shunt", "hydrocephalus", "outcomes"],
    meshTerms: ["Ventriculoperitoneal Shunt", "Hydrocephalus, Normal Pressure"],
  },
  {
    pmid: "34521014",
    title: "Hyponatremia and cognitive impairment in elderly: diuretic-related",
    abstract:
      "BACKGROUND: Loop diuretics including furosemide are common cause of hyponatremia in elderly. METHODS: 3200 elderly patients on diuretics followed for 2 years. RESULTS: Hyponatremia (Na <130) developed in 9%, leading to confusion in 60% of those affected, gait instability in 45%, and falls in 23%. Correction of sodium improved cognition within 7 days in 78%. CONCLUSION: Hyponatremia is a reversible cause of confusion and falls in elderly patients on diuretics, mimicking NPH and dementia.",
    authors: ["Ferguson L", "Kim DH", "Singh R"],
    journal: "Age and Ageing",
    year: 2022,
    keywords: ["hyponatremia", "diuretics", "furosemide", "confusion", "elderly"],
    meshTerms: ["Hyponatremia", "Diuretics", "Aged", "Cognitive Dysfunction"],
  },
  {
    pmid: "34521015",
    title: "B12 deficiency and reversible dementia in the elderly",
    abstract:
      "OBJECTIVE: Vitamin B12 deficiency causes reversible cognitive and gait disturbance. METHODS: Cross-sectional study of 1100 elderly with cognitive complaints. RESULTS: B12 <200 pg/mL in 13%. Replacement therapy improved cognition in 67% within 6 months, gait in 52%. PPI use (e.g., omeprazole) increased B12 deficiency risk 2.5-fold. CONCLUSION: B12 should be measured in all elderly patients with new cognitive or gait symptoms.",
    authors: ["Hernandez M", "Vogel S", "Pradhan A"],
    journal: "American Journal of Medicine",
    year: 2023,
    keywords: ["vitamin B12", "dementia", "elderly", "PPI", "reversible cognitive impairment"],
    meshTerms: ["Vitamin B 12 Deficiency", "Dementia", "Proton Pump Inhibitors"],
  },

  // ===== Hyperthyroidism / Graves (5 papers) =====
  {
    pmid: "34521016",
    title: "Graves' disease: clinical features and TRAb in young adults",
    abstract:
      "BACKGROUND: Graves' disease commonly presents in women age 20-40 with palpitations, weight loss, heat intolerance, and tremor. METHODS: Prospective study of 920 newly diagnosed Graves' patients. RESULTS: TRAb (thyrotropin receptor antibody) positive in 96%, with levels >10 IU/L correlating with disease severity. TSH suppressed (<0.05) in 100%, free T4 elevated (mean 3.5 ng/dL), free T3 elevated (mean 8.4 pg/mL). Family history of autoimmune thyroid disease present in 28%. CONCLUSION: TRAb is highly sensitive and specific for Graves'.",
    authors: ["Bahn RS", "Burch HB", "Cooper DS"],
    journal: "Thyroid",
    year: 2022,
    keywords: ["Graves disease", "hyperthyroidism", "TRAb", "TSH", "T4"],
    meshTerms: ["Graves Disease", "Hyperthyroidism", "Autoantibodies"],
  },
  {
    pmid: "34521017",
    title: "Methimazole vs propylthiouracil in Graves' disease",
    abstract:
      "OBJECTIVE: Compare antithyroid drugs for Graves' management. METHODS: RCT of 480 patients comparing methimazole (15-30 mg/day) with propylthiouracil (300 mg/day). RESULTS: Methimazole achieved euthyroidism faster (mean 6 vs 9 weeks), with lower rates of hepatotoxicity (0.4% vs 2.7%) and similar agranulocytosis risk (0.3% each). PTU preferred only in first trimester pregnancy. CONCLUSION: Methimazole is first-line antithyroid drug for non-pregnant Graves' patients.",
    authors: ["Cooper DS", "Greenspan SL", "Ross DS"],
    journal: "Journal of Clinical Endocrinology and Metabolism",
    year: 2023,
    keywords: ["methimazole", "PTU", "Graves disease", "hyperthyroidism"],
    meshTerms: ["Antithyroid Agents", "Methimazole", "Propylthiouracil"],
  },
  {
    pmid: "34521018",
    title: "Beta-blockers for symptomatic relief in hyperthyroidism",
    abstract:
      "BACKGROUND: Beta-blockers provide symptomatic relief in hyperthyroidism. METHODS: Cohort of 320 hyperthyroid patients given propranolol. RESULTS: Heart rate reduction averaged 28 bpm, tremor improved in 89%, anxiety in 76%. Propranolol 40-80 mg three times daily was effective. Atenolol 50-100 mg daily also effective with better adherence. CONCLUSION: Beta-blockers are essential adjunctive therapy until antithyroid drugs take effect.",
    authors: ["Watanabe K", "Lefkowitz P", "Mehra R"],
    journal: "Endocrine Practice",
    year: 2022,
    keywords: ["beta-blocker", "propranolol", "hyperthyroidism", "tachycardia"],
    meshTerms: ["Adrenergic beta-Antagonists", "Hyperthyroidism"],
  },
  {
    pmid: "34521019",
    title: "Radioiodine vs antithyroid drugs vs surgery in Graves' disease",
    abstract:
      "PURPOSE: Compare definitive therapies for Graves'. METHODS: Multicenter cohort, 1850 patients. RESULTS: Radioiodine: 85% cure rate, hypothyroidism in 80% within 1 year. Methimazole: 50% remission at 18 months, 40% relapse. Thyroidectomy: 99% cure rate, recurrent laryngeal nerve injury 1.5%, hypoparathyroidism 2%. CONCLUSION: Choice depends on patient preference, ophthalmopathy, and pregnancy plans.",
    authors: ["Bartalena L", "Wiersinga WM", "Pinchera A"],
    journal: "European Thyroid Journal",
    year: 2023,
    keywords: ["radioiodine", "thyroidectomy", "Graves", "treatment"],
    meshTerms: ["Iodine Radioisotopes", "Thyroidectomy", "Graves Disease"],
  },
  {
    pmid: "34521020",
    title: "Thyroid storm: recognition and management",
    abstract:
      "BACKGROUND: Thyroid storm is a life-threatening complication with mortality 10-30%. METHODS: Retrospective review of 240 thyroid storm cases. RESULTS: Burch-Wartofsky score >45 had sensitivity 90% for diagnosis. Triggers included infection (38%), surgery (12%), iodine load (8%), and noncompliance with antithyroid drugs (32%). Management requires beta-blocker, antithyroid drug, iodine, glucocorticoid, and treatment of precipitant. CONCLUSION: Early recognition with high index of suspicion is crucial.",
    authors: ["Akamizu T", "Satoh T", "Isozaki O"],
    journal: "Thyroid",
    year: 2022,
    keywords: ["thyroid storm", "Burch-Wartofsky", "hyperthyroidism", "emergency"],
    meshTerms: ["Thyroid Crisis", "Hyperthyroidism"],
  },

  // ===== Cholestasis / Biliary Obstruction (5 papers) =====
  {
    pmid: "34521021",
    title: "Choledocholithiasis: diagnosis and management",
    abstract:
      "BACKGROUND: Common bile duct stones cause obstructive jaundice with characteristic lab pattern. METHODS: Cohort of 1100 patients with suspected choledocholithiasis. RESULTS: Elevated bilirubin (>3 mg/dL), ALP (>2x ULN), GGT (>3x ULN), and dilated CBD on ultrasound >6mm had PPV 78% for stones. ERCP is gold standard for diagnosis and treatment. Cholangitis (Charcot triad: fever, jaundice, RUQ pain) present in 32%. CONCLUSION: Lab pattern and imaging guide need for ERCP.",
    authors: ["Gurusamy KS", "Davidson BR", "Williamson RC"],
    journal: "Annals of Surgery",
    year: 2023,
    keywords: ["choledocholithiasis", "jaundice", "ERCP", "bile duct", "cholangitis"],
    meshTerms: ["Choledocholithiasis", "Jaundice, Obstructive", "Cholangitis"],
  },
  {
    pmid: "34521022",
    title: "Drug-induced liver injury from NSAIDs",
    abstract:
      "BACKGROUND: NSAIDs including ibuprofen cause hepatotoxicity in 1-10 per 100,000 prescriptions. METHODS: 480 cases of NSAID-induced liver injury analyzed. RESULTS: Pattern was predominantly hepatocellular (ALT >5x ULN) in 65%, cholestatic in 20%, mixed in 15%. Onset typically 2-12 weeks after initiation. Resolution usually after drug discontinuation (median 60 days). Risk increased with prolonged use >2 weeks and high doses. CONCLUSION: NSAID use should be considered in unexplained liver dysfunction.",
    authors: ["Bessone F", "Hernandez N", "Sanchez M"],
    journal: "Hepatology",
    year: 2022,
    keywords: ["DILI", "NSAID", "ibuprofen", "hepatotoxicity"],
    meshTerms: ["Chemical and Drug Induced Liver Injury", "Anti-Inflammatory Agents, Non-Steroidal"],
  },
  {
    pmid: "34521023",
    title: "Ascending cholangitis: Tokyo guidelines update",
    abstract:
      "OBJECTIVE: To validate the 2018 Tokyo guidelines for acute cholangitis. METHODS: International study of 5800 patients. RESULTS: Definite diagnosis requires (A) systemic inflammation (fever or labs), (B) cholestasis (jaundice or labs), and (C) imaging (biliary dilation or etiology). Severity grading (mild/moderate/severe) guides timing of biliary drainage. Mortality 2.7% in mild, 7.4% in moderate, 29% in severe. CONCLUSION: Tokyo Guidelines provide effective clinical framework.",
    authors: ["Kiriyama S", "Kozaka K", "Takada T"],
    journal: "Journal of Hepato-Biliary-Pancreatic Sciences",
    year: 2023,
    keywords: ["cholangitis", "Tokyo guidelines", "biliary infection", "jaundice"],
    meshTerms: ["Cholangitis", "Bacterial Infections"],
  },
  {
    pmid: "34521024",
    title: "ALT vs AST patterns in differentiating liver disease",
    abstract:
      "OBJECTIVE: Hepatocellular vs cholestatic vs mixed patterns aid diagnosis. METHODS: 2400 patients with abnormal liver tests. RESULTS: ALT/ALP ratio (R-value): R>5 indicates hepatocellular injury (drugs, viral hepatitis), R<2 cholestatic (obstruction, drugs), R 2-5 mixed. Bilirubin >5 mg/dL with ALP >3x ULN strongly suggests biliary obstruction. AST:ALT >2 suggests alcoholic liver disease. CONCLUSION: Pattern recognition narrows differential of liver injury.",
    authors: ["Kwo PY", "Cohen SM", "Lim JK"],
    journal: "American Journal of Gastroenterology",
    year: 2022,
    keywords: ["ALT", "AST", "ALP", "liver injury", "cholestasis"],
    meshTerms: ["Liver Function Tests", "Liver Diseases"],
  },
  {
    pmid: "34521025",
    title: "Ursodeoxycholic acid in cholestatic liver disease",
    abstract:
      "BACKGROUND: UDCA is mainstay for primary biliary cholangitis and used for pruritus in cholestasis. METHODS: Meta-analysis of 14 trials, 1850 patients. RESULTS: UDCA 13-15 mg/kg/day improved biochemistry in 78%, delayed progression in PBC. Symptomatic improvement in pruritus 60%. Limited role in obstructive jaundice from stones. CONCLUSION: UDCA is effective for medical cholestasis but does not replace mechanical drainage in obstruction.",
    authors: ["Lindor KD", "Bowlus CL", "Boyer J"],
    journal: "Hepatology",
    year: 2023,
    keywords: ["UDCA", "ursodeoxycholic acid", "cholestasis", "PBC"],
    meshTerms: ["Ursodeoxycholic Acid", "Cholestasis"],
  },

  // ===== Drug Interactions (5 papers) =====
  {
    pmid: "34521026",
    title: "Metformin and iodinated contrast: risk of lactic acidosis",
    abstract:
      "BACKGROUND: Concerns about metformin-associated lactic acidosis with iodinated contrast. METHODS: Systematic review of 32 studies, 65,000 patients. RESULTS: Risk negligible in patients with normal renal function (eGFR >60). For eGFR 30-60, hold metformin at time of contrast and resume 48 hours after if renal function stable. Avoid metformin if eGFR <30. CONCLUSION: Risk has been overstated; reasonable precautions suffice in most patients.",
    authors: ["Goergen SK", "Rumbold G", "Compton G"],
    journal: "Radiology",
    year: 2022,
    keywords: ["metformin", "contrast", "lactic acidosis", "renal function"],
    meshTerms: ["Metformin", "Contrast Media", "Acidosis, Lactic"],
  },
  {
    pmid: "34521027",
    title: "ACE inhibitors and NSAIDs: triple whammy and AKI",
    abstract:
      "BACKGROUND: ACE inhibitors + diuretics + NSAIDs cause acute kidney injury (triple whammy). METHODS: Case-control study, 3200 AKI cases. RESULTS: Combination doubled AKI risk (OR 1.91, 95% CI 1.51-2.41). Risk highest in elderly, dehydration, and CKD. Lisinopril plus furosemide plus ibuprofen particularly hazardous. CONCLUSION: Avoid this combination, especially in elderly with CKD.",
    authors: ["Lapi F", "Azoulay L", "Yin H"],
    journal: "BMJ",
    year: 2023,
    keywords: ["ACE inhibitor", "NSAID", "diuretic", "AKI", "triple whammy"],
    meshTerms: ["Angiotensin-Converting Enzyme Inhibitors", "Anti-Inflammatory Agents, Non-Steroidal", "Acute Kidney Injury"],
  },
  {
    pmid: "34521028",
    title: "Statin and macrolide interactions: rhabdomyolysis risk",
    abstract:
      "BACKGROUND: Statins metabolized by CYP3A4 (atorvastatin, simvastatin) interact with macrolides. METHODS: Population cohort of 280,000 patients. RESULTS: Concurrent clarithromycin and statin increased rhabdomyolysis 4.6-fold. Azithromycin had lower risk. Pravastatin and rosuvastatin (non-CYP3A4) had no interaction. CONCLUSION: Switch to non-interacting statin or pause statin during macrolide course.",
    authors: ["Patel AM", "Shariff SZ", "Bailey DG"],
    journal: "Annals of Internal Medicine",
    year: 2022,
    keywords: ["statin", "macrolide", "rhabdomyolysis", "drug interaction", "CYP3A4"],
    meshTerms: ["Hydroxymethylglutaryl-CoA Reductase Inhibitors", "Macrolides", "Rhabdomyolysis"],
  },
  {
    pmid: "34521029",
    title: "Penicillin allergy cross-reactivity with cephalosporins",
    abstract:
      "BACKGROUND: Historical concern about 10% cross-reactivity exaggerated. METHODS: Systematic review of 27 studies. RESULTS: True cross-reactivity is <2% with first-generation cephalosporins, <1% with third-generation. IgE-mediated severe reactions to penicillin (anaphylaxis) require avoidance of all beta-lactams without skin testing. CONCLUSION: Most patients labeled penicillin-allergic can safely receive cephalosporins.",
    authors: ["Khan DA", "Banerji A", "Bernstein JA"],
    journal: "Journal of Allergy and Clinical Immunology",
    year: 2023,
    keywords: ["penicillin allergy", "cephalosporin", "cross-reactivity"],
    meshTerms: ["Penicillins", "Cephalosporins", "Drug Hypersensitivity"],
  },
  {
    pmid: "34521030",
    title: "Aspirin and PPI: optimal use for gastrointestinal protection",
    abstract:
      "BACKGROUND: Long-term aspirin causes ulcers; PPI co-prescription reduces risk. METHODS: Meta-analysis of 18 RCTs, 32,400 patients. RESULTS: PPI reduced ulcer bleeding by 67% in aspirin users. Number needed to treat 75 in high-risk patients (age >65, prior ulcer, anticoagulation). Omeprazole, pantoprazole equally effective. CONCLUSION: PPIs are indicated for high-risk patients on chronic aspirin.",
    authors: ["Scally B", "Emberson JR", "Spata E"],
    journal: "Gastroenterology",
    year: 2022,
    keywords: ["aspirin", "PPI", "omeprazole", "GI bleeding"],
    meshTerms: ["Aspirin", "Proton Pump Inhibitors", "Peptic Ulcer Hemorrhage"],
  },
];

export function getPubMed(pmid: string): PubMedAbstract | undefined {
  return MOCK_PUBMED.find((p) => p.pmid === pmid);
}
