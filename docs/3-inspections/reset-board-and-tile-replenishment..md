Empty-board Scrabble test flow

Recommended approach

Update the existing Game screen in place. Keep the current board, rack, pending-tile, validation, scoring, drag/drop, wildcard, and replenishment components; change only the initial board source and add the smallest state/UI needed to select the simulated move context.

The empty board must require an explicit choice between First Move and Second Move / Opponent before placement. Either choice may be used to construct an opening position on an empty board. Selecting the mode changes the simulation context only; it does not create separate games, reset state, or add persistence.

Changes





code/client/pages/Game.tsx





Replace the seeded initial board value with an empty board while leaving seededTiles available as existing data unless no longer referenced.



Add a compact First Move / Second Move / Opponent selector near the current turn/build controls.



Prevent placement on an empty board until one mode is selected; allow both modes to place the opening move.



Preserve the existing single board, rack, pending, drag/drop, wildcard, score, and replenishment state so committed moves remain visible while constructing the temporary test position.



Continue using the existing submitMove, drawRandom, and confirmManual flow for both modes.



Keep replenished tiles in currentRack and reset only when the page is left or the existing game state is otherwise reset.



Ensure manual replenishment cannot select more copies of a letter than the available count reported by the tile bag.



code/client/lib/game-data.ts





Keep getUnseenCounts() and replacementTiles() together as the clearly identifiable frontend tile-bag boundary; do not add an API endpoint or persistence.



Preserve wildcard-aware inventory counting and tile metadata.



Make the existing random replacement operation actually select randomly from the available remaining tile counts while returning only available tiles.



Extend validateMove(board, pending) only as needed for an empty-board opening rule: when board has no committed tiles, require the pending move to cover the center square (7,7); when the board is populated, retain the existing connection, direction, contiguity, word, and scoring rules.



Keep the existing validation result shape and UI status behavior unchanged.



code/client/components/ScrabbleBoard.tsx





No structural redesign is needed. Verify its existing board/pending defaults render all 225 empty cells and preserve current placement, movement, wildcard display, validation borders, and score pop-out behavior.

Data flow after the update

mode selection → rack/manual/random tile selection → existing placement into pending → existing validateMove(board, pending) → green/red validation and score → submitMove commits pending into board → existing replenishment dialog → currentRack for the next simulated move.

Verification





Open the existing Scrabble route and confirm the board is completely empty.



Confirm no tile can be placed until First Move or Second Move / Opponent is selected.



Confirm either selected mode can place an opening move covering the center square and that an opening move away from center is invalid.



Confirm submitted tiles remain on the board, replenished manual/random tiles remain in the rack, and another move can be constructed without leaving the page.



Confirm existing populated-board connection, validation, scoring, wildcard, drag/drop, and UI behavior remain intact.



Run typecheck, tests, and exercise the flow in the live preview.