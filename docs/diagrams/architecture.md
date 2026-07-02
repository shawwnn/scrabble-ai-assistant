````md
# System Architecture Diagram

```mermaid
flowchart TD

subgraph Client Layer
A[React Native Mobile App]
B[Next.js Web App]
end

subgraph API Layer
C[Django REST API]
end

subgraph Business Logic Layer
D[Game Engine]
E[Move Validation Service]
F[AI Move Generator]
G[Dictionary Engine]
H[Score Calculator]
I[Tile Tracking Service]
end

subgraph Data Layer
J[(PostgreSQL Database)]
K[(Dictionary Dataset: TWL/CSW)]
end

subgraph Storage Models
L[Games]
M[Turns]
N[Board States]
O[Racks]
P[Tile Bags]
Q[Move History]
R[Suggestions]
end

A --> C
B --> C

C --> D

D --> E
D --> F
D --> H
D --> I

F --> G
G --> K

D --> J

J --> L
J --> M
J --> N
J --> O
J --> P
J --> Q
J --> R
````

## Data Flow

1. User opens mobile or web application

2. User creates a new game

3. API initializes:

   * Empty board
   * Player rack
   * Tile bag
   * Score data

4. User enters a move

5. Django API sends move to:

   * Move Validation Service
   * Score Calculator
   * Tile Tracker

6. AI Move Generator:

   * Reads board state
   * Reads player rack
   * Uses TWL/CSW dictionary
   * Computes possible moves
   * Returns Top 5 suggestions

7. Updated game state saved:

   * Turn history
   * Board state
   * Scores
   * Suggestions

8. Client updates UI

```
```
