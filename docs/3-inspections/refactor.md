# Scrabble UI diff inspection

Inspected commit `3122162` (`Improve move selection and responsive game board`). It modifies two existing files; no files were created or deleted. The working tree is clean.

## `code/client/pages/Game.tsx`

- **Added:** current lines 37 (initial-position state), 40–41 (persona-relative score labels), and setup/selection copy and handlers at 149, 153, and 165.
- **Modified:** current lines 2, 31, 39–42, 141, 146, 148–155, 158, 165, and 172. These cover imports, initial feedback, active-player score cards/status, empty-rack entry, action hierarchy, removal of repeated turn info, dialog copy, and the `ScoreCard` label prop.
- **Removed:** the unused `currentMoveTiles` calculation (old lines 35–42); inert Help/ellipsis buttons (old lines 147 and 158); duplicate turn labels (old lines 154 and 165); and the previous five-column action layout/old undo button placement (old lines 161–162).
- Diff count: 16 added lines and 23 removed lines. Modified lines are represented as removed+added in the diff.

## `code/client/components/ScrabbleBoard.tsx`

- **Modified:** current lines 36–37 remove the 320px minimum width; current line 72 allows placement guidance to wrap on narrow screens.
- **Replaced:** old guidance at lines 73–74 now reads “Select a rack tile, then tap a square” and “Or drag a rack tile to place it.”
- Diff count: 5 added lines and 5 removed lines; no net file additions or deletions.

Overall, the commit has 21 added and 28 removed lines across the two modified files. Replaced content accounts for both sides of those counts.
