# Phase 5 Ledger

## What Was Built
ScoreManager class with localStorage persistence, SPEED_SCHEDULE speed tiers (50/100/150/200pts → 130/110/90/75ms), add()/reset()/clearHighScore()/getTickInterval(). GameManager wired: getScore() delegates to scoreManager, getTickInterval() proxy added, scoreManager.add(10) called on food eat with scoreUpdate event, scoreManager.reset() in restartGame(). GameLoop migrated from local intervalForScore() (wrong thresholds, 70ms min) to manager.getTickInterval() delegation. 34 new tests; 169 total.

## Key Decisions
| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Speed schedule ownership | ScoreManager owns SPEED_SCHEDULE | Cohesion: ScoreManager knows score, should own what score means for speed |
| Event emission | GameManager emits scoreUpdate | Keeps all GameEvents through one emitter; ScoreManager stays pure data class |
| Delegation path | GameManager.getTickInterval() proxy | GameLoop already talks to GameManager; avoids leaking ScoreManager through two layers |
| getHighScore() on GameManager | Deferred to Phase 6 | No Phase 5 consumer needs it; renderer will request it |
| add() return value | boolean (highScore updated?) | Informational, zero cost, allows caller decisions |

## Architecture Changes
- `src/game/ScoreManager.ts` — NEW. SPEED_SCHEDULE, localStorage, all scoring methods.
- `src/game/GameManager.ts` — getScore() real; getTickInterval() proxy; scoreUpdate event; restartGame resets score.
- `src/game/GameLoop.ts` — intervalForScore() deleted; delegates to manager.getTickInterval().

## Deviations

### Spec Divergences
- Spec said "GameLoop reads ScoreManager.getTickInterval()". Implemented as GameLoop → GameManager.getTickInterval() → ScoreManager.getTickInterval(). Functionally equivalent; preserves GameLoop's single dependency on GameManager. Spec not updated (semantically correct).

### Deferred Tasks
- `getHighScore()` not yet exposed on GameManager — Phase 6 renderer will need it. Add in Phase 6.

### Stubs
None — all Phase 4 stubs (getScore()=0, speed=150ms always) fully activated.

### Test Deferrals
None.

## Patterns Established
- ScoreManager pattern: pure data class, no EventEmitter, caller (GameManager) owns event emission
- localStorage pattern: `localStorage.clear()` in `beforeEach` is mandatory for any test touching ScoreManager; happy-dom localStorage persists across test cases within a run
- `addN(sm, n)` helper in tests: calls `add(1)` n times to reach exact score for bracket boundary testing
