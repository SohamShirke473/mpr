import { Router } from "express";
import { reviewCode, chat } from "../controllers/ai.controller";

const router = Router();

router.post("/ai/review", reviewCode);
router.post("/ai/chat", chat);

export default router;