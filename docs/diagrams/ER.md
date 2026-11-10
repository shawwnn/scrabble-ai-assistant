erDiagram

    GAME {
        uuid id PK
        string dictionary_type
        datetime created_at
        string status
        int current_turn
    }

    PLAYER {
        uuid id PK
        uuid game_id FK
        string name
        int total_score
        int turn_order
    }

    TURN {
        uuid id PK
        uuid game_id FK
        uuid player_id FK
        int turn_number
        datetime created_at
    }

    BOARD_STATE {
        uuid id PK
        uuid turn_id FK
        json board_tiles
    }

    RACK {
        uuid id PK
        uuid player_id FK
        string tiles
    }

    TILE_BAG {
        uuid id PK
        uuid game_id FK
        string remaining_tiles
        int remaining_count
    }

    MOVE {
        uuid id PK
        uuid turn_id FK
        string word
        int score
        int start_row
        int start_col
        string direction
    }

    MOVE_SUGGESTION {
        uuid id PK
        uuid turn_id FK
        string suggested_word
        int score
        int rank
    }

    SCORE_HISTORY {
        uuid id PK
        uuid player_id FK
        uuid turn_id FK
        int score_before
        int score_after
    }

    GAME ||--o{ PLAYER : has
    GAME ||--o{ TURN : contains
    GAME ||--|| TILE_BAG : owns

    PLAYER ||--|| RACK : has
    PLAYER ||--o{ TURN : plays
    PLAYER ||--o{ SCORE_HISTORY : tracks

    TURN ||--|| BOARD_STATE : snapshots
    TURN ||--|| MOVE : records
    TURN ||--o{ MOVE_SUGGESTION : generates
    TURN ||--o{ SCORE_HISTORY : updates