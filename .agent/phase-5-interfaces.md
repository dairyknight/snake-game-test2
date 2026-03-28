# Phase 5 — Scoring & Difficulty: Public Interfaces

## 3a. Public Interfaces

### `src/game/ScoreManager.ts` — NEW FILE (full interface)

```typescript
const STORAGE_KEY = 'snake_high_score';

// Speed schedule — score bracket → tick interval (ms)
// Replaces the module-level intervalForScore() in GameLoop.ts
const SPEED_SCHEDULE: Array<{ threshold: number; interval: number }> = [
  { threshold: 200, interval: 75 },
  { threshold: 150, interval: 90 },
  { threshold: 100, interval: 110 },
  { threshold: 50,  interval: 130 },
  { threshold: 0,   interval: 150 },
];

export class ScoreManager {
  private _currentScore = 0;
  private _highScore: number;

  constructor() {
    // Read persisted high score from localStorage on construction
    const stored = localStorage.getItem(STORAGE_KEY);
    this._highScore = stored !== null ? parseInt(stored, 10) : 0;
  }

  get currentScore(): number { return this._currentScore; }
  get highScore(): number { return this._highScore; }

  /**
   * Increment score by `points`. Update highScore if exceeded.
   * Does NOT emit events — caller (GameManager) handles emission.
   * Returns true if highScore was updated (useful for caller logic).
   */
  add(points: number): boolean {
    this._currentScore += points;
    if (this._currentScore > this._highScore) {
      this._highScore = this._currentScore;
      localStorage.setItem(STORAGE_KEY, String(this._highScore));
      return true;
    }
    return false;
  }

  /** Reset currentScore to 0. Does NOT touch highScore. */
  reset(): void {
    this._currentScore = 0;
  }

  /** Remove highScore from localStorage and zero in-memory value. */
  clearHighScore(): void {
    this._highScore = 0;
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Return tick interval (ms) for current score bracket.
   * Lower = faster. Minimum cap: 75ms at score >= 200.
   */
  getTickInterval(): number {
    for (const tier of SPEED_SCHEDULE) {
      if (this._currentScore >= tier.threshold) {
        return tier.interval;
      }
    }
    return 150; // unreachable: threshold 0 catches all; defensive fallback
  }
}
```

**Design decisions:**
- `add()` returns `boolean` (highScore updated?) so callers can make decisions, but GameManager will always emit `scoreUpdate` regardless — so this return value is informational only, not required by the spec.
- `add()` does NOT emit events itself. GameManager owns `GameEvents` emitter and must emit `scoreUpdate` after calling `add()`. This keeps all event routing through one emitter.
- SPEED_SCHEDULE is sorted descending by threshold. The loop uses `>=` and returns on first match, so 200+ hits first, 0 hits last. This avoids a nested if/else ladder and is easy to extend.
- The defensive `return 150` after the loop is unreachable (threshold:0 matches everything ≥0) but required for TypeScript exhaustiveness — score is never negative in normal gameplay.

---

### `src/game/GameManager.ts` — Additions / Changes

```typescript
// Import addition (top of file):
import { ScoreManager } from '@/game/ScoreManager';

// New field in class body:
private readonly _scoreManager: ScoreManager = new ScoreManager();

// REPLACE getScore() stub:
getScore(): number {
  return this._scoreManager.currentScore;
}

// ADD new delegation method:
getTickInterval(): number {
  return this._scoreManager.getTickInterval();
}

// MODIFY update() — food eaten block, add after this._food.respawn():
this._scoreManager.add(10);
this.events.emit('scoreUpdate', {
  score: this._scoreManager.currentScore,
  highScore: this._scoreManager.highScore,
});

// MODIFY restartGame() — add after this._pendingDirection = null:
this._scoreManager.reset();
```

**No other changes.** `endGame()` already calls `this.getScore()` which now returns real score. `clearHighScore()` is exposed via delegation only if the HUD/UI needs it — for Phase 5 (no UI), it is NOT exposed on GameManager. Tests call `scoreManager` directly via a test accessor if needed, or test clearHighScore() in ScoreManager unit tests.

---

### `src/game/GameLoop.ts` — Changes to intervalForScore delegation

```typescript
// REMOVE entire module-level function:
// function intervalForScore(score: number): number { ... }

// MODIFY _step() line ~52 — replace:
// const tickInterval = intervalForScore(this._manager.getScore());
// WITH:
const tickInterval = this._manager.getTickInterval();
```

