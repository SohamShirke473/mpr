import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma.js";
import { battleCancelQueue } from "../lib/bullmq.js";
import { broadcast } from "./socket.controller.js";
import type { AuthRequest } from "../middleware/auth.js";

const CODE_RUNNER_URL = process.env.CODE_RUNNER_URL || "http://localhost:8080";

function outputsMatch(actual: string, expected: string): boolean {
  return actual.trim() === expected.trim();
}

export async function createBattle(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const roomCode = nanoid(6).toUpperCase();

    const battle = await prisma.battle.create({
      data: {
        roomCode,
        player1Id: userId,
        status: "PENDING",
        player1Connected: false,
        player2Connected: false,
      },
    });

    await battleCancelQueue.add(
      "cancel",
      { battleId: battle.id, reason: "p1_no_show" },
      { delay: 5 * 60 * 1000, jobId: `cancel-p1-${battle.id}` }
    );

    res.status(201).json({ battleId: battle.id, roomCode });
  } catch (err) {
    console.error("createBattle error:", err);
    res.status(500).json({ error: "Failed to create battle" });
  }
}

export async function joinBattle(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { roomCode } = req.body as { roomCode: string };
  if (!roomCode) {
    res.status(400).json({ error: "roomCode is required" });
    return;
  }

  try {
    const battle = await prisma.battle.findUnique({
      where: { roomCode },
    });

    if (!battle) {
      res.status(404).json({ error: "Battle not found" });
      return;
    }

    if (battle.status !== "PENDING") {
      res.status(400).json({ error: "Battle is not in PENDING status" });
      return;
    }

    if (battle.player2Id !== null) {
      res.status(409).json({ error: "Battle already has a second player" });
      return;
    }

    if (battle.player1Id === userId) {
      res.status(400).json({ error: "Cannot join your own battle" });
      return;
    }

    await battleCancelQueue.remove(`cancel-p1-${battle.id}`);

    const updated = await prisma.battle.update({
      where: { id: battle.id },
      data: { player2Id: userId, status: "READY" },
    });

    await battleCancelQueue.add(
      "cancel",
      { battleId: battle.id, reason: "p2_no_ws" },
      { delay: 2 * 60 * 1000, jobId: `cancel-p2-${battle.id}` }
    );

    res.json({ battleId: updated.id });
  } catch (err) {
    console.error("joinBattle error:", err);
    res.status(500).json({ error: "Failed to join battle" });
  }
}

