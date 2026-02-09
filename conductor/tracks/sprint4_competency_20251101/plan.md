# Plan: Sprint 4 - Competency Engine & Lesson Gating (Rebaseline 2026-02-09)

## Dependency Gate
- [x] Task: Confirm Sprint 3 is complete and competency prerequisite schema/routes are stable. [afdf6d3]

## Phase 1: Competency Schema And RLS
- [x] Task: Validate `competency_standards` and `student_competency` schema parity against Supabase migrations. [afdf6d3]
- [x] Task: Tighten RLS policies for student self-read and teacher/admin scoped read access. [bb5744c]
- [x] Task: Add seed coverage for Unit 1 accounting standards and verify idempotency. [c89c3f8]

## Phase 2: Activity Evaluation Path
- [x] Task: Finalize `SpreadsheetEvaluator` validation and submission handling with security-focused tests. [8a4fd4a]
- [x] Task: Ensure activity completion events propagate through `ActivityRenderer` with canonical completion API. [42e6ac3]
- [ ] Task: Add read-only replay support needed for teacher evidence review.

## Phase 3: Lesson Navigation And Auto-Capture
- [ ] Task: Stabilize `LessonStepper` + locked navigation logic under server-authorized access rules.
- [ ] Task: Harden auto-capture flows for read/activity phases, including offline/retry edge cases.
- [ ] Task: Remove any duplicate completion triggers and preserve idempotent behavior.

## Phase 4: Unit 1 Delivery Verification
- [ ] Task: Re-verify Unit 1 Lesson 1 v2 authored content (all six phases + competency links).
- [ ] Task: Execute end-to-end flow validation for unlock logic and competency recording.
- [ ] Task: Conductor - User Manual Verification 'Sprint 4 Competency Release' (Protocol in workflow.md).

## Session Handoff Notes (2026-02-09)

- Completed in this session:
  - Dependency gate + schema parity unblocked and completed. [`afdf6d3`]
  - Competency RLS scope hardening migration + tests completed. [`bb5744c`]
  - Unit 1 competency standards seed coverage + idempotency checks completed. [`c89c3f8`]
- Current in-progress task:
  - `Phase 2 / Task 1` (`SpreadsheetEvaluator` validation + submission hardening) is still `[~]`.
- Uncommitted local WIP to resume from:
  - `app/api/activities/spreadsheet/[activityId]/submit/route.ts`
  - `__tests__/app/api/activities/spreadsheet/[activityId]/submit/route.test.ts`
  - `conductor/tracks/sprint4_competency_20251101/plan.md` (status marker only)
- Current WIP intent:
  - Server should ignore client-provided `targetCells` and validate against DB activity config (`activities.props.targetCells`).
  - Route should return `422` when activity config is not valid `spreadsheet-evaluator` schema.
- Next-session start sequence:
  1. Run: `CI=true npm test -- __tests__/app/api/activities/spreadsheet/[activityId]/submit/route.test.ts`
  2. If passing, run: `CI=true npm test -- __tests__/components/SpreadsheetEvaluator.test.tsx __tests__/api/spreadsheet-sanitization.test.ts __tests__/lib/activities/spreadsheet-validation.test.ts`
  3. Run: `npm run lint`
  4. Commit task changes + git note, then mark Phase 2 Task 1 complete in this plan.
