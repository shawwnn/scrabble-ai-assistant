// gentle-bastion-plan.md

Capture current-move coordinates and letters

Findings

code/client/pages/Game.tsx:14 owns the committed board as Record<string, BoardTile>.

code/client/pages/Game.tsx:17 owns pending/current-turn tiles as Record<string, BoardTile> keyed by "row,col".

code/client/pages/Game.tsx:33 derives validation with validateMove(board, pending).

code/client/lib/game-data.ts:65 exposes MoveValidation.affectedKeys; validateMove() populates it from generated horizontal/vertical word positions and returns pending keys for invalid states.

code/client/components/ScrabbleBoard.tsx:43 confirms the project lookup convention: pending[key] ?? board[key], with the letter read from tile.letter.

No validateMoveBackend() or validation-related useEffect exists in the current frontend.

Recommended minimal change

In code/client/pages/Game.tsx, immediately after the existing validation memo, derive the current move tiles without new state:

Merge board sources as { ...board, ...pending } so pending letters override committed coordinates.

Combine validation.affectedKeys with Object.keys(pending), deduplicated by key so invalid/unusual states still include every pending tile.

Map each key to the project-native tile lookup and return a small structure containing the coordinate key and actual BoardTile/letter. Do not emit entries for missing tiles.

Keep this derived value available to the future backend call or pass it through the existing validation integration point when that call is introduced. Do not add useEffect, useState, highlightedKeys, duplicate board state, or backend word-generation logic now because no backend validation hook exists.

Preserve the existing affectedKeys prop and green/red rendering behavior in ScrabbleBoard.tsx; this change only makes the current move’s coordinate/letter data available.

Verification

Run TypeScript type checking and the existing tests.

Confirm placement, movement, and removal update the derived list through the existing board, pending, and validation dependencies.
