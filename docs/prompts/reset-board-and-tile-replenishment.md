## Update Existing Scrabble Test UI

Modify the **existing Scrabble test/game UI**. Do not rebuild or create a new sandbox.

### 1. Reset the Existing Board

The current board already contains previously placed words/tiles.

Change the initial/reset state so that the board starts **completely empty**.

Remove the currently pre-placed tiles/words from the board.

Keep all existing board functionality, styling, validation, scoring, and interactions intact.

---

### 2. Add First Move / Second Move Selection

Add a simple choice for how I want to construct the test position:

- **First Move**
- **Second Move / Opponent**

This determines whether I am currently entering my opening move or entering the opponent's move.

Do not create a new game system around this. It is simply a way to tell the existing UI which side/move I am currently simulating.

---

### 3. Use the Existing Tile Selection

The existing tile-selection and **Random Tiles** functionality should be reused.

For the selected move/player, I should be able to:

- Choose specific tiles manually.
- Or use the existing Random Tiles functionality.

Then I can place those tiles on the existing board.

Do not rebuild the tile system if the functionality already exists.

---

### 4. Replenish Tiles

After placing a move, I need the ability to replenish the player's rack.

The replenishment UI should allow:

- Selecting specific replacement tiles.
- Or generating random replacement tiles.

The newly replenished tiles should become available in the existing rack for the next move.

The flow should therefore be:

**Select tiles → place move → replenish rack → select/place next move → replenish again**

This should work for both **First Move** and **Second Move / Opponent**.

---

### 5. Keep Board and Rack State Temporarily

Do not add persistence or a database.

For the current page/session:

- Placed board tiles remain on the board.
- Replenished rack tiles remain available.
- I can continue making moves and constructing a test position.
- Leaving the page can reset everything.

The state only needs to live in the existing frontend state.

---

### 6. Tile Bag — Keep It Backend-Ready

For now, keep tile-bag/replenishment logic **frontend-only and in-memory**.

However, isolate the tile-bag operations in one clearly identifiable module/function rather than scattering the logic across UI components.

The important requirement is:

> I should be able to replace the local tile-bag implementation with a real backend later without searching through the entire codebase.

Do **not** build the backend now.

Do **not** add API endpoints now.

Do **not** add persistence now.

Just keep the local tile-bag logic cleanly separated from the UI.

---

### 7. Do Not Change Existing Functionality Unnecessarily

This is an update to the existing Scrabble application.

Preserve:

- Existing board
- Existing rack
- Existing tile placement
- Existing validation
- Existing dictionary validation
- Existing scoring
- Existing Random Tiles functionality
- Existing UI/design

Only add or modify what is necessary for the flow above.

### Final Expected Flow

When I open the existing Scrabble UI:

**Empty board → choose First Move or Second Move → select/randomize tiles → place move → replenish tiles → continue placing moves**

The board should remain populated as I construct the test position.

No persistence is required.
No new sandbox architecture is required.
No backend is required yet.