export async function runCode(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { battleId, questionId } = req.params as {
    battleId: string;
    questionId: string;
  };

  try {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      res.status(404).json({ error: "Battle not found" });
      return;
    }

    if (battle.status !== "ONGOING") {
      res.status(410).json({ error: "Battle is not ongoing" });
      return;
    }

    const isPlayer =
      battle.player1Id === userId || battle.player2Id === userId;
    if (!isPlayer) {
      res.status(403).json({ error: "You are not part of this battle" });
      return;
    }

    const validQuestionIds = [
      battle.questionEasyId,
      battle.questionMediumId,
      battle.questionHardId,
    ].filter(Boolean);
    if (!validQuestionIds.includes(questionId)) {
      res.status(400).json({ error: "Invalid question ID for this battle" });
      return;
    }

    const sampleCases = await prisma.testCase.findMany({
      where: { questionId, isSample: true },
      orderBy: { testCaseNumber: "asc" },
    });

    const runnerResponse = await fetch(`${CODE_RUNNER_URL}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissions: sampleCases.map((tc) => ({
          code: req.body.code,
          stdin: tc.input,
          timeLimit: (tc.timeLimitMs || 2000) / 1000,
          memoryLimit: tc.memoryLimitMb || 128,
        })),
      }),
    });

    const runnerData = await runnerResponse.json();
    const runnerResults = runnerData.results || [];

    const results = runnerResults.map((r: any, i: number) => ({
      passed: r.status === "OK" && outputsMatch(r.stdout, sampleCases[i]!.expectedOutput),
      input: sampleCases[i]!.input,
      expectedOutput: sampleCases[i]!.expectedOutput,
      actualOutput: r.stdout,
      executionTimeMs: r.execTime,
      memoryUsedMb: 0,
    }));

    res.status(runnerResponse.status).json({ results });
  } catch (err) {
    console.error("runCode error:", err);
    res.status(500).json({ error: "Failed to run code" });
  }
}

export async function submitCode(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { battleId, questionId } = req.params as {
    battleId: string;
    questionId: string;
  };

  try {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      res.status(404).json({ error: "Battle not found" });
      return;
    }

    if (battle.status !== "ONGOING") {
      res.status(410).json({ error: "Battle is not ongoing" });
      return;
    }

    if (battle.endsAt && battle.endsAt <= new Date()) {
      res.status(410).json({ error: "Battle time has expired" });
      return;
    }

    const isPlayer =
      battle.player1Id === userId || battle.player2Id === userId;
    if (!isPlayer) {
      res.status(403).json({ error: "You are not part of this battle" });
      return;
    }

    const validQuestionIds = [
      battle.questionEasyId,
      battle.questionMediumId,
      battle.questionHardId,
    ].filter(Boolean);
    if (!validQuestionIds.includes(questionId)) {
      res.status(400).json({ error: "Invalid question ID for this battle" });
      return;
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const multiplier: Record<string, number> = {
      EASY: 1,
      MEDIUM: 2,
      HARD: 3,
    };
    const mult = multiplier[question.difficulty] ?? 1;

    const allTestCases = await prisma.testCase.findMany({
      where: { questionId },
      orderBy: [{ isSample: "desc" }, { testCaseNumber: "asc" }],
    });

    const runnerResponse = await fetch(`${CODE_RUNNER_URL}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissions: allTestCases.map((tc) => ({
          code: req.body.code,
          stdin: tc.input,
          timeLimit: (tc.timeLimitMs || 2000) / 1000,
          memoryLimit: tc.memoryLimitMb || 128,
        })),
      }),
    });

    const runnerData = await runnerResponse.json();
    const runnerResults = runnerData.results || [];

    const results = runnerResults.map((r: any, i: number) => ({
      passed: r.status === "OK" && outputsMatch(r.stdout, allTestCases[i]!.expectedOutput),
      input: allTestCases[i]!.input,
      expectedOutput: allTestCases[i]!.expectedOutput,
      actualOutput: r.stdout,
      executionTimeMs: r.execTime,
      memoryUsedMb: 0,
    }));

    const passed = results.filter((r: any) => r.passed).length;
    const points = passed * 10 * mult;

    const previousBest = await prisma.submission.findFirst({
      where: { userId, battleId, questionId },
      orderBy: { pointsEarned: "desc" },
    });
    const previousMax = previousBest?.pointsEarned ?? 0;

    let scoreIncrease = 0;
    if (points > previousMax) {
      scoreIncrease = points - previousMax;
    }

    await prisma.submission.create({
      data: {
        userId,
        battleId,
        questionId,
        code: req.body.code,
        language: req.body.language,
        testCasesPassed: passed,
        pointsEarned: points,
        multiplierApplied: mult,
        executionTimeMs: runnerData.maxExecutionTimeMs ?? 0,
        memoryUsedMb: runnerData.maxMemoryUsedMb ?? 0,
      },
    });

    const isP1 = battle.player1Id === userId;
    const currentTime = new Date();

    const updateData: any = isP1
      ? { player1Score: { increment: scoreIncrease } }
      : { player2Score: { increment: scoreIncrease } };

    if (battle.questionEasyId === questionId) {
      if (isP1) {
        updateData.player1EasyLastSubmissionTime = currentTime;
      } else {
        updateData.player2EasyLastSubmissionTime = currentTime;
      }
    } else if (battle.questionMediumId === questionId) {
      if (isP1) {
        updateData.player1MediumLastSubmissionTime = currentTime;
      } else {
        updateData.player2MediumLastSubmissionTime = currentTime;
      }
    } else if (battle.questionHardId === questionId) {
      if (isP1) {
        updateData.player1HardLastSubmissionTime = currentTime;
      } else {
        updateData.player2HardLastSubmissionTime = currentTime;
      }
    }

    if (scoreIncrease > 0) {
      await prisma.battle.update({
        where: { id: battleId },
        data: updateData,
      });
    }

    const updated = await prisma.battle.findUnique({
      where: { id: battleId },
      select: { player1Score: true, player2Score: true },
    });

    if (updated) {
      broadcast(battleId, {
        event: "score:update",
        payload: {
          player1Score: updated.player1Score,
          player2Score: updated.player2Score,
        },
      });
    }

    res.json({ passed, total: allTestCases.length, points, previousMax, multiplier: mult, improved: scoreIncrease > 0 });
  } catch (err) {
    console.error("submitCode error:", err);
    res.status(500).json({ error: "Failed to submit code" });
  }
}

