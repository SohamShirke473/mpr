import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

export async function reviewCode(req: Request, res: Response): Promise<void> {
  const { code, language } = req.body;
  if (!code) {
    res.status(400).json({ error: "code is required" });
    return;
  }

  const lang = language || "python";
  const prompt = "You are an expert code reviewer. Analyze the following " + lang + " code and provide constructive feedback.\n" +
    "Focus on: time and space complexity, code readability, potential bugs, performance suggestions.\n" +
    "Code to review:\n```" + lang + "\n" + code + "\n```\n" +
    "Return ONLY valid JSON with: summary, timeComplexity, spaceComplexity, codeQuality, issues[], suggestions[]";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    res.json({ text: response.text });
  } catch (err) {
    console.error("AI review error:", err instanceof Error ? err.message : "Unknown error");
    res.status(500).json({ error: "AI review failed" });
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function chat(req: Request, res: Response): Promise<void> {
  const { messages, system } = req.body;
  if (!messages) {
    res.status(400).json({ error: "messages is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const contents = messages.map((m: Message) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      config: { systemInstruction: system },
      contents,
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("AI chat error:", err instanceof Error ? err.message : "Unknown error");
    res.write(`data: ${JSON.stringify({ chunk: "Sorry, AI is unavailable right now." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
}

interface BattleSubmission {
  userId: string;
  code: string;
  question: { title: string; difficulty: string; constraints: string };
}

interface BattleQuestion {
  id: string;
  title: string;
  difficulty: string;
  constraints: string;
}

interface QuestionAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: string;
  improvements: string[];
}

interface QuestionReviewData {
  title: string;
  difficulty: string;
  player1: QuestionAnalysis;
  player2: QuestionAnalysis;
  bonusReason: string;
}

interface PlayerReviewData {
  totalBonus: number;
  strengths: string[];
  improvements: string[];
}

interface EvaluateBattleResult {
  questions: QuestionReviewData[];
  player1: PlayerReviewData;
  player2: PlayerReviewData;
  motivational: string;
}

const WIN_QUOTES = [
  "Victory belongs to the most persistent.",
  "Code is poetry. Today you wrote a masterpiece.",
  "Every expert was once a beginner.",
  "Champions keep playing until they get it right.",
];

const TIE_QUOTES = [
  "Great minds think alike.",
  "A draw is just a pause before the win.",
  "You're neck and neck. Next battle decides!",
];

const LOSE_QUOTES = [
  "Loss is the teacher, success is the reward.",
  "Every failure builds a stronger coder.",
  "The best code is written one iteration at a time.",
];

function getMotivationalQuote(result: "win" | "lose" | "tie"): string {
  const quotes = result === "win" ? WIN_QUOTES : result === "lose" ? LOSE_QUOTES : TIE_QUOTES;
  return quotes[Math.floor(Math.random() * quotes.length)] ?? "Keep coding!";
}

interface ParsedAIResponse {
  questions?: Array<{
    title?: string;
    difficulty?: string;
    player1?: QuestionAnalysis;
    player2?: QuestionAnalysis;
    bonusReason?: string;
  }>;
  player1?: {
    totalBonus?: number;
    strengths?: string[];
    improvements?: string[];
  };
  player2?: {
    totalBonus?: number;
    strengths?: string[];
    improvements?: string[];
  };
}

function extractJSON(raw: string): ParsedAIResponse | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {}

  const codeBlockMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]!);
    } catch {}
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  return null;
}

export async function evaluateBattle(
  submissions: BattleSubmission[],
  questions: BattleQuestion[],
  player1Id: string,
  player2Id: string,
  battleResult: "win" | "lose" | "tie"
): Promise<EvaluateBattleResult> {
  const byPlayer: Record<string, { code: string; questionTitle: string; difficulty: string }[]> = {};

  for (const sub of submissions) {
    if (!byPlayer[sub.userId]) byPlayer[sub.userId] = [];
    byPlayer[sub.userId]!.push({
      code: sub.code,
      questionTitle: sub.question.title,
      difficulty: sub.question.difficulty,
    });
  }

  console.log("[evaluateBattle] player1Id:", player1Id);
  console.log("[evaluateBattle] player2Id:", player2Id);
  console.log("[evaluateBattle] byPlayer keys:", Object.keys(byPlayer));
  console.log("[evaluateBattle] player1 submissions:", byPlayer[player1Id]?.length ?? 0);
  console.log("[evaluateBattle] player2 submissions:", byPlayer[player2Id]?.length ?? 0);
  console.log("[evaluateBattle] total submissions:", submissions.length);
  console.log("[evaluateBattle] questions count:", questions.length);

  const p1Subs = byPlayer[player1Id] ?? [];
  const p2Subs = byPlayer[player2Id] ?? [];

  // Handle case where one or both players have no submissions (disconnected/forfeit)
  const p1HasSubs = p1Subs.length > 0;
  const p2HasSubs = p2Subs.length > 0;

  if (!p1HasSubs && !p2HasSubs) {
    console.error("[evaluateBattle] No submissions for either player!");
    return {
      questions: [],
      player1: { totalBonus: 0, strengths: [], improvements: [] },
      player2: { totalBonus: 0, strengths: [], improvements: [] },
      motivational: "Every expert was once a beginner.",
    };
  }

  // Handle single player submission (other disconnected)
  if (!p1HasSubs || !p2HasSubs) {
    const activePlayer = !p1HasSubs ? player2Id : player1Id;
    const activeSubs = !p1HasSubs ? p2Subs : p1Subs;
    const disconnectedPlayer = !p1HasSubs ? player1Id : player2Id;
    console.log("[evaluateBattle] Single player mode: " + activePlayer + " submitted, " + disconnectedPlayer + " disconnected");

    const buildSingleSection = activeSubs.map((s) => "Question \"" + s.questionTitle + "\" (" + s.difficulty + "):\n```\n" + s.code + "\n```").join("\n\n");
    const questionsList = questions.map((q, i) => (i + 1) + ". \"" + q.title + "\" (" + q.difficulty + ") - " + q.constraints).join("\n");

    const promptSingle = "You are reviewing code for a battle where one player disconnected. Analyze the submitted code.\n\nQuestions:\n" + questionsList + "\n\nPlayer who submitted (" + activePlayer + "):\n" + buildSingleSection + "\n\nAnalyze each question and return ONLY valid JSON with: questions[{title, difficulty, player1:{timeComplexity,spaceComplexity,codeQuality,improvements[]},player2:null,bonusReason}], player1:null, player2:{totalBonus:15,strengths:[],improvements:[]}. Rate based on code quality (max 25 bonus).";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptSingle,
      });

      const raw = response.text ?? "";
      const parsed = extractJSON(raw);

      if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
        const validatedQuestions: QuestionReviewData[] = (parsed.questions ?? []).map((q) => ({
          title: q.title ?? "",
          difficulty: q.difficulty ?? "EASY",
          player1: q.player1 ?? { timeComplexity: "Unknown", spaceComplexity: "Unknown", codeQuality: "Unknown", improvements: [] },
          player2: q.player2 ?? { timeComplexity: "N/A", spaceComplexity: "N/A", codeQuality: "N/A", improvements: [] },
          bonusReason: q.bonusReason ?? "Opponent disconnected",
        }));

        const bonus = Math.max(0, Math.min(25, parsed.player2?.totalBonus ?? parsed.player1?.totalBonus ?? 0));

        if (!p1HasSubs) {
          return {
            questions: validatedQuestions,
            player1: { totalBonus: 0, strengths: [], improvements: ["Opponent disconnected - forfeit"] },
            player2: {
              totalBonus: bonus,
              strengths: parsed.player2?.strengths ?? [],
              improvements: parsed.player2?.improvements ?? [],
            },
            motivational: "You won by forfeit. Better luck next time!",
          };
        } else {
          return {
            questions: validatedQuestions,
            player1: {
              totalBonus: bonus,
              strengths: parsed.player1?.strengths ?? [],
              improvements: parsed.player1?.improvements ?? [],
            },
            player2: { totalBonus: 0, strengths: [], improvements: ["Opponent disconnected - forfeit"] },
            motivational: "Opponent disconnected - you win by forfeit!",
          };
        }
      }
    } catch (err) {
      console.error("evaluateBattle single player error:", err);
    }

    const defaultBonus = 10;
    if (!p1HasSubs) {
      return {
        questions: questions.map((q) => ({
          title: q.title,
          difficulty: q.difficulty,
          player1: { timeComplexity: "N/A", spaceComplexity: "N/A", codeQuality: "N/A", improvements: [] },
          player2: { timeComplexity: "N/A", spaceComplexity: "N/A", codeQuality: "N/A", improvements: [] },
          bonusReason: "Opponent disconnected",
        })),
        player1: { totalBonus: 0, strengths: [], improvements: ["Opponent disconnected"] },
        player2: { totalBonus: defaultBonus, strengths: ["Submitted code"], improvements: [] },
        motivational: "You won by forfeit!",
      };
    } else {
      return {
        questions: questions.map((q) => ({
          title: q.title,
          difficulty: q.difficulty,
          player1: { timeComplexity: "N/A", spaceComplexity: "N/A", codeQuality: "N/A", improvements: [] },
          player2: { timeComplexity: "N/A", spaceComplexity: "N/A", codeQuality: "N/A", improvements: [] },
          bonusReason: "Opponent disconnected",
        })),
        player1: { totalBonus: defaultBonus, strengths: ["Submitted code"], improvements: [] },
        player2: { totalBonus: 0, strengths: [], improvements: ["Opponent disconnected"] },
        motivational: "You won by forfeit!",
      };
    }
  }

  if (p1Subs.length === 0) {
    console.warn("[evaluateBattle] No submissions for player1!");
  }
  if (p2Subs.length === 0) {
    console.warn("[evaluateBattle] No submissions for player2!");
  }

  // Validate player IDs are actual UUIDs, not placeholder strings
  if (!player1Id || player1Id.length < 10) {
    console.error("[evaluateBattle] Invalid player1Id:", player1Id);
    player1Id = "unknown";
  }
  if (!player2Id || player2Id.length < 10) {
    console.error("[evaluateBattle] Invalid player2Id:", player2Id);
    player2Id = "unknown";
  }

  const buildPlayerSection = (pid: string) => {
    const subs = byPlayer[pid] ?? [];
    return subs.map((s) => `Question "${s.questionTitle}" (${s.difficulty}):\n\`\`\`\n${s.code}\n\`\`\``).join("\n\n");
  };

  const prompt = `You are judging a code battle between two players. Analyze each question separately.

Questions:
${questions.map((q, i) => `${i + 1}. "${q.title}" (${q.difficulty}) - ${q.constraints}`).join("\n")}

Player 1 (${player1Id}):
${buildPlayerSection(player1Id)}

Player 2 (${player2Id}):
${buildPlayerSection(player2Id)}

For EACH question, analyze and return JSON:
{
  "questions": [
    {
      "title": "question title",
      "difficulty": "EASY/MEDIUM/HARD",
      "player1": {
        "timeComplexity": "O(n), O(n²), O(log n), O(1), etc.",
        "spaceComplexity": "O(n), O(1), etc.",
        "codeQuality": "Good/Needs Work/Excellent",
        "improvements": ["specific improvement 1", "specific improvement 2"]
      },
      "player2": { ... },
      "bonusReason": "Short explanation why one player got more bonus points"
    }
  ],
  "player1": {
    "totalBonus": <0-50>,
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"]
  },
  "player2": {
    "totalBonus": <0-50>,
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"]
  }
}

Focus on:
- Time complexity (use Big O notation)
- Space complexity (use Big O notation)
- Code readability and best practices
- Algorithm efficiency

Return ONLY valid JSON, no other text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const raw = response.text ?? "";
    const parsed = extractJSON(raw);

    if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
      for (const q of parsed.questions) {
        if (!q.player1 || !q.player2) {
          console.error("[evaluateBattle] Missing player analysis in question:", q.title);
        }
      }

      console.log("[evaluateBattle] Parsed questions count:", parsed.questions.length);
      console.log("[evaluateBattle] p1 bonus raw:", parsed.player1?.totalBonus);
      console.log("[evaluateBattle] p2 bonus raw:", parsed.player2?.totalBonus);

      const p1Bonus = Math.max(0, Math.min(50, parsed.player1?.totalBonus ?? 0));
      const p2Bonus = Math.max(0, Math.min(50, parsed.player2?.totalBonus ?? 0));

      const validatedQuestions: QuestionReviewData[] = (parsed.questions ?? []).map((q) => ({
        title: q.title ?? "",
        difficulty: q.difficulty ?? "EASY",
        player1: q.player1 ?? { timeComplexity: "Unknown", spaceComplexity: "Unknown", codeQuality: "Unknown", improvements: [] },
        player2: q.player2 ?? { timeComplexity: "Unknown", spaceComplexity: "Unknown", codeQuality: "Unknown", improvements: [] },
        bonusReason: q.bonusReason ?? "",
      }));

      return {
        questions: validatedQuestions,
        player1: {
          totalBonus: p1Bonus,
          strengths: parsed.player1?.strengths ?? [],
          improvements: parsed.player1?.improvements ?? [],
        },
        player2: {
          totalBonus: p2Bonus,
          strengths: parsed.player2?.strengths ?? [],
          improvements: parsed.player2?.improvements ?? [],
        },
        motivational: getMotivationalQuote(battleResult),
      };
    } else {
      console.error("[evaluateBattle] Failed to parse JSON or missing questions array");
      console.error("[evaluateBattle] Raw response:", raw.slice(0, 500));
    }
  } catch (err) {
    console.error("evaluateBattle error:", err);
  }

  return {
    questions: [],
    player1: { totalBonus: 0, strengths: [], improvements: [] },
    player2: { totalBonus: 0, strengths: [], improvements: [] },
    motivational: "Every expert was once a beginner.",
  };
}