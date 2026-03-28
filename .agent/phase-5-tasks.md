# Phase 5 — Scoring & Difficulty: Task Breakdown

## 3b. Task Graph

```
T0 (Tracer Bullet) ──► T1 ──► T2 ──► T3
                         │           │
                         └─ (INDEP)  └─ depends on T2 (getTickInterval exists)
```

### T0 — Tracer Bullet (SEQUENTIAL — must be first)
**What:** ScoreManager skeleton + GameManager.getScore() wired
**Scope:**
- Create `src/game/ScoreManager.ts` with constructor (reads localStorage), `currentScore` getter, `highScore` getter, `reset()` method, `clearHighScore()` method, `getTickInterval()` (full implementation with SPEED_SCHEDULE — not a stub)
- Add `add(points: number): boolean` full implementation
- In `GameManager.ts`: import ScoreManager, add `private readonly _scoreManager`, replace `getScore()` stub with `return this._scoreManager.currentScore`
- Add `getTickInterval(): number` on GameManager that delegates to `_scoreManager.getTickInterval()`
- Verify `tsc --noEmit` passes
**Goal:** Proves ScoreManager can be constructed, GameManager compiles with the new method, and GameLoop's delegation target (`getTickInterval`) exists on manager — even before GameLoop calls it.
**Does NOT:** wire food-eating scoring, emit scoreUpdate events, touch GameLoop

---

### T1 — ScoreManager Full Implementation + Tests (INDEPENDENT after T0)
**What:** Full ScoreManager behavioral tests
**Scope:**
- `tests/ScoreManager.test.ts` — test file covering ALL unit test requirements:
  - Initial state: `currentScore=0`, `highScore` reads from localStorage (0 if absent)
  - `add(10)` increments currentScore by 10
  - `add(10)` updates highScore when currentScore exceeds it
  - `add(10)` persists highScore to localStorage
  - `highScore` survives new ScoreManager construction (localStorage round-trip)
  - `reset()` zeros currentScore, does NOT change highScore
  - `clearHighScore()` removes localStorage key and zeros in-memory highScore
  - `getTickInterval()` returns correct interval for each bracket: 0→150, 49→150, 50→130, 99→130, 100→110, 149→110, 150→90, 199→90, 200→75, 999→75
  - `beforeEach(() => localStorage.clear())` — mandatory for isolation
- No changes to implementation code in this task (T0 built it)

**Dependency:** T0 must be complete (ScoreManager.ts exists)
**INDEPENDENT of:** T2, T3

---

### T2 — GameManager Wiring + Integration Tests (SEQUENTIAL after T0)
**What:** Wire score into game flow; update GameManager tests
**Scope:**
- `src/game/GameManager.ts`:
  - In `update()` food-eaten block: call `this._scoreManager.add(10)` after `this._food.respawn()`, then emit `scoreUpdate` event
  - In `restartGame()`: call `this._scoreManager.reset()` after `this._pendingDirection = null`
- `tests/GameManager.test.ts`:
  - REMOVE the stub test `it('getScore() returns 0', ...)` (lines 221-227)
  - ADD: `getScore()` returns 0 initially
  - ADD: `getScore()` returns 10 after one food-eaten update (using controlled RNG)
  - ADD: `getScore()` returns 0 after restartGame()
  - ADD: `scoreUpdate` event fires with `{ score: 10, highScore: 10 }` on food eat
  - ADD: `gameOver` event emits real score (already valid for score=0 case; add score>0 case)
  - ADD: score does NOT increase during PAUSED state (update() guard test)
  - UPDATE: `endGame()` emits `gameOver` with real score — add a test for score>0 scenario

**Dependency:** T0 must be complete (getTickInterval, getScore wired)
**SEQUENTIAL:** Must run after T0. INDEPENDENT of T1 (no ScoreManager test dependency).

---

### T3 — GameLoop Delegation + Tests (SEQUENTIAL after T0 + T2)
**What:** Remove local intervalForScore; delegate to manager
**Scope:**
- `src/game/GameLoop.ts`:
  - Delete module-level `intervalForScore()` function entirely
  - Replace `intervalForScore(this._manager.getScore())` with `this._manager.getTickInterval()`
