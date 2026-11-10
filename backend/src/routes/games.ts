import { Router } from "express";
import { supabase } from "../db/supabase.js";
import { checkWords, type DictionaryName } from "../game/dictionary.js";
import { validateMove, type Board, type BoardTile } from "../game/rules.js";

const router = Router();

type RackTile = { id: string; letter: string; points: number; wildcard?: boolean };
type GameRow = { id: string; status: string; dictionary: string; current_player_id: string | null; board: Board; bag: RackTile[] };
type GamePlayerRow = { player_id: string; score: number; rack: RackTile[]; turn_order: number };

const dictionaryFor = (dictionary: string): DictionaryName =>
  dictionary === "TWL" || dictionary === "US" ? "US" : "UK";
const keyFor = (row: number, col: number) => `${row},${col}`;
const isRackTile = (value: unknown): value is RackTile => {
  if (!value || typeof value !== "object") return false;
  const tile = value as Record<string, unknown>;
  return typeof tile.id === "string" && typeof tile.letter === "string";
};

async function loadGame(gameId: string) {
  const { data: gameData, error: gameError } = await supabase
    .from("games")
    .select("id,status,dictionary,current_player_id,board,bag")
    .eq("id", gameId)
    .maybeSingle();
  if (gameError) throw gameError;
  if (!gameData) return null;
  const game = gameData as GameRow;

  const { data: membershipData, error: membershipError } = await supabase
    .from("game_players")
    .select("player_id,score,rack,turn_order")
    .eq("game_id", gameId)
    .order("turn_order");
  if (membershipError) throw membershipError;
  const memberships = (membershipData ?? []) as GamePlayerRow[];
  const playerIds = memberships.map(({ player_id }) => player_id);
  const names = new Map<string, string>();
  if (playerIds.length) {
    const { data: players, error: playersError } = await supabase.from("players").select("id,name").in("id", playerIds);
    if (playersError) throw playersError;
    for (const player of players ?? []) names.set(player.id as string, player.name as string);
  }

  const { data: turns, error: turnsError } = await supabase
    .from("turns")
    .select("id,player_id,turn_number,move,words,score,created_at")
    .eq("game_id", gameId)
    .order("turn_number", { ascending: false })
    .limit(20);
  if (turnsError) throw turnsError;
  const bag = Array.isArray(game.bag) ? game.bag.filter(isRackTile) : [];

  return {
    id: game.id,
    status: game.status,
    dictionary: game.dictionary,
    currentPlayerId: game.current_player_id,
    board: game.board ?? {},
    bagCount: bag.length,
    players: memberships.map((membership) => ({
      id: membership.player_id,
      name: names.get(membership.player_id) ?? "Unknown player",
      score: membership.score,
      rack: Array.isArray(membership.rack) ? membership.rack.filter(isRackTile) : [],
      turnOrder: membership.turn_order,
    })),
    turns: (turns ?? []).map((turn) => ({
      id: turn.id,
      playerId: turn.player_id,
      playerName: names.get(turn.player_id) ?? "Unknown player",
      turnNumber: turn.turn_number,
      move: turn.move,
      words: Array.isArray(turn.words) ? turn.words : [],
      score: turn.score,
      createdAt: turn.created_at,
    })),
  };
}

router.get("/:gameId", async (req, res) => {
  try {
    const game = await loadGame(req.params.gameId);
    return game ? res.json(game) : res.status(404).json({ error: "Game not found." });
  } catch (error) {
    console.error("Unable to load game", error);
    return res.status(500).json({ error: "Unable to load game." });
  }
});

router.post("/:gameId/moves", async (req, res) => {
  try {
    const game = await loadGame(req.params.gameId);
    if (!game) return res.status(404).json({ error: "Game not found." });
    if (game.status !== "active") return res.status(409).json({ error: "This game is not active." });

    const { playerId, placements } = req.body as { playerId?: string; placements?: Array<{ row: number; col: number; tileId: string; letter: string }> };
    if (!playerId || !Array.isArray(placements) || !placements.length) return res.status(422).json({ error: "A player and at least one placement are required." });
    if (game.currentPlayerId !== playerId) return res.status(409).json({ error: "It is not this player's turn." });
    const player = game.players.find((candidate) => candidate.id === playerId);
    if (!player) return res.status(403).json({ error: "Player is not in this game." });

    const usedTileIds = new Set<string>();
    const pending: Board = {};
    for (const placement of placements) {
      if (!Number.isInteger(placement.row) || !Number.isInteger(placement.col) || placement.row < 0 || placement.row > 14 || placement.col < 0 || placement.col > 14) return res.status(422).json({ error: "A placement is outside the board." });
      const key = keyFor(placement.row, placement.col);
      const rackTile = player.rack.find((tile) => tile.id === placement.tileId);
      if (!rackTile || usedTileIds.has(rackTile.id)) return res.status(422).json({ error: "A submitted tile is not available in the player's rack." });
      if (game.board[key] || pending[key]) return res.status(422).json({ error: "A submitted square is already occupied." });
      const letter = String(placement.letter ?? "").toUpperCase();
      if (!/^[A-Z]$/.test(letter) || (!rackTile.wildcard && letter !== rackTile.letter)) return res.status(422).json({ error: "A submitted tile letter is invalid." });
      usedTileIds.add(rackTile.id);
      pending[key] = { letter, points: rackTile.wildcard ? 0 : rackTile.points, pending: true } as BoardTile;
    }

    const validation = validateMove(game.board, pending);
    if (validation.status !== "valid") return res.status(422).json({ error: validation.reason, validation });
    const dictionary = checkWords(dictionaryFor(game.dictionary), validation.words);
    if (!dictionary.valid) return res.status(422).json({ error: `Some words are not valid: ${dictionary.invalidWords.join(", ")}.` });

    const { data: gameState, error: gameStateError } = await supabase.from("games").select("bag").eq("id", game.id).single();
    if (gameStateError) throw gameStateError;
    const bag = Array.isArray(gameState.bag) ? (gameState.bag as RackTile[]).filter(isRackTile) : [];
    const drawn = bag.slice(0, usedTileIds.size);
    const rackAfter = [...player.rack.filter((tile) => !usedTileIds.has(tile.id)), ...drawn];
    const boardAfter = { ...game.board, ...pending };
    const nextPlayer = game.players.find((candidate) => candidate.turnOrder !== player.turnOrder) ?? player;
    const turnNumber = (game.turns[0]?.turnNumber ?? 0) + 1;

    const { error: gameUpdateError } = await supabase.from("games").update({ board: boardAfter, bag: bag.slice(drawn.length), current_player_id: nextPlayer.id, updated_at: new Date().toISOString() }).eq("id", game.id);
    if (gameUpdateError) throw gameUpdateError;
    const { error: playerUpdateError } = await supabase.from("game_players").update({ rack: rackAfter, score: player.score + validation.score }).eq("game_id", game.id).eq("player_id", player.id);
    if (playerUpdateError) throw playerUpdateError;
    const { error: turnError } = await supabase.from("turns").insert({ game_id: game.id, player_id: player.id, turn_number: turnNumber, move: placements, words: validation.words, score: validation.score, rack_before: player.rack, rack_after: rackAfter, board_after: boardAfter });
    if (turnError) throw turnError;
    return res.json(await loadGame(game.id));
  } catch (error) {
    console.error("Unable to submit move", error);
    return res.status(500).json({ error: "Unable to submit move." });
  }
});

export default router;
