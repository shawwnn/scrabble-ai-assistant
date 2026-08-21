import { Router } from "express";

const router = Router();

type CurrentMoveTile = {
  key: string;
  letter: string;
  tile: Record<string, unknown>;
};

router.post("/", (req, res) => {
  const { currentMoveTiles } = req.body as {
    currentMoveTiles: CurrentMoveTile[];
  };

  const moveTiles = currentMoveTiles.map(
    ({ key, letter, tile }: CurrentMoveTile) => ({
      key,
      letter,
      tile,
    }),
  );

  console.log("BACKEND RECEIVED:", moveTiles);

  // not yet, process first.
  // res.json({
  //   moveTiles,
  //   status: "success",
  // });
});

export default router;
