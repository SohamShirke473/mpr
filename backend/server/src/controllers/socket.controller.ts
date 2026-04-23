import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { battleCancelQueue, battleEndQueue } from "../lib/bullmq.js";
import type { WsEvent, QuestionPayload } from "../types/battle.js";

const JWT_SECRET = process.env.JWT_SECRET!;

interface Player {
  userId: string;
  username: string;
  isReady: boolean;
  score: number;
}

interface Room {
  players: Record<string, Player>;
}

const rooms: Record<string, Room> = {};
export const battleSockets: Record<
  string,
  { p1: Socket | null; p2: Socket | null }
> = {};

const battleTransitioning: Record<string, { p1: boolean; p2: boolean }> = {};

function getOrCreateRoom(roomCode: string): Room {
  if (!rooms[roomCode]) rooms[roomCode] = { players: {} };
  return rooms[roomCode];
}

function getRoomPlayers(roomCode: string): Player[] {
  return Object.values(rooms[roomCode]?.players ?? {});
}

export function broadcast(battleId: string, event: WsEvent) {
  console.log(`[broadcast] battleId=${battleId}, event=${event.event}, sockets=`, battleSockets[battleId]);
  const sockets = battleSockets[battleId];
  if (!sockets) {
    console.log(`[broadcast] No sockets found for battle ${battleId}`);
    return;
  }
  if (sockets.p1?.connected) {
    console.log(`[broadcast] Sending to p1: ${sockets.p1.id}, event: ${event.event}`);
    sockets.p1.emit(event.event, event.payload);
  }
  if (sockets.p2?.connected) {
    console.log(`[broadcast] Sending to p2: ${sockets.p2.id}, event: ${event.event}`);
    sockets.p2.emit(event.event, event.payload);
  }
}

async function startBattle(battleId: string) {
  try {
    const easyCount = await prisma.question.count({
      where: { difficulty: "EASY" },
    });
    const mediumCount = await prisma.question.count({
      where: { difficulty: "MEDIUM" },
    });
    const hardCount = await prisma.question.count({
      where: { difficulty: "HARD" },
    });

    const skip = (count: number) =>
      count > 0 ? Math.floor(Math.random() * count) : 0;

    const [easy, medium, hard] = await Promise.all([
      prisma.question.findFirst({
        where: { difficulty: "EASY" },
        skip: skip(easyCount),
        include: {
          testcases: { where: { isSample: true }, orderBy: { testCaseNumber: "asc" } },
        },
      }),
      prisma.question.findFirst({
        where: { difficulty: "MEDIUM" },
        skip: skip(mediumCount),
        include: {
          testcases: { where: { isSample: true }, orderBy: { testCaseNumber: "asc" } },
        },
      }),
      prisma.question.findFirst({
        where: { difficulty: "HARD" },
        skip: skip(hardCount),
        include: {
          testcases: { where: { isSample: true }, orderBy: { testCaseNumber: "asc" } },
        },
      }),
    ]);

    if (!easy || !medium || !hard) {
      console.error("Not enough questions to start battle");
      return;
    }

    const endsAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes for testing

    await prisma.battle.update({
      where: { id: battleId },
      data: {
        questionEasyId: easy.id,
        questionMediumId: medium.id,
        questionHardId: hard.id,
        status: "ONGOING",
        startedAt: new Date(),
        endsAt,
      },
    });

    await battleEndQueue.add(
      "end",
      { battleId },
      { delay: 5 * 60 * 1000, jobId: `end-${battleId}` }
    );

    const makePayload = (
      q: typeof easy
    ): QuestionPayload => ({
      id: q!.id,
      title: q!.title,
      description: q!.description,
      difficulty: q!.difficulty,
      inputFormat: q!.inputFormat,
      outputFormat: q!.outputFormat,
      constraints: q!.constraints,
      tags: q!.tags,
      sampleCases: q!.testcases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        testCaseNumber: tc.testCaseNumber,
      })),
    });

    console.log(`[startBattle] Broadcasting battle:start for ${battleId}`);
    battleTransitioning[battleId] = { p1: true, p2: true };
    broadcast(battleId, {
      event: "battle:start",
      payload: {
        endsAt: endsAt.toISOString(),
        questions: {
          easy: makePayload(easy),
          medium: makePayload(medium),
          hard: makePayload(hard),
        },
      },
    });
  } catch (err) {
    console.error("startBattle error:", err);
  }
}

