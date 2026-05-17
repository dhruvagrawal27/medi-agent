export const typeDefs = /* GraphQL */ `
  scalar JSON

  type Patient {
    id: ID!
    name: String!
    age: Int!
    gender: String!
    bloodType: String!
    chiefComplaint: String!
    symptoms: [String!]!
    vitals: Vitals!
    labs: JSON
    currentMedications: [String!]!
    allergies: [String!]!
    history: [String!]!
    smokingStatus: String!
    familyHistory: [String!]!
  }

  type Vitals {
    bp: String!
    hr: Int!
    temp: Float!
    rr: Int!
    spo2: Int!
  }

  type Drug {
    name: String!
    genericName: String!
    class: String!
    indications: [String!]!
    contraindications: [String!]!
    interactions: [DrugInteraction!]!
    sideEffects: [String!]!
    renalDosing: Boolean!
    hepaticDosing: Boolean!
  }

  type DrugInteraction {
    drug: String!
    severity: String!
    effect: String!
  }

  type ICDCode {
    code: String!
    description: String!
    category: String!
    commonSymptoms: [String!]!
    urgencyLevel: String!
  }

  type ClinicalGuideline {
    id: ID!
    title: String!
    organization: String!
    year: Int!
    condition: String!
    recommendations: [Recommendation!]!
    keywords: [String!]!
  }

  type Recommendation {
    level: String!
    text: String!
  }

  type Query {
    patient(id: ID!): Patient
    patients: [Patient!]!
    drug(name: String!): Drug
    drugInteractions(medications: [String!]!): [DrugInteraction!]!
    icdCode(code: String!): ICDCode
    searchICDBySymptoms(symptoms: [String!]!): [ICDCode!]!
    guidelines(condition: String!): [ClinicalGuideline!]!
    checkContraindications(medications: [String!]!, allergies: [String!]!): [String!]!
  }
`;
