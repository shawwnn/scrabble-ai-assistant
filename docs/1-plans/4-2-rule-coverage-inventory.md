legend:
rules.ts
= what I inherited/audited from the frontend

ruleComplete.ts
= what I must add to make the rules complete

words.ts
= determine what words the move created

dictionary.ts
= determine whether those words are valid

| Rule                    | Frontend has it? (`rules.ts`) | Additional backend rule needed? (`rulesComplete.ts`) | Backend verified? | Responsible layer  |
| ----------------------- | ----------------------------- | ---------------------------------------------------- | ----------------- | ------------------ |
| Board bounds            | ✅                            | No                                                   | ⬜                | `rules.ts`         |
| Straight-line placement | ✅                            | No                                                   | ⬜                | `rules.ts`         |
| No gaps                 | ?                             | Yes                                                  | ⬜                | `rulesComplete.ts` |
| Touch existing board    | ✅                            | No                                                   | ⬜                | `rules.ts`         |
| First move center       | ?                             | Yes                                                  | ⬜                | `rulesComplete.ts` |
| At least one tile       | ?                             | Yes                                                  | ⬜                | `rulesComplete.ts` |
| Main word extraction    | Partial                       | Yes                                                  | ⬜                | `words.ts`         |
| Cross-word extraction   | Partial                       | Yes                                                  | ⬜                | `words.ts`         |
| Dictionary membership   | ❌                            | Yes                                                  | ⬜                | `dictionary.ts`    |
