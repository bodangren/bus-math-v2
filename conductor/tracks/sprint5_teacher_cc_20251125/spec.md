# Sprint 5 - Teacher Command Center Specification

## Problem Statement
While the current dashboard allows viewing progress, it lacks the "Power Tools" needed to manage a real classroom of 25+ students efficiently.
1.  **Onboarding Friction:** Creating students one-by-one is too slow for a whole class.
2.  **Limited Visibility:** The current list view doesn't show the "big picture" of class performance across standards/lessons.
3.  **Management Gaps:** Teachers cannot easily help students who forget passwords or need name corrections.

## Proposed Solution
We will build a "Teacher Command Center" focused on efficient classroom management and deep visibility.

1.  **Bulk Onboarding:**
    *   **Bulk Import:** Allow teachers to paste a list of names or upload a simple roster. The system will auto-generate usernames/passwords and create accounts in a single batch.
    *   **Credentials Sheet:** Automatically generate a printable view of all new student credentials for easy distribution in class.

2.  **Interactive Gradebook:**
    *   **Grid View:** A master matrix (Rows=Students, Columns=Lessons/Standards) replacing the simple list.
    *   **Visual Insights:** Color-coded cells (Green/Yellow/Red) based on completion or competency status.
    *   **Deep Dive:** Clicking a cell opens a detail view showing exactly what the student submitted (e.g., their specific spreadsheet answers).

3.  **Student Management:**
    *   **Quick Actions:** "Reset Password" and "Edit Details" available directly from the Gradebook view.

## Benefits
*   **Scalability:** Makes the platform viable for classes of any size.
*   **Actionable Insights:** Teachers can spot trends (e.g., "Everyone is failing Lesson 3") instantly via the visual grid.
*   **Admin Efficiency:** Reduces time spent on non-teaching tasks (account setup, password resets).

## Success Criteria
*   Teacher can onboard a class of 25 students in <5 minutes.
*   Gradebook loads efficiently for a full class.
*   Teacher can reset a student password in <30 seconds.
*   Teacher can click a gradebook cell to see the student's actual work.

---

## Spec Delta: Sprint 5 - Teacher Command Center

### 1. Bulk Student Import

#### UI Workflow
1.  Teacher clicks "Add Students" -> "Bulk Import".
2.  **Input:** Text area to paste names (one per line) OR file picker for simple CSV.
3.  **Processing:** Client parses names, generates suggested usernames (e.g., `first.last`) and random passwords.
4.  **Review:** Teacher reviews the list, can edit usernames if collisions occur.
5.  **Submit:** Batch API call to create accounts.
6.  **Output:** "Credentials Sheet" modal opens, formatted for printing (cards per student).

#### Backend (Edge Function)
- Update `create-student` function or create `bulk-create-students` to handle array inputs.
- Run in a transaction to ensure all-or-nothing success.
- Return list of created credentials.

### 2. Multi-Level Progress Views

The teacher-facing gradebook is organized as three navigable levels. Each level derives entirely from existing schema — no new migrations are required for Phases 2–3.

#### Curriculum Structure (for reference)

```
Course
└── Unit  (unitNumber on lessons table)
    └── Lesson  (row in lessons; orderIndex 1–11 within unit)
        └── Phase  (phase_versions; phaseNumber 1–6 per lesson)
            └── Activity / StudentProgress
```

Lesson 11 in each unit is the **unit test lesson** (summative). It is identified by `orderIndex = 11` on the `lessons` table — no additional flag is required. It is authored and completed identically to any other lesson; only its position distinguishes it.

---

#### Level 1 — Course Overview (default `/teacher` view)

**Purpose:** One-glance class health across all units.

**Layout:** Grid — Rows = Students (sorted by last name), Columns = Units.

**Cell contract:**
- **Value:** Average `student_competency.masteryLevel` (0–100) across all competency standards linked to lessons in that unit.
- **Color:** Green ≥ 80 · Yellow 50–79 · Red < 50 · Gray = no data yet.
- **Display:** `"72%"` (mastery percentage, integer).

