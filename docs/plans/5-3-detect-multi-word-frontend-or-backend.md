FRONTEND
↓
Send:

- current board
- newly placed/pending tiles
  ↓
  BACKEND
  ↓
  Determine:
- affected coordinates
- main word
- cross-words
- connected tiles
- gaps/placement rules
- dictionary validity
  ↓
  Return:
- VALID / INVALID
- affectedKeys
- words created
- eventually score
  ↓
  FRONTEND
  ↓
  Use affectedKeys + validation result
  to render green/red borders

==
definition of terms:

pendingKeys
= tiles the player has placed during the current move

affectedKeys
= existing + pending tiles that belong to the words affected
by the current move

boardState
= the actual complete board, including committed tiles
and pending tiles
