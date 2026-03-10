# Implementation Plan: React Test Signal Cleanup & Conductor Queue Closeout

## Phase 1: Track Setup and Red Tests

- [x] Task 1.1: Register the cleanup track in Conductor and document the warning/queue drift found during review
- [x] Task 1.2: Add failing tests for deterministic `InventoryManager` notification/event identifiers
  - [x] Cover multiple rapid notifications without duplicate React key warnings
  - [x] Cover rapid market-event generation producing distinct ids
- [x] Task 1.3: Add failing tests for async warning cleanup
  - [x] Cover `SubmissionDetailModal` settling its fetch lifecycle without React `act(...)` warnings
  - [x] Cover `usePhaseCompletion` completion flow without React `act(...)` warnings
- [x] Task 1.4: Add failing coverage for stale Conductor queue cleanup
- [x] Task 1.5: Run focused tests and confirm the pre-implementation failure state
- [x] Task: Conductor - User Manual Verification 'Phase 1: Track Setup and Red Tests' (Automated verification only; unattended run)

## Phase 2: Implementation and Refactor

- [x] Task 2.1: Implement deterministic id generation in `InventoryManager`
- [x] Task 2.2: Refactor modal and hook tests to use warning-free async patterns
- [x] Task 2.3: Clean up stale completed February tracks from active Conductor state
- [x] Task 2.4: Run focused tests and confirm they pass
- [x] Task: Conductor - User Manual Verification 'Phase 2: Implementation and Refactor' (Automated verification only; unattended run)

## Phase 3: Verification, Docs, and Closeout

- [x] Task 3.1: Update README and Conductor memory files with the cleanup and queue-hygiene changes
- [x] Task 3.2: Run non-interactive verification commands for lint, tests, and production build
- [x] Task 3.3: Update track metadata, archive the completed track, commit changes, and push the branch
- [x] Task: Conductor - User Manual Verification 'Phase 3: Verification, Docs, and Closeout' (Automated verification only; unattended run)
