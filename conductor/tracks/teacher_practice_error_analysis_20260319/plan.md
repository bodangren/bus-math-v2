# Implementation Plan: Teacher Practice Error Analysis

> Deconfliction note: this plan assumes generic teacher evidence, canonical persistence, and migrated component payloads already exist. If those prerequisites are missing, route the gap back to the owning earlier track instead of expanding this track into evidence-foundation work.

## Phase 1: Summary Model and Safety Red Tests

### Tasks

- [x] **Task: Add failing tests for deterministic error summaries**
  - [x] Cover summary assembly from stored part-level evidence and misconception tags
  - [x] Cover lesson-level and student-level teacher access boundaries

- [x] **Task: Add failing tests for AI-summary fallback behavior**
  - [x] Assert that teacher evidence still works when AI analysis is unavailable
  - [x] Assert that AI output never replaces raw evidence access

## Phase 2: Deterministic Summary Layer

### Tasks

- [x] **Task: Implement teacher-facing deterministic summaries**
  - [x] Aggregate misconception tags and per-part outcomes into concise summaries
  - [x] Expose those summaries through the teacher review flow

- [x] **Task: Add lesson-level error summary Convex query**
  - [x] Added `getLessonErrorSummary` internal query in `convex/teacher.ts`
  - [x] Aggregates all practice.v1 submissions for a lesson into a `DeterministicErrorSummary`
  - [x] Added `/api/teacher/error-summary` API route with auth/org guard

- [x] **Task: Wire per-student error summary into submission detail**
  - [x] Extended `getSubmissionDetail` to include `studentErrorSummary` field
  - [x] Builds deterministic summary from student's practice.v1 envelopes

## Phase 3: AI-Assisted Interpretation

### Tasks

- [ ] **Task: Implement AI-summary pipeline**
  - [ ] Assemble model inputs from stored evidence plus deterministic summaries
  - [ ] Generate concise teacher-facing interpretation with explicit evidence grounding
  - [ ] Add safe fallback behavior when the AI layer is unavailable

## Phase 4: Verification and Closeout

### Tasks

- [ ] **Task: Run verification**
  - [ ] Run targeted tests for summary assembly, authorization, and fallback behavior
  - [ ] Run `npm run lint`
  - [ ] Fix regressions

- [ ] **Task: Update Conductor docs if new operational requirements exist**
  - [ ] Record any AI-provider or evidence-retention requirements that become part of the active operating model
