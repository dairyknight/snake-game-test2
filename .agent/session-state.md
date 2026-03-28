# Session State

## Current Phase
Phase 5 — complete. Phase 6 not started.

## Completed Phases
- Phase 1: Project Scaffolding — PR #1 https://github.com/dairyknight/snake-game-test2/pull/1
- Phase 2: Game State Machine & Event System — PR #2 https://github.com/dairyknight/snake-game-test2/pull/2
- Phase 3: Game Loop — PR #3 https://github.com/dairyknight/snake-game-test2/pull/3
- Phase 4: Snake & Board Entities — PR #4 https://github.com/dairyknight/snake-game-test2/pull/4
- Phase 5: Scoring & Difficulty — PR #5 https://github.com/dairyknight/snake-game-test2/pull/5

## Active Architecture
- Entry: src/main.ts — GameManager + GameLoop wired; no-op draw stub (Phase 6 replaces)
- Canvas: index.html#game-canvas
- State: src/state/GameState.ts — GameState enum + GameEvents interface
- Events: src/utils/EventEmitter.ts — generic pub/sub backbone
- Grid: src/utils/Vector2.ts — immutable {x,y} with equals()/add()
- Manager: src/game/GameManager.ts — owns Board/Snake/Food/ScoreManager; full update() loop; getScore()/getTickInterval() live
- Loop: src/game/GameLoop.ts — rAF, delta-time, delegates getTickInterval() to manager; _step() test seam
- Snake: src/game/Snake.ts — segment queue, UP/DOWN/LEFT/RIGHT consts, grow flag, 180° reversal guard
- Board: src/game/Board.ts — 20×20 default, checkCollision(pos, snake) skips segments[0]
- Food: src/game/Food.ts — injected RNG, available[] algorithm, respawn() returns bool
- Score: src/game/ScoreManager.ts — SPEED_SCHEDULE (50/100/150/200→130/110/90/75ms), localStorage key snake_high_score

## Carry-Forward Issues
- `getHighScore()` not yet on GameManager — Phase 6 adds when renderer needs it

## Established Patterns
- Vitest config inline in vite.config.ts (import from `vitest/config`)
- Path alias @/ → src/
- Quality gates: tsc --noEmit → npm run test → npm run build
- Branch per phase off previous phase branch (PRs not merged to main yet)
- @internal JSDoc test seam pattern (GameLoop._step())
- DrawCallback = (interpolation: number) => void — render contract
- RNG injection: rng?: () => number = Math.random — for deterministic testability
- noUncheckedIndexedAccess requires ! on indexed array accesses in tests
- localStorage.clear() in beforeEach mandatory for any ScoreManager test
- Pure data class pattern: ScoreManager has no EventEmitter; caller (GameManager) emits events
