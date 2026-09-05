I’ll update only the existing `Game` screen: make both the board and rack start empty, add explicit persona labels and active-player feedback, and keep the existing manual/random tile controls available without auto-filling anything.

I found the remaining gap: the board is empty, but `Game.tsx` still initializes the active rack from `initialRack`, and the tile picker is only reachable after a submitted move. I’ll remove that auto-filled rack, expose the existing selection flow for an empty rack, and label the selected persona/rack owner without changing the board mechanics.

The persona and empty-rack changes are in place. I’m adding a visible `Random Tiles` entry point alongside `Manual tile selection` so an empty rack can be populated through either existing path, then I’ll run the verification suite.

Updated `code/client/pages/Game.tsx` only:

- Board and rack now initialize completely empty.
- Added explicit persona controls:
  - `Q with U — First Move`
  - `John Doe — Second Move / Opponent`
- Added visible `Playing as` indicator.
- Rack label now synchronizes with the selected persona.
- Added `Manual tile selection` and `Random Tiles` actions for initially filling the empty rack.
- Preserved existing placement, validation, replenishment, and tile-bag behavior.

Typecheck, tests, production builds, and the live `/games/wordmaster` route all pass.
