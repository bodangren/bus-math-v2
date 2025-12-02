---
title: Sprint 4 - Competency Engine & Seamless UX Specification
type: spec-delta
status: active
created: 2025-11-25
updated: 2025-11-25
epic: 4
description: Schema changes and component specifications for competency standards tracking and automatic phase completion
tags: [sprint-4, competency, schema, spreadsheet-evaluator, auto-capture]
---

# Spec Delta: Sprint 4 - Competency Engine & Seamless UX

## 1. Schema Changes

### New Tables

#### `competency_standards`
Defines the educational standards (e.g., Common Core or Custom).
- `id`: UUID (PK)
- `code`: Text (Unique, e.g., "ACC-1.2")
- `description`: Text
- `created_at`: Timestamp

#### `student_competency`
Tracks a student's mastery of a specific standard.
- `id`: UUID (PK)
- `student_id`: UUID (FK to `profiles.id`)
- `standard_id`: UUID (FK to `competency_standards.id`)
- `mastery_level`: Integer (0-100) or Enum ('novice', 'competent', 'mastery')
- `evidence_activity_id`: UUID (FK to `activities.id`, optional)
- `last_updated`: Timestamp

### Updates to Existing Tables
- **`activities`**: Add `standard_id` FK (optional) to link an activity to a primary standard.
- **`lessons`**: Add `standards` JSONB array to list all standards covered in the lesson.

## 2. Interactive Component: `SpreadsheetEvaluator`

A wrapper around the existing Spreadsheet component that adds grading logic.

### Props Schema (JSONB in `activities` table)
```typescript
{
  templateId: string; // Reference to the starting template
  instructions: string;
  targetCells: [
    {
      cell: string; // e.g., "B4"
      expectedValue?: number | string;
      expectedFormula?: string; // e.g., "=SUM(A1:A3)"
      tolerance?: number; // For numeric comparisons
      feedbackSuccess?: string;
      feedbackError?: string;
    }
  ],
  linkedStandardId?: string; // ID of the standard to update on success
}
```

### Logic
1.  **Validation:** On change or "Check Answer" click, compare user input in `targetCells` against expectations.
2.  **Feedback:** Display inline success/error messages.
3.  **Completion:** If all targets match:
    *   Fire `onSuccess` event to the parent Phase Renderer.
    *   (Server-Side) Update `student_competency` table for the `linkedStandardId`.

## 3. Seamless Flow UX

### Navigation & Completion Logic

#### "Read" Phases (Text, Video, Callouts)
- **Trigger:** User clicks "Next Phase >" OR scrolls to bottom (optional).
- **Action:**
    1.  Optimistically mark phase as complete in UI.
    2.  Fire background API call to `completePhase`.
    3.  Navigate to next route.

#### "Do" Phases (Activities)
- **Initial State:** "Next Phase >" button is **Locked/Disabled**.
- **Trigger:** Activity component emits `onActivityComplete` event.
- **Action:**
    1.  Unlock "Next Phase >" button.
    2.  Auto-save progress to DB.
    3.  Display subtle "Progress Saved" toast.

### UI Changes
- **Stepper:** Replace top pagination with a 1-6 stepper.
    - **Circle Icons:** Empty (Todo), Filled (Done), Ring (Current).
    - **Clickable:** Only for completed or current phases (prevent skipping ahead).

## 4. Migration Path
- Run schema migrations.
- Seed initial standards for Unit 1.
- Manually author Unit 1, Lesson 1 using the new `SpreadsheetEvaluator` and schema structure.
