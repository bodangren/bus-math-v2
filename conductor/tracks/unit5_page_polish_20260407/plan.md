# Implementation Plan: Unit 5 Page Evaluation and Polish

## Phase 1: Unit 5 Audit

- [x] Enumerate Unit 5 route and lesson coverage for student and teacher flows
- [x] Capture desktop and mobile audit notes for Unit 5 surfaces (found missing activity components in registry, fixed)
- [x] Separate shared defects from Unit 5-local defects (registry was shared issue, now fixed)

## Phase 2: Shared Fixes Needed For Unit 5

- [x] Write or update targeted regression coverage for risky shared changes (registry fix tested)
- [x] Implement shared layout/component fixes required for Unit 5 correctness (fixed activity registry)
- [x] Verify Unit 5 still renders correctly after shared updates (lint, test, build all pass)

## Phase 3: Unit 5 Local Polish

- [x] Fix Unit 5 overview and navigation issues
- [x] Fix Unit 5 teacher page issues
- [x] Fix Unit 5 lesson page issues (added submittedRef guard to DynamicMethodSelector)
- [x] Re-check all touched Unit 5 surfaces

## Phase 4: Verification

- [x] Re-test Unit 5 surfaces on desktop and mobile widths
- [x] Run `npm run lint`
- [x] Run targeted tests for touched components/routes
- [x] Run `npm run build`
- [x] Record residual risks or intentional deferrals
