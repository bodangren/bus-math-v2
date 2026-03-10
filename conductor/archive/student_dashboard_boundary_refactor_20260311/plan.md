# Implementation Plan

## Phase 1: Auth Boundary Hardening
- [x] Task: Add student-role server guard helper
  - [x] Write failing auth guard tests for student-only access and teacher/admin redirects
  - [x] Implement `requireStudentSessionClaims` in `lib/auth/server`
- [x] Task: Enforce the student dashboard role boundary
  - [x] Write failing page tests for teacher/admin redirects away from `/student/dashboard`
  - [x] Update `app/student/dashboard/page.tsx` to use the new guard

## Phase 2: Shared Dashboard Presentation Refactor
- [x] Task: Extract shared dashboard lesson-status presentation
  - [x] Write failing tests for a shared next-lesson card and shared unit-status helpers
  - [x] Implement shared dashboard presentation modules/components
- [x] Task: Migrate student and teacher detail pages to the shared presentation
  - [x] Update the student dashboard to consume the shared presentation
  - [x] Update the teacher student-detail page to consume the shared presentation
  - [x] Adjust existing tests to assert the shared behavior

## Phase 3: Verification and Closeout
- [x] Task: Run lint, targeted tests, and production build
- [x] Task: Update README and Conductor memory files with the refactor/security outcome
- [x] Task: Archive the track and finalize registry/metadata updates
