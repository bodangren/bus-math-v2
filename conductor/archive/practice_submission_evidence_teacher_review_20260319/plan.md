# Implementation Plan: Practice Submission Evidence and Teacher Review

Completed on 2026-03-19 after the final tree passed lint, full test, and production build gates.

## Phase 1: Evidence and Access Red Tests

### Tasks

- [x] **Task: Add failing tests for normalized submission persistence**
  - [x] Cover canonical submission writes and reads for part-level answers and artifacts
  - [x] Cover graceful handling for partially migrated components

- [x] **Task: Add failing teacher-review tests**
  - [x] Cover teacher read-only access to non-spreadsheet practice submissions
  - [x] Cover org boundary and student/teacher authorization behavior

## Phase 2: Persistence Alignment

### Tasks

- [x] **Task: Extend practice submission persistence**
  - [x] Persist canonical response envelopes for migrated practice families
  - [x] Preserve attempt metadata, scaffold usage, and artifacts where available
  - [x] Keep compatibility behavior for pre-backfill components

- [x] **Task: Add deterministic evaluation fields**
  - [x] Store per-part correctness and scoring where available
  - [x] Add misconception-tagging storage fields and empty extension hooks so components can write tags at submission time
  - [x] This track owns the storage schema and retrieval queries; the Error Analysis track owns population logic and aggregation

- [x] **Task: Type Convex submission schema**
  - [x] Replace `v.any()` on `activity_submissions.submissionData` in `convex/schema.ts` with a Convex validator matching the `practice.v1` envelope
  - [x] Keep backward compatibility for pre-contract submissions during migration window

## Phase 3: Teacher Evidence Surfaces

### Tasks

- [x] **Task: Generalize submission detail assembly**
  - [x] Expand teacher submission-detail helpers beyond spreadsheet-only evidence
  - [x] Normalize evidence rendering by activity family or artifact type

- [x] **Task: Update teacher read-only UI**
  - [x] Show exact submitted answers and artifacts where available
  - [x] Preserve spreadsheet rendering for spreadsheet families
  - [x] Keep the surface strictly read-only

## Phase 4: Verification and Closeout

### Tasks

- [x] **Task: Run verification**
  - [x] Run the targeted submission, teacher-view, and authorization tests
  - [x] Run `npm run lint`
  - [x] Fix any regressions

- [x] **Task: Update planning memory**
  - [x] Record any reusable teacher-evidence or persistence patterns in Conductor docs if needed
