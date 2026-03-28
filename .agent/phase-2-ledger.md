# Phase 2 Ledger

## What Was Built
GameState enum (IDLE/PLAYING/PAUSED/GAME_OVER), typed EventEmitter<T>, Vector2 class, and GameManager FSM with 6 transitions and pub/sub event emission. 58 tests cover all valid transitions, all invalid (silent no-op), toggle-pause, event payload correctness, and stubs.

## Key Decisions
| Decision | Choice | Reasoning |
|----------|--------|-----------|
| EventEmitter constraint | Record<string,any> | GameEvents has undefined values; unknown triggers TS2344 without index signature |
| endGame() from PAUSED | PAUSED→GAME_OVER valid | Prevents invisible game-over loss from external triggers |
| Vector2 type | Class with equals() | Matches spec; encapsulates equality |

## Architecture Changes
- GameEvents interface defined in GameState.ts (includes stateChange, gameOver, scoreUpdate, foodEaten)
- EventEmitter is the inter-module communication backbone

## Deviations

### Spec Divergences
- FSM diagram in architecture.md omits PAUSED→GAME_OVER. Added per eng review. Safer transition table.
- GameEvents includes scoreUpdate/foodEaten ahead of Phase 4 — defined now, consumed later.

### Stubs
- GameManager.getScore() returns 0 — wired to ScoreManager in Phase 5
- GameManager.update() body empty — populated in Phase 4
- GameManager.restartGame() has TODO comment for Phase 4 entity reset

### Test Deferrals
None.

## Patterns Established
- All test imports use @/ alias (enforced)
- EventEmitter generic constraint: `Record<string, any>` (not unknown)
- _transition() private method handles state mutation + event emission atomically
