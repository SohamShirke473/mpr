import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const CODE_RUNNER_URL = process.env.CODE_RUNNER_URL || "http://localhost:8080";

router.post("/execute", authMiddleware, async (req, res) => {
  const response = await fetch(`${CODE_RUNNER_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.status(response.status).json(data);
});

router.post("/batch", authMiddleware, async (req, res) => {
  const response = await fetch(`${CODE_RUNNER_URL}/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.status(response.status).json(data);
});

router.get("/logs", authMiddleware, async (req, res) => {
  const limit = req.query.limit || 100;
  const response = await fetch(`${CODE_RUNNER_URL}/logs?limit=${limit}`);
  const data = await response.json();
  res.json(data);
});

export default router;