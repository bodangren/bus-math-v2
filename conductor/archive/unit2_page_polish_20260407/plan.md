# Implementation Plan: Unit 2 Page Evaluation and Polish

## Phase 1: Unit 2 Audit

- [x] Enumerate Unit 2 route and lesson coverage for student and teacher flows
- [x] Capture desktop and mobile audit notes for Unit 2 surfaces
- [x] Separate shared defects from Unit 2-local defects

## Phase 2: Shared Fixes Needed For Unit 2

- [x] Write or update targeted regression coverage for risky shared changes
- [x] Implement shared layout/component fixes required for Unit 2 correctness (added submittedRef guards to AssetRegisterSimulator, DepreciationMethodComparisonSimulator, MethodComparisonSimulator)
- [x] Verify Unit 2 still renders correctly after shared updates (all tests pass, lint passes, build passes)

## Phase 3: Unit 2 Local Polish

- [x] Fix Unit 2 overview and navigation issues
- [x] Fix Unit 2 teacher page issues
- [x] Fix Unit 2 lesson page issues
- [x] Re-check all touched Unit 2 surfaces

## Phase 4: Verification

- [x] Re-test Unit 2 surfaces on desktop and mobile widths
- [x] Run `npm run lint` (0 errors, 1 pre-existing warning)
- [x] Run targeted tests for touched components/routes (all 1518 tests pass)
- [x] Run `npm run build` (build passes cleanly)
- [x] Record residual risks or intentional deferrals (tech-debt.md updated to close 3 depreciation simulator issues)
