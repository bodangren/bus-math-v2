# Implementation Plan: Published Progress Consistency & Dashboard Hardening

## Phase 1: Track Setup and Red Tests

- [x] Task 1.1: Register the cleanup track in Conductor and document the published-vs-draft progress drift found during review
- [x] Task 1.2: Add failing tests for shared published-progress helpers
  - [x] Cover latest-published version selection
  - [x] Cover published-phase snapshot calculation for teacher/student progress
- [x] Task 1.3: Add failing tests for student dashboard phase-weighted unit progress
- [x] Task 1.4: Run focused tests and confirm the pre-implementation failure state
- [x] Task: Conductor - User Manual Verification 'Phase 1: Track Setup and Red Tests' (Automated verification only; unattended run)

## Phase 2: Shared Progress Refactor

- [x] Task 2.1: Implement shared published-progress helpers for latest published lesson versions and phase snapshots
- [x] Task 2.2: Refactor student Convex progress flows to use the shared helpers
  - [x] `convex/student.ts`
- [x] Task 2.3: Refactor teacher Convex progress snapshots to use the shared helpers
  - [x] `convex/teacher.ts`
  - [x] Related shared student dashboard math in `lib/student/dashboard.ts`
- [x] Task 2.4: Run focused tests and confirm they pass
- [x] Task: Conductor - User Manual Verification 'Phase 2: Shared Progress Refactor' (Automated verification only; unattended run)

## Phase 3: Verification, Documentation, and Closeout

- [x] Task 3.1: Update README and Conductor memory files with the published-progress hardening result and any remaining follow-up
- [x] Task 3.2: Run non-interactive verification commands for lint, tests, and production build
- [x] Task 3.3: Update track metadata, archive the completed track, commit changes, and push the branch
- [x] Task: Conductor - User Manual Verification 'Phase 3: Verification, Documentation, and Closeout' (Automated verification only; unattended run)