export async function getBattleStatus(req: AuthRequest, res: Response): Promise<void> {
  const { battleId } = req.params as { battleId: string };

  try {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      select: {
        id: true,
        roomCode: true,
        status: true,
        player1Id: true,
        player2Id: true,
        player1Connected: true,
        player2Connected: true,
        startedAt: true,
        endedAt: true,
        questionEasyId: true,
        questionMediumId: true,
        questionHardId: true,
      },
    });

    if (!battle) {
      res.status(404).json({ error: "Battle not found" });
      return;
    }

    res.json({
      battleId: battle.id,
      roomCode: battle.roomCode,
      status: battle.status,
      player1Connected: battle.player1Connected,
      player2Connected: battle.player2Connected,
      startedAt: battle.startedAt,
      endedAt: battle.endedAt,
    });
  } catch (err) {
    console.error("getBattleStatus error:", err);
    res.status(500).json({ error: "Failed to get battle status" });
  }
}

export async function getResults(req: AuthRequest, res: Response): Promise<void> {
  const { battleId } = req.params as { battleId: string };

  try {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      select: {
        id: true,
        status: true,
        startedAt: true,
        endedAt: true,
        player1Score: true,
        player2Score: true,
        player1AiBonus: true,
        player2AiBonus: true,
        player1EasyLastSubmissionTime: true,
        player1MediumLastSubmissionTime: true,
        player1HardLastSubmissionTime: true,
        player2EasyLastSubmissionTime: true,
        player2MediumLastSubmissionTime: true,
        player2HardLastSubmissionTime: true,
        aiReview: true,
        winner: { select: { id: true, username: true } },
        player1: { select: { id: true, username: true } },
        player2: { select: { id: true, username: true } },
        questionEasy: { select: { id: true, title: true, difficulty: true, description: true, inputFormat: true, outputFormat: true, constraints: true } },
        questionMedium: { select: { id: true, title: true, difficulty: true, description: true, inputFormat: true, outputFormat: true, constraints: true } },
        questionHard: { select: { id: true, title: true, difficulty: true, description: true, inputFormat: true, outputFormat: true, constraints: true } },
        submissions: {
          select: {
            id: true,
            userId: true,
            questionId: true,
            code: true,
            language: true,
            testCasesPassed: true,
            pointsEarned: true,
            submittedAt: true,
            question: { select: { id: true, title: true, difficulty: true } },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!battle) {
      res.status(404).json({ error: "Battle not found" });
      return;
    }

    if (battle.status !== "COMPLETED") {
      res.json({
        battleId: battle.id,
        status: battle.status,
        message: "Preparing results...",
      });
      return;
    }

    let parsedAiReview = null;
    try {
      if (battle.aiReview) {
        parsedAiReview = JSON.parse(battle.aiReview);
      }
    } catch (e) {
      console.error("Failed to parse aiReview:", e);
    }

    res.json({
      battleId: battle.id,
      status: battle.status,
      startedAt: battle.startedAt,
      endedAt: battle.endedAt,
      aiReview: parsedAiReview,
      winner: battle.winner
        ? { id: battle.winner.id, username: battle.winner.username }
        : null,
      players: {
        player1: {
          id: battle.player1.id,
          username: battle.player1.username,
          baseScore: battle.player1Score,
          aiBonus: battle.player1AiBonus,
          total: battle.player1Score + battle.player1AiBonus,
          player1EasyLastSubmissionTime: battle.player1EasyLastSubmissionTime,
          player1MediumLastSubmissionTime: battle.player1MediumLastSubmissionTime,
          player1HardLastSubmissionTime: battle.player1HardLastSubmissionTime,
        },
        player2: battle.player2
          ? {
              id: battle.player2.id,
              username: battle.player2.username,
              baseScore: battle.player2Score,
              aiBonus: battle.player2AiBonus,
              total: battle.player2Score + battle.player2AiBonus,
              player2EasyLastSubmissionTime: battle.player2EasyLastSubmissionTime,
              player2MediumLastSubmissionTime: battle.player2MediumLastSubmissionTime,
              player2HardLastSubmissionTime: battle.player2HardLastSubmissionTime,
            }
          : null,
      },
      questions: {
        easy: battle.questionEasy,
        medium: battle.questionMedium,
        hard: battle.questionHard,
      },
      submissions: battle.submissions,
    });
  } catch (err) {
    console.error("getResults error:", err);
    res.status(500).json({ error: "Failed to get results" });
  }
}

export async function reportViolation(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { battleId } = req.params as { battleId: string };
  const { reason } = req.body as { reason?: string };

  try {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      res.status(404).json({ error: "Battle not found" });
      return;
    }

    if (battle.status !== "ONGOING") {
      res.status(400).json({ error: "Battle is not ongoing" });
      return;
    }

    const isPlayer1 = battle.player1Id === userId;
    const isPlayer2 = battle.player2Id === userId;

    if (!isPlayer1 && !isPlayer2) {
      res.status(403).json({ error: "You are not part of this battle" });
      return;
    }

    const isDisqualified = battle.disqualifiedPlayerId !== null;
    if (isDisqualified) {
      res.status(400).json({ error: "Battle already decided" });
      return;
    }

    const updateData = isPlayer1
      ? { player1Violations: { increment: 1 } }
      : { player2Violations: { increment: 1 } };

    const updated = await prisma.battle.update({
      where: { id: battleId },
      data: updateData,
      select: {
        player1Violations: true,
        player2Violations: true,
      },
    });

    const currentViolations = isPlayer1 ? updated.player1Violations : updated.player2Violations;

    broadcast(battleId, {
      event: "violation:update",
      payload: {
        player1Violations: updated.player1Violations,
        player2Violations: updated.player2Violations,
        reportedBy: isPlayer1 ? "player1" : "player2",
        reason: reason || "Unknown violation",
      },
    });

    res.json({
      violations: currentViolations,
      maxViolations: 3,
      disqualified: currentViolations >= 3,
    });
  } catch (err) {
    console.error("reportViolation error:", err);
    res.status(500).json({ error: "Failed to report violation" });
  }
}

export async function disqualifyPlayer(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { battleId } = req.params as { battleId: string };

  try {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      res.status(404).json({ error: "Battle not found" });
      return;
    }

    if (battle.status !== "ONGOING") {
      res.status(400).json({ error: "Battle is not ongoing" });
      return;
    }

    const isPlayer1 = battle.player1Id === userId;
    const isPlayer2 = battle.player2Id === userId;

    if (!isPlayer1 && !isPlayer2) {
      res.status(403).json({ error: "You are not part of this battle" });
      return;
    }

    const disqualifiedId = userId;
    const winnerId = isPlayer1 ? battle.player2Id : battle.player1Id;

    if (!winnerId) {
      res.status(400).json({ error: "No opponent to win" });
      return;
    }

    await prisma.battle.update({
      where: { id: battleId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        winnerId: winnerId,
        disqualifiedPlayerId: disqualifiedId,
        player1AiBonus: isPlayer1 ? 0 : battle.player1AiBonus,
        player2AiBonus: isPlayer2 ? 0 : battle.player2AiBonus,
        aiReview: JSON.stringify({ message: "Disqualified for violations", disqualifiedPlayerId: disqualifiedId }),
      },
    });

    const winner = await prisma.user.findUnique({ where: { id: winnerId } });
    const loser = await prisma.user.findUnique({ where: { id: disqualifiedId } });

    if (winner) {
      await prisma.user.update({
        where: { id: winnerId },
        data: {
          totalBattles: { increment: 1 },
          totalPoints: { increment: winner.totalPoints },
          battlesWon: { increment: 1 },
        },
      });
    }

    if (loser) {
      await prisma.user.update({
        where: { id: loser.id },
        data: {
          totalBattles: { increment: 1 },
          battlesLost: { increment: 1 },
        },
      });
    }

    broadcast(battleId, {
      event: "battle:end",
      payload: { cancelled: false, disqualified: true, winnerId },
    });

    res.json({
      success: true,
      winnerId,
      disqualifiedPlayerId: disqualifiedId,
    });
  } catch (err) {
    console.error("disqualifyPlayer error:", err);
    res.status(500).json({ error: "Failed to disqualify player" });
  }
}
