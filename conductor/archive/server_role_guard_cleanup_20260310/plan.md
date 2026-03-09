# Implementation Plan: Server Role Guard Cleanup & Admin Authorization Hardening

## Phase 1: Track Setup and Red Tests

- [x] Task 1.1: Register the cleanup track in Conductor and document the auth/redirect drift found during review
- [x] Task 1.2: Add failing tests for shared server auth guard helpers
  - [x] Cover login redirect behavior for missing sessions
  - [x] Cover fallback redirect behavior for disallowed roles
- [x] Task 1.3: Add failing page tests for teacher/admin route guard behavior
  - [x] Cover `/admin/dashboard` rejecting non-admin sessions
  - [x] Cover teacher page fallback redirects for authenticated-but-unavailable data
- [x] Task 1.4: Run focused tests and confirm the pre-implementation failure state
- [x] Task: Conductor - User Manual Verification 'Phase 1: Track Setup and Red Tests' (Automated verification only; unattended run)

## Phase 2: Shared Guard Refactor

- [x] Task 2.1: Implement shared server auth/role guard helpers in `lib/auth/server.ts`
- [x] Task 2.2: Refactor the teacher and admin pages to use the shared helper
  - [x] `app/teacher/page.tsx`
  - [x] `app/teacher/gradebook/page.tsx`
  - [x] `app/teacher/units/[unitNumber]/page.tsx`
  - [x] `app/teacher/students/[studentId]/page.tsx`
  - [x] `app/admin/dashboard/page.tsx`
- [x] Task 2.3: Run focused tests and confirm they pass
- [x] Task: Conductor - User Manual Verification 'Phase 2: Shared Guard Refactor' (Automated verification only; unattended run)

## Phase 3: Verification, Docs, and Closeout

- [x] Task 3.1: Update README and Conductor memory files with the shared-guard/security cleanup
- [x] Task 3.2: Run non-interactive verification commands for lint, tests, and production build
- [x] Task 3.3: Update track metadata, archive the completed track, commit changes, and push the branch
- [x] Task: Conductor - User Manual Verification 'Phase 3: Verification, Docs, and Closeout' (Automated verification only; unattended run)
