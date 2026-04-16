# SRS Tech Debt Resolution — Implementation Plan

## Phase 1: TOCTOU Race Analysis and Defensive Documentation

### Tasks

- [ ] Task: Analyze SRS write mutations for TOCTOU race patterns
  - [ ] Read `convex/srs.ts` to understand `upsertSrsCard` and `recordSrsReview` patterns
  - [ ] Identify the specific race condition windows
  - [ ] Document findings in code comments

- [ ] Task: Add defensive documentation to SRS mutations
  - [ ] Add warning comments explaining Convex transaction limitations
  - [ ] Add inline comments about the tradeoff rationale

- [ ] Task: Update tech-debt.md with resolution notes
  - [ ] Update TOCTOU race entry with "Closed" status and documentation notes
  - [ ] Update client-computed state entry with assessment findings

## Phase 2: Client-Computed State Trust Assessment

### Tasks

- [ ] Task: Audit client-side vs server-side card state computation
  - [ ] Trace where `family.grade()` and `family.toEnvelope()` are called
  - [ ] Identify where card state is submitted to Convex mutations
  - [ ] Document the current data flow

- [ ] Task: Add server-side validation defense-in-depth
  - [ ] Add basic sanity checks on submitted card state in `recordSrsReview`
  - [ ] Ensure server validates rating values against SrsRating enum

- [ ] Task: Update lessons-learned.md
  - [ ] Add entry about client-computed state validation importance

## Verification

- [ ] Run `npm run lint` — verify 0 errors
- [ ] Run `npm test` — verify 2211/2211 tests pass
- [ ] Run `npm run build` — verify clean build