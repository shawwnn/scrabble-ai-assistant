import express from "express";
import cors from "cors";
import gamesRouter from "./routes/games.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api/server", (req, res) => {
  res.json({
    message: "Server is running!",
    status: "ok",
  });
});

app.use("/api/games", gamesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
