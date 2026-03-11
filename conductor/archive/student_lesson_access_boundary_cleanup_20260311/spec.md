# Track Spec: Student Write Boundary Hardening

## Summary

Harden request-level authorization for student-write APIs so only student sessions can create or mutate learner progress, assessment submissions, spreadsheet drafts, and spreadsheet submissions. The fix should preserve intentional teacher/admin read-only preview and replay capabilities while closing the current role-boundary gap.

## Problem Statement

Several authenticated API routes only verify that a session exists and then write learner data using `claims.sub` directly. Because teacher/admin preview is intentionally allowed elsewhere, those non-student roles can currently create `student_progress`, spreadsheet draft/submission, assessment, and competency rows tied to non-student profiles. This is a high-severity authorization defect and the first-track-of-day cleanup must patch it before lower-priority refactors continue.

## Goals

- Add a shared request-level guard for student-only API writes.
- Reject teacher/admin sessions from student-write endpoints before any Convex read/write that would mutate learner state.
- Preserve authenticated student behavior for phase completion, assessment submission, spreadsheet draft save/load, and spreadsheet submission.
- Preserve teacher/admin read-only replay behavior where it is already intentional.
- Increase automated coverage around request-role enforcement and negative authorization cases.
- Update README and impacted implementation/security docs to describe the hardened boundary.

## Non-Goals

- Reworking session revocation or JWT invalidation across the entire app in this track.
- Changing teacher/admin read-only replay behavior for spreadsheet responses.
- Changing Convex payload shapes beyond what is needed to enforce route-level authorization.

## Acceptance Criteria

1. Shared request auth logic enforces a student-only boundary for student-write API routes.
2. `POST /api/phases/complete`, `POST /api/progress/assessment`, `GET|POST /api/activities/spreadsheet/[activityId]/draft`, and `POST /api/activities/spreadsheet/[activityId]/submit` reject teacher/admin sessions with `403`.
3. Rejected teacher/admin requests do not execute the downstream Convex mutations for learner data.
4. Existing student success-path behavior remains covered by tests.
5. README and security/conductor docs reflect the hardened request boundary.

## Risks & Mitigations

- Risk: Teacher/admin replay endpoints could be blocked accidentally.
  Mitigation: Limit the new guard to student-write endpoints and keep the spreadsheet replay GET route covered separately.
- Risk: Existing student flows could fail if the new helper changes response semantics.
  Mitigation: Add negative role tests alongside the current student success-path tests for each route.
- Risk: A secondary auth gap could remain undocumented.
  Mitigation: Record the session-revocation issue in Conductor tech debt for a follow-on track.
