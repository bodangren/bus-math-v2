# Plan: Assessment Regression Hotfix

## Phase 1 — Fix ComprehensionCheck numeric/boolean answer normalisation

- [x] Task 1.1: Write failing tests for normalizeAnswer with non-string correctAnswer types
    - [x] Add test cases: numeric correctAnswer (e.g. 42), boolean correctAnswer (true/false), numeric array correctAnswer
    - [x] Confirm tests fail against current implementation (trim is not a function)
- [x] Task 1.2: Fix normalizeAnswer in ComprehensionCheck.tsx to coerce values to string before calling string methods
- [x] Task 1.3: Run tests and confirm all pass
- [x] Task 1.4: Commit fix `95cc652`
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Add tiered-assessment to validator union

- [x] Task 2.1: Write failing test confirming selectActivitySchema rejects a tiered-assessment activity row
- [x] Task 2.2: Add `activityPropsSchemas['tiered-assessment']` to the activityPropsSchema union in lib/db/schema/validators.ts; fix scoring.ts questionSchema to accept number/boolean correctAnswer
- [x] Task 2.3: Run tests and confirm all pass (including the new one)
- [x] Task 2.4: Commit fix `d41052d`
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Revert spreadsheet draft autoGrade to false

- [x] Task 3.1: Change autoGrade: true → autoGrade: false for the spreadsheet draft activity in supabase/seed/unit1/lesson-04.ts; correct grading-config test to check phase 5 (Assessment) not phase 4 (Independent Practice)
- [x] Task 3.2: Run lint and existing tests to confirm no regressions
- [x] Task 3.3: Commit fix `f91129f`
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
