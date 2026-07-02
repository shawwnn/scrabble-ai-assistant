flowchart TD

A[Start App] --> B[Launch App]
B --> C[Main Menu]

C --> D[New Game]
C --> E[Resume Game]
C --> F[History]
C --> G[Settings]

D --> H[Select Dictionary<br/>TWL / CSW]
H --> I[Initialize Game]

I --> J[Initialize Empty Board]
I --> K[Initialize Tile Bag]
I --> L[Draw 7 Tiles]
I --> M[Player 1 Turn]

M --> N[Display Game Board]

N --> O[Player Actions]

O --> O1[Place Tiles]
O --> O2[Edit Move]
O --> O3[Shuffle Rack]
O --> O4[Pass Turn]
O --> O5[Request AI Suggestions]
O --> O6[Undo Move]

O --> P{Submit Move?}

P -->|No| O
P -->|Yes| Q[Validate Move]

Q --> R{Move Valid?}

R -->|No| O

R -->|Yes| S[Apply Move]

S --> T[Calculate Score]
T --> U[Update Board State]
U --> V[Remove Used Tiles]
V --> W[Draw New Tiles]
W --> X[Update Rack]
X --> Y[Update Tile Bag]

Y --> Z[Generate Top 5 AI Suggestions]

Z --> AA[Save Turn]
AA --> AB[Save History]
AB --> AC[Switch Player]

AC --> AD{Game Over?}

AD -->|No| N

AD -->|Yes| AE[Show Final Scores]
AE --> AF[Game Summary]
AF --> AG[Winner Display]
AG --> AH[Return to Main Menu]