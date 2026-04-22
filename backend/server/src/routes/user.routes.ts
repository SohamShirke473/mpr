import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/me/stats", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        battlesWon: true,
        totalBattles: true,
        battlesLost: true,
        totalPoints: true,
        avgScore: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const winRate = user.totalBattles > 0
      ? Math.round((user.battlesWon / user.totalBattles) * 100)
      : 0;

    res.json({
      battlesWon: user.battlesWon,
      totalBattles: user.totalBattles,
      winRate,
      avgScore: user.avgScore,
      totalPoints: user.totalPoints,
    });
  } catch (error) {
    console.error("getUserStats error:", error);
    res.status(500).json({ error: "Failed to get user stats" });
  }
});

router.get("/me/recent-battles", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const battles = await prisma.battle.findMany({
      where: {
        status: "COMPLETED",
        OR: [{ player1Id: userId }, { player2Id: userId }],
      },
      include: {
        player1: { select: { id: true, username: true } },
        player2: { select: { id: true, username: true } },
        winner: { select: { id: true } },
        questionEasy: { select: { difficulty: true } },
        questionMedium: { select: { difficulty: true } },
        questionHard: { select: { difficulty: true } },
      },
      orderBy: { endedAt: "desc" },
      take: 5,
    });

    const recentBattles = battles.map((battle) => {
      const isPlayer1 = battle.player1Id === userId;
      const opponent = isPlayer1 ? battle.player2 : battle.player1;
      const myScore = isPlayer1 ? battle.player1Score : battle.player2Score;
      const theirScore = isPlayer1 ? battle.player2Score : battle.player1Score;
      const won = battle.winnerId === userId;

      let difficulty = "Easy";
      if (battle.questionHard) difficulty = "Hard";
      else if (battle.questionMedium) difficulty = "Medium";

      const duration = battle.startedAt && battle.endedAt
        ? Math.round((battle.endedAt.getTime() - battle.startedAt.getTime()) / 60000) + "m"
        : "0m";

      return {
        id: battle.id,
        opponent: opponent?.username || "Unknown",
        result: won ? "win" : "loss",
        myScore,
        theirScore,
        duration,
        difficulty,
        timestamp: battle.endedAt,
      };
    });

    res.json(recentBattles);
  } catch (error) {
    console.error("getRecentBattles error:", error);
    res.status(500).json({ error: "Failed to get recent battles" });
  }
});

export default router;