Scrabble move-validation inspection — no implementation

Scope

Inspect only code/client/pages/Game.tsx, code/client/lib/game-data.ts, and code/client/components/ScrabbleBoard.tsx. Do not modify application files, design an API, add backend integration, or change validation logic.

Validation inputs

Game.tsx:14-17 owns const [board, setBoard] = useState<Record<string, BoardTile>>(boardFromSeed) and const [pending, setPending] = useState<Record<string, BoardTile>>({}).

game-data.ts:3 defines type BoardTile = { letter: string; points: number; pending?: boolean }.

Both records are sparse Record<string, BoardTile> maps keyed by coordinate strings such as "7,7", not 2D arrays. ScrabbleBoard.tsx renders 225 cells (15 × 15) and derives each row,col key.

Game.tsx:33 derives const validation = useMemo(() => validateMove(board, pending), [board, pending]).

placeTile (Game.tsx:39-55) creates pending entries { letter: tile.letter, points: tile.points, pending: true }, removes the selected Tile from currentRack, and clears selectedRackId.

movePendingTile (Game.tsx:57-70) moves the same BoardTile from pending[fromKey] to pending[toKey].

validateMove (game-data.ts:89) receives only board and pending; it does not receive the rack, tile IDs, score, opponent data, or route/game ID. It internally creates cells = { ...board, ...pending }, parses pending keys into { key, row, col }, checks orthogonal connection, one-direction placement, contiguity, generated words, and score.

Validation output

game-data.ts:60-65 defines:

export type MoveValidation = {
status: "unchanged" | "valid" | "invalid";
reason: string;
score: number;
words: string[];
};

Return branches in game-data.ts:90-136:

no pending tiles → unchanged, reason Place a tile to begin your move., score 0, words [];

disconnected → invalid, reason Your move must connect to an existing tile., score 0, words [];

mixed direction → invalid, reason New tiles must stay in one direction., score 0, words [];

gap → invalid, reason New tiles must form one contiguous line., score 0, words [];

no generated word → invalid, reason Your move must create at least one word., score 0, words [];

success → valid, reason ${words.size} word(s) formed., calculated score, and words: [...words].

Game.tsx uses status for submission guard (submitMove:72-79), status badge (113), board props (114), message styling (115), and Submit disabled state (118). It uses reason for feedback and the validation message (73, 115). It uses score to update the player score, show submit feedback, pass moveScore to the board, and display the validation message (76-77, 114-115). validation.words is not consumed by the current UI. ScrabbleBoard.tsx:12-20,53-62 receives only validationStatus and moveScore, applying status rings/borders to pending tiles and showing a score badge for a valid move.

Existing data flow

currentRack tile selection → placeTile(row, col) → pending: Record<string, BoardTile> update → useMemo(validateMove(board, pending)) → validation drives page status/message/Submit and board tile styling. Pending drag start stores draggedPendingKey; movePendingTile changes the pending coordinate and triggers the same derived validation. submitMove rejects non-valid results; for valid results it merges pending into board, clears pending, increments score by validation.score, and opens replenishment UI.

External-validation boundary (description only)

Based only on the existing validator signature, the minimum existing input data is the two sparse maps board: Record<string, BoardTile> and pending: Record<string, BoardTile>, including coordinate keys plus each tile's letter and points. The current validator does not read BoardTile.pending, though that property exists. The existing UI consumes status, reason, and score; the declared MoveValidation contract also includes words: string[], even though current UI code does not read it. Transport format, API shape, and any additional backend rules cannot be determined from these files and are intentionally not designed here.

Execution boundary

Return an inspection report only. Do not implement, redesign, create API contracts, or modify the existing validation.
