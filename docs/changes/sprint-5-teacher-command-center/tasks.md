# Tasks: Sprint 5 - Teacher Command Center

## Phase 1: Bulk Onboarding
- [ ] Create `bulk-create-students` Edge Function (transactional).
- [ ] Implement `BulkImportDialog` component (Parse/Review/Submit steps).
- [ ] Implement `CredentialsSheet` component (Print-friendly CSS).
- [ ] Integration Test: Import 30 names, verify all created.

## Phase 2: Gradebook Grid
- [ ] Create `GradebookGrid` component using `tanstack-table` or similar.
- [ ] Implement data fetching (Students + Progress + Standards).
- [ ] Build `StatusCell` component (visual logic for Green/Yellow/Red).
- [ ] Optimize performance (virtualization if class > 50 students, though likely fine for now).

## Phase 3: Detail Views
- [ ] Create `SubmissionDetailModal`.
- [ ] Update `ActivityRenderer` to support `mode="readonly"` and `initialData={studentData}`.
    - [ ] Ensure Spreadsheet component can render read-only state.

## Phase 4: Management Actions
- [ ] Implement `ResetPasswordDialog`.
- [ ] Wire up "Reset Password" API (Server Action or Edge Function).
- [ ] Add "Edit Student" form.

**Acceptance Criteria**
- Bulk import works for 25+ names.
- Credentials sheet prints cleanly on A4/Letter paper.
- Gradebook accurately reflects database state.
- Clicking a cell shows the correct student's work.
- Password reset works and allows student login.
