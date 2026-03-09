# Implementation Plan: Student Progress Hub & Resume Navigation

## Phase 1: Activate the Track and Capture Failing Coverage

- [x] Task 1.1: Mark the new track active in Conductor and document the student dashboard product gap
- [x] Task 1.2: Write failing tests for shared student dashboard derivation logic
  - [x] Cover overall summary metrics, unit status derivation, and next-lesson selection
  - [x] Cover empty and fully completed-course states
- [x] Task 1.3: Write failing page and route tests for the upgraded dashboard and `/student` alias
  - [x] Cover next-step rendering, unit progress rendering, and completion-state messaging
  - [x] Cover redirect behavior for unauthenticated requests and `/student`
- [x] Task 1.4: Run focused non-interactive tests and confirm they fail before implementation

## Phase 2: Implement Shared Progress and Navigation Helpers

- [x] Task 2.1: Add a shared student dashboard view-model utility
- [x] Task 2.2: Add shared student navigation helpers for dashboard, unit anchors, and lesson links
- [x] Task 2.3: Update existing student overview components to consume valid lesson/dashboard paths
- [x] Task 2.4: Run focused helper/component tests and confirm they pass

## Phase 3: Ship the Student Progress Hub

- [x] Task 3.1: Rebuild `/student/dashboard` with summary metrics, next-step callout, and unit progress cards
- [x] Task 3.2: Add the `/student` route alias to the dashboard
- [x] Task 3.3: Rerun focused student page tests and polish mobile/tablet layout

## Phase 4: Documentation, Verification, and Closeout

- [x] Task 4.1: Update README with the guided student dashboard functionality
- [x] Task 4.2: Run `CI=true npm run lint`, targeted tests, `CI=true npm test`, and `CI=true npm run build`
- [x] Task 4.3: Update track metadata and registry state, archive the track, commit with model/version metadata, and push the branch
