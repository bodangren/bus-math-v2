# Implementation Plan

## Phase 1: Phase Guidance Red Tests
- [x] Task: Add failing tests for curriculum phase-guidance metadata
  - [x] Cover accounting, excel, project, and assessment phase guidance lookup
  - [x] Assert guided-practice and graded-phase success criteria are exposed
- [x] Task: Add failing tests for the student phase shell
  - [x] Add a focused component test for the reusable phase guidance card
  - [x] Add lesson-renderer regression tests that expect the current phase guidance shell and shared `PhaseRenderer`

## Phase 2: Objective-Aware Student Phase Shell
- [x] Task: Implement shared curriculum phase-guidance helpers
  - [x] Add canonical phase goal and success-criteria metadata keyed by lesson type and phase number
  - [x] Expose a helper that resolves the current lesson type and phase guidance with safe fallback behavior
- [x] Task: Render the reusable student phase guidance shell
  - [x] Add a dedicated student-facing phase guidance component
  - [x] Refactor `LessonRenderer` to render the guidance shell and shared `PhaseRenderer` while preserving progress/navigation behavior

## Phase 3: Verification and Closeout
- [x] Task: Run lint and automated tests for the track scope
- [x] Task: Update README and Conductor memory files with the phase-shell alignment outcome
- [ ] Task: Archive the track and finalize registry/metadata updates
