I’ll inspect the game screen and its related components, then implement the agreed UI changes and verify the live flow and project checks.

The main issue is confirmed: the initial draw dialog exists but nothing opens it before the first move, and several secondary controls are inactive. I’m checking the page/component details now so I can preserve the working move and replenishment behaviors while tightening the layout.

I’ve confirmed the existing score-card highlight can contradict the selected persona, and the board’s hard minimum width causes small-screen overflow. I’m preserving the existing gameplay mechanics and only adjusting their entry points, status presentation, and action grouping.

The planned changes are in place: empty-rack setup now requires a selected persona, player labels follow that selection, Submit is primary, and lower-frequency actions are grouped with inactive actions disabled or removed. I’ve also removed the inert header controls and made the board shrink with its container; next I’m checking the diff, build/tests, and actual viewport behavior.

Typecheck, tests, and the production build all pass; the only build messages are the existing stale Browserslist-data and large-chunk warnings. I’ve opened the game route and am checking the rendered desktop and narrow-screen layouts next.

The live preview shows the intended blank board and empty racks. I spotted one small copy-state issue during the review: after choosing a player, the status banner would still say to choose a player, so I’m correcting that before the final checks.

Implemented the UI refinements in `client/pages/Game.tsx:37` and `client/components/ScrabbleBoard.tsx:36`: rack setup now follows persona selection, player labels track the selected persona, Submit is prioritized, inactive controls are disabled, redundant/inert controls are removed, and board guidance/layout are more responsive. The board and rack still start empty.

Typecheck, all 5 tests, production build, and a live preview inspection passed. I couldn’t click through manual/random draws or submission because browser automation tooling isn’t available; the build also reports existing Browserslist-data and large-chunk warnings.
