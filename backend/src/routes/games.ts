import { Router } from "express";
import { validateMove } from "../game/rules.js";

const router = Router();

router.post("/move", (req, res) => {
  const { board, pending, rack } = req.body;

  const result = validateMove(board, pending);

  res.json({
    valid: result.status === "valid",
    result,
    rack,
  });
});

export default router;
