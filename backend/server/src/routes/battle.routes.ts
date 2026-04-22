import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createBattle,
  joinBattle,
  runCode,
  submitCode,
  getResults,
  getBattleStatus,
  disqualifyPlayer,
  reportViolation,
} from "../controllers/battle.controller.js";

const router = Router();

router.post("/create", authMiddleware, createBattle);
router.post("/join", authMiddleware, joinBattle);
router.get("/:battleId", authMiddleware, getBattleStatus);
router.post("/:battleId/questions/:questionId/run", authMiddleware, runCode);
router.post(
  "/:battleId/questions/:questionId/submit",
  authMiddleware,
  submitCode
);
router.get("/:battleId/results", authMiddleware, getResults);
router.post("/:battleId/report-violation", authMiddleware, reportViolation);
router.post("/:battleId/disqualify", authMiddleware, disqualifyPlayer);

export default router;
