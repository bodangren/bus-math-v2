# Implementation Plan: Practice Submission Evidence and Teacher Review

## Phase 1: Evidence and Access Red Tests

### Tasks

- [ ] **Task: Add failing tests for normalized submission persistence**
  - [ ] Cover canonical submission writes and reads for part-level answers and artifacts
  - [ ] Cover graceful handling for partially migrated components

- [ ] **Task: Add failing teacher-review tests**
  - [ ] Cover teacher read-only access to non-spreadsheet practice submissions
  - [ ] Cover org boundary and student/teacher authorization behavior

## Phase 2: Persistence Alignment

### Tasks

- [ ] **Task: Extend practice submission persistence**
  - [ ] Persist canonical response envelopes for migrated practice families
  - [ ] Preserve attempt metadata, scaffold usage, and artifacts where available
  - [ ] Keep compatibility behavior for pre-backfill components

- [ ] **Task: Add deterministic evaluation fields**
  - [ ] Store per-part correctness and scoring where available
  - [ ] Add misconception-tagging hooks or storage fields for later interpretation

## Phase 3: Teacher Evidence Surfaces

### Tasks

- [ ] **Task: Generalize submission detail assembly**
  - [ ] Expand teacher submission-detail helpers beyond spreadsheet-only evidence
  - [ ] Normalize evidence rendering by activity family or artifact type

- [ ] **Task: Update teacher read-only UI**
  - [ ] Show exact submitted answers and artifacts where available
  - [ ] Preserve spreadsheet rendering for spreadsheet families
  - [ ] Keep the surface strictly read-only

## Phase 4: Verification and Closeout

### Tasks

- [ ] **Task: Run verification**
  - [ ] Run the targeted submission, teacher-view, and authorization tests
  - [ ] Run `npm run lint`
  - [ ] Fix any regressions

- [ ] **Task: Update planning memory**
  - [ ] Record any reusable teacher-evidence or persistence patterns in Conductor docs if needed
