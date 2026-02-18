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
- [x] Task: Re-verify Unit 1 Lesson 1 v2 authored content (all six phases + competency links). [bc32eb1]
- [x] Task: Execute end-to-end flow validation for unlock logic and competency recording. [bc32eb1]
- [x] Task: Conductor - User Manual Verification 'Sprint 4 Competency Release' (Protocol in workflow.md). [bc32eb1]
- [checkpoint: bc32eb1]

## Session Handoff Notes (2026-02-18)

- **Sprint 4 Complete:** All phases verified.
- **Phase 4 Verification:**
  - Validated Unit 1 Lesson 1 content flow across all 6 phases.
  - Confirmed activity completion triggers and cache invalidation logic fix (committed in `bc32eb1`).
  - Successfully executed end-to-end flow tests (`tests/e2e/sprint4-demo-flow.spec.ts`).
- **Checkpoint:** `bc32eb1` marks the verified completion of Sprint 4.
- **Next Steps:** Merge `sprint4_competency_20260209` into `main` and begin Sprint 5.

### Commit Ledger (latest-first)
- `bc32eb1` fix(lesson): Fix activity completion state refresh and cache invalidation
- `12b3be6` feat(lesson): stabilize navigation and harden auto-capture flow
