# Sprint 4: Competency Engine & Seamless UX - Specification

## Problem Statement
The current platform backbone (from Sprint 3) is functional but lacks the "educational engine" required for the v2 vision. Specifically:
1.  **No Competency Tracking:** We cannot track if a student actually *learned* a specific standard (e.g., "ACC-1.2"), only if they viewed a page.
2.  **Content Incompatibility:** The v1 curriculum sequence differs significantly from the desired v2 sequence, so a simple import is impossible. We need a robust authoring foundation to build v2 content.
3.  **High-Friction UX:** The manual "Mark Complete" button breaks the learning flow and is prone to user error (forgetting to click).

## Proposed Solution
We will build the "Competency Engine" and a "Seamless Flow" UX in Sprint 4 to establish the foundation for all future content.

1.  **Competency Engine:**
    *   **Schema Expansion:** Add tables to define educational standards and track student mastery per standard.
    *   **Evaluated Spreadsheet Component:** A new interactive component that automatically checks student work (values/formulas) against a target and records competency achievement in the database.
    *   **First v2 Lesson:** Collaboratively design and author **Unit 1, Lesson 1** using this new system to validate the model.

2.  **Seamless Flow UX:**
    *   **Auto-Capture:** Remove the "Mark Complete" button. Replace with logic that marks "Read" phases complete on navigation/scroll and "Do" phases complete upon successful activity submission.
    *   **Stepper UI:** Replace simple Next/Prev buttons with a numbered phase stepper (e.g., `1 2 3 4 5 6`) to visualize progress within a lesson.

## Benefits
*   **Data-Driven Pedagogy:** Enables the detailed "Standards-Based Grading" required by modern classrooms.
*   **Frictionless Learning:** Students focus on the content, not the interface.
*   **Valid Foundation:** Proves the v2 data model works for real content before we scale up authoring.

## Success Criteria
*   Database schema supports defining standards and linking them to activities.
*   `SpreadsheetEvaluator` correctly identifies right/wrong answers and updates student competency.
*   Unit 1, Lesson 1 is fully playable with the new UX (no manual "Mark Complete").
*   Student progress is accurately tracked via the new auto-capture events.

---

## Spec Delta: Sprint 4 - Competency Engine & Seamless UX

### 1. Schema Changes

#### New Tables

**`competency_standards`**
Defines the educational standards (e.g., Common Core or Custom).
- `id`: UUID (PK)
- `code`: Text (Unique, e.g., "ACC-1.2")
- `description`: Text
- `created_at`: Timestamp

**`student_competency`**
Tracks a student's mastery of a specific standard.
- `id`: UUID (PK)
- `student_id`: UUID (FK to `profiles.id`)
- `standard_id`: UUID (FK to `competency_standards.id`)
- `mastery_level`: Integer (0-100) or Enum ('novice', 'competent', 'mastery')
- `evidence_activity_id`: UUID (FK to `activities.id`, optional)
- `last_updated`: Timestamp

#### Updates to Existing Tables
- **`activities`**: Add `standard_id` FK (optional) to link an activity to a primary standard.
- **`lessons`**: Add `standards` JSONB array to list all standards covered in the lesson.

### 2. Interactive Component: `SpreadsheetEvaluator`

A wrapper around the existing Spreadsheet component that adds grading logic.

#### Props Schema (JSONB in `activities` table)
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

#### Logic
1.  **Validation:** On change or "Check Answer" click, compare user input in `targetCells` against expectations.
2.  **Feedback:** Display inline success/error messages.
3.  **Completion:** If all targets match:
    *   Fire `onSuccess` event to the parent Phase Renderer.
    *   (Server-Side) Update `student_competency` table for the `linkedStandardId`.

### 3. Seamless Flow UX

#### Navigation & Completion Logic

**"Read" Phases (Text, Video, Callouts)**
- **Trigger:** User clicks "Next Phase >" OR scrolls to bottom (optional).
- **Action:**
    1.  Optimistically mark phase as complete in UI.
    2.  Fire background API call to `completePhase`.
    3.  Navigate to next route.

**"Do" Phases (Activities)**
- **Initial State:** "Next Phase >" button is **Locked/Disabled**.
- **Trigger:** Activity component emits `onActivityComplete` event.
- **Action:**
    1.  Unlock "Next Phase >" button.
    2.  Auto-save progress to DB.
    3.  Display subtle "Progress Saved" toast.

#### UI Changes
- **Stepper:** Replace top pagination with a 1-6 stepper.
    - **Circle Icons:** Empty (Todo), Filled (Done), Ring (Current).
    - **Clickable:** Only for completed or current phases (prevent skipping ahead).

### 4. Migration Path
- Run schema migrations.
- Seed initial standards for Unit 1.
- Manually author Unit 1, Lesson 1 using the new `SpreadsheetEvaluator` and schema structure.
