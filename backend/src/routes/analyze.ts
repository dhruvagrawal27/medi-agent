import { Router } from "express";
import { orchestrator } from "../agents/orchestrator.js";

const router = Router();

router.post("/analyze", async (req, res) => {
  try {
    const { patientId, query } = req.body ?? {};
    if (!patientId) return res.status(400).json({ error: "patientId is required" });
    const analysis = await orchestrator.analyze(patientId, query);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "internal server error" });
  }
});

export default router;
