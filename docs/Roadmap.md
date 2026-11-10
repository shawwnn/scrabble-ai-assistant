# MVP-Roadmap.md

# Scrabble AI Assistant — MVP Roadmap

## Project Goal

Build an AI-assisted Scrabble companion that mirrors real-world gameplay by allowing users to manually maintain game state while AI computes the top move suggestions.

The MVP focuses on accurate state management and fast move generation rather than online multiplayer features.

Target MVP duration:

8–10 weeks

---

# Phase 1 — Foundation Setup

Estimated: Week 1

## Goals

Create project structure and establish core infrastructure.

## Tasks

Project setup:

* Create Git repository
* Setup backend
* Setup frontend web
* Setup mobile app
* Create docs folder

Backend setup:

* Django REST Framework
* PostgreSQL connection
* Environment configuration
* API base structure

Frontend setup:

* Next.js initialization
* React Native initialization
* Shared component structure

Documentation:

* README.md
* PRD.md
* Architecture.md
* Database Schema.md
* API Specification.md

Deliverables:

✓ Working project skeleton

✓ Database connection

✓ Initial API server

---

# Phase 2 — Dictionary Engine

Estimated: Week 2

## Goals

Import and support Scrabble dictionaries.

## Tasks

Dictionary processing:

* Import TWL dictionary
* Import CSW dictionary
* Normalize words
* Remove duplicates
* Generate searchable structure

Optimization:

* Trie data structure
* Fast lookup
* Prefix searching

Settings:

* Dictionary selection:

  * TWL
  * CSW

Deliverables:

✓ Dictionary database populated

✓ Word validation API

✓ Dictionary selector

---

# Phase 3 — Core Game State System

Estimated: Week 3

## Goals

Build the game state engine.

## Tasks

Database models:

Game

Turn

BoardState

Rack

TileBag

MoveHistory

ScoreHistory

Features:

* Create game
* Initialize board
* Initialize racks
* Initialize tile bag
* Track scores
* Save turns

Deliverables:

✓ Persistent game state

✓ Turn tracking

✓ Score tracking

---

# Phase 4 — Board UI

Estimated: Week 4

## Goals

Build interactive board interface.

## Tasks

Board:

* 15×15 Scrabble grid
* Premium squares
* Tile placement
* Tile movement
* Remove tiles

Player controls:

* Rack display
* Drag-and-drop
* Undo placement
* Clear placement

Deliverables:

✓ Functional board UI

✓ Tile movement system

✓ Rack interaction

---

# Phase 5 — Move Validation Engine

Estimated: Week 5

## Goals

Validate player moves.

## Tasks

Validation rules:

* Connected words
* First move center requirement
* Dictionary validity
* Tile ownership
* Cross-word checking
* Direction validation

Scoring:

* Letter multipliers
* Word multipliers
* Bingo bonus
* Cross-word score calculation

Deliverables:

✓ Accurate move validation

✓ Score calculation engine

---

# Phase 6 — AI Suggestion Engine

Estimated: Weeks 6–7

## Goals

Generate top move suggestions.

## Tasks

Input:

* Board state
* Current rack
* Dictionary
* Tile bag

AI processing:

Generate all legal moves

Calculate:

* Immediate score
* Position
* Word value

Rank:

Top 5 moves

Return:

* Word
* Coordinates
* Direction
* Score

Deliverables:

✓ Top 5 move generation

✓ Ranked suggestions

✓ Fast response times

---

# Phase 7 — Turn Management + Tile Tracking

Estimated: Week 8

## Goals

Simulate real gameplay flow.

## Tasks

Turn flow:

Player move

↓

Move validation

↓

Remove used tiles

↓

Prompt user for drawn tiles

↓

Update rack

↓

Update tile bag

↓

Save turn

↓

Switch player

Features:

* Manual tile draw entry
* Remaining tile count
* Tile probability tracking

Deliverables:

✓ Complete game cycle

✓ Accurate tile tracking

---

# Phase 8 — History + Replay

Estimated: Week 9

## Goals

Allow users to review previous games.

## Tasks

Features:

* Move history
* Score history
* Replay mode
* Step-by-step replay
* Turn navigation

Deliverables:

✓ Replay functionality

✓ Historical move data

---

# Phase 9 — MVP Polish

Estimated: Week 10

## Goals

Prepare MVP release.

## Tasks

Performance:

* API optimization
* Query optimization
* Caching

UX:

* Loading states
* Error handling
* Empty states
* Mobile responsiveness

Testing:

* Validation tests
* AI tests
* API tests
* UI tests

Deliverables:

✓ Stable MVP build

✓ Release candidate

---

# Post-MVP (Future Features)

Version 2:

* User accounts
* Cloud save
* Multiplayer online
* Game sharing
* Advanced AI heuristics
* Endgame solver
* Win probability estimation
* Tournament mode
* Voice input
* OCR board scanning using camera
* Analytics dashboard

---

# Final MVP Definition

Included:

✓ Local two-player play

✓ TWL dictionary

✓ CSW dictionary

✓ Drag-and-drop board

✓ AI top 5 suggestions

✓ Move validation

✓ Score calculation

✓ Tile tracking

✓ Replay

✓ History

Not Included:

✗ Accounts

✗ Online multiplayer

✗ Chat

✗ Social features

✗ Advanced strategic AI

✗ Camera scanning

✗ Cloud synchronization

---

# Success Metrics

Technical:

* Suggestion generation under 2 seconds
* Move validation under 500ms
* Zero game-state corruption

User:

* Complete game without bugs
* Suggestion accuracy above 95%
* Replay works across entire game history
