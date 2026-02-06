# Tasks: Sprint 5 - Teacher Command Center

## Phase 1: Bulk Onboarding
- [x] Task: Create `bulk-create-students` Edge Function (transactional). `1015ba9`
- [ ] Task: Implement `BulkImportDialog` component (Parse/Review/Submit steps).
- [ ] Task: Implement `CredentialsSheet` component (Print-friendly CSS).
- [ ] Task: Integration Test: Import 30 names, verify all created.

## Phase 2: Gradebook Grid
- [ ] Task: Create `GradebookGrid` component using `tanstack-table` or similar.
- [ ] Task: Implement data fetching (Students + Progress + Standards).
- [ ] Task: Build `StatusCell` component (visual logic for Green/Yellow/Red).
- [ ] Task: Optimize performance (virtualization if class > 50 students, though likely fine for now).

## Phase 3: Detail Views
- [ ] Task: Create `SubmissionDetailModal`.
- [ ] Task: Update `ActivityRenderer` to support `mode="readonly"` and `initialData={studentData}`.
    - [ ] Task: Ensure Spreadsheet component can render read-only state.

## Phase 4: Management Actions
- [ ] Task: Implement `ResetPasswordDialog`.
- [ ] Task: Wire up "Reset Password" API (Server Action or Edge Function).
- [ ] Task: Add "Edit Student" form.

**Acceptance Criteria**
- Bulk import works for 25+ names.
- Credentials sheet prints cleanly on A4/Letter paper.
- Gradebook accurately reflects database state.
- Clicking a cell shows the correct student's work.
- Password reset works and allows student login.