- `tests/GameLoop.test.ts` (if exists — check for interval-related tests):
  - Any test that relied on the old score thresholds (10/20/40/70) must be updated to new thresholds (50/100/150/200) or mocked via `getTickInterval()` on manager
  - Verify: at score=0, tick interval is 150ms (getTickInterval returns 150)
  - Verify: speed changes dynamically — mock `getTickInterval()` to return 75 and confirm loop uses it

**Dependency:** T2 must be complete (GameManager.getTickInterval exists and is real)
**SEQUENTIAL after T2:** Ensures getTickInterval() returns real score-based intervals, not stub 0 values.

---

## 3c. Tracer Bullet

**Minimal path that proves all interfaces connect:**

1. Create `ScoreManager` with constructor, `currentScore` getter, `highScore` getter, `getTickInterval()` (full implementation), `add()`, `reset()`, `clearHighScore()`
2. In `GameManager`: add `private readonly _scoreManager = new ScoreManager()`, replace `getScore()` stub, add `getTickInterval()` delegation
3. Run `tsc --noEmit` — must pass with zero errors

**What this proves:**
- ScoreManager is importable with correct TypeScript types
- GameManager compiles with the new `_scoreManager` field and delegated methods
- `getTickInterval()` exists on GameManager — GameLoop's future delegation target is in place
- No circular imports (ScoreManager → localStorage only, no game dependencies)
- `noUncheckedIndexedAccess` satisfied (SPEED_SCHEDULE uses for-of, not indexed access)
- `noUnusedLocals/Parameters` satisfied (all fields used)

**What it does NOT prove (left for T1/T2/T3):**
- Event emission on food eat
- Score resets on restart
- GameLoop actually calls getTickInterval()
- Tests pass

---

## 3d. Negative Constraints

### What Phase 5 MUST NOT do:

1. **No HUD rendering.** ScoreManager and GameManager do NOT render score to canvas or DOM. That is Phase 6 (Renderer). Phase 5 only manages score state and emits events.

2. **No UI for high score display.** No `<div>`, no `<span>`, no DOM manipulation. Purely data layer.

3. **No speed tier visual indicator.** No color change, no "speed level" text. Data only.

4. **No ScoreManager event emitter.** ScoreManager is a pure data class. It does NOT own an EventEmitter. It does NOT emit `scoreUpdate`. That event is emitted by `GameManager.events` (the single source of truth for GameEvents). Adding an emitter to ScoreManager would create a second event channel outside the established architecture.

5. **No score multiplier or combo system.** Score is flat 10 points per food. No multipliers, no streak bonuses, no combo mechanics.

6. **No difficulty modes / settings UI.** Speed is entirely determined by the score bracket. No "easy/hard" toggle. No config object.

7. **No score animation or tween.** Score is an integer that changes atomically. No interpolated display value.

8. **Do NOT modify the speed schedule mid-game.** The SPEED_SCHEDULE constant is fixed. It is not configurable at runtime.

9. **Do NOT expose ScoreManager as a public property of GameManager.** Access goes through `getScore()`, `getTickInterval()`, and `getHighScore()` (if needed). Direct access to `_scoreManager` breaks encapsulation and bypasses the event system.

10. **Do NOT add `getHighScore()` to GameManager unless a consumer needs it.** Phase 5 acceptance criteria do not require GameManager to expose highScore. ScoreManager tests access it directly. If the renderer (Phase 6) needs highScore, that delegation gets added in Phase 6 as part of its planned interface — not here.

11. **Do NOT skip `localStorage.clear()` in ScoreManager tests.** happy-dom localStorage persists within a test run. Tests that omit `beforeEach(() => localStorage.clear())` will produce flaky failures when test order changes.

12. **Do NOT leave the stub test `getScore() returns 0` in GameManager.test.ts.** Once score is wired, this test becomes incorrect for any game state where food has been eaten. It must be removed and replaced with a behavioral assertion.

---

## Implementation Order Summary

```
T0 (tracer bullet): ScoreManager.ts created + GameManager.getScore() / getTickInterval() wired
  → tsc --noEmit passes
  → Start T1 and T2 in parallel

T1 (parallel): ScoreManager unit tests written and passing
T2 (parallel): GameManager update() + restartGame() wired; GameManager tests updated

T3 (after T2): GameLoop intervalForScore deleted; delegation to getTickInterval() added; GameLoop tests updated
  → npm run test passes (all suites)
  → tsc --noEmit passes
  → npm run build passes
```
