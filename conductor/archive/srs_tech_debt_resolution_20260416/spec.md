# SRS Tech Debt Resolution — Specification

## Overview

Address 2 open Medium-severity tech-debt items in the SRS system:
1. **TOCTOU race in SRS write mutations** — Convex does not support transactions on these patterns; document the tradeoff and add defensive guards
2. **SRS mutations trust client-computed card state** — Architectural issue where the FSRS scheduler runs client-side; document the risk and evaluate server-side options

## Functional Requirements

### 1. TOCTOU Race Documentation and Defensive Guards
- Analyze the existing SRS write mutation patterns (`upsertSrsCard`, `recordSrsReview`)
- Document why Convex transactions cannot be used on these patterns
- Add idempotency keys or conditional updates where possible to reduce race window
- Add warning comments in code explaining the tradeoff

### 2. Client-Computed State Trust Assessment
- Audit where card state is computed client-side vs server-side
- Document the current architecture and data flow
- Evaluate feasibility of moving FSRS scheduling server-side (ts-fsrs is a pure TypeScript library)
- Add server-side validation of client-submitted card state as defense-in-depth

## Non-Functional Requirements

- Zero breaking changes to existing API contracts
- All existing tests continue to pass
- No new lint errors or warnings
- Documentation updates for architectural awareness

## Acceptance Criteria

1. `convex/srs.ts` has updated comments documenting the TOCTOU race tradeoff
2. `tech-debt.md` entries for both items are updated with resolution notes
3. `lessons-learned.md` has a new entry about Convex transaction limitations
4. `npm run lint` passes with 0 errors
5. `npm test` passes all 2211 tests
6. `npm run build` passes cleanly

## Out of Scope

- Full server-side FSRS scheduler migration (architectural change, out of scope for stabilization)
- Changes to existing Convex schema structure