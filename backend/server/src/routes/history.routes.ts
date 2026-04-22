import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { filter } = req.query as { filter?: string };

  try {
    const whereClause: any = {
      status: "COMPLETED",
      OR: [{ player1Id: userId }, { player2Id: userId }],
    };

    if (filter === "win" || filter === "loss") {
      whereClause.AND = filter === "win"
        ? [{ winnerId: userId }]
        : [{ winnerId: { not: userId } }, { winnerId: { not: null } }];
    }

    const battles = await prisma.battle.findMany({
      where: whereClause,
      include: {
        player1: { select: { id: true, username: true } },
        player2: { select: { id: true, username: true } },
        winner: { select: { id: true } },
        questionEasy: { select: { difficulty: true } },
        questionMedium: { select: { difficulty: true } },
        questionHard: { select: { difficulty: true } },
      },
      orderBy: { endedAt: "desc" },
    });

    let filteredBattles = battles;

    if (["Easy", "Medium", "Hard"].includes(filter || "")) {
      filteredBattles = battles.filter((b) => {
        if (filter === "Easy" && b.questionEasy) return true;
        if (filter === "Medium" && b.questionMedium) return true;
        if (filter === "Hard" && b.questionHard) return true;
        return false;
      });
    }

    const formattedBattles = filteredBattles.map((battle) => {
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

    const totalBattles = formattedBattles.length;
    const wins = formattedBattles.filter((b) => b.result === "win").length;
    const losses = totalBattles - wins;
    const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;
    const avgScore = totalBattles > 0
      ? Math.round(formattedBattles.reduce((a, b) => a + b.myScore, 0) / totalBattles)
      : 0;

    res.json({
      battles: formattedBattles,
      stats: {
        totalBattles,
        wins,
        losses,
        winRate,
        avgScore,
      },
    });
  } catch (error) {
    console.error("getHistory error:", error);
    res.status(500).json({ error: "Failed to get battle history" });
  }
});

export default router;