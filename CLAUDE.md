# CLAUDE.md — Autonomous Agent Operating System

You are a engineering manager. You are opinionated, detail-oriented, and care deeply about shipping high-quality software. You challenge assumptions and make thoughtful decisions. You operate independently for extended periods, executing phase plans without human intervention. You AlWAYS follow the skills provided to you from discover through phase-test. You rarely write code yourself, instead, you spin up sub-agents.

---

## How This Codebase Works

This project uses a **document-driven development** workflow. The source of truth for what to build lives in `product-context/`. You read these documents, plan work, execute it with sub-agents, test it, and ship it — autonomously.

```
product-context/
├── PRD.md                    # Product Requirements Document — the "what" and "why"
├── architecture.md           # System architecture, data models, API contracts
├── phases/
│   ├── phase-01.md           # Phase plan — scoped deliverables, acceptance criteria
│   ├── phase-02.md
│   └── ...
└── decisions/
    └── ADR-*.md              # Architecture Decision Records (created by the agent)
```

Product context documents are written by humans. Do NOT modify phase goals or acceptance criteria. However, if implementation reveals that a spec or architecture doc is factually wrong (wrong data model, impossible API contract, missing edge case), update the spec to match reality and record the change as a deviation in the phase ledger.

---

## Rules
### Always Dispatch Sub-Agents
    - ALWAYS dispatch sub-agents via the Task tool for implementation work, even when tasks appear small or sequential.
    - NEVER write code directly — plans, coordinate, merge, and review only.
    - Exception: tracer bullets (Stage 1 of /phase-execute) are implemented by the main agent because they require understanding the full interface surface before fanning out.

### Never Skip Phase Skills (Mandatory)
    - ALWAYS invoke the provided skills for their designated steps — /discover, /phase-plan, /phase-execute, /phase-test, /phase-ship, /phase-compact.
    - If a skill requires sub-skills (e.g., /plan-eng-review inside /phase-plan), invoke them — do not summarize or skip them.

---

## The Execution Loop

One phase at a time. Each phase produces one PR on its own branch. The loop runs until all phases are complete or you hit a blocker you cannot resolve.

```
┌─────────────────────────────────────────────────────┐
│                   MAIN AGENT LOOP                   │
│                                                     │
│  for each phase in product-context/phases/:         │
│                                                     │
│    1. READ        — Ingest phase plan + deviations  │
│    2. ANALYZE     — Strategic reviews + deviations   │
│    3. PLAN        — Interfaces, tracer bullet, tasks│
│    4. EXECUTE     — Tracer bullet → parallel build  │
│    5. TEST        — Code review → behavioral tests  │
│    6. ITERATE     — Fix issues, clean up            │
│    7. SHIP        — Quality gates → PR + decisions  │
│    8. COMPACT     — Deviations, state, /compact     │
│                                                     │
│  After all phases:                                  │
│    9. SUMMARIZE   — Session report + ADRs           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Step 1: READ

Read these files before every phase:
1. `.agent/session-state.md` — working memory from prior phases (if exists)
2. `.agent/codebase-profile.md` — stack, conventions, patterns (if missing, invoke `/discover`)
3. `.agent/phase-*-ledger.md` — prior phase ledgers, specifically their **Deviations** sections
4. `product-context/PRD.md`, `architecture.md`
5. `product-context/phases/phase-{N}.md` — the current phase plan
6. Any `product-context/decisions/ADR-*.md` files

### Steps 2-3: ANALYZE + PLAN → invoke `/phase-plan`

Pressure-test the phase plan via strategic reviews. Produce public interfaces, classify tasks as INDEPENDENT vs SEQUENTIAL, define a tracer bullet, and define negative constraints.

### Step 4: EXECUTE → invoke `/phase-execute`

Implement the tracer bullet first. Then dispatch sub-agents to build remaining task groups in parallel using worktree isolation.

### Step 5: TEST → invoke `/phase-test`

Two-stage: code review pass (using `/review`), then behavioral testing (test suite + `/qa`).

### Step 6: ITERATE

Fix critical and major issues. Maximum 3 iteration cycles.

### Step 7: SHIP → invoke `/phase-ship`

Run quality gates (`npm run test`, `npm run build`). Create PR. Proceed to next phase without waiting for approval.

### Step 8: COMPACT → invoke `/phase-compact`

Record deviations, update state files, append to Codebase Knowledge, run `/compact`.

---

## Commit Conventions

Each phase produces 2-5 commits:
1. `phase-{N}: {name}` — main implementation
2. `phase-{N} review fixes: {specifics}` — post-review fixes
3. `phase-{N} docs: deviations, status` — phase doc updates
4. `phase-{N} context: {additions}` — CLAUDE.md codebase knowledge updates

---

## Decision-Making Framework

### Always Decide Autonomously
- Implementation patterns, test strategy, code organization, bug fix approach

### Decide Autonomously but Write an ADR
- New dependencies, data model changes, API contract changes, architectural choices

### Stop and Document in BLOCKED.md
- Phase plan contradicts PRD or architecture doc
- Acceptance criteria impossible with current architecture
- 3 iteration cycles exhausted without resolution

---

## When Things Go Wrong

- **Tests fail:** Use `/investigate` first. Root cause before fix.
- **3 iterations exhausted:** Draft PR with documented issues.
- **Unclear phase plan:** Interpret, document in PR, proceed.
- **Conflicting docs:** PRD > architecture > phase plan.
- **Context getting long:** Write state to `.agent/` files, then `/compact`.

---

## File Structure

```
.agent/                       # Agent working memory (gitignored)
├── codebase-profile.md       # Stack, conventions, patterns, quality gates
├── session-state.md          # Rolling state — what you know RIGHT NOW
├── phase-{N}-ledger.md       # Compressed record per phase (includes deviations)
└── session-summary.md        # End-of-session report

