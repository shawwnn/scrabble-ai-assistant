Focused Scrabble UI improvements

Recommended approach

Improve the existing WordMaster test-game screen in place. Preserve the explicitly requested empty board/rack, persona selection (Q with U / John Doe), manual and random tile selection, and session-only gameplay. Do not add a new screen or convert this test flow into a historical-match experience.

Restore the empty-rack start flow. In client/pages/Game.tsx, connect the existing empty-rack actions to openRackSelection so manual and random selection are reachable before the first move. Keep the board and rack empty on load; make the empty state clearly guide the player to choose a persona and then add tiles. Preserve the existing replenishment flow after submitting a move.

Clarify the action hierarchy. Give Submit the strongest visual treatment and disable it when there is no valid pending move. Group lower-frequency actions (bag, hint, exchange/wildcard, shuffle/sort, undo) so they do not compete with the board and rack. Keep the working main Menu; remove or wire the inert Help and ellipsis controls rather than leaving misleading buttons. Retain distinct actions such as Sort and Shuffle.

Reduce repeated status and improve placement guidance. Keep one clear active-persona/turn status and remove duplicate turn labels where they add no information. Make board guidance state that a rack tile must be selected or dragged before placement. Keep the player/rack identity explicit.

Tighten responsive layout. Let the board size to the available viewport width and reflow/group controls on narrow screens, avoiding horizontal page overflow while keeping squares usable. Preserve the existing green visual language and board interaction behavior.

Remove only proven dead UI/code. Delete the unused currentMoveTiles computation in Game.tsx; remove inert/redundant controls only after preserving their useful actions through the existing menu or another functional control. Do not remove ScrabbleBoard's seeded default or sample fixtures without checking all call sites, since they may serve other uses.

Scope and validation

Primary files: client/pages/Game.tsx and, if needed for responsive sizing or instructions, client/components/ScrabbleBoard.tsx. Leave routing, backend integration, and match fixture behavior unchanged.

Verify the initial page shows an empty board and rack; selecting either persona updates the active/rack labels; both manual and random selection can fill the rack before the first move; placement, validation, submit, replenishment, and existing board interactions still work; and the layout remains usable at desktop and mobile widths. Run the existing typecheck, tests, and build, then exercise the live game route in the browser.