No other changes to GameLoop. The local function is deleted entirely; delegation flows through `_manager.getTickInterval()` → `_scoreManager.getTickInterval()`.

---

## Edge Cases & Risk Analysis

### Risk 1: Speed Schedule Ownership Conflict
**Problem:** `GameLoop.ts` currently owns `intervalForScore()` with DIFFERENT thresholds (10/20/40/70 → 70ms min) than Phase 5 spec (50/100/150/200 → 75ms min).
**Resolution:** Delete `intervalForScore()` from GameLoop entirely. ScoreManager owns the schedule and minimum cap. GameLoop delegates via `_manager.getTickInterval()`. The two cannot coexist.
**Test implication:** GameLoop tests for tick-interval behavior must now call through ScoreManager (or mock `getTickInterval()` on manager).

### Risk 2: gameOver Event Score Value
**Problem:** `endGame()` calls `this.events.emit('gameOver', { score: this.getScore() })`. Once `getScore()` is wired, this emits the real score. The existing test at line 194 asserts `{ score: 0 }` — this remains valid only when the snake dies before eating any food, which is the current test scenario (snake walks into wall with no food eaten).
**Resolution:** No change needed to existing test. But Phase 5 tests must verify `gameOver` emits with the correct accumulated score after eating food.

### Risk 3: Existing `getScore() returns 0` Stub Test (line 221-227)
**Problem:** This test explicitly asserts `getScore() === 0` across all states. Once Phase 5 wires score, this test becomes semantically wrong (it was a stub placeholder, not a behavioral assertion).
**Resolution:** The Phase 5 implementation tests REPLACE this test with a wired-score test. The stub test must be removed from `GameManager.test.ts` or it will fail mid-game if score > 0 is checked after food is eaten.

### Risk 4: localStorage Isolation Between Tests
**Problem:** `happy-dom` provides localStorage but it is NOT cleared between test files or between `describe` blocks unless explicitly cleared. If `ScoreManager` tests run in sequence, a high score written by test A leaks into test B.
**Resolution:** `beforeEach` in `ScoreManager.test.ts` must call `localStorage.clear()` (or `localStorage.removeItem('snake_high_score')`). The `ScoreManager` constructor reads from localStorage — any test that constructs a new `ScoreManager` must start from a clean storage state.

### Risk 5: ScoreManager Constructor Reads localStorage
**Problem:** `new ScoreManager()` immediately calls `localStorage.getItem()`. Tests that create a ScoreManager after a previous test wrote a high score will inherit that value unless storage is cleared.
**Resolution:** See Risk 4. This is the canonical reason `beforeEach(() => localStorage.clear())` is mandatory in ScoreManager tests.

### Risk 6: Score Does Not Reset on restartGame() (Current State)
**Problem:** Current `restartGame()` resets Snake and Food but NOT score. Post-Phase-5, failing to call `scoreManager.reset()` means the player carries their score into the next game.
**Resolution:** Phase 5 T2 must add `this._scoreManager.reset()` to `restartGame()`. Test: after GAME_OVER → restartGame() → startGame(), `getScore()` must return 0.

### Risk 7: highScore is NOT reset by restartGame()
**Problem/Feature:** This is intentional per spec. `reset()` zeros `currentScore` only. `clearHighScore()` is a separate, explicit action. Must be verified in tests: high score persists across restartGame() cycles.

### Risk 8: ScoreManager.add() Called Outside PLAYING State
**Problem:** `update()` guards against non-PLAYING state (early return). However, the food-eaten block is inside `update()`, which is already gated. No risk of `add()` being called in IDLE/PAUSED/GAME_OVER states.

### Risk 9: noUncheckedIndexedAccess with SPEED_SCHEDULE Array
**Problem:** `SPEED_SCHEDULE[i]` with `noUncheckedIndexedAccess: true` returns `typeof SPEED_SCHEDULE[number] | undefined`. The for-of loop (`for (const tier of SPEED_SCHEDULE)`) avoids indexed access — `tier` is always defined.
**Resolution:** Use `for...of` (not `for(let i...)`). Already reflected in the interface above.

### Risk 10: GameLoop No Longer Has intervalForScore — Existing Tests May Reference It
**Problem:** If any test in `GameLoop.test.ts` directly references `intervalForScore`, removing it breaks tests.
**Resolution:** T3 must audit `tests/GameLoop.test.ts` and update any assertions about tick intervals to go through the manager mock.
