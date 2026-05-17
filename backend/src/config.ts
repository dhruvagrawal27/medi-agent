import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

export const GROQ_API_KEY = process.env.GROQ_API_KEY || "placeholder";
export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
export const PORT = parseInt(process.env.PORT || "3001", 10);

export const USE_MOCK_LLM =
  !GROQ_API_KEY || GROQ_API_KEY === "placeholder" || GROQ_API_KEY.trim() === "";

export const CONFIG = {
  groqApiKey: GROQ_API_KEY,
  groqModel: GROQ_MODEL,
  port: PORT,
  useMockLLM: USE_MOCK_LLM,
  maxRefinementIterations: 2,
  confidenceThreshold: 0.6,
};
