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
- Follow-up updates:
  - Phase 2 tasks completed and committed (`8a4fd4a`, `42e6ac3`, `27bb1b3`).
  - Fixed demo provisioning gap: `ensure-demo` now seeds a six-phase lesson with a required `spreadsheet-evaluator` activity so `demo_student` can complete activity phases.
  - Fixed stale demo-version fallback and phase-link drift in `ensure-demo` seeding; now normalizes to one active version and resolves persisted phase IDs before section upsert.
  - Fixed `/api/phases/complete` duplicate-click behavior to return idempotent success (instead of `409`) when a phase is already completed.
  - Fixed student lesson rendering path to mount real `ActivityRenderer` for activity blocks (instead of static Activity ID text), enabling visible interactive spreadsheet activities in lesson phases.
