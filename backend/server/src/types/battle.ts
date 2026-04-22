export type BattleEndJob = {
  battleId: string;
};

export type BattleCancelJob = {
  battleId: string;
  reason: "p1_no_show" | "p2_no_ws";
};

export type QuestionPayload = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  tags: string[];
  sampleCases: {
    input: string;
    expectedOutput: string;
    testCaseNumber: number;
  }[];
};

export type WsEvent =
  | { event: "battle:ready" }
  | {
      event: "battle:start";
      payload: {
        endsAt: string;
        questions: {
          easy: QuestionPayload;
          medium: QuestionPayload;
          hard: QuestionPayload;
        };
      };
    }
  | {
      event: "score:update";
      payload: { player1Score: number; player2Score: number };
    }
  | {
      event: "battle:player_disconnected";
      payload: { player: "player1" | "player2" };
    }
  | { event: "battle:end"; payload: { cancelled: boolean; disqualified?: boolean; winnerId?: string } }
  | {
      event: "violation:update";
      payload: {
        player1Violations: number;
        player2Violations: number;
        reportedBy: string;
        reason: string;
      };
    };
