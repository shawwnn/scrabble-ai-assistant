
import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAnalyze } from "./routes/analyze";
import gamesRouter from "./routes/games";
import validateMoveRouter from "./routes/validateMove";
import { loadDictionary } from "./lib/dictionary";
import { handleGeminiHealth } from "./routes/gemini-health";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/analyze", handleAnalyze);
  app.get("/api/gemini-health", handleGeminiHealth);
  app.use("/api/games", gamesRouter);
  app.use("/api/validate-move", validateMoveRouter);

  return app;
}
