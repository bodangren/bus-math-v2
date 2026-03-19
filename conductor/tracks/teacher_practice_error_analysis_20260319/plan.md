# Implementation Plan: Teacher Practice Error Analysis

## Phase 1: Summary Model and Safety Red Tests

### Tasks

- [ ] **Task: Add failing tests for deterministic error summaries**
  - [ ] Cover summary assembly from stored part-level evidence and misconception tags
  - [ ] Cover lesson-level and student-level teacher access boundaries

- [ ] **Task: Add failing tests for AI-summary fallback behavior**
  - [ ] Assert that teacher evidence still works when AI analysis is unavailable
  - [ ] Assert that AI output never replaces raw evidence access

## Phase 2: Deterministic Summary Layer

### Tasks

- [ ] **Task: Implement teacher-facing deterministic summaries**
  - [ ] Aggregate misconception tags and per-part outcomes into concise summaries
  - [ ] Expose those summaries through the teacher review flow

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
