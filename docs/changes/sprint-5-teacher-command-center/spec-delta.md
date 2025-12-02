---
title: Sprint 5 - Teacher Command Center Specification
type: spec-delta
status: draft
created: 2025-11-25
updated: 2025-11-25
epic: 5
description: Specifications for bulk student import workflow, interactive gradebook grid, and student management features
tags: [sprint-5, teacher, gradebook, bulk-import, edge-functions]
---

# Spec Delta: Sprint 5 - Teacher Command Center

## 1. Bulk Student Import

### UI Workflow
1.  Teacher clicks "Add Students" -> "Bulk Import".
2.  **Input:** Text area to paste names (one per line) OR file picker for simple CSV.
3.  **Processing:** Client parses names, generates suggested usernames (e.g., `first.last`) and random passwords.
4.  **Review:** Teacher reviews the list, can edit usernames if collisions occur.
5.  **Submit:** Batch API call to create accounts.
6.  **Output:** "Credentials Sheet" modal opens, formatted for printing (cards per student).

### Backend (Edge Function)
- Update `create-student` function or create `bulk-create-students` to handle array inputs.
- Run in a transaction to ensure all-or-nothing success.
- Return list of created credentials.

## 2. Interactive Gradebook (Internal)

### UI Layout
- **Component:** `GradebookGrid`
- **Rows:** Students (sorted by Last Name).
- **Columns:** Hierarchical headers (Unit -> Lesson -> Standard).
- **Cells:**
    - **Status:** Icon/Color (Empty, In Progress, Submitted, Graded).
    - **Score:** % or Mastery Level.
- **Interactivity:**
    - Hover row: Highlights student across all columns.
    - Click cell: Opens `SubmissionDetailModal`.

### Submission Detail Modal
- Shows the specific Activity Context.
- **Read-only view** of the interactive component (e.g., the Spreadsheet) populated with the student's data.
- Teacher override controls (Change Grade).

## 3. Student Management

### Actions
- **Reset Password:**
    - Triggered from Student Row actions.
    - Generates new random string.
    - Displays in a "Copy to Clipboard" dialog.
- **Edit Details:**
    - Change display name.
    - Archive/Deactivate student (soft delete).

## 4. Migration Path
- No schema changes expected (uses existing `profiles` and `auth`).
- New components purely additive to the `/teacher` route.
