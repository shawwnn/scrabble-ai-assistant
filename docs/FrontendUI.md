# 🧩 Scrabble AI MVP Frontend Roadmap

This document outlines the planned frontend screens and core features for the **Scrabble AI** MVP.

---

# 🏠 1. Home

**Purpose:** Landing page for the application.

## Features
- Hero section
- Introduction to Scrabble AI Assistant
- Start New Game
- Continue Ongoing Game

---

# 🎮 2. New Game

**Purpose:** Configure a new Scrabble match.

## Features
- Enter Player 1 name
- Enter Player 2 name
- Choose who goes first
- Select the initial 7 rack tiles
- Start Game

---

# 📂 3. Ongoing Games

**Purpose:** Resume previously saved matches.

## Features
- List of saved games
- Resume selected game
- Automatically load the selected game's board and state

---

# ♟️ 4. Game Screen

**Purpose:** Main gameplay interface.

## Board
- Empty board for new games
- Load board for ongoing games

## Player Information
- Current player's rack
- Current turn indicator
- Scoreboard

## Tile Bag
- Remaining tile count
- Remaining letter distribution
- Visible (known) letters
- Unseen (unknown) letters

## Gameplay Actions
- Pass (confirmation modal)
- Exchange Tiles (tile selection modal)
- Save Game
- End Game

## 🤖 AI Assistant (Flagship Feature)
- Show Top 3–5 best move suggestions
- Suggested word
- Estimated score
- Placement preview
- Analyze the current board and player's rack

---

# 📜 5. Match History

**Purpose:** Review completed matches.

## Features
- Completed games list
- Winner
- Final scores
- Date played
- View match details

---

# ⚙️ 6. Settings

**Purpose:** Customize the application.

## Features
- Dictionary selection (e.g., TWL, CSW)
- Light/Dark theme toggle

---

# 🚀 MVP User Flow

```text
Home
   │
   ├── New Game
   │       │
   │       ▼
   │   Game Screen
   │
   └── Ongoing Games
           │
           ▼
      Game Screen
           │
           ▼
     Match History

Settings (Accessible Anytime)
```

---

## 🎯 MVP Goal

Build a functional Scrabble AI assistant that allows users to:

- Create and resume games
- Manage gameplay efficiently
- Track the tile bag and game state
- Receive AI-powered move suggestions
- Review completed matches
- Customize gameplay preferences