# Plan: Sprint 5 - Teacher Command Center (Rebaseline 2026-02-09)

## Dependency Gate
- [x] Task: Confirm Sprint 3 and Sprint 4 completion checkpoints before teacher workflow expansion. [b4a3234]

## Phase 1: Bulk Onboarding Pipeline
- [x] Task: Finalize transactional `bulk-create-students` edge function with strict role checks and audit-safe responses. [252174b]
- [x] Task: Implement `BulkImportDialog` parse/review/submit flow with robust validation errors. [252174b]
- [x] Task: Implement print-friendly `CredentialsSheet` and verify output for Letter + A4. [252174b]
- [x] Task: Integration test for class-size import scenarios (25-30 students). [394a75a]

## Session Handoff Notes (2026-02-18)

- **Phase 1 — Verified & Stable:**
  - Bulk student creation works end-to-end (tested with real accounts in local dev).
  - Moved `bulk-create-students` logic out of the Supabase edge function and into the Next.js API route (`app/api/users/bulk-create-students/route.ts`) using `createAdminClient`. Eliminates the need to run `supabase functions serve` in local dev; no separate edge function deployment required for production.
  - Fixed `getSession()` → `getUser()` for secure server-side auth validation.
  - Fixed profile `insert` → `upsert` to survive the `on_auth_user_created` auto-trigger (migration `20251114214040`) that creates a stub profile the moment `auth.admin.createUser` fires.
  - Fixed `TeacherCredentialsSheet` print: replaced broken `<style jsx global>` (Pages Router only) + flawed visibility-isolation CSS with a self-contained `window.open()` print window. Print button now produces a correct two-column Letter layout.
  - Unit and integration tests updated to mock `createAdminClient` instead of `global.fetch`.
- **Next Steps:** Proceed to **Phase 2: Gradebook And Status Grid**.

## Phase 2: Gradebook And Status Grid [checkpoint: 1b7ccd3]
- [x] Task: Implement `GradebookGrid` with scalable row rendering and stable sorting/filtering. [aea3211]
- [x] Task: Wire student progress + competency data fetch path with org scoping. [b4ffcca]
- [x] Task: Implement status visualization contract (green/yellow/red) with deterministic rules. [b4ffcca]

## Phase 3: Evidence And Intervention Views [checkpoint: 0d20d31]
- [x] Task: Implement `SubmissionDetailModal` and readonly activity playback path. [0d20d31]
- [x] Task: Support spreadsheet/read-only rendering for teacher review workflows. [0d20d31]
- [x] Task: Add regression tests for teacher viewing student submissions without mutation capability. [0d20d31]

## Phase 4: Account Management Actions
- [x] Task: Implement secure reset-password workflow (API/edge + UI) with role gating.
- [x] Task: Implement edit-student workflow with validation and audit-friendly change handling.
- [x] Task: Conductor - User Manual Verification 'Sprint 5 Teacher Command Center' (Protocol in workflow.md). [2026-02-18]
