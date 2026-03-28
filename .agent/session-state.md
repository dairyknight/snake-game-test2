# Session State

## Current Phase
Phase 2 — complete. Phase 3 not started.

## Completed Phases
- Phase 1: Project Scaffolding — PR #1 https://github.com/dairyknight/snake-game-test2/pull/1
- Phase 2: Game State Machine & Event System — PR #2 https://github.com/dairyknight/snake-game-test2/pull/2

## Active Architecture
- Entry: src/main.ts (placeholder)
- Canvas: index.html#game-canvas
- State: src/state/GameState.ts — GameState enum + GameEvents interface
- Events: src/utils/EventEmitter.ts — generic pub/sub backbone
- Grid: src/utils/Vector2.ts — immutable {x,y} with equals()/add()
- Manager: src/game/GameManager.ts — FSM owner; getScore()=0 stub; update() empty stub

## Carry-Forward Issues
None.

## Established Patterns
- Vitest config inline in vite.config.ts (import from `vitest/config`)
- Path alias @/ → src/
- Quality gates: tsc --noEmit → npm run test → npm run build
- Branch per phase: agent/phase-{N}-{description}
- PR per phase before proceeding
