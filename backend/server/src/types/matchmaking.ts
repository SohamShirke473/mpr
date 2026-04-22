export const RANKS = ["A", "B", "C", "D", "E"] as const;
export type Rank = (typeof RANKS)[number];

export interface TryMatchJob {
    rank: Rank;
    enqueuedAt: number;
}

export interface MatchResult {
    player1: string;
    player2: string;
    ranks: [Rank, Rank];
    roomId: string;
}