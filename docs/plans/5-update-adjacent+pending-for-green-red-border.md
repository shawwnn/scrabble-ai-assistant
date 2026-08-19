Recommended minimal change for connected-tile highlighting

Preserve Game.tsx as the owner of board, pending, placement/removal/movement handlers, and derived validation; no new store, component, or architecture.

Extend the existing MoveValidation result in code/client/lib/game-data.ts with the coordinate keys already discovered by getWord. Build the affected set from every generated horizontal/vertical word, including pending tiles, adjacent committed tiles, and multiple same-direction placements. Return an empty set for unchanged/invalid results where no connected move should be highlighted.

Keep the existing connection, direction, gap, and score checks. Ensure validation continues to run through useMemo after every placeTile, movePendingTile, undo/removal, or pass update.

Pass the affected coordinate set from Game.tsx to ScrabbleBoard.tsx alongside the existing global validationStatus.

In ScrabbleBoard.tsx, apply the existing green/red classes to tiles whose keys are in the affected set, while keeping empty squares unstyled and preserving the current board/pending rendering and drag/drop behavior. With the confirmed requirement, committed adjacent tiles in the connected word(s) will also receive the move’s green/red state.

Keep Submit controlled by the existing validation.status !== "valid" guard; do not make Submit responsible for validation.

Verify placement, pending movement, removal, adjacent horizontal/vertical words, and multi-tile same-direction moves without changing unrelated UI.

Boundary

Do not add backend code, API calls, libraries, state-management systems, or unrelated UI changes.
