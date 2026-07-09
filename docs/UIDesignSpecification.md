# Scrabble AI MVP Design Specification

> **Goal:** Build a modern, AI-powered Scrabble web application inspired by the mobile Scrabble app. This document defines the **Minimum Viable Product (MVP)** to keep development focused and avoid unnecessary features.

---

# 🎯 MVP Goal

The MVP should allow a user to:

```text
Open Website
      ↓
Start New Game
      ↓
Play Scrabble
      ↓
Finish Game
      ↓
View Match History
```

Nothing more.

---

# 📄 Pages

Only **4 core pages** are required for the MVP.

## 1. Home

Purpose

- Start New Game
- Continue Current Game
- View Recent Games

### Components

- Header
- Sidebar (desktop)
- Welcome Card
- New Game Button
- Continue Game Card
- Recent Games List

---

## 2. Game

This is the primary page of the application.

### Components

- Header
- Player Scoreboard
- Scrabble Board
- Letter Rack
- Submit Button
- Shuffle Button
- Swap Button
- Pass Button
- AI Assistant Panel

---

## 3. Match History

### Components

- Match Table
- Search (optional)
- Filters (future)

Columns

- Opponent
- Result
- Score
- Date

---

## 4. Settings

### Components

- Theme Toggle
- Dictionary Selection
- Logout

---

# ❌ Features Removed from MVP

These can be added in future versions.

- Adventure Mode
- Puzzle Mode
- Social
- Friends
- Notifications
- Chat
- Leaderboards
- Shop
- Coins
- Daily Rewards
- Achievements
- Avatar Customization
- Country Flags
- Promotions
- Inbox
- Events
- Online Presence

---

# 🧩 Core Components

These components should be reusable throughout the application.

## Layout

- App Layout
- Sidebar
- Header
- Footer (optional)

## UI

- Button
- Card
- Modal
- Avatar
- Badge
- Input
- Table

## Game

- Scrabble Board
- Board Cell
- Letter Tile
- Tile Rack
- Scoreboard
- Player Card

---

# 🎨 Design Tokens

## Colors

```css
:root{

    --primary:#0D8CA0;
    --success:#45B649;
    --danger:#D64545;
    --warning:#F3B63A;

    --background:#F8F9FB;
    --surface:#FFFFFF;
    --surface-secondary:#F2F4F8;

    --board-background:#ECEFF8;

    --triple-word:#B03052;
    --double-word:#E8AE39;
    --triple-letter:#2386D1;
    --double-letter:#59B6F5;

    --text-primary:#222222;
    --text-secondary:#666666;
    --text-light:#AAAAAA;

}
```

---

## Typography

Suggested fonts

- Inter
- Roboto

Font scale

| Style | Size |
|--------|------|
| H1 | 32px |
| H2 | 24px |
| H3 | 20px |
| Body | 16px |
| Small | 14px |
| Caption | 12px |

---

## Border Radius

- 4px
- 8px
- 12px
- 16px
- 24px
- 9999px (pill)

---

## Spacing Scale

- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 48

---

# 📦 React Component Structure

```
App
│
├── Layout
│   ├── Sidebar
│   ├── Header
│   └── Content
│
├── Pages
│   ├── Home
│   ├── Game
│   ├── History
│   └── Settings
│
└── Components
    ├── Button
    ├── Card
    ├── Modal
    ├── Avatar
    ├── Badge
    ├── Input
    ├── Board
    ├── BoardCell
    ├── Tile
    ├── Rack
    ├── PlayerCard
    └── HistoryTable
```

---

# 📁 Suggested Folder Structure

```
src/

components/
    Avatar/
    Badge/
    Board/
    BoardCell/
    Button/
    Card/
    Header/
    HistoryTable/
    Input/
    Layout/
    Modal/
    PlayerCard/
    Rack/
    Sidebar/
    Tile/

pages/
    Home/
    Game/
    History/
    Settings/

hooks/

context/

services/

styles/

assets/
    icons/
    images/
```

---

# 🌐 Django API Endpoints

Only the essentials for MVP.

```
POST    /game
GET     /game/:id
POST    /move
POST    /ai-move
GET     /history
```

---

# 🖥 Desktop Layout

Unlike the mobile application, the web version should use a desktop-first layout.

```
+-------------------------------------------------------------+
| Sidebar | Header                                            |
|         +---------------------------------------------------+
|         | Opponent Info                                     |
|         |---------------------------------------------------|
|         |                                                   |
|         |               Scrabble Board                      |
|         |                                                   |
|         |---------------------------------------------------|
|         | Tile Rack                                         |
|         |---------------------------------------------------|
|         | Toolbar | AI Assistant | Move History             |
+-------------------------------------------------------------+
```

---

# 🚀 Development Roadmap

## Phase 1 — Design (Figma)

- Design Tokens
- Components
- Home Page
- Game Page
- Match History
- Settings

---

## Phase 2 — Frontend

- React Setup
- Routing
- Layout
- Responsive Design
- Component Library

---

## Phase 3 — Gameplay

- Scrabble Board
- Tile Placement
- Letter Rack
- Score Calculation
- Turn System

---

## Phase 4 — Backend & AI

- Django API
- Game State
- AI Move Generation
- Save Match History

---

# 📌 Future Features (Post-MVP)

These features should only be implemented after the MVP is complete.

- Multiplayer
- Friends
- Chat
- Leaderboards
- Daily Challenges
- Achievements
- Tournament Mode
- User Profiles
- AI Difficulty Levels
- Puzzle Mode
- Adventure Mode
- Notifications
- Themes
- Replay System
- Statistics Dashboard

---

# 💡 MVP Philosophy

> **Focus on building a complete, playable Scrabble AI experience instead of cloning every feature from the original mobile app.**

The original application is designed around player retention (social features, events, rewards, etc.). This project's unique value is **AI-assisted Scrabble gameplay**, so the MVP should prioritize:

- A polished game board
- A clean and intuitive interface
- Match history
- AI move suggestions
- Responsive web design
- Maintainable React components
- Django-powered backend

Everything else can be added incrementally after the core experience is finished.