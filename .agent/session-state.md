# Session State

## Current Phase
Phase 7 — complete. Phase 8 not started.

## Completed Phases
- Phase 1: Project Scaffolding — PR #1 https://github.com/dairyknight/snake-game-test2/pull/1
- Phase 2: Game State Machine & Event System — PR #2 https://github.com/dairyknight/snake-game-test2/pull/2
- Phase 3: Game Loop — PR #3 https://github.com/dairyknight/snake-game-test2/pull/3
- Phase 4: Snake & Board Entities — PR #4 https://github.com/dairyknight/snake-game-test2/pull/4
- Phase 5: Scoring & Difficulty — PR #5 https://github.com/dairyknight/snake-game-test2/pull/5
- Phase 6: Canvas Rendering Pipeline — PR #6 https://github.com/dairyknight/snake-game-test2/pull/6
- Phase 7: Input Handling — PR #7 https://github.com/dairyknight/snake-game-test2/pull/7

## Active Architecture
- Entry: src/main.ts — canvas guard → GameManager → Renderer → GameLoop → new KeyboardInput → new TouchInput (no var assignment)
- Canvas: index.html#game-canvas wrapped in #game-wrapper (column flex); page shell: body #0F172A, flexbox center, color-scheme: dark
- State: src/state/GameState.ts — GameState enum + GameEvents interface
- Events: src/utils/EventEmitter.ts — generic pub/sub with on()/off()
- Grid: src/utils/Vector2.ts — immutable {x,y}
- Manager: src/game/GameManager.ts — owns Board/Snake/Food/ScoreManager; getHighScore() live
- Loop: src/game/GameLoop.ts — rAF, delta-time, delegates getTickInterval() to manager
- Snake: src/game/Snake.ts — segment queue, direction constants, grow flag
- Board: src/game/Board.ts — 20×20, checkCollision skips segments[0]
- Food: src/game/Food.ts — injected RNG, available[] algorithm
- Score: src/game/ScoreManager.ts — SPEED_SCHEDULE, localStorage snake_high_score
- Renderer: src/renderer/Renderer.ts — orchestrator; full draw cycle; resize(90vmin); destroy()
- SnakeRenderer: src/renderer/SnakeRenderer.ts — stateless draw()/drawFlash()
- FoodRenderer: src/renderer/FoodRenderer.ts — arc() circle; stateless draw()/drawFlash()
- UIRenderer: src/renderer/UIRenderer.ts — flash timers; drawHUD(); drawOverlay(); destroy()
- KeyboardInput: src/input/KeyboardInput.ts — keydown on window; Arrow/WASD→queueDirection; P/Esc→togglePause; Space/Enter→start/restart
- TouchInput: src/input/TouchInput.ts — swipe detection (30px); MediaQueryList D-pad show/hide; _btnCleanups[] for button listeners

## Carry-Forward Issues
- HTML aria-live accessibility layer — Phase 8 must add aria-live for score/state (ADR-001)
- PAUSED/GAME_OVER overlays are canvas-only (no screen reader support) until Phase 8
- HUD floats over board (no dedicated header zone) — Phase 8 polish
- Game-over snake flash is single-frame only (not animated) — accepted deviation

## Established Patterns
- Vitest config inline in vite.config.ts (import from `vitest/config`)
- Path alias @/ → src/
- Quality gates: tsc --noEmit → npm run test → npm run build
- Branch per phase off previous phase branch (PRs not merged to main)
- @internal JSDoc test seam pattern (GameLoop._step())
- DrawCallback = (interpolation: number) => void — render contract
- RNG injection: rng?: () => number = Math.random
- noUncheckedIndexedAccess requires ! on indexed array accesses in tests
- localStorage.clear() in beforeEach mandatory for any ScoreManager test
- Pure data class pattern: ScoreManager has no EventEmitter; caller emits events
- Canvas mock: makeMockCtx() factory with vi.fn() methods, cast to CanvasRenderingContext2D
- vi.spyOn(Class.prototype, 'method') intercepts instance calls even after construction
- vi.stubGlobal('performance', { now: vi.fn() }) + vi.unstubAllGlobals() in afterEach
- renderer.destroy() in afterEach prevents window resize listener accumulation
- Sub-renderer signature: (ctx, data, cellSize, offsetX, offsetY) — stateless, no stored layout
- `new InputClass(manager)` without var — TS 5.9 noUnusedLocals flags _-prefixed module vars; window/mql listeners keep instance alive
- `_btnCleanups: Array<() => void>` — collect cleanup fns when wiring anonymous listeners; drain in destroy()
- MediaQueryList.addEventListener('change', handler) + removeEventListener in destroy() — live viewport
- { passive: false } required on touchstart/touchend when calling preventDefault()
- Static HTML with `hidden` attribute + JS show/hide — cleaner than createElement for persistent DOM
