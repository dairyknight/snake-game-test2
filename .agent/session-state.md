# Session State

## Current Phase
Phase 3 — complete. Phase 4 not started.

## Completed Phases
- Phase 1: Project Scaffolding — PR #1 https://github.com/dairyknight/snake-game-test2/pull/1
- Phase 2: Game State Machine & Event System — PR #2 https://github.com/dairyknight/snake-game-test2/pull/2
- Phase 3: Game Loop — PR #3 https://github.com/dairyknight/snake-game-test2/pull/3

## Active Architecture
- Entry: src/main.ts — instantiates GameManager + GameLoop, starts loop
- Canvas: index.html#game-canvas
- State: src/state/GameState.ts — GameState enum + GameEvents interface
- Events: src/utils/EventEmitter.ts — generic pub/sub backbone
- Grid: src/utils/Vector2.ts — immutable {x,y} with equals()/add()
- Manager: src/game/GameManager.ts — FSM owner; getScore()=0 stub; update() empty
- Loop: src/game/GameLoop.ts — rAF, delta-time, 150ms tick, DrawCallback; _step() test seam

## Carry-Forward Issues
None.

## Established Patterns
- Vitest config inline in vite.config.ts (import from `vitest/config`)
- Path alias @/ → src/
- Quality gates: tsc --noEmit → npm run test → npm run build
- Branch per phase: agent/phase-{N}-{description}
- PR per phase before proceeding
