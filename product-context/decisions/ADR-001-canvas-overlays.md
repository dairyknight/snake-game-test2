# ADR-001: Canvas Overlays for PAUSED/GAME_OVER States

## Status
Accepted

## Context
The architecture document called for HTML/CSS overlays for PAUSED and GAME_OVER states to support accessibility (screen readers, tab focus). The design review during Phase 6 planning flagged this as a requirement and initially marked it BLOCKER. However, Phase 6 scope is canvas rendering only; adding a parallel HTML DOM layer alongside the canvas would require Phase 7 input wiring (which touches the DOM) to co-ordinate with these elements.

## Decision
Implement PAUSED and GAME_OVER overlays as canvas draws via UIRenderer.drawOverlay(). The canvas rendering pipeline already supports this. HTML aria-live regions for accessibility are deferred to Phase 8 (UI Screens), which owns the full HTML shell and accessibility layer.

## Alternatives Considered
- **HTML/CSS overlays now (Phase 6):** Would add DOM elements (div#overlay, aria-live regions) to index.html. Requires CSS z-index coordination with the canvas. Creates an HTML/CSS dependency in what is otherwise a pure canvas rendering phase. Defers the input wiring complexity to Phase 7 without adding value.
- **Canvas overlays + aria-live in Phase 6:** Feasible but over-scoped for Phase 6; aria-live updates require JavaScript DOM mutation that should be co-located with Phase 8's screen management.

## Consequences
- **Positive:** Phase 6 stays scoped to canvas rendering; Renderer.ts has no DOM side-effects beyond the canvas element.
- **Negative:** PAUSED and GAME_OVER overlays are not accessible to screen readers until Phase 8. This is a known accessibility gap.
- **Phase 8 action required:** Add `<div aria-live="polite" id="game-status">` to index.html; emit status updates from GameManager events. Phase 8 owns this.
