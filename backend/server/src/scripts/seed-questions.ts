import { prisma } from "../lib/prisma.js";
import { questions } from "./questions.js";

// const questions = [
//   {
//     title: "Two Sum",
//     difficulty: "EASY" as const,
//     description:
//       "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
//     inputFormat:
//       "First line: space-separated integers (nums). Second line: integer target.",
//     outputFormat: "Two space-separated indices (0-indexed, ascending order).",
//     constraints:
//       "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, exactly one valid answer exists.",
//     tags: ["array", "hash-table"],
//     sampleCases: [
//       { input: "2 7 11 15\n9", expectedOutput: "0 1" },
//       { input: "3 2 4\n6", expectedOutput: "1 2" },
//     ],
//     hiddenCases: [
//       { input: "1 1 1 1\n2", expectedOutput: "0 1" },
//       { input: "0 4 3 0\n0", expectedOutput: "0 3" },
//       { input: "-1 -2 -3 -4 -5\n-8", expectedOutput: "2 4" },
//       { input: "9 9 9\n18", expectedOutput: "0 1" },
//       { input: "1 5 3 7 2\n10", expectedOutput: "1 3" },
//       { input: "2 5 8 1 3\n7", expectedOutput: "0 4" },
//       { input: "7 6 4 3 1\n10", expectedOutput: "0 1" },
//       { input: "1 2 3 4 5 6\n11", expectedOutput: "4 5" },
//     ],
//   },
//   {
//     title: "Valid Parentheses",
//     difficulty: "EASY" as const,
//     description:
//       "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
//     inputFormat: "One line: string s (1 <= s.length <= 10^4).",
//     outputFormat: '"true" or "false"',
//     constraints: "s consists of brackets only: ()[]{}",
//     tags: ["string", "stack"],
//     sampleCases: [
//       { input: "()", expectedOutput: "true" },
//       { input: "()[]{}", expectedOutput: "true" },
//     ],
//     hiddenCases: [
//       { input: "(]", expectedOutput: "false" },
//       { input: "([)]", expectedOutput: "false" },
//       { input: "{[]}", expectedOutput: "true" },
//       { input: "", expectedOutput: "true" },
//       { input: "((((", expectedOutput: "false" },
//       { input: "(((())))", expectedOutput: "true" },
//       { input: "{[()]}", expectedOutput: "true" },
//       { input: "]", expectedOutput: "false" },
//     ],
//   },
//   {
//     title: "Reverse Linked List",
//     difficulty: "EASY" as const,
//     description:
//       "Given the head of a singly linked list, reverse the list, and return the reversed list.",
//     inputFormat:
//       "Space-separated integers representing list values. End with -1.",
//     outputFormat: "Space-separated reversed list values, ending with -1.",
//     constraints: "1 <= length <= 5000, values fit in int range",
//     tags: ["linked-list"],
//     sampleCases: [
//       { input: "1 2 3 4 5 -1", expectedOutput: "5 4 3 2 1 -1" },
//       { input: "1 2 -1", expectedOutput: "2 1 -1" },
//     ],
//     hiddenCases: [
//       { input: "2 1 -1", expectedOutput: "1 2 -1" },
//       { input: "-1", expectedOutput: "-1" },
//       { input: "1 -1", expectedOutput: "1 -1" },
//       { input: "1 2 3 -1", expectedOutput: "3 2 1 -1" },
//       { input: "7 6 5 4 3 2 1 -1", expectedOutput: "1 2 3 4 5 6 7 -1" },
//       { input: "99 88 77 -1", expectedOutput: "77 88 99 -1" },
//       { input: "10 -1", expectedOutput: "10 -1" },
//       { input: "1 2 3 4 6 -1", expectedOutput: "6 4 3 2 1 -1" },
//     ],
//   },
//   {
//     title: "Longest Substring Without Repeating Characters",
//     difficulty: "MEDIUM" as const,
//     description:
//       "Given a string s, find the length of the longest substring without repeating characters.",
//     inputFormat: "One line: string s (0 <= s.length <= 50000).",
//     outputFormat: "Integer — length of longest substring.",
//     constraints: "0 <= s.length <= 50000",
//     tags: ["hash-table", "string", "sliding-window"],
//     sampleCases: [
//       { input: "abcabcbb", expectedOutput: "3" },
//       { input: "bbbbb", expectedOutput: "1" },
//     ],
//     hiddenCases: [
//       { input: "pwwkew", expectedOutput: "3" },
//       { input: "", expectedOutput: "0" },
//       { input: "abcdefg", expectedOutput: "7" },
//       { input: "dvdf", expectedOutput: "3" },
//       { input: "anviaj", expectedOutput: "5" },
//       { input: "tmmzuxt", expectedOutput: "5" },
//       { input: "au", expectedOutput: "2" },
//       { input: "abba", expectedOutput: "2" },
//     ],
//   },
//   {
//     title: "Container With Most Water",
//     difficulty: "MEDIUM" as const,
//     description:
//       "Given n non-negative integers representing an elevation map, find two lines that together with the x-axis form a container that holds the most water.",
//     inputFormat:
//       "Space-separated non-negative integers representing heights.",
//     outputFormat: "Maximum area (integer).",
//     constraints:
//       "n == height.length, 2 <= n <= 10^5, 0 <= height[i] <= 10^4",
//     tags: ["two-pointers", "greedy", "array"],
//     sampleCases: [
//       { input: "1 8 6 2 5 4 8 3 7", expectedOutput: "49" },
//       { input: "1 1", expectedOutput: "1" },
//     ],
//     hiddenCases: [
//       { input: "4 3 2 1 4", expectedOutput: "16" },
//       { input: "2 3 10 5 2 8 3 1", expectedOutput: "36" },
//       { input: "1 2 1", expectedOutput: "2" },
//       { input: "2 3 4 5 6 7 8 9", expectedOutput: "36" },
//       { input: "9 8 7 6 5 4 3 2 1", expectedOutput: "20" },
//       { input: "1 0 0 0 0 0 0 0 0 0 1", expectedOutput: "10" },
//       { input: "3 1 2 4 1 3", expectedOutput: "16" },
//       { input: "5 4 3 2 1 5", expectedOutput: "25" },
//     ],
//   },
//   {
//     title: "Word Search",
//     difficulty: "MEDIUM" as const,
//     description:
//       "Given an m x n grid of characters board and a string word, return true if word exists in the grid.",
//     inputFormat:
//       "First line: two integers m n. Next m lines: n characters each. Next line: word to search.",
//     outputFormat: '"true" or "false"',
//     constraints:
//       "1 <= m, n <= 6, board[i][j] is a lowercase letter, 1 <= word.length <= 15",
//     tags: ["matrix", "backtracking", "trie"],
//     sampleCases: [
//       {
//         input: "3 4\nA B C E\nS F C S\nA D E E\nABCCED",
//         expectedOutput: "true",
//       },
//       {
//         input: "3 4\nA B C E\nS F C S\nA D E E\nSEE",
//         expectedOutput: "true",
//       },
//     ],
//     hiddenCases: [
//       {
//         input: "3 4\nA B C E\nS F C S\nA D E E\nABCB",
//         expectedOutput: "false",
//       },
//       { input: "1 1\na\na", expectedOutput: "true" },
//       { input: "1 1\na\na\naa", expectedOutput: "false" },
//       { input: "2 2\na b\nc d\nacbd", expectedOutput: "false" },
//       { input: "2 2\na b\nc d\nabcd", expectedOutput: "true" },
//       {
//         input: "3 3\na b c\na a a\na a a\naaa",
//         expectedOutput: "true",
//       },
//       {
//         input: "3 3\na b c\na a a\na a a\naaaab",
//         expectedOutput: "false",
//       },
//       { input: "1 2\na b\nab", expectedOutput: "true" },
//     ],
//   },
//   {
//     title: "Median of Two Sorted Arrays",
//     difficulty: "HARD" as const,
//     description:
//       "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
//     inputFormat:
//       "First line: space-separated integers (nums1). Second line: space-separated integers (nums2).",
//     outputFormat:
//       "The median as a number (print full precision to 4 decimal places).",
//     constraints:
//       "1 <= m, n <= 1000, -10^6 <= nums[i] <= 10^6",
//     tags: ["array", "binary-search", "divide-and-conquer"],
//     sampleCases: [
//       { input: "1 3\n2", expectedOutput: "2.0000" },
//       { input: "1 2\n3 4", expectedOutput: "2.5000" },
//     ],
//     hiddenCases: [
//       { input: "1 3 5 7\n2", expectedOutput: "3.0000" },
//       { input: "0 0\n0 0", expectedOutput: "0.0000" },
//       { input: "2\n1 3 4 5 6", expectedOutput: "3.5000" },
//       { input: "1 2 3 4 5\n6 7 8 9 10", expectedOutput: "5.5000" },
//       { input: "1 1\n1 2", expectedOutput: "1.0000" },
//       { input: "1\n2 3 4", expectedOutput: "3.0000" },
//       { input: "3 4\n1 2 5 6 7", expectedOutput: "4.0000" },
//       { input: "1 2 3\n4 5 6 7 8", expectedOutput: "4.5000" },
//     ],
//   },
//   {
//     title: "Trapping Rain Water",
//     difficulty: "HARD" as const,
//     description:
//       "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
//     inputFormat:
//       "Space-separated non-negative integers representing heights.",
//     outputFormat: "Total units of water trapped.",
//     constraints:
//       "n == height.length, 0 <= n <= 3*10^4, 0 <= height[i] <= 10^5",
//     tags: ["two-pointers", "stack", "array", "dp"],
//     sampleCases: [
//       {
//         input: "0 1 0 2 1 0 1 3 2 1 2 1",
//         expectedOutput: "6",
//       },
//       { input: "4 2 0 3 2", expectedOutput: "5" },
//     ],
//     hiddenCases: [
//       { input: "3 0 0 2 0 4", expectedOutput: "10" },
//       { input: "2 0 2", expectedOutput: "2" },
//       { input: "0 1 0 2 1 0 3 1 0 1 2", expectedOutput: "8" },
//       { input: "1 2 3 4 5 4 3 2 1", expectedOutput: "0" },
//       { input: "5 4 3 2 1 0 1 2 3 4 5", expectedOutput: "36" },
//       { input: "0 2 0", expectedOutput: "0" },
//       { input: "1 2 3 4 5", expectedOutput: "0" },
//       { input: "5 0 5", expectedOutput: "5" },
//     ],
//   },
//   {
//     title: "Merge K Sorted Lists",
//     difficulty: "HARD" as const,
//     description:
//       "You are given an array of k linked-lists, each sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
//     inputFormat:
//       "First line: integer k. Next k lines: space-separated integers ending with -1.",
//     outputFormat: "Space-separated merged list values, ending with -1.",
//     constraints: "1 <= k <= 10^4, total nodes <= 10^4",
//     tags: ["linked-list", "heap", "divide-and-conquer"],
//     sampleCases: [
//       {
//         input: "3\n1 4 5 -1\n1 3 4 -1\n2 6 -1",
//         expectedOutput: "1 1 2 3 4 4 5 6 -1",
//       },
//       { input: "1\n1 -1", expectedOutput: "1 -1" },
//     ],
//     hiddenCases: [
//       { input: "3\n-1\n-1\n-1", expectedOutput: "-1" },
//       { input: "2\n1 -1\n-1", expectedOutput: "1 -1" },
//       {
//         input: "4\n1 2 3 -1\n4 5 6 -1\n7 8 9 -1\n0 -1",
//         expectedOutput: "0 1 2 3 4 5 6 7 8 9 -1",
//       },
//       { input: "2\n1 -1\n2 -1", expectedOutput: "1 2 -1" },
//       {
//         input: "3\n1 3 5 7 9 -1\n2 4 6 8 10 -1\n0 -1",
//         expectedOutput: "0 1 2 3 4 5 6 7 8 9 10 -1",
//       },
//       { input: "1\n1 2 3 4 5 -1", expectedOutput: "1 2 3 4 5 -1" },
//       {
//         input: "2\n1 1 1 -1\n1 1 1 -1",
//         expectedOutput: "1 1 1 1 1 1 -1",
//       },
//       { input: "3\n1 -1\n2 -1\n3 -1", expectedOutput: "1 2 3 -1" },
//     ],
//   },
// ];

async function seed() {
  console.log("Seeding questions...\n");

  for (const q of questions) {
    const created = await prisma.question.create({
      data: {
        title: q.title,
        difficulty: q.difficulty,
        description: q.description,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        constraints: q.constraints,
        tags: q.tags,
        testcases: {
          create: [
            ...q.sampleCases.map((tc, i) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isSample: true,
              testCaseNumber: i + 1,
              timeLimitMs: q.difficulty === "HARD" ? 2000 : 1000,
              memoryLimitMb: 256,
            })),
            ...q.hiddenCases.map((tc, i) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isSample: false,
              testCaseNumber: q.sampleCases.length + i + 1,
              timeLimitMs: q.difficulty === "HARD" ? 2000 : 1000,
              memoryLimitMb: 256,
            })),
          ],
        },
      },
    });

    const totalTCs = q.sampleCases.length + q.hiddenCases.length;
    console.log(
      `  ${q.difficulty.padEnd(6)} — ${q.title} (${totalTCs} TCs)`
    );
  }

  console.log(`\nDone. ${questions.length} questions seeded.`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
