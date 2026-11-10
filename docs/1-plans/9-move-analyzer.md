Yes. I understand.

We're not rebuilding the existing project. We're leaving existing pages, components, and functionality untouched, even if incomplete.

We're adding a new, independent analyzer workflow.

### New Scrabble Analyzer workflow

```
1. User uploads Scrabble screenshot
          ↓
2. New Backend Upload Endpoint
          ↓
3. Gemini API (Image Recognition)
          ↓
4. Extract board tiles and coordinates
          ↓
5. Convert Gemini response into backend data
          ↓
6. Backend Scrabble Analyzer
          ↓
7. Load uploaded dictionary (CSW2024 / NWL2023)
          ↓
8. Calculate all valid possible moves
          ↓
9. Rank moves by highest score
          ↓
10. Return best move and score to frontend
```

### Responsibilities

| Component            | Responsibility                        |
| -------------------- | ------------------------------------- |
| Frontend             | Screenshot upload and results display |
| New backend endpoint | Receive and process screenshot        |
| Gemini API           | Recognize board tiles and coordinates |
| Backend algorithm    | Find valid moves and calculate scores |
| Dictionary           | Validate words                        |
| API response         | Return highest-scoring moves          |

### Important distinction

Gemini does not calculate the best Scrabble move.

Gemini only interprets the screenshot. Our backend performs the actual Scrabble computation using our dictionary and scoring rules.

We preserve the existing project and add only what's necessary for this workflow.

That's our agreed direction.
