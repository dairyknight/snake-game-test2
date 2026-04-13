# Phase 3 Ledger

## What Was Built
requestAnimationFrame game loop with delta-time accumulator, fixed 150ms default tick, 3-tick backlog cap, state-aware gating (PLAYING ticks, PAUSED resets accumulator, GAME_OVER self-terminates). DrawCallback type exported. GameManager + GameLoop wired in main.ts. 22 GameLoop tests.

## Key Decisions
| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Draw surface | DrawCallback type | Simpler than interface; Renderer satisfies it in Phase 6 |
| rAF in tests | _step() test seam | happy-dom rAF doesn't auto-advance; direct calls are deterministic |
| Speed schedule | 5-tier (0/10/20/40/70 score) | Matches architecture doc |

## Architecture Changes
- DrawCallback = (interpolation: number) => void — the render contract
- GameLoop._step() exposed as test seam (documented @internal)
- main.ts now instantiates and starts GameManager + GameLoop

## Deviations

### Spec Divergences
- Spec called for explicit pause()/resume() methods on GameLoop. Not implemented — pause/resume fully driven by GameManager state polling inside _step(). Avoids duplicating FSM responsibility.

### Stubs
- _onDraw in main.ts is a no-op stub — replaced by Renderer.draw in Phase 6
- Speed tiers always return 150ms — activated in Phase 5 when getScore() is wired to ScoreManager

### Test Deferrals
None.

## Patterns Established
- Test seam pattern: _step(now) exposed with @internal JSDoc for deterministic loop testing without rAF
- DrawCallback as the draw contract between GameLoop and Renderer
