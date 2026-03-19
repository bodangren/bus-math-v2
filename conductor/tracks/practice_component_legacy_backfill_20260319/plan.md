# Implementation Plan: Practice Component Legacy Backfill

## Phase 1: Migration Audit and Wave Planning

### Tasks

- [ ] **Task: Audit legacy practice components**
  - [ ] Inventory the curriculum-relevant activity families in the registry
  - [ ] Group them into migration waves by shared behavior
  - [ ] Identify which components are already close to the shared contract and which need deeper rewrites
  - [ ] Produce a component-family-to-lesson mapping that the Curriculum Rollout track (Track 4) can consume as its starting audit input
  - [ ] Consult `conductor/BM-Accounting-Problems.pdf` and `conductor/BM-Accounting-Problems-Spec-Sheet` for accounting domain context

- [ ] **Task: Add migration coverage targets**
  - [ ] Define which test files need payload assertions
  - [ ] Record any component-specific blockers that should be handled before backfill starts

## Phase 2: Quiz and Structured-Response Families

### Tasks

- [ ] **Task: Refactor quiz-like families**
  - [ ] Update quiz, fill-in-the-blank, and comparable structured-response components to emit canonical submissions
  - [ ] Preserve auto-graded behavior and retry semantics
  - [ ] Add or update focused tests

## Phase 3: Drag/Drop and Accounting Practice Families

### Tasks

- [ ] **Task: Refactor drag/drop and categorization families**
  - [ ] Normalize part-level answers, artifact outputs, and scaffold tracking where applicable
  - [ ] Add or update tests for canonical submission payloads

- [ ] **Task: Refactor accounting-entry families**
  - [ ] Normalize journal-entry and similar accounting artifact families
  - [ ] Preserve teacher-readable artifact output for submission review

## Phase 4: Spreadsheet and Simulation Practice Families

### Tasks

- [ ] **Task: Align spreadsheet and evaluator families**
  - [ ] Ensure spreadsheet-like families fit the shared contract without losing existing artifact fidelity
  - [ ] Verify compatibility with teacher evidence surfaces
  - [ ] Plan consolidation or deprecation path for the legacy `student_spreadsheet_responses` Convex table — submissions should flow through unified `activity_submissions` with canonical envelopes rather than a parallel table

- [ ] **Task: Align practice-capable simulation families**
  - [ ] Refactor the simulation-backed practice components used by authored curriculum
  - [ ] Document any families that intentionally remain outside the practice contract

## Phase 5: Verification and Contract Cleanup

### Tasks

- [ ] **Task: Run migration verification**
  - [ ] Run targeted component tests for each migrated wave
  - [ ] Run `npm run lint`
  - [ ] Fix regressions

- [ ] **Task: Remove no-longer-needed compatibility branches**
  - [ ] Reduce temporary adapters where all relevant families have been migrated
  - [ ] Update Conductor docs if the supported mode matrix changed during implementation
