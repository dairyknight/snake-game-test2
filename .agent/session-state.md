# Session State

## Current Phase
Phase 1 — complete. Phase 2 not started.

## Completed Phases
- Phase 1: Project Scaffolding — PR #1 https://github.com/dairyknight/snake-game-test2/pull/1

## Active Architecture
- Entry: src/main.ts (placeholder — `export {}`)
- Canvas: index.html#game-canvas
- Dirs: src/game, src/input, src/renderer, src/ui, src/state, src/utils, tests/
- Build: Vite → dist/; tsc strict; Vitest happy-dom

## Carry-Forward Issues
None.

## Established Patterns
- Vitest config inline in vite.config.ts (import from `vitest/config`)
- Path alias @/ → src/
- Quality gates: tsc --noEmit → npm run test → npm run build
- Branch per phase: agent/phase-{N}-{description}
- PR per phase before proceeding
