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
- [x] Task: Add read-only replay support needed for teacher evidence review. [27bb1b3]

## Phase 3: Lesson Navigation And Auto-Capture
- [x] Task: Stabilize `LessonStepper` + locked navigation logic under server-authorized access rules. [12b3be6]
- [x] Task: Harden auto-capture flows for read/activity phases, including offline/retry edge cases. [12b3be6]
- [x] Task: Remove any duplicate completion triggers and preserve idempotent behavior. [12b3be6]
- [checkpoint: 12b3be6]

## Phase 4: Unit 1 Delivery Verification
- [ ] Task: Re-verify Unit 1 Lesson 1 v2 authored content (all six phases + competency links).
- [ ] Task: Execute end-to-end flow validation for unlock logic and competency recording.
- [ ] Task: Conductor - User Manual Verification 'Sprint 4 Competency Release' (Protocol in workflow.md).

## Session Handoff Notes (2026-02-18)

- **Blocker Resolved:** Fixed the 500 error in `POST /api/users/ensure-demo?reset=full` by robustly handling unique constraint violations during re-seeding. The endpoint now safely cleans up stale phases/sections before insertion.
- **Phase 3 Complete:**
  - **LessonStepper:** Stabilized visual logic to treat 'available' active phases as 'current' (Blue) and verified 'locked' logic via tests.
  - **Auto-Capture:** Implemented automatic phase completion for "Read" phases upon navigation in `LessonRenderer`. Removed manual "Mark Complete" button.
  - **Navigation:** Confirmed "Next Phase" button enables correctly for Read phases and completed Do phases.
  - **Idempotency:** Verified `ActivityRenderer` and API endpoints handle duplicate submissions gracefully without errors.
- **Checkpoint:** `12b3be6` captures the stable state of Phase 3.
- **Next Steps:** Proceed to Phase 4 for final end-to-end verification of Unit 1 Lesson 1 content and flow.

### Commit Ledger (latest-first)
- `12b3be6` feat(lesson): stabilize navigation and harden auto-capture flow
