import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const { period = "all", limit = "10" } = req.query as { period?: string; limit?: string };
  const userId = req.userId;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        totalPoints: true,
        battlesWon: true,
        totalBattles: true,
        avgScore: true,
      },
      orderBy: { totalPoints: "desc" },
      take: parseInt(limit) + 1,
    });

    const now = new Date();
    let filteredUsers = users;

    if (period === "month") {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      const monthBattles = await prisma.battle.findMany({
        where: {
          status: "COMPLETED",
          endedAt: { gte: monthAgo },
        },
        select: {
          player1Id: true,
          player2Id: true,
          player1Score: true,
          player2Score: true,
          winnerId: true,
        },
      });

      const userPoints: Record<string, number> = {};
      monthBattles.forEach((b) => {
        const p1Points = b.player1Score;
        const p2Points = b.player2Score;
        if (b.player1Id) userPoints[b.player1Id] = (userPoints[b.player1Id] || 0) + p1Points;
        if (b.player2Id) userPoints[b.player2Id] = (userPoints[b.player2Id] || 0) + p2Points;
      });

      filteredUsers = users
        .map((u) => ({ ...u, totalPoints: userPoints[u.id] || 0 }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, parseInt(limit));
    } else if (period === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      const weekBattles = await prisma.battle.findMany({
        where: {
          status: "COMPLETED",
          endedAt: { gte: weekAgo },
        },
        select: {
          player1Id: true,
          player2Id: true,
          player1Score: true,
          player2Score: true,
        },
      });

      const userPoints: Record<string, number> = {};
      weekBattles.forEach((b) => {
        const p1Points = b.player1Score;
        const p2Points = b.player2Score;
        if (b.player1Id) userPoints[b.player1Id] = (userPoints[b.player1Id] || 0) + p1Points;
        if (b.player2Id) userPoints[b.player2Id] = (userPoints[b.player2Id] || 0) + p2Points;
      });

      filteredUsers = users
        .map((u) => ({ ...u, totalPoints: userPoints[u.id] || 0 }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, parseInt(limit));
    }

    const leaderboard = filteredUsers.map((u, index) => ({
      rank: index + 1,
      username: u.username,
      score: u.totalPoints,
      battlesWon: u.battlesWon,
      totalBattles: u.totalBattles,
      winRate: u.totalBattles > 0 ? Math.round((u.battlesWon / u.totalBattles) * 100) : 0,
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error("getLeaderboard error:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        totalPoints: true,
        battlesWon: true,
        totalBattles: true,
        avgScore: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const usersAbove = await prisma.user.count({
      where: { totalPoints: { gt: user.totalPoints } },
    });

    const rank = usersAbove + 1;

    res.json({
      rank,
      username: user.username,
      score: user.totalPoints,
      battlesWon: user.battlesWon,
      totalBattles: user.totalBattles,
      winRate: user.totalBattles > 0 ? Math.round((user.battlesWon / user.totalBattles) * 100) : 0,
    });
  } catch (error) {
    console.error("getMyRank error:", error);
    res.status(500).json({ error: "Failed to get my rank" });
  }
});

router.get("/stats", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const totalPlayers = await prisma.user.count();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const battlesThisWeek = await prisma.battle.count({
      where: {
        status: "COMPLETED",
        endedAt: { gte: weekAgo },
      },
    });

    res.json({
      totalPlayers,
      battlesThisWeek,
    });
  } catch (error) {
    console.error("getPlatformStats error:", error);
    res.status(500).json({ error: "Failed to get platform stats" });
  }
});

export default router;