# Phase 4 Ledger

## What Was Built
Three core domain objects (Snake, Board, Food) and GameManager.update() wiring. Snake maintains a segment queue with 180° reversal guard and a boolean grow flag. Board checks wall + self-collision, skipping segments[0] (the newly-moved head) to prevent a trivial always-true collision bug. Food uses an injected RNG and available[] array algorithm for deterministic testability. GameManager gained queueDirection(), getSnake(), getFood(), and a populated restartGame(). 62 new tests; 135 total.

## Key Decisions
| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Self-collision skip-head | Skip segments[0] | move() prepends new head before collision check — including head would always fire |
| segments getter | Live readonly reference | No defensive copy; TypeScript readonly overlay sufficient for this design |
| Board-full constructor fallback | Fallback (0,0) | Win condition is Phase 7+ stub; board-full at construction is impossible in normal play |
| _snake/_food mutability | private non-readonly | restartGame() must reassign both; _board stays readonly (dimensions never change) |
| Food RNG | Constructor-injected | Enables deterministic tests without mocking global Math.random |

## Architecture Changes
- `src/game/Snake.ts` — NEW. Segment queue, direction constants, grow flag.
- `src/game/Board.ts` — NEW. Wall + self-collision, 20×20 default.
- `src/game/Food.ts` — NEW. Available[] algorithm, injected RNG.
- `src/game/GameManager.ts` — Entities added, update() wired, accessors added, restartGame() populated.

## Deviations

### Spec Divergences
None — all interfaces implemented exactly as specified in phase-4-interfaces.md.

### Stubs
- `getScore()` returns 0 — ScoreManager wired in Phase 5.
- Speed tier in GameLoop always returns 150ms — activated in Phase 5.
- `Food` board-full fallback to (0,0) — win condition handling deferred to Phase 7+.

### Test Deferrals
None.

### Deferred Tasks
- ScoreManager (Phase 5)
- Speed tier activation (Phase 5)
- Board-full win condition handling (Phase 7+)

## Patterns Established
- RNG injection pattern: `rng?: () => number = Math.random` — use in any class needing testable randomness
- Entity accessor pattern: `getSnake()` / `getFood()` expose domain state for the renderer (Phase 6+)
- `noUncheckedIndexedAccess` requires `!` on indexed array access in tests