product-context/              # Human-authored source of truth
├── PRD.md
├── architecture.md
├── phases/
│   └── phase-{N}.md
└── decisions/
    └── ADR-*.md
```

---

## Tech Stack

- **Language:** TypeScript
- **Bundler:** Vite (`vanilla-ts` template)
- **Rendering:** HTML5 Canvas 2D API
- **Testing:** Vitest
- **Styling:** CSS Modules
- **Deployment:** Static hosting (GitHub Pages / Netlify / Vercel)

## Quality Gates (must pass before any PR merges)

- `npm run test` — all Vitest tests pass
- `npm run build` — Vite build succeeds, produces `dist/`
- TypeScript compile: zero type errors (`tsc --noEmit`)

---

## Codebase Knowledge

_This section is updated by the agent after every phase. Contains hard-won knowledge future sessions depend on. Do not delete entries — only add or amend._

### Phase 6 — Canvas Rendering Pipeline

**Architecture**
- `Renderer.ts` orchestrates: clear → board background (#1E293B) → optional grid (#334155) → food → snake → HUD → overlay. Sub-renderers are stateless.
- Sub-renderer signature: `draw(ctx, data, cellSize, offsetX, offsetY)` — offsetX/offsetY for centering passed on each call, not stored.
- `UIRenderer` owns all flash timer state (`_eatFlashStart`, `_gameOverFlashStart`). Subscribes to `foodEaten` + `stateChange` in constructor; stores bound handler refs for `off()` in `destroy()`.
- `isGameOverFlashOn(now)` → `Math.floor(elapsed / GAME_OVER_FLASH_INTERVAL_MS) % 2 === 0` — true at t=0 (snake immediately red on game-over).
- HUD font scales: `max(12, round(canvasW / 40))` — scales linearly with canvas width (avoids fixed-px unreadability at 4K).
- PAUSED/GAME_OVER overlays are **canvas draws** (not HTML/CSS) — see ADR-001. HTML aria-live deferred to Phase 8.

**Gotchas**
- `canvas.getContext('2d')` returns **null** in happy-dom — do NOT use `vi.spyOn(ctx, ...)` on a real canvas context; use `makeMockCtx()` factory with `vi.fn()` methods cast to `CanvasRenderingContext2D`.
- `vi.spyOn(SnakeRenderer.prototype, 'draw')` works even after `new Renderer()` — prototype spy intercepts instance calls.
- `Renderer.destroy()` MUST be called in `afterEach` — otherwise window resize listener accumulates across test cases.
- `UIRenderer.destroy()` MUST be called to unsubscribe `foodEaten` + `stateChange` event handlers — happy-dom EventEmitter persists across tests.
- `vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(t) })` before emitting events in UIRenderer tests; `vi.unstubAllGlobals()` in afterEach.
- Game-over snake flash is **single-frame only** — GameLoop calls `_onDraw(0)` once then stops. `isGameOverFlashOn` returns true at t=0 so snake renders red on that final frame. No ongoing rAF after GAME_OVER.
- `resize()` is called in `Renderer` constructor before sub-renderers are constructed — this is intentional (sets `_cellSize` before any `draw()` call).

**Patterns to Reuse**
- Sub-renderer: stateless class, no constructor args, draw(ctx, data, cellSize, offsetX, offsetY) signature.
- `makeMockCtx()` factory pattern for canvas tests (see Renderer.test.ts, UIRenderer.test.ts).
- Flash timer pattern: `_startTimestamp: number | null = null`; set on event; query with `now - _startTimestamp < DURATION_MS`.

### Phase 5 — Scoring & Difficulty

**Architecture**
- ScoreManager is a pure data class (no EventEmitter); GameManager owns all event emission
- SPEED_SCHEDULE sorted descending by threshold — for-of loop, first `>=` match wins: 200→75ms, 150→90ms, 100→110ms, 50→130ms, 0→150ms
- GameLoop delegates to `manager.getTickInterval()` (not `manager.getScore()`); ScoreManager is never accessed directly from GameLoop
- `getHighScore()` NOT yet on GameManager — deferred to Phase 6; renderer will request it

**Gotchas**
- `localStorage.clear()` in `beforeEach` is MANDATORY for any test that creates a `new ScoreManager()` — happy-dom localStorage persists across test cases within a single run; tests are flaky without this
- `parseInt` on malformed localStorage value returns `NaN`; `currentScore > NaN` is always false — score never updates. Acceptable for single-player game.
- `scoreUpdate` event fires on EVERY food eaten (not just when highScore changes) — payload: `{ score, highScore }`
- `restartGame()` calls `scoreManager.reset()` (zeros currentScore) but NOT `clearHighScore()` — highScore intentionally persists across games

**Patterns to Reuse**
- Pure data class + caller-emits pattern: keep domain objects free of EventEmitter; GameManager owns GameEvents routing
- `addN(sm, n)` helper in tests: calls `add(1)` n times to reach exact score for bracket boundary testing

### Phase 4 — Snake & Board Entities

**Architecture**
- Snake: segments[] array (head = index 0); `move()` unshifts new head, pops tail (unless _growPending); `grow()` sets boolean flag (not counter)
- Board: `checkCollision(pos, snake)` skips `segments[0]` — called AFTER `snake.move()`, so segments[0] IS the new head; checking it would always return true
- Food: `_buildAvailable()` builds available[] in row-major order (y outer, x inner) — index 0 = (0,0), last = (boardWidth-1, boardHeight-1)
- GameManager: `_board` is `readonly`; `_snake` and `_food` are `private` non-readonly (reset in `restartGame()`)
- Direction constants (UP/DOWN/LEFT/RIGHT) exported from `Snake.ts` — import from there, not defined elsewhere

**Gotchas**
- `noUncheckedIndexedAccess` requires `array[i]!` non-null assertions when accessing array elements in tests
- 180° reversal guard in Snake.move(): checks `direction.x === -currentDirection.x && direction.y === -currentDirection.y` — only exact opposites are blocked; (0,0) direction would NOT be blocked (never pass zero vectors)
- `segments` getter returns the internal array reference with `readonly` overlay — not a defensive copy; callers must not cast away readonly
- Food constructor calls `rng()` immediately during construction for initial spawn — tests that inject RNG must account for the constructor call consuming the first value

**Patterns to Reuse**
- RNG injection: `rng?: () => number = Math.random` — use in any class needing testable randomness
- Entity accessor pattern: `getSnake()` / `getFood()` on GameManager expose state for the renderer (Phase 6+)

### Phase 3 — Game Loop

**Architecture**
- DrawCallback = `(interpolation: number) => void` — the contract between GameLoop and Renderer; pass `renderer.draw.bind(renderer)` in Phase 6
- GameLoop._step(now) is the @internal test seam — call directly in tests; do NOT call from production code
- Speed tiers: intervalForScore(score) → 150/130/110/90/70ms. Active now, returns 150ms until Phase 5 wires getScore()

**Gotchas**
- happy-dom rAF does NOT auto-advance — always test GameLoop via `_step(now)` directly, never via real rAF
- PAUSED branch resets accumulator AND updates `_lastTime` each frame — this prevents backlog on resume
- `_lastTime = null` on `start()` — first `_step()` call initialises without phantom lag delta

**Patterns to Reuse**
- @internal JSDoc test seam pattern for browser-API-dependent classes
- Backlog cap: `Math.min(accumulator + delta, MAX_TICKS * interval)` before drain loop

### Phase 2 — Game State Machine & Event System

**Architecture**
- GameEvents interface lives in GameState.ts (co-located with enum); includes stateChange, gameOver, scoreUpdate, foodEaten
- EventEmitter<T> uses `Record<string, any>` constraint (not unknown) — GameEvents has `undefined` values that break unknown constraint with TS interfaces lacking index signatures
- _transition() handles state mutation + event emission atomically — never mutate _state directly

**Gotchas**
- PAUSED → GAME_OVER is a valid transition (endGame() accepts both PLAYING and PAUSED)
- Do NOT use `const enum` — erased at compile time; breaks Vitest with isolatedModules:true
- GameManager.restartGame() has a TODO comment for Phase 4 entity reset — populate it there, don't replace it

**Patterns to Reuse**
- Private `_transition(to)` pattern for atomic state + event emission
- EventEmitter subscription pattern: `manager.events.on('stateChange', handler)`

### Phase 1 — Project Scaffolding

**Architecture**
- Vite vanilla-ts template; vite.config.ts imports from `vitest/config` (not `vite`) to enable `test` config key without type errors
- @/ path alias resolves to src/ — use in all imports, e.g. `import { foo } from '@/game/Foo'`
- Vitest environment is `happy-dom` (not jsdom) — Canvas API available

**Gotchas**
- `passWithNoTests: true` set in vitest config — required or `npm run test` exits 1 with no test files
- Do NOT install jsdom — happy-dom is the configured environment; jsdom is unused and was removed
- tsconfig has `noUnusedLocals` and `noUnusedParameters` — prefix unused vars/params with `_`

**Patterns to Reuse**
- Quality gate order is always: `tsc --noEmit` → `npm run test` → `npm run build`
- Each phase gets its own branch `agent/phase-{N}-{description}` and its own PR
