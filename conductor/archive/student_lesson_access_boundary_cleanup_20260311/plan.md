# Implementation Plan: Student Write Boundary Hardening

## Phase 1: Boundary Spec And Red Tests

- [x] Add failing negative tests that prove teacher/admin request claims are rejected by student-write routes before any learner-data mutation runs.
- [x] Extend route coverage for student-write endpoints to pin the expected `403` response shape and keep student success paths intact.

## Phase 2: Hardening And Integration

- [x] Add shared request-level auth helpers in `lib/auth/server.ts` for student-only API writes.
- [x] Apply the new student-only guard to `app/api/phases/complete/route.ts`, `app/api/progress/assessment/route.ts`, `app/api/activities/spreadsheet/[activityId]/draft/route.ts`, and `app/api/activities/spreadsheet/[activityId]/submit/route.ts`.
- [x] Keep teacher/admin spreadsheet replay reads working while preventing teacher/admin writes.

## Phase 3: Docs, Verification, And Closeout

- [x] Update README plus impacted security/Conductor memory docs to document the student-write boundary hardening and recorded follow-on auth debt.
- [x] Run `CI=true npm run lint`, `CI=true npm test`, and `CI=true npm run build`, then resolve any issues.
- [x] Archive the completed track, update `conductor/tracks.md`, commit with the model name/version in the message, and push the branch.
