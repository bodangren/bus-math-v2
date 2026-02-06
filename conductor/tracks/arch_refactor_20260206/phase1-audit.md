# Phase 1 Audit — Documentation & Conductor Enrichment

## Existing Conductor Coverage

### `conductor/product.md`
- Covers product concept, target audience, value proposition, and feature themes.
- Gap: does not define explicit system boundaries/responsibilities.
- Gap: does not describe runtime data flow (client -> API -> Supabase -> response).

### `conductor/tech-stack.md`
- Covers core frameworks, libraries, and testing tools.
- Gap: still frames Drizzle as schema-management capable, while current direction is Supabase-first.
- Gap: does not define canonical schema workflow.

### `conductor/workflow.md`
- Defines task lifecycle, TDD loop, quality gates, and checkpoint protocol.
- Gap: no single architecture reference document linked for implementation context.

## Missing `docs/*` Mapping to `conductor/*`

| Missing docs reference | New conductor destination |
| --- | --- |
| `docs/project-brief.md` | `conductor/product.md` |
| `docs/backend-architecture.md` | `conductor/architecture.md` (Backend section) |
| `docs/frontend-architecture.md` | `conductor/architecture.md` (Frontend section) |
| `docs/full-stack-architecture.md` | `conductor/architecture.md` (Full-stack section) |
| `docs/brownfield-architecture.md` | `conductor/architecture.md` (Brownfield section) |
| `docs/TDD.md` | `conductor/workflow.md` + `conductor/architecture.md` (TDD summary section) |

## Valid Docs That Should Remain
- `docs/RETROSPECTIVE.md`
- `docs/security-api-route-matrix.md`
- `docs/curriculum/`
