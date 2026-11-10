# Agreed System Design — Backend ↔ Builder.io Frontend Integration

The goal is to connect the new backend functionality to the existing Builder.io frontend **without rewriting or duplicating the existing UI**. The integration should be thin, clearly separated, and easy to extend later.

```text
Backend
   ↓
shared/api.ts
   ↓
shared/integrations/
└── useMoveValidation.ts
   ↓
Game.tsx / ScrabbleBoard.tsx
   ↓
Existing Builder.io UI
```

## 1. `shared/api.ts` — Communication Layer

`shared/api.ts` is responsible only for communicating with the backend.

For example:

```text
Frontend → POST /api/validate-move → Backend
Backend → validation result → Frontend
```

It receives things such as:

```text
status
score
words
invalidWords
reason
```

It should **not decide how the UI looks**.

---

## 2. `shared/integrations/useMoveValidation.ts` — Custom Integration

This is the main **custom bridge** between the backend API and the existing frontend.

```text
shared/integrations/
└── useMoveValidation.ts
```

Its responsibility is to take the backend result and expose simple frontend state/behavior such as:

```tsx
const { validationStatus, moveScore, validateMove } = useMoveValidation();
```

The hook is **UI-agnostic**.

It does not contain JSX, board markup, colors, buttons, or Builder.io UI.

---

## 3. `Game.tsx` / `ScrabbleBoard.tsx` — Existing UI

These remain primarily responsible for the existing Builder.io interface.

Only the **minimum integration code** should be added.

Conceptually:

```tsx
const { validationStatus, moveScore, validateMove } = useMoveValidation();
```

Then the existing UI can use those values.

The goal is **not zero changes** to Builder.io code. The goal is to avoid putting backend-specific logic throughout the Builder-generated files.

---

## 4. No `shared/components/` for This Integration

We agreed **not to create a new shared UI/component layer just for this feature**.

That could unnecessarily compete with or duplicate the existing Builder.io components.

If a genuinely reusable UI component is needed later, that can be evaluated separately.

---

## Final Principle

```text
api.ts
→ How do we communicate with the backend?

useMoveValidation.ts
→ How do we connect that backend capability to the frontend?

Game.tsx / ScrabbleBoard.tsx
→ How does the existing UI use the result?
```

The architecture therefore keeps the **backend communication, integration logic, and UI responsibilities separate**, while keeping the changes to the Builder.io-generated frontend as small as practical.
