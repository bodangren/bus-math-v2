# Plan: Sprint 5 - Teacher Command Center (Rebaseline 2026-02-09)

## Dependency Gate
- [x] Task: Confirm Sprint 3 and Sprint 4 completion checkpoints before teacher workflow expansion. [b4a3234]

## Phase 1: Bulk Onboarding Pipeline
- [x] Task: Finalize transactional `bulk-create-students` edge function with strict role checks and audit-safe responses. [252174b]
- [x] Task: Implement `BulkImportDialog` parse/review/submit flow with robust validation errors. [252174b]
- [x] Task: Implement print-friendly `CredentialsSheet` and verify output for Letter + A4. [252174b]
- [ ] Task: Integration test for class-size import scenarios (25-30 students).

## Session Handoff Notes (2026-02-18)

- **Phase 1 Progress:**
  - Implemented `app/api/users/bulk-create-students/route.ts` proxy to edge function with unit tests.
  - Implemented `TeacherBulkImportDialog` for multi-line name parsing and proposed username review.
  - Implemented `TeacherCredentialsSheet` for printable student account records.
  - Integrated bulk import into the Teacher Dashboard.
  - Resolved several build errors related to type mismatches in `ActivityRenderer` and `complete` API route.
- **Current State:** Phase 1 UI and API are implemented. E2E tests are updated but encountered dev-server timeout issues during verification.
- **Next Steps:** Finalize integration tests for Phase 1, then proceed to **Phase 2: Gradebook And Status Grid**.

## Phase 2: Gradebook And Status Grid
- [ ] Task: Implement `GradebookGrid` with scalable row rendering and stable sorting/filtering.
- [ ] Task: Wire student progress + competency data fetch path with org scoping.
- [ ] Task: Implement status visualization contract (green/yellow/red) with deterministic rules.

## Phase 3: Evidence And Intervention Views
- [ ] Task: Implement `SubmissionDetailModal` and readonly activity playback path.
- [ ] Task: Support spreadsheet/read-only rendering for teacher review workflows.
- [ ] Task: Add regression tests for teacher viewing student submissions without mutation capability.

## Phase 4: Account Management Actions
- [ ] Task: Implement secure reset-password workflow (API/edge + UI) with role gating.
- [ ] Task: Implement edit-student workflow with validation and audit-friendly change handling.
- [ ] Task: Conductor - User Manual Verification 'Sprint 5 Teacher Command Center' (Protocol in workflow.md).
