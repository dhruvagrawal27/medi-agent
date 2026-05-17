export interface Vitals {
  bp: string;
  hr: number;
  temp: number;
  rr: number;
  spo2: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  chiefComplaint: string;
  symptoms: string[];
  vitals: Vitals;
  labs: Record<string, number>;
  currentMedications: string[];
  allergies: string[];
  history: string[];
  smokingStatus: string;
  familyHistory: string[];
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "P001",
    name: "Rajesh Kumar",
    age: 58,
    gender: "Male",
    bloodType: "B+",
    chiefComplaint: "Chest pain radiating to left arm, shortness of breath, diaphoresis for 2 hours",
    symptoms: ["chest pain", "left arm radiation", "dyspnea", "diaphoresis", "nausea"],
    vitals: { bp: "158/95", hr: 102, temp: 37.1, rr: 22, spo2: 94 },
    labs: { troponin: 0.8, bnp: 450, creatinine: 1.1, hba1c: 7.2, ldl: 145 },
    currentMedications: ["metformin", "lisinopril", "atorvastatin"],
    allergies: ["penicillin"],
    history: ["type 2 diabetes", "hypertension", "hyperlipidemia"],
    smokingStatus: "former",
    familyHistory: ["father: MI at 55"],
  },
  {
    id: "P002",
    name: "Priya Sharma",
    age: 34,
    gender: "Female",
    bloodType: "O+",
    chiefComplaint: "Severe headache, photophobia, neck stiffness, fever for 18 hours",
    symptoms: ["severe headache", "photophobia", "neck stiffness", "fever", "vomiting"],
    vitals: { bp: "130/80", hr: 118, temp: 39.4, rr: 20, spo2: 98 },
    labs: { wbc: 18.5, crp: 145, procalcitonin: 3.2, csf_wbc: 850, csf_glucose: 28 },
    currentMedications: ["oral contraceptive"],
    allergies: [],
    history: ["migraines"],
    smokingStatus: "never",
    familyHistory: [],
  },
  {
    id: "P003",
    name: "Arjun Mehta",
    age: 72,
    gender: "Male",
    bloodType: "A-",
    chiefComplaint: "Gradually worsening confusion, urinary incontinence, gait instability for 3 weeks",
    symptoms: ["confusion", "urinary incontinence", "gait instability", "memory loss", "falls"],
    vitals: { bp: "142/88", hr: 76, temp: 36.8, rr: 16, spo2: 97 },
    labs: { tsh: 0.3, b12: 180, folate: 4.2, sodium: 128, creatinine: 1.4 },
    currentMedications: ["amlodipine", "omeprazole", "aspirin", "furosemide"],
    allergies: ["sulfonamides"],
    history: ["hypertension", "chronic kidney disease stage 3", "BPH"],
    smokingStatus: "never",
    familyHistory: ["mother: Alzheimer's"],
  },
  {
    id: "P004",
    name: "Fatima Al-Hassan",
    age: 26,
    gender: "Female",
    bloodType: "AB+",
    chiefComplaint: "Palpitations, weight loss 8kg over 3 months, heat intolerance, tremor",
    symptoms: ["palpitations", "weight loss", "heat intolerance", "tremor", "anxiety", "diarrhea"],
    vitals: { bp: "128/72", hr: 128, temp: 37.8, rr: 18, spo2: 99 },
    labs: { tsh: 0.01, ft4: 3.8, ft3: 9.2, trab: 14.5, wbc: 6.2 },
    currentMedications: [],
    allergies: ["iodine contrast"],
    history: [],
    smokingStatus: "never",
    familyHistory: ["sister: Hashimoto's thyroiditis"],
  },
  {
    id: "P005",
    name: "Samuel Okonkwo",
    age: 45,
    gender: "Male",
    bloodType: "O-",
    chiefComplaint: "Jaundice, dark urine, right upper quadrant pain, fever for 5 days",
    symptoms: ["jaundice", "dark urine", "RUQ pain", "fever", "pruritus", "anorexia"],
    vitals: { bp: "118/76", hr: 95, temp: 38.6, rr: 19, spo2: 98 },
    labs: { bilirubin_total: 8.4, alt: 285, ast: 310, alp: 420, ggt: 380, lipase: 45 },
    currentMedications: ["ibuprofen (self-prescribed, 2 weeks)"],
    allergies: [],
    history: ["gallstones (known, untreated)"],
    smokingStatus: "social",
    familyHistory: [],
  },
];

export function getPatient(id: string): Patient | undefined {
  return MOCK_PATIENTS.find((p) => p.id === id);
}
