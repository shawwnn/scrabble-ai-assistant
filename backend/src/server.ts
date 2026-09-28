import express from "express";
import cors from "cors";
import gamesRouter from "./routes/games.js";
import validateMoveRouter from "./routes/validateMove.js";
import { initializeDictionary } from "./game/dictionary.js";
import { supabase } from "./db/supabase.js";

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

app.use("/api/games", gamesRouter);
app.use("/api/validate-move", validateMoveRouter);

async function testSupabase() {
  const { data, error } = await supabase.from("games").select("*");

  console.log("Supabase data:", data);
  console.log("Supabase error:", error);
}

testSupabase();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