**Data path:**
```
lessons (unit_number = U)
  → lesson_standards (lesson_version_id)
  → student_competency (standard_id, student_id)
  → AVG(mastery_level)
```

**Interaction:** Clicking a unit cell (or unit column header) navigates to Level 2 for that unit.

---

#### Level 2 — Unit GradebookGrid (`/teacher/units/[unitNumber]` or modal)

**Purpose:** Lesson-by-lesson status for every student in a unit.

**Component:** `GradebookGrid`

**Layout:** Grid — Rows = Students (sorted by last name), Columns = Lessons L1–L11, frozen first column (student name).

**Cell contract (L1–L10, regular lessons):**
- **Color:** Green = all 6 phases completed · Yellow = in progress (≥1 phase completed) · Red = not started.
- **Value:** `student_competency.masteryLevel` for the lesson's primary standard, displayed as `"87%"`. Omitted (`—`) if no standard is linked or lesson not started.
- **Display:** Single cell — background color + percentage text.

**Cell contract (L11 — Unit Test):**
- Same color + percentage format as L1–L10.
- Column header is visually distinguished: bold label **"Unit Test"**, separator line before it.
- The mastery % shown is for the unit test lesson's linked standard(s), same data path as other lessons.

**Completion rollup rule (deterministic):**
- `completed` → all `student_progress` rows for the lesson's phase_versions have `status = 'completed'`.
- `in_progress` → at least one phase is `completed` or `in_progress`, but not all phases `completed`.
- `not_started` → all phases are `not_started` or no progress rows exist.

**Color thresholds (shared across all levels):**
```
Green  = completed (phase rollup) OR mastery ≥ 80
Yellow = in_progress (phase rollup) OR mastery 50–79
Red    = not_started OR mastery < 50
Gray   = no data
```

**Interaction:**
- Hover row → highlights student across all columns.
- Click cell → opens Level 3 (SubmissionDetailModal) for that student × lesson.
- Row action menu → Reset Password, Edit Details (Phase 4).

**Data path:**
```
lessons (unit_number = U, order_index 1–11)
  → lesson_versions (status = 'published')
  → phase_versions (phase_number 1–6)
  → student_progress (user_id, status)          ← completion color
  → lesson_standards → student_competency       ← mastery %
```

Fetched in a single server query scoped to `organization_id` (teacher's org). No client-side data pulls.

---

#### Level 3 — Lesson Detail (SubmissionDetailModal)

**Purpose:** Phase-by-phase breakdown for one student × one lesson.

**Trigger:** Clicking any Level 2 cell.

**Layout:** Vertical list of 6 phase rows.

**Row contract:**
- Phase name (Hook / Introduction / Guided Practice / Independent Practice / Assessment / Closing).
- Completion badge: `Completed` · `In Progress` · `Not Started`.
- For Phase 5 (Assessment): show `completion_data` summary if available (activity type-specific; best-effort display).
- Competency standard mastery change if the phase completion updated `student_competency`.

**Read-only.** No mutation capability at this level (teacher grade override is a Phase 4 concern).

---

#### Level 2 — Interactive Gradebook (original spec, superseded by above)

~~The original single-grid description is replaced by the three-level hierarchy above. `GradebookGrid` now refers specifically to the Level 2 unit view.~~

---

### 3. Student Management

#### Actions
- **Reset Password:**
    - Triggered from Student Row actions in the Level 2 grid.
    - Generates new random string.
    - Displays in a "Copy to Clipboard" dialog.
- **Edit Details:**
    - Change display name.
    - Archive/Deactivate student (soft delete).

### 4. Migration Path
- No schema changes required for Phases 2–3 (progress views use existing tables).
- Level 1 course overview, Level 2 `GradebookGrid`, and Level 3 `SubmissionDetailModal` are purely additive to the `/teacher` route.
- Future: `is_summative` boolean on `lessons` table if the unit test ever deviates from the `orderIndex = 11` convention.
