# Implementation Plan: Practice Component Legacy Backfill

## Phase 1: Migration Audit and Wave Planning

### Tasks

- [x] **Task: Audit legacy practice components**
  - [x] Inventory the curriculum-relevant activity families in the registry
  - [x] Group them into migration waves by shared behavior
  - [x] Identify which components are already close to the shared contract and which need deeper rewrites
  - [x] Produce a component-family-to-lesson mapping that the Curriculum Rollout track (Track 4) can consume as its starting audit input
  - [x] Consult `conductor/BM-Accounting-Problems.pdf` and `conductor/BM-Accounting-Problems-Spec-Sheet` for accounting domain context

- [x] **Task: Add migration coverage targets**
  - [x] Define which test files need payload assertions
  - [x] Record any component-specific blockers that should be handled before backfill starts

### Phase 1 Output

- [x] `./audit.md`

## Phase 2: Quiz and Structured-Response Families

### Tasks

- [x] **Task: Refactor quiz-like families**
  - [x] Update quiz, fill-in-the-blank, and comparable structured-response components to emit canonical submissions
  - [x] Preserve auto-graded behavior and retry semantics
  - [x] Add or update focused tests

## Phase 3: Drag/Drop and Accounting Practice Families

### Tasks

- [x] **Task: Refactor drag/drop and categorization families**
  - [x] Normalize part-level answers, artifact outputs, and scaffold tracking where applicable
  - [x] Add or update tests for canonical submission payloads

- [x] **Task: Refactor accounting-entry families**
  - [x] Normalize journal-entry and similar accounting artifact families
  - [x] Preserve teacher-readable artifact output for submission review

## Phase 4: Spreadsheet and Simulation Practice Families

### Tasks

- [x] **Task: Align spreadsheet and evaluator families**
  - [x] Ensure spreadsheet-like families fit the shared contract without losing existing artifact fidelity
  - [x] Verify compatibility with teacher evidence surfaces
  - [x] Plan consolidation or deprecation path for the legacy `student_spreadsheet_responses` Convex table — submissions now flow through unified `activity_submissions` with canonical envelopes rather than a parallel table

- [x] **Task: Align practice-capable simulation families**
  - [x] Refactor the simulation-backed practice components used by authored curriculum
  - [x] Document any families that intentionally remain outside the practice contract

## Phase 5: Verification and Contract Cleanup

### Tasks

- [x] **Task: Run migration verification**
  - [x] Run targeted component tests for each migrated wave
  - [x] Run `npm run lint`
  - [x] Fix regressions

- [ ] **Task: Remove no-longer-needed compatibility branches**
  - [ ] Reduce temporary adapters where all relevant families have been migrated
  - [ ] Update Conductor docs if the supported mode matrix changed during implementation
