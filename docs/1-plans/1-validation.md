# Scrabble Backend Dictionary Validation Plan

## Goal

Keep the Builder.io-generated frontend intact while adding backend-authoritative Scrabble word validation.

The frontend provides immediate/provisional feedback. The backend performs the authoritative validation using a local dictionary.

## Architecture

User places/moves tile
↓
Existing React frontend validation
↓
🟢 Immediate provisional state
↓
API request: POST /api/moves/validate
↓
Backend validateMove()
↓
Determine formed word(s)
↓
Local dictionary lookup
↓
VALID / INVALID
↓
API response
↓
React updates existing validation state
↓
VALID → 🟢 stays green
INVALID → 🔴 entire affected word becomes red

## Responsibilities

### Frontend — Builder.io generated

- Keep existing UI and tile-placement behavior.
- Keep existing frontend validation.
- Trigger backend validation after a tile placement/movement.
- Receive the backend result.
- Update the existing validation state/UI.
- Do not rebuild the frontend architecture.

### Backend — Our code

- Own authoritative Scrabble validation.
- Implement `validateMove()`.
- Determine words formed by the move.
- Check words against the local dictionary.
- Return `VALID` or `INVALID`.
- Eventually handle authoritative scoring and other Scrabble rules.

### Dictionary

- Download an appropriate Scrabble dictionary.
- Store it inside the backend project.
- Load it into memory for fast lookup.
- Dictionary remains an internal backend dependency.
- Frontend never accesses the dictionary directly.

## Validation Behavior

Frontend:

    Tile placed
        ↓
    🟢 provisional

Backend:

    Validate move
        ↓
    Dictionary lookup
        ↓
    VALID → remain 🟢
    INVALID → 🔴 entire affected word

A backend response arriving later is acceptable:

    100 ms → 🟢 provisional
    400 ms → backend says INVALID
             ↓
             🔴

This is normal asynchronous behavior and does not require WebSockets or another complex synchronization system.

## API

Initial endpoint:

    POST /api/moves/validate

Conceptually:

    React
      ↓
    board + pending move
      ↓
    backend
      ↓
    validation result
      ↓
    React

The exact request/response structure will be defined after inspecting the current frontend data structures.

## Implementation Order

1. Keep Builder.io frontend intact.
2. Identify the existing tile-placement/state-change point.
3. Connect that event to `/api/moves/validate`.
4. Add the dictionary to the backend.
5. Implement backend `validateMove()`.
6. Implement dictionary lookup.
7. Return `VALID` / `INVALID`.
8. Connect the response to the existing frontend validation state.
9. Invalid word → entire affected word becomes red.
10. Test rapid tile placement and asynchronous responses.

## Core Principle

Frontend = immediate provisional feedback.

Backend = authoritative Scrabble validation.

Dictionary = internal backend dependency.

No frontend rewrite.
No WebSockets.
No separate dictionary API.
No unnecessary architecture.
