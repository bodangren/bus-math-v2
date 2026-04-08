# Implementation Plan: Unit 7 Page Evaluation and Polish

## Phase 1: Unit 7 Audit

- [x] Enumerate Unit 7 route and lesson coverage for student and teacher flows
- [x] Capture desktop and mobile audit notes for Unit 7 surfaces (audit-notes.md)
- [x] Separate shared defects from Unit 7-local defects (fixed GrowthPuzzle and CapitalNegotiation reset buttons)

## Phase 2: Shared Fixes Needed For Unit 7

- [x] Write or update targeted regression coverage for risky shared changes (no shared changes needed)
- [x] Implement shared layout/component fixes required for Unit 7 correctness (no shared changes needed)
- [x] Verify Unit 7 still renders correctly after shared updates (no shared changes needed)

## Phase 3: Unit 7 Local Polish

- [~] Fix Unit 7 overview and navigation issues
- [ ] Fix Unit 7 teacher page issues
- [ ] Fix Unit 7 lesson page issues
- [ ] Re-check all touched Unit 7 surfaces

## Phase 3: Unit 7 Local Polish

- [x] Fix Unit 7 overview and navigation issues
- [x] Fix Unit 7 teacher page issues
- [x] Fix Unit 7 lesson page issues (fixed GrowthPuzzle and CapitalNegotiation reset buttons)
- [x] Re-check all touched Unit 7 surfaces

## Phase 4: Verification

- [x] Re-test Unit 7 surfaces on desktop and mobile widths
- [x] Run `npm run lint` (0 errors, 1 pre-existing warning)
- [x] Run targeted tests for touched components/routes (all tests pass)
- [x] Run `npm run build` (build passes cleanly)
- [x] Record residual risks or intentional deferrals
