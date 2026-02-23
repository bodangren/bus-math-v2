---
lesson_id: "UXXLXX"
type: "accounting"
objectives:
  - "Objective 1"
  - "Objective 2"
narrative_hook: "Sarah Chen's context for this accounting concept"
standards:
  primary: "ACC-X.X"
assets:
  starter_sheet: "starter_sheet_url"
quality_rules:
  guided_phase_requires_activity: true
  independent_phase_requires_auto_grade: true
  independent_min_passing_score: 60
  auto_graded_requires_problem_template: true
---

# Lesson: {{lesson_title}}

## Phase 1: Hook
- **Goal:** Open with a business decision tension in Sarah Chen's story.
- **Required:** Include at least one "Why this matters" callout.

## Phase 2: Concept Intro
- **Goal:** Teach the concept with explicit A/L/E reasoning.
- **Required:** Define success criteria for guided and independent phases.

## Phase 3: Guided Practice (Interactive Required)
- **Goal:** Teacher-led practice using an interactive activity (not text-only).
- **Required Activity Types:** `account-categorization`, `spreadsheet`, `comprehension-quiz`, or equivalent.

## Phase 4: Independent Practice (Auto-Graded Required)
- **Goal:** Students complete a graded task independently.
- **Required:** `gradingConfig.autoGrade: true` and `gradingConfig.passingScore >= 60`.
- **Required:** Include `problemTemplate` in activity props (or per-question templates).
- **Spreadsheet Note:** Prefer cell-value checks with explicit tolerances (default +/-$1).

## Phase 5: Assessment
- **Goal:** Exit ticket verifying objective mastery.
- **Required:** Auto-graded and algorithmic-ready via `problemTemplate`.

## Phase 6: Reflection
- **Goal:** Connect accounting accuracy to business trust and decision quality.

---

## Problem Template Pattern

```yaml
problemTemplate:
  parameters:
    assets: { min: 1000, max: 10000, step: 100 }
    liabilities: { min: 500, max: 8000, step: 100 }
  answerFormula: "assets - liabilities"
  questionTemplate: "Given assets {{assets}} and liabilities {{liabilities}}, compute equity."
  tolerance: 1
```

## Teacher Notes
- Keep language at an 8th-grade reading level.
- Use one primary standard linkage per non-project lesson.
