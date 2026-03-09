# Implementation Plan: Dashboard Helper Consolidation & Dev Stack Closeout

## Phase 1: Track Setup, Review, and Red Tests

- [x] Task 1.1: Register the cleanup track in Conductor and document the stale migration-track closeout intent
- [x] Task 1.2: Add failing tests for the shared dashboard helper module
  - [x] Cover nullable-string normalization
  - [x] Cover map-entry reuse/creation semantics
- [x] Task 1.3: Add a failing test for the `dev:stack` package script
- [x] Task 1.4: Run the new focused tests and confirm the pre-implementation failure state
- [x] Task: Conductor - User Manual Verification 'Phase 1: Track Setup, Review, and Red Tests' (Automated verification only; unattended run)

## Phase 2: Shared Helper Refactor and Dev Workflow Support

- [x] Task 2.1: Implement `convex/dashboardHelpers.ts`
- [x] Task 2.2: Refactor dashboard/curriculum Convex query modules to use the shared helper
  - [x] `convex/public.ts`
  - [x] `convex/student.ts`
  - [x] `convex/teacher.ts`
- [x] Task 2.3: Add the `scripts/dev-stack.mjs` helper and wire `package.json`
- [x] Task 2.4: Run focused tests and confirm they pass
- [x] Task: Conductor - User Manual Verification 'Phase 2: Shared Helper Refactor and Dev Workflow Support' (Automated verification only; unattended run)

## Phase 3: Docs, Security Review Notes, and Conductor Cleanup

- [x] Task 3.1: Update README with the local stack workflow and cleanup notes
- [x] Task 3.2: Record the focused security review result in project docs
- [x] Task 3.3: Archive the stale migration track and update the tracks registry to keep one active track per branch
- [x] Task: Conductor - User Manual Verification 'Phase 3: Docs, Security Review Notes, and Conductor Cleanup' (Automated verification only; unattended run)

## Phase 4: Final Verification and Closeout

- [x] Task 4.1: Run non-interactive verification commands for lint, tests, and production build
- [x] Task 4.2: Update track metadata and registry state for completion
- [x] Task 4.3: Commit implementation, push remote branch, and archive the completed track
