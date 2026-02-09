# Plan: Sprint 4 - Competency Engine & Lesson Gating (Rebaseline 2026-02-09)

## Dependency Gate
- [x] Task: Confirm Sprint 3 is complete and competency prerequisite schema/routes are stable. [afdf6d3]

## Phase 1: Competency Schema And RLS
- [x] Task: Validate `competency_standards` and `student_competency` schema parity against Supabase migrations. [afdf6d3]
- [ ] Task: Tighten RLS policies for student self-read and teacher/admin scoped read access.
- [ ] Task: Add seed coverage for Unit 1 accounting standards and verify idempotency.

## Phase 2: Activity Evaluation Path
- [ ] Task: Finalize `SpreadsheetEvaluator` validation and submission handling with security-focused tests.
- [ ] Task: Ensure activity completion events propagate through `ActivityRenderer` with canonical completion API.
- [ ] Task: Add read-only replay support needed for teacher evidence review.

## Phase 3: Lesson Navigation And Auto-Capture
- [ ] Task: Stabilize `LessonStepper` + locked navigation logic under server-authorized access rules.
- [ ] Task: Harden auto-capture flows for read/activity phases, including offline/retry edge cases.
- [ ] Task: Remove any duplicate completion triggers and preserve idempotent behavior.

## Phase 4: Unit 1 Delivery Verification
- [ ] Task: Re-verify Unit 1 Lesson 1 v2 authored content (all six phases + competency links).
- [ ] Task: Execute end-to-end flow validation for unlock logic and competency recording.
- [ ] Task: Conductor - User Manual Verification 'Sprint 4 Competency Release' (Protocol in workflow.md).
