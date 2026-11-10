Blank / wildcard tile integration plan

Recommended approach

Implement one blank tile through the existing Tile → currentRack → pending → currentMoveTiles flow. The repository has no theTiles.act symbol, so the existing rack export in code/client/lib/game-data.ts is the starting-rack source. Per the confirmed mapping, retain the current points field with points: 0 and add an optional wildcard: true property rather than introducing or renaming a separate value field.

Changes

code/client/lib/game-data.ts

Extend Tile and BoardTile with optional wildcard identity.

Replace exactly one starting-rack letter with a blank tile whose letter starts as ?, points are 0, and wildcard is true.

code/client/pages/Game.tsx

Preserve wildcard metadata when moving a rack tile into pending, removing it, moving it, undoing it, and replenishing state where applicable.

Track the pending blank’s board key and open a small letter-selection dialog after placement.

Let the player choose A–Z, then update only the pending tile’s displayed letter; keep points: 0, wildcard: true, and pending: true.

Keep the existing currentMoveTiles memo unchanged as the single payload path; its letter becomes the chosen letter while tile retains wildcard metadata.

code/client/components/ScrabbleBoard.tsx

Render the selected letter from the existing tile letter field and preserve the current board interactions; no separate wildcard rendering path is needed.

Constraints and verification

Do not add theTiles.act, a second wildcard type, a separate payload, backend validation, dictionary logic, scoring, premium, or bingo logic.

Keep normal rack tile placement and drag/drop behavior unchanged.

Verify type checking, tests, and the UI flow: blank appears in the seven-tile rack, can be placed, opens the picker, displays the chosen A–Z letter, remains points 0/wildcard, and appears in currentMoveTiles.
