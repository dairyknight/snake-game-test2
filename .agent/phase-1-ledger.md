# Phase 1 Ledger

## What Was Built
Vite + TypeScript (vanilla-ts) project scaffold with Vitest (happy-dom environment), strict TypeScript config, @/ path alias, and source maps. All 6 src/ subdirectories and tests/ created with .gitkeep. index.html has canvas#game-canvas and meta viewport. src/main.ts is a bootstrap placeholder.

## Key Decisions
| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Vitest environment | happy-dom | Faster than jsdom; Canvas-compatible |
| Path alias | @/ → src/ | Prevents relative import hell; painful to retrofit later |
| Prettier | Skip | TypeScript strict mode sufficient for game project |
| passWithNoTests | true | Required for acceptance criterion (no tests in Phase 1) |

## Architecture Changes
None — scaffolding only.

## Deviations

### Spec Divergences
- Spec listed `public/assets/` as deliverable — dropped. Self-creates when assets are added. Not blocking.

### Stubs
- `src/main.ts` — exports `{}` only; full GameManager wiring deferred to Phase 2+

### Test Deferrals
None — Phase 1 has no testable domain logic.

### Deferred Tasks
None.

## Patterns Established
- Vitest config lives inline in `vite.config.ts` (imported from `vitest/config`)
- Path alias: `@/` resolves to `src/`
- Quality gate order: `tsc --noEmit` → `npm run test` → `npm run build`
