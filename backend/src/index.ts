import express from "express";
import cors from "cors";
import { createYoga, createSchema } from "graphql-yoga";
import { CONFIG } from "./config.js";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import health from "./routes/health.js";
import patients from "./routes/patients.js";
import analyze from "./routes/analyze.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", health);
app.use("/api", patients);
app.use("/api", analyze);

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers: resolvers as any,
  }),
  graphqlEndpoint: "/graphql",
});
app.use("/graphql", yoga as any);

app.get("/", (_req, res) => {
  res.json({
    name: "ClinicalCopilot",
    version: "1.0.0",
    mockLLM: CONFIG.useMockLLM,
    endpoints: ["/api/health", "/api/patients", "/api/analyze", "/graphql"],
  });
});

export function startServer(port: number = CONFIG.port) {
  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[ClinicalCopilot] listening on http://localhost:${port}`);
    // eslint-disable-next-line no-console
    console.log(`[ClinicalCopilot] mockLLM=${CONFIG.useMockLLM} model=${CONFIG.groqModel}`);
  });
}

export { app };

const isMain =
  typeof process !== "undefined" &&
  process.argv?.[1] &&
  (process.argv[1].endsWith("index.ts") || process.argv[1].endsWith("index.js"));

if (isMain) {
  startServer();
}
