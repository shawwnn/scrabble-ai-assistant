import express from "express";
import cors from "cors";
import validateMoveRouter from "./routes/validateMove.js";
import { initializeDictionary } from "./game/dictionary.js";

// ./backend/src/server.ts

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

initializeDictionary("UK");
initializeDictionary("US");

app.get("/api/server", (req, res) => {
  res.json({
    message: "Server is running!",
    status: "ok",
  });
});

app.use("/api/validate-move", validateMoveRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
