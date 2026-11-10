I’ll compare the current board highlighting against the requested connected-word behavior, then update the existing validator and board projection so adjacent committed tiles and all tiles in the current move share the correct green/red state.

The plan was not executed: `MoveValidation` still returns only words and score, and `ScrabbleBoard` styles only `isPending` cells. I’m wiring the affected word coordinates through those existing components without changing placement or validation rules.

The connected-coordinate projection is now in place: valid words collect every occupied position in their horizontal/vertical runs, including committed neighbors, while invalid states still mark the pending tiles red. I’m running type checks and tests next to catch any shape or rendering regressions.

TypeScript and the existing test suite pass, and Vite accepted the hot update. I’m opening the game route now to verify the updated board projection renders in the live preview.

The plan was not previously executed. I’ve now implemented the connected-tile highlighting.

Changes made:

- `code/client/lib/game-data.ts:60`
  - Added `affectedKeys` to `MoveValidation`.
  - Valid moves now collect every coordinate belonging to generated horizontal and vertical words.
  - This includes:
    - Newly placed tiles
    - Existing adjacent horizontal tiles
    - Existing adjacent vertical tiles
    - Cross-word tiles
    - Multiple tiles placed in the same direction

- `code/client/pages/Game.tsx:114`
  - Passes `validation.affectedKeys` into `ScrabbleBoard`.

- `code/client/components/ScrabbleBoard.tsx:18`
  - Highlights all affected coordinates:
    - Green borders for valid moves
    - Red borders for invalid pending moves
  - Existing committed tiles remain unchanged when they are not part of the current move.

Validation passed:

- `pnpm typecheck`
- `pnpm test -- --run`
- Live game route opened successfully at `/games/wordmaster`

The board now highlights the complete connected word structure instead of only the tile placed from the rack.
