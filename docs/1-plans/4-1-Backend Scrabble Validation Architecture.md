                 SCRABBLE MOVE
                       │
                       ▼
             ┌──────────────────┐
             │    rules.ts      │
             │                  │
             │ existing client  │
             │ behavior         │
             └────────┬─────────┘
                      │
                      +
                      │
             ┌────────▼─────────┐
             │ rulesComplete.ts │
             │                  │
             │ missing/explicit │
             │ Scrabble rules   │
             └────────┬─────────┘
                      │
                      ▼
              LEGAL STRUCTURE?
                      │
                      ▼
             ┌──────────────────┐
             │    words.ts      │
             │                  │
             │ What words were  │
             │ actually formed? │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ dictionary.ts    │
             │                  │
             │ Are those words  │
             │ legitimate?     │
             └──────────────────┘
