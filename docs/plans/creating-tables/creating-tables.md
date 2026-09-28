Sure — here's the clean Markdown version you can keep as your **Supabase Step 4 reference**.

# Supabase Tables

## 1. `players`

| Field        | Type          | Primary Key | Default             |
| ------------ | ------------- | ----------: | ------------------- |
| `id`         | `uuid`        |          ✅ | `gen_random_uuid()` |
| `name`       | `text`        |          ❌ | —                   |
| `created_at` | `timestamptz` |          ❌ | `now()`             |

---

## 2. `games`

| Field            | Type          | Primary Key | Default             |
| ---------------- | ------------- | ----------: | ------------------- |
| `id`             | `uuid`        |          ✅ | `gen_random_uuid()` |
| `board`          | `jsonb`       |          ❌ | `'{}'`              |
| `bag`            | `jsonb`       |          ❌ | `'[]'`              |
| `dictionary`     | `text`        |          ❌ | `'UK'`              |
| `current_player` | `uuid`        |          ❌ | —                   |
| `status`         | `text`        |          ❌ | `'active'`          |
| `created_at`     | `timestamptz` |          ❌ | `now()`             |

---

## 3. `game_players`

| Field        | Type      | Primary Key | Default             |
| ------------ | --------- | ----------: | ------------------- |
| `id`         | `uuid`    |          ✅ | `gen_random_uuid()` |
| `game_id`    | `uuid`    |          ❌ | —                   |
| `player_id`  | `uuid`    |          ❌ | —                   |
| `score`      | `integer` |          ❌ | `0`                 |
| `rack`       | `jsonb`   |          ❌ | `'[]'`              |
| `turn_order` | `integer` |          ❌ | —                   |

---

## 4. `turns`

| Field         | Type          | Primary Key | Default             |
| ------------- | ------------- | ----------: | ------------------- |
| `id`          | `uuid`        |          ✅ | `gen_random_uuid()` |
| `game_id`     | `uuid`        |          ❌ | —                   |
| `player_id`   | `uuid`        |          ❌ | —                   |
| `move`        | `jsonb`       |          ❌ | `'{}'`              |
| `words`       | `jsonb`       |          ❌ | `'[]'`              |
| `score`       | `integer`     |          ❌ | `0`                 |
| `rack_before` | `jsonb`       |          ❌ | `'[]'`              |
| `rack_after`  | `jsonb`       |          ❌ | `'[]'`              |
| `board_after` | `jsonb`       |          ❌ | `'{}'`              |
| `created_at`  | `timestamptz` |          ❌ | `now()`             |

---

## Relationships

```text
players
   │
   │ player_id
   ▼
game_players
   │
   │ game_id
   ▼
games
   │
   │ game_id
   ▼
turns
```

### Primary keys

Only the `id` field in each table is the primary key:

```text
players.id
games.id
game_players.id
turns.id
```

### Foreign keys

```text
game_players.player_id → players.id
game_players.game_id   → games.id

games.current_player   → players.id

turns.game_id          → games.id
turns.player_id        → players.id
```

This is the **4-table structure** we're using for the Scrabble persistence MVP.
