import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  console.log("BACKEND RECEIVED:", req.body);

  res.json({
    status: "received",
    board: req.body.board,
    pending: req.body.pending,
  });
});

export default router;
