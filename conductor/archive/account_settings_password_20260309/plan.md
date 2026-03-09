# Implementation Plan: Account Settings & Self-Service Password Changes

## Phase 1: Activate Track and Capture Failing Coverage

- [x] Task 1.1: Mark this track active in Conductor and record the current product gap in the plan context
- [x] Task 1.2: Write failing automated tests for the password-change route, Convex credential update path, and account settings UI
  - [x] Cover unauthorized, invalid-current-password, invalid-new-password, and success cases for the route
  - [x] Cover the settings page rendering account details plus the real password form
  - [x] Cover the client form UX for validation and successful submission states
- [x] Task 1.3: Run the focused test commands and confirm the new coverage fails before implementation
- [x] Task: Conductor - User Manual Verification 'Phase 1: Activate Track and Capture Failing Coverage' (Automated verification only; unattended run)

## Phase 2: Implement Secure Password Change Backend

- [x] Task 2.1: Add a shared password-policy helper for role-aware validation
- [x] Task 2.2: Add internal Convex support for updating a caller’s own credential after verifying ownership
- [x] Task 2.3: Implement the authenticated password-change API route using existing JWT session claims
- [x] Task 2.4: Run focused backend tests and confirm they pass
- [x] Task: Conductor - User Manual Verification 'Phase 2: Implement Secure Password Change Backend' (Automated verification only; unattended run)

## Phase 3: Ship the Settings Experience

- [x] Task 3.1: Replace the placeholder password-update component with a real form wired to the new API
- [x] Task 3.2: Replace the `/settings` placeholder page with an account settings experience that surfaces user context and password guidance
- [x] Task 3.3: Update any auth-context helpers needed by the new settings flow and rerun focused UI tests
- [x] Task: Conductor - User Manual Verification 'Phase 3: Ship the Settings Experience' (Automated verification only; unattended run)

## Phase 4: Documentation, Verification, and Closeout

- [x] Task 4.1: Update README and any impacted Conductor/docs notes to document self-service password changes and the remaining teacher-managed reset path
- [x] Task 4.2: Run non-interactive verification commands for lint, tests, and production build
- [x] Task 4.3: Update track metadata and registry state, push the branch, and archive the completed track
