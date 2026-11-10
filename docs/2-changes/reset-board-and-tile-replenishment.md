I’ll inspect the existing game screen, board logic, and tile-bag helpers first, then apply only the planned empty-board and move-mode changes and verify the gameplay flow.

The existing flow is already in place: `Game.tsx` owns `board`, `pending`, rack, submit, and validation; `game-data.ts` owns `validateMove()` and tile-bag counting; `ScrabbleBoard.tsx` already renders an empty board when passed `{}`. I’m applying the smallest changes at those existing boundaries.

The empty seeded position is now removed, the test-position selector gates first placement, opening moves must cover the center, and replacement draws are randomized from available inventory. I’m checking types/tests next, then I’ll verify the route in the live preview.

Typecheck, tests, and both client/server production builds pass. The live route is running, and a direct validation check confirms a center-covering opening word is valid while an off-center opening is invalid; I’m doing a final diff check for unintended changes.

Implemented the approved empty-board Scrabble test flow.

Modified:

- `code/client/pages/Game.tsx`
  - Board now starts completely empty.
  - Added First Move / Second Move / Opponent selector.
  - Prevents tile placement until a mode is selected.
  - Preserved existing board, rack, validation, submit, and replenishment flow.
  - Prevents manual replenishment from selecting more copies than available.

- `code/client/lib/game-data.ts`
  - Opening moves must cover the center square at `7,7`.
  - Existing populated-board connection and direction validation remains unchanged.
  - Random replacement tiles now draw randomly from available inventory.

Verification completed:

- TypeScript check passed.
- Tests passed: 5/5.
- Production client and server builds passed.
- Live `/games/wordmaster` route confirmed running.
- Center-covering opening move validated as valid; off-center opening validated as invalid.
