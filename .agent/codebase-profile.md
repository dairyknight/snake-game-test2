# Codebase Profile

## Stack
- Language: TypeScript
- Framework: Vite (vanilla-ts template) — no UI framework; vanilla TypeScript with HTML5 Canvas
- Key dependencies: vite, vitest, typescript, @testing-library (Vitest + Testing Library), CSS Modules

## Test Runner
- Command: `npm run test`
- Framework: Vitest (co-located with Vite; fast unit/integration tests)

## Code Style
- Naming: PascalCase for classes and files (e.g. `GameManager.ts`, `Snake.ts`); camelCase for variables and functions
- File organization: Feature-grouped under `src/` — `game/`, `input/`, `renderer/`, `ui/`, `state/`, `utils/`; tests under `tests/` at project root
- Formatting: TypeScript compiler enforced via `tsconfig.json`; no explicit formatter configured yet (recommend Prettier)

## CI/CD
- Platform: None configured yet
- On push: N/A
- On PR: N/A

## Quality Gates
Run these commands in order. All must pass before shipping.
1. `tsc --noEmit` — zero TypeScript type errors
2. `npm run test` — all Vitest tests pass
3. `npm run build` — Vite build succeeds, produces `dist/`

## Patterns
- Error handling: Not yet established — green-field project
- Logging: Not yet established — browser `console.*` expected for development; no logging library planned
- Config: No environment variables required; all config is in-code (e.g. tick interval, grid size) or `localStorage` (high score under key `snake_high_score`)
- Database: None — persistence via browser `localStorage` only (`ScoreManager` handles read/write)
- API: None — fully client-side, no backend or API calls
- Auth: None — single-player, no authentication required
