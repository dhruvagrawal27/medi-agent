import { resolvers } from "./resolvers.js";

/**
 * In-process GraphQL client for agents. Avoids HTTP round-trip but mirrors the
 * same call surface as graphql-request.
 */
export const gqlClient = {
  patient(id: string) {
    return resolvers.Query.patient(null, { id });
  },
  patients() {
    return resolvers.Query.patients();
  },
  drug(name: string) {
    return resolvers.Query.drug(null, { name });
  },
  drugInteractions(medications: string[]) {
    return resolvers.Query.drugInteractions(null, { medications });
  },
  icdCode(code: string) {
    return resolvers.Query.icdCode(null, { code });
  },
  searchICDBySymptoms(symptoms: string[]) {
    return resolvers.Query.searchICDBySymptoms(null, { symptoms });
  },
  guidelines(condition: string) {
    return resolvers.Query.guidelines(null, { condition });
  },
  checkContraindications(medications: string[], allergies: string[]) {
    return resolvers.Query.checkContraindications(null, { medications, allergies });
  },
};
