import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import aiRoutes from "./routes/ai.routes";
import codeRunnerRoutes from "./routes/code-runner.routes";
import authRoutes from "./routes/auth.routes";
import battleRoutes from "./routes/battle.routes.js";
import userRoutes from "./routes/user.routes.js";
import historyRoutes from "./routes/history.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import { setupSocketHandlers } from "./controllers/socket.controller.js";
import { authMiddleware } from "./middleware/auth.js";

import "./workers/battle.worker.js";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(codeRunnerRoutes);
app.use(aiRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173" },
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;