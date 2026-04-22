import { Worker } from "bullmq";
import { bullRedis } from "../lib/redis.js";
import { prisma } from "../lib/prisma.js";
import { battleEndQueue, battleCancelQueue } from "../lib/bullmq.js";
import { battleSockets, broadcast } from "../controllers/socket.controller.js";
import { evaluateBattle } from "../controllers/ai.controller.js";
import type { BattleEndJob, BattleCancelJob } from "../types/battle.js";

new Worker<BattleEndJob>(
  "battle-end",
  async (job) => {
    const { battleId } = job.data;

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        submissions: { include: { question: true } },
        player1: true,
        player2: true,
        questionEasy: true,
        questionMedium: true,
        questionHard: true,
      },
    });

    if (!battle || battle.status !== "ONGOING") return;

    const rawQuestions = [
      battle.questionEasy,
      battle.questionMedium,
      battle.questionHard,
    ];
    const questions = rawQuestions
      .filter((q): q is NonNullable<typeof q> => q !== null)
      .map((q) => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty,
        constraints: q.constraints,
      }));

    const p1Base = battle.player1Score;
    const p2Base = battle.player2Score;

    console.log(`[battle:end] p1Base=${p1Base}, p2Base=${p2Base}`);
    console.log(`[battle:end] p1Id=${battle.player1Id}, p2Id=${battle.player2Id}`);
    console.log(`[battle:end] player1=${battle.player1?.username}, player2=${battle.player2?.username ?? "none"}`);
    console.log(`[battle:end] submissions count=${battle.submissions.length}`);

    // Count submissions per player
    const p1SubCount = battle.submissions.filter(s => s.userId === battle.player1Id).length;
    const p2SubCount = battle.submissions.filter(s => s.userId === battle.player2Id).length;
    console.log(`[battle:end] p1 submissions=${p1SubCount}, p2 submissions=${p2SubCount}`);

    // Validate both players exist
    if (!battle.player2Id) {
      console.log("[battle:end] No player2, marking battle complete with 0 AI bonus");
      await prisma.battle.update({
        where: { id: battleId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
          winnerId: battle.player1Id, // Player 1 wins by default
          player1AiBonus: 0,
          player2AiBonus: 0,
          aiReview: JSON.stringify({ message: "No opponent" }),
        },
      });
      broadcast(battleId, { event: "battle:end", payload: { cancelled: false } });
      delete battleSockets[battleId];
      return;
    }

    // Call AI with proper player IDs
    const p1Id = battle.player1.id;
    const p2Id = battle.player2?.id;

    if (!p2Id) {
      console.error("[battle:end] player2 ID is null despite player2Id existing");
      return;
    }

    const aiResult = await evaluateBattle(
      battle.submissions,
      questions,
      p1Id,
      p2Id,
      "tie" // Will be recalculated after AI
    );

    // Validate AI bonus values
    const p1Bonus = Math.max(0, Math.min(50, aiResult?.player1?.totalBonus ?? 0));
    const p2Bonus = Math.max(0, Math.min(50, aiResult?.player2?.totalBonus ?? 0));

    console.log(`[battle:end] p1Bonus=${p1Bonus}, p2Bonus=${p2Bonus}`);

    // Re-fetch battle to get the latest base scores since submissions might have completed during AI evaluation
    const finalBattle = await prisma.battle.findUnique({
      where: { id: battleId },
      select: { player1Score: true, player2Score: true }
    });
    
    const finalP1Base = finalBattle?.player1Score ?? p1Base;
    const finalP2Base = finalBattle?.player2Score ?? p2Base;

    // Calculate TOTAL scores (base + AI bonus)
    const p1Total = finalP1Base + p1Bonus;
    const p2Total = finalP2Base + p2Bonus;

    console.log(`[battle:end] finalP1Base=${finalP1Base}, finalP2Base=${finalP2Base}`);
    console.log(`[battle:end] p1Total=${p1Total}, p2Total=${p2Total}`);

    // Determine winner based on TOTAL scores
    let winnerId: string | null = null;
    if (p1Total > p2Total) {
      winnerId = battle.player1Id;
    } else if (p2Total > p1Total) {
      winnerId = battle.player2Id;
    } else {
      winnerId = null; // Tie
    }

    const battleResult: "win" | "lose" | "tie" =
      winnerId === battle.player1Id ? "win" :
      winnerId === battle.player2Id ? "lose" : "tie";

    console.log(`[battle:end] winnerId=${winnerId}, battleResult=${battleResult}`);

    await prisma.battle.update({
      where: { id: battleId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        winnerId,
        player1AiBonus: p1Bonus,
        player2AiBonus: p2Bonus,
        aiReview: JSON.stringify({
          ...aiResult,
          _debug: {
            p1Base,
            p2Base,
            p1Bonus,
            p2Bonus,
            p1Total,
            p2Total,
            winnerId,
          }
        }),
      },
    });

    if (battle.player2Id) {
      await prisma.user.update({
        where: { id: battle.player1Id },
        data: {
          totalBattles: { increment: 1 },
          totalPoints: { increment: p1Total },
          ...(winnerId === battle.player1Id
            ? { battlesWon: { increment: 1 } }
            : winnerId === battle.player2Id
              ? { battlesLost: { increment: 1 } }
              : { battlesDraw: { increment: 1 } }),
        },
      });

      await prisma.user.update({
        where: { id: battle.player2Id },
        data: {
          totalBattles: { increment: 1 },
          totalPoints: { increment: p2Total },
          ...(winnerId === battle.player2Id
            ? { battlesWon: { increment: 1 } }
            : winnerId === battle.player1Id
              ? { battlesLost: { increment: 1 } }
              : { battlesDraw: { increment: 1 } }),
        },
      });
    }

    broadcast(battleId, { event: "battle:end", payload: { cancelled: false } });
    delete battleSockets[battleId];
  },
  { connection: bullRedis }
);

new Worker<BattleCancelJob>(
  "battle-cancel",
  async (job) => {
    const { battleId } = job.data;

    const battle = await prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle || !["PENDING", "READY"].includes(battle.status)) return;

    await prisma.battle.update({
      where: { id: battleId },
      data: { status: "CANCELLED" },
    });

    broadcast(battleId, { event: "battle:end", payload: { cancelled: true } });
    delete battleSockets[battleId];
  },
  { connection: bullRedis }
);
