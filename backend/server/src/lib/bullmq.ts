import { Queue } from "bullmq";
import { bullRedis } from "./redis.js";
import type { TryMatchJob, MatchResult } from "../types/matchmaking.js";
import type { BattleEndJob, BattleCancelJob } from "../types/battle.js";

export const tryMatchQueue = new Queue<TryMatchJob>("matchmaking-try", {
  connection: bullRedis,
});

export const matchedQueue = new Queue<MatchResult>("matchmaking-matched", {
  connection: bullRedis,
});

export const battleEndQueue = new Queue<BattleEndJob>("battle-end", {
  connection: bullRedis,
});

export const battleCancelQueue = new Queue<BattleCancelJob>(
  "battle-cancel",
  { connection: bullRedis }
);