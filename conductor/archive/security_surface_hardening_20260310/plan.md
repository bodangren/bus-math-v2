# Implementation Plan: Security Surface Hardening

## Phase 1: Regression Coverage

- [x] Task: Add failing regression tests for demo provisioning environment gates and sensitive Convex boundaries
  - [x] Add demo-provisioning tests that reject preview and production environments while preserving local development behavior
  - [x] Add boundary tests that require sensitive activity/profile helpers to remain internal-only

- [x] Task: Add failing route coverage for internalized activity access
  - [x] Update activity-route tests to require internal Convex activity lookup usage
  - [x] Confirm the new expectations fail against the pre-hardening implementation

- [x] Task: Conductor - User Manual Verification 'Phase 1: Regression Coverage' (Protocol in workflow.md)

## Phase 2: Runtime Hardening

- [x] Task: Harden demo provisioning and Convex access boundaries
  - [x] Restrict demo provisioning to safe local development contexts
  - [x] Convert sensitive Convex activity/profile helpers to internal-only exports and update server callers/tests

- [~] Task: Update security-facing documentation and closeout artifacts
  - [x] Update README with the hardened demo-account and activity-access behavior
  - [x] Record any remaining follow-up items in Conductor memory if needed

- [x] Task: Conductor - User Manual Verification 'Phase 2: Runtime Hardening' (Protocol in workflow.md)