export function setupSocketHandlers(io: Server): void {
  io.use((socket, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = jwt.verify(token as string, JWT_SECRET) as {
        userId: string;
        username: string;
      };
      socket.data.userId = decoded.userId;
      socket.data.username = decoded.username;
      next();
    } catch {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(
      "[socket] Socket connected:",
      socket.id,
      "user:",
      socket.data.username,
      "userId:",
      socket.data.userId
    );

    socket.on(
      "waiting_room_join",
      ({ roomCode, username }: { roomCode: string; username?: string }) => {
        const { userId, username: socketUsername } = socket.data;
        const playerUsername = username || socketUsername || "Unknown";
        const room = getOrCreateRoom(roomCode);
        socket.join(roomCode);
        socket.data.roomCode = roomCode;

        room.players[socket.id] = {
          userId,
          username: playerUsername,
          isReady: false,
          score: 0,
        };

        const others = getRoomPlayers(roomCode).filter(
          (p) => p.userId !== userId
        );
        console.log(
          `[waiting] ${playerUsername} (${userId}) joined ${roomCode}, socketId=${socket.id}, others: ${others.length}`
        );
        console.log(`[waiting] Room ${roomCode} players:`, Object.keys(room.players));

        if (others.length > 0) {
          socket.emit("opponent_joined", { player: others[0] });
          if (others[0].isReady) {
            socket.emit("opponent_ready", { 
              userId: others[0].userId, 
              username: others[0].username, 
              isReady: true 
            });
          }
        }
        socket.to(roomCode).emit("opponent_joined", {
          player: room.players[socket.id],
        });
      }
    );

    socket.on(
      "player_ready",
      ({
        roomCode,
        isReady,
      }: {
        roomCode: string;
        isReady: boolean;
      }) => {
        const { userId, username } = socket.data;
        const room = rooms[roomCode];
        if (!room) return;
        
        const playerCount = Object.keys(room.players).length;
        if (playerCount < 2) {
          socket.emit("error", { code: 4005, message: "Wait for opponent to join first" });
          return;
        }
        
        const player = room.players[socket.id];
        if (player) player.isReady = isReady;
        console.log(`[ready] ${username} (${userId}) isReady=${isReady} in ${roomCode}`);
        socket.to(roomCode).emit("opponent_ready", { userId, username, isReady });
      }
    );

    socket.on("join_room", ({ roomCode }: { roomCode: string }) => {
      const { userId, username } = socket.data;
      const room = getOrCreateRoom(roomCode);
      socket.join(roomCode);
      socket.data.roomCode = roomCode;

      const existingPlayer = room.players[socket.id];
      room.players[socket.id] = {
        userId,
        username,
        isReady: existingPlayer?.isReady ?? false,
        score: existingPlayer?.score ?? 0,
      };

      console.log(`[battle] ${userId} joined room ${roomCode}`);

      const others = getRoomPlayers(roomCode).filter(
        (p) => p.userId !== userId
      );
      if (others.length > 0 && others[0]) {
        socket.emit("sync_opponent_score", { score: others[0].score });
      }
    });

    socket.on(
      "battle:join",
      async ({ battleId }: { battleId: string }) => {
        const { userId } = socket.data;

        try {
          const battle = await prisma.battle.findUnique({
            where: { id: battleId },
          });

          if (!battle) {
            socket.emit("error", { code: 4004, message: "Battle not found" });
            return;
          }

          if (!["READY", "ONGOING"].includes(battle.status)) {
            socket.emit("error", {
              code: 4003,
              message: "Battle not ready",
            });
            return;
          }

          const slot =
            userId === battle.player1Id
              ? "p1"
              : userId === battle.player2Id
                ? "p2"
                : null;

          console.log(`[battle:join] userId=${userId}, player1Id=${battle.player1Id}, player2Id=${battle.player2Id}, slot=${slot}, status=${battle.status}, p1Conn=${battle.player1Connected}, p2Conn=${battle.player2Connected}`);

          if (!slot) {
            socket.emit("error", {
              code: 4003,
              message: "Not a player in this battle",
            });
            return;
          }

          const entry = battleSockets[battleId] ?? { p1: null, p2: null };
          entry[slot] = socket;
          battleSockets[battleId] = entry;
          socket.data.battleId = battleId;
          socket.data.slot = slot;
          socket.data.userId = userId;
          console.log(`[battle:join] Stored socket: battleId=${battleId}, slot=${slot}, socketId=${socket.id}`);

          if (battleTransitioning[battleId]) {
            battleTransitioning[battleId][slot === "p1" ? "p1" : "p2"] = false;
            console.log(`[battle:join] Cleared transitioning state for ${slot}`);
          }

          await prisma.battle.update({
            where: { id: battleId },
            data: {
              [slot === "p1"
                ? "player1Connected"
                : "player2Connected"]: true,
            },
          });

          socket.emit("player:role", { role: slot, userId });
          console.log(`[battle:join] Sent player:role to socket: ${slot}, userId: ${userId}`);

          if (slot === "p2") {
            await battleCancelQueue.remove(`cancel-p2-${battleId}`);
          }

          // If guest (player2) joins, notify host to also join
          if (slot === "p2") {
            const hostSocket = battleSockets[battleId]?.p1;
            if (hostSocket) {
              hostSocket.emit("guest_ready_to_battle");
            }
          }

          const updated = await prisma.battle.findUnique({
            where: { id: battleId },
          });

          console.log(`[battle:join] Checking: p1Conn=${updated?.player1Connected}, p2Conn=${updated?.player2Connected}, status=${updated?.status}, slot=${slot}`);

          // If battle is already ONGOING, send battle:start to this socket
          if (updated?.status === "ONGOING") {
            console.log(`[battle:join] Battle already ongoing, sending battle:start to socket`);
            const [easy, medium, hard] = await Promise.all([
              prisma.question.findUnique({ 
                where: { id: updated.questionEasyId! },
                include: { testcases: { where: { isSample: true }, orderBy: { testCaseNumber: "asc" } } }
              }),
              prisma.question.findUnique({ 
                where: { id: updated.questionMediumId! },
                include: { testcases: { where: { isSample: true }, orderBy: { testCaseNumber: "asc" } } }
              }),
              prisma.question.findUnique({ 
                where: { id: updated.questionHardId! },
                include: { testcases: { where: { isSample: true }, orderBy: { testCaseNumber: "asc" } } }
              }),
            ]);
            
            if (easy && medium && hard) {
              const makePayload = (q: typeof easy) => ({
                id: q!.id,
                title: q!.title,
                description: q!.description,
                difficulty: q!.difficulty,
                inputFormat: q!.inputFormat,
                outputFormat: q!.outputFormat,
                constraints: q!.constraints,
                tags: q!.tags,
                sampleCases: q!.testcases.map((tc: any) => ({
                  input: tc.input,
                  expectedOutput: tc.expectedOutput,
                  testCaseNumber: tc.testCaseNumber,
                })),
              });
              
              socket.emit("battle:start", {
                endsAt: updated.endsAt?.toISOString(),
                questions: { 
                  easy: makePayload(easy), 
                  medium: makePayload(medium), 
                  hard: makePayload(hard) 
                },
              });
            }
            return;
          }

          // Only start if both connected and host (player1) triggered it
          if (
            updated?.player1Connected &&
            updated?.player2Connected &&
            updated.status === "READY" &&
            slot === "p1"
          ) {
            console.log(`[battle:join] Starting battle ${battleId}`);
            await startBattle(battleId);
          } else {
            console.log(`[battle:join] Not starting: p1Conn=${updated?.player1Connected}, p2Conn=${updated?.player2Connected}, status=${updated?.status}, slot=${slot}`);
          }
        } catch (err) {
          console.error("battle:join error:", err);
          socket.emit("error", { code: 5000, message: "Internal error" });
        }
      }
    );

    socket.on(
      "score_update",
      ({ roomCode, score }: { roomCode: string; score: number }) => {
        const { userId } = socket.data;
        const room = rooms[roomCode];
        const player = room?.players[socket.id];
        if (player) player.score = score;
        console.log(`[score] ${userId} = ${score} in ${roomCode}`);
        socket.to(roomCode).emit("opponent_score", { userId, score });
      }
    );

    socket.on(
      "violation",
      async ({ battleId, reason }: { battleId: string; reason?: string }) => {
        const { userId } = socket.data;
        console.log(`[violation] userId=${userId}, battleId=${battleId}, reason=${reason}`);

        if (!battleId || !userId) {
          console.log("[violation] Missing battleId or userId");
          return;
        }

        try {
          const battle = await prisma.battle.findUnique({
            where: { id: battleId },
          });

          if (!battle || battle.status !== "ONGOING") {
            console.log("[violation] Battle not found or not ongoing");
            return;
          }

          const isPlayer1 = battle.player1Id === userId;
          const isPlayer2 = battle.player2Id === userId;

          if (!isPlayer1 && !isPlayer2) {
            console.log("[violation] User not part of battle");
            return;
          }

          if (battle.disqualifiedPlayerId) {
            console.log("[violation] Already disqualified");
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
              player1Id: true,
              player2Id: true,
            },
          });

          const currentViolations = isPlayer1
            ? updated.player1Violations
            : updated.player2Violations;

          console.log(`[violation] ${isPlayer1 ? "player1" : "player2"} violations: ${currentViolations}`);

          broadcast(battleId, {
            event: "violation:update",
            payload: {
              player1Violations: updated.player1Violations,
              player2Violations: updated.player2Violations,
              reportedBy: isPlayer1 ? "player1" : "player2",
              reason: reason || "Unknown violation",
            },
          });

          if (currentViolations >= 3) {
            console.log(`[violation] Player disqualified! userId=${userId}`);

            const disqualifiedId = userId;
            const winnerId = isPlayer1 ? updated.player2Id : updated.player1Id;

            if (winnerId) {
              await prisma.battle.update({
                where: { id: battleId },
                data: {
                  status: "COMPLETED",
                  endedAt: new Date(),
                  winnerId: winnerId,
                  disqualifiedPlayerId: disqualifiedId,
                  player1AiBonus: isPlayer1 ? 0 : battle.player1AiBonus,
                  player2AiBonus: isPlayer2 ? 0 : battle.player2AiBonus,
                  aiReview: JSON.stringify({
                    message: "Disqualified for violations",
                    disqualifiedPlayerId: disqualifiedId,
                    player1: { strengths: [], improvements: [] },
                    player2: { strengths: [], improvements: [] },
                    questions: []
                  }),
                },
              });

              const winner = await prisma.user.findUnique({ where: { id: winnerId } });
              const loser = await prisma.user.findUnique({ where: { id: disqualifiedId } });

              if (winner) {
                await prisma.user.update({
                  where: { id: winnerId },
                  data: {
                    totalBattles: { increment: 1 },
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

              delete battleSockets[battleId];
              console.log(`[violation] Battle ended. winnerId=${winnerId}, disqualifiedId=${disqualifiedId}`);
            }
          }
        } catch (err) {
          console.error("[violation] Error:", err);
        }
      }
    );

    socket.on("disconnect", async () => {
      const { roomCode, userId, battleId, slot } = socket.data;

      console.log(`[disconnect] userId=${userId}, slot=${slot}, battleId=${battleId}, roomCode=${roomCode}`);

      if (battleId && slot) {
        try {
          const battle = await prisma.battle.findUnique({ where: { id: battleId } });
          const isBattleActive = battle && battle.status === "ONGOING";
          
          console.log(`[disconnect] Battle status: ${battle?.status}, isBattleActive=${isBattleActive}`);

          if (!isBattleActive) {
            console.log(`[disconnect] Not in battle yet (status: ${battle?.status}), skipping disconnect handler`);
            if (roomCode && rooms[roomCode]) {
              delete rooms[roomCode].players[socket.id];
              socket.to(roomCode).emit("opponent_disconnected", { userId });
              if (Object.keys(rooms[roomCode].players).length === 0) {
                delete rooms[roomCode];
              }
            }
            return;
          }

          const isTransitioning = battleTransitioning[battleId]?.[slot === "p1" ? "p1" : "p2"];
          if (isTransitioning) {
            console.log(`[disconnect] Player ${slot} is transitioning (received battle:start but hasn't joined battle), skipping notification`);
            if (entry) {
              if (slot === "p1") entry.p1 = null;
              else entry.p2 = null;
            }
            return;
          }

          await prisma.battle.update({
            where: { id: battleId },
            data: {
              [slot === "p1"
                ? "player1Connected"
                : "player2Connected"]: false,
            },
          });

          const entry = battleSockets[battleId];
          if (entry) {
            if (slot === "p1") entry.p1 = null;
            else entry.p2 = null;
            if (!entry.p1 && !entry.p2) {
              delete battleSockets[battleId];
            }
          }

          console.log(
            `[disconnect] ${userId} (${slot}) left battle ${battleId}, waiting for potential reconnect...`
          );

          setTimeout(async () => {
            const currentEntry = battleSockets[battleId];
            const isP1StillConnected = currentEntry?.p1?.connected ?? false;
            const isP2StillConnected = currentEntry?.p2?.connected ?? false;

            console.log(`[disconnect] After wait: p1=${isP1StillConnected}, p2=${isP2StillConnected}, originalSlot=${slot}`);

            if (!isP1StillConnected && isP2StillConnected) {
              broadcast(battleId, {
                event: "battle:player_disconnected",
                payload: { player: "player1" },
              });
              console.log(`[disconnect] p1 confirmed disconnected, notifying p2`);
            } else if (!isP2StillConnected && isP1StillConnected) {
              broadcast(battleId, {
                event: "battle:player_disconnected",
                payload: { player: "player2" },
              });
              console.log(`[disconnect] p2 confirmed disconnected, notifying p1`);
            } else if (!isP1StillConnected && !isP2StillConnected) {
              broadcast(battleId, {
                event: "battle:end",
                payload: { cancelled: true },
              });
              console.log(`[disconnect] Both players disconnected, cancelling battle`);
            } else {
              console.log(`[disconnect] Player reconnected, no action needed`);
            }
          }, 2000);
        } catch (err) {
          console.error("disconnect battle error:", err);
        }
      }

      if (roomCode && rooms[roomCode]) {
        delete rooms[roomCode].players[socket.id];
        socket.to(roomCode).emit("opponent_disconnected", { userId });
        console.log(`[disconnect] ${userId} left ${roomCode}`);
        if (Object.keys(rooms[roomCode].players).length === 0) {
          delete rooms[roomCode];
          console.log(`[cleanup] Room ${roomCode} deleted`);
        }
      }
    });
  });
}
