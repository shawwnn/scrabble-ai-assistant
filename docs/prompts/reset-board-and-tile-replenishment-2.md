## Scrabble UI Modification

Modify the existing Scrabble UI with these two changes only:

### 1. Make the active persona obvious

There are two simulated players:

- **Q with U** — First Move
- **John Doe** — Second Move / Opponent

When I choose First or Second Move, clearly show on the screen **which persona I am currently playing as**.

The active rack must also clearly identify its owner:

- **Q with U — Rack**
- **John Doe — Rack**

I should never have to guess which player or rack I am controlling.

### 2. Start with a completely empty board and rack

Remove the currently pre-placed tiles/words from the initial board state.

The board and rack should start **completely empty**, so I must first choose my tiles through the existing:

- Manual tile selection
- Random Tiles

Do not automatically populate the board or rack with predefined game data.
