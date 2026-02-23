---
lesson_id: "UXXLXX"
type: "excel"
objectives:
  - "Objective 1"
  - "Objective 2"
narrative_hook: "Sarah Chen's context for this Excel workflow"
standards:
  primary: "ACC-X.X"
assets:
  starter_sheet: "starter_sheet_url"
quality_rules:
  guided_phase_requires_activity: true
  independent_phase_requires_teacher_submission: true
  checkpoint_min_passing_score: 80
  checkpoint_requires_problem_template: true
---

# Lesson: {{lesson_title}}

## Phase 1: Hook
- **Goal:** Frame an operational spreadsheet problem students must solve.

## Phase 2: Intro
- **Goal:** Demonstrate the Excel workflow and quality criteria.

## Phase 3: Guided Practice (Interactive Required)
- **Goal:** Build the skill with live teacher facilitation.
- **Required Activity Types:** `spreadsheet`, `fill-in-the-blank`, or equivalent interactive format.

## Phase 4: Independent Practice (Teacher Submission Required)
- **Goal:** Students complete real work in desktop Excel and submit deliverables.
- **Required Section Type:** `teacher-submission`.
- **Required Deliverable Fields:**
  - deliverable description
  - rubric criteria array
  - explicit submission artifact(s) (workbook, screenshot, or PDF)

## Phase 5: Checkpoint Assessment
- **Goal:** Auto-graded checkpoint with minimum `passingScore: 80`.
- **Required:** Include `problemTemplate` for algorithmic retest support.

## Phase 6: Reflection
- **Goal:** Explain how spreadsheet discipline affects business decisions.

---

## Teacher Submission Pattern

```yaml
sectionType: teacher-submission
content:
  submissionType: teacher-submission
  deliverable: "Submit workbook and evidence screenshot"
  rubricCriteria:
    - "Accuracy"
    - "Formatting quality"
    - "Explanation clarity"
```

## Teacher Notes
- Independent phase is intentionally not auto-graded in-app.
- Keep rubric language explicit and classroom-operable.
