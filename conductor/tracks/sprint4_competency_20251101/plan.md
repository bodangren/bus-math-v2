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
- [x] Task: Stabilize `LessonStepper` + locked navigation logic under server-authorized access rules. [fba7c2d]
- [x] Task: Harden auto-capture flows for read/activity phases, including offline/retry edge cases. [4dc47e0]
- [~] Task: Remove any duplicate completion triggers and preserve idempotent behavior.

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
  - Added explicit demo full-reset mode: `POST /api/users/ensure-demo?reset=full` now clears `demo_student` progress/submissions/completions/spreadsheet responses/competency evidence before reseeding lesson content.

### Commit Ledger (latest-first)
- `b855365` feat(demo): add full reset mode for demo student state
- `4dc47e0` fix(student): render interactive activity blocks in lesson phases
- `fcb7305` fix(demo): normalize ensured lesson version and phase sections
- `f5bf8cd` fix(api): return idempotent success for already-completed phases
- `1a74dd9` fix(demo): provision spreadsheet activity in ensure-demo lesson
- `224dada` conductor(plan): mark task 'read-only replay support' complete
- `27bb1b3` feat(api): add read-only spreadsheet replay for teacher evidence
- `4a712fe` conductor(plan): mark task 'ActivityRenderer completion propagation' complete
- `42e6ac3` fix(lesson): propagate submit completion events through ActivityRenderer
- `e699556` conductor(plan): mark task 'SpreadsheetEvaluator validation hardening' complete
- `8a4fd4a` fix(api): harden spreadsheet submit against client target tampering

### Open Blocker (must resolve before Phase 3)
- User runtime still reports:
  - `curl -X POST "http://localhost:3000/api/users/ensure-demo?reset=full"` -> `{"error":"Failed to ensure demo users"}`
- This is not reproducible in unit tests; endpoint returns generic `500` wrapper, so next session must inspect live server logs to locate failing sub-operation.

### Next Session Start Sequence (do these first)
1. Start dev server and capture logs: `npm run dev`
2. Re-run reset in another shell: `curl -i -X POST "http://localhost:3000/api/users/ensure-demo?reset=full"`
3. Read server console stack trace and patch failing table/op in `app/api/users/ensure-demo/route.ts`.
4. Re-run:
   - `CI=true npm test -- __tests__/app/api/users/ensure-demo/route.test.ts __tests__/components/login-form.test.tsx __tests__/components/student/LessonRenderer.test.tsx __tests__/app/student/lesson/[lessonSlug]/page.test.tsx`
   - `npm run lint`
5. Validate manually as `demo_student`:
   - `/student/lesson/demo-introduction-to-business-math?phase=3` renders spreadsheet evaluator
   - phase completion does not throw `Phase already completed` error
6. Only after blocker is green, begin Phase 3 Task 1.
