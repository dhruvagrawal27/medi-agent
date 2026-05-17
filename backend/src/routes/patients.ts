import { Router } from "express";
import { MOCK_PATIENTS, getPatient } from "../mock-data/patients.js";

const router = Router();

router.get("/patients", (_req, res) => {
  res.json(
    MOCK_PATIENTS.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      bloodType: p.bloodType,
      chiefComplaint: p.chiefComplaint,
    }))
  );
});

router.get("/patients/:id", (req, res) => {
  const p = getPatient(req.params.id);
  if (!p) return res.status(404).json({ error: "Patient not found" });
  res.json(p);
});

export default router;
