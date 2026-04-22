import "dotenv/config";
import express from "express";
import cors from "cors";
import { runCode } from "./services/executor.js";
import { getLogs } from "./services/database.js";
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
let isRunning = false;
const queue = [];
const processingInterval = [];
async function processQueue() {
    if (isRunning || queue.length === 0)
        return;
    const task = queue.shift();
    if (!task)
        return;
    isRunning = true;
    try {
        await task();
    }
    catch (err) {
        console.error("Queue task error:", err);
    }
    finally {
        isRunning = false;
    }
}
app.post("/execute", async (req, res) => {
    const { code, stdin, timeLimit, memoryLimit } = req.body;
    if (!code)
        return res.status(400).json({ error: "Code is required" });
    return new Promise((resolve) => {
        queue.push(async () => {
            try {
                const result = await runCode({ code, stdin, timeLimit, memoryLimit });
                resolve(res.json(result));
            }
            catch (err) {
                resolve(res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" }));
            }
        });
    });
});
app.post("/batch", async (req, res) => {
    console.log("BATCH HIT", JSON.stringify(req.body).substring(0, 500));
    const { submissions } = req.body;
    if (!Array.isArray(submissions) || submissions.length === 0) {
        return res.status(400).json({ error: "submissions must be a non-empty array" });
    }
    return new Promise((resolve) => {
        queue.push(async () => {
            try {
                const results = [];
                for (const submission of submissions) {
                    const result = await runCode(submission);
                    results.push(result);
                    // Small delay between each run to avoid Docker overload
                    await new Promise(r => setTimeout(r, 100));
                }
                resolve(res.json({ results }));
            }
            catch (err) {
                resolve(res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" }));
            }
        });
    });
});
app.get("/logs", (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const rows = getLogs(limit);
    return res.json({ logs: rows });
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Code Runner running on port ${PORT}`);
    // Process queue every 500ms
    setInterval(processQueue, 500);
});
export default app;
