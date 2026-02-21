# Specification: Curriculum Quality Standards & Unit 1 Remediation

## Overview

Establish enforceable curriculum quality standards for all lesson types (accounting, Excel, project, assessment) and remediate Unit 1 seeds to comply. This track produces:

1. **Curriculum Quality Definitions** — TypeScript schemas and formal rules defining what constitutes a valid seed for each lesson type
2. **Algorithmic Problem Engine** — A runtime system for generating parameterized problem instances with cell-value auto-grading, enabling student retesting
3. **Updated Templates** — revised markdown spec templates for all four lesson types
4. **Enforcement Tests** — Vitest test suites that validate any seed file against the quality definitions
5. **Unit 1 Seed Fixes** — all 11 Unit 1 seeds updated to pass enforcement tests

## Functional Requirements

### FR-1: Accounting Lesson Standards

Accounting lessons (type `accounting`) must satisfy:

- **6-phase structure**: Hook, Concept Intro, Guided Practice, Independent Practice, Assessment, Reflection
- **Guided Practice (Phase 3)** must contain at least one interactive activity (not text-only)
- **Independent Practice (Phase 4)** must contain an auto-graded activity with `autoGrade: true` and `passingScore >= 60`
- Independent Practice activities must use cell-value validation for spreadsheet-type activities (compare student cell values against expected values)
- All auto-graded activities must support algorithmic problem generation via a `problemTemplate` schema (parameterized values with ranges and answer formulas) so students can retest with varied numbers
- Each lesson must link exactly one primary standard via `lesson_standards`

### FR-2: Excel Lesson Standards

Excel lessons (type `excel`) must satisfy:

- **6-phase structure**: Same as accounting
- **Guided Practice (Phase 3)** must contain at least one interactive activity (not text-only)
- **Independent Practice (Phase 4)** must contain instructions for students to complete work in desktop Excel and submit to the teacher
- Independent Practice is NOT auto-graded in-app; students submit deliverables to the teacher outside the platform
- Phase 4 must include a `teacher-submission` section type (or equivalent marker) with clear deliverable description and rubric criteria
- **Assessment (Phase 5)** must contain an auto-graded exit ticket with `passingScore >= 80`

### FR-3: Project Lesson Standards

Project lessons (type `project`) must satisfy:

- **3-day structure** across three consecutive lessons:
  - **Day 1 (Scaffolding)**: 1 phase — project brief review, team formation, goal setting, deliverable checklist
  - **Day 2 (Build)**: 1 phase — dedicated Excel workbook construction time, checkpoint verification
  - **Day 3 (Present)**: 1 phase — rehearsal, live presentation to class, peer feedback
- Each day has **ungraded deliverables** (no `autoGrade` on project activities, but deliverables must be explicitly described)
- Each day's phase must declare a `deliverables` array listing what students produce that day
- Project activities should be substantive — structured rubrics, checklists, and clear milestones

### FR-4: Summative Assessment Standards

Summative assessments (type `assessment`) must satisfy:

- **Multi-phase structure**: Instructions phase + assessment phases organized by question tier
- **3 questions per learning objective**, split across:
  - 1 Knowledge question (recall): `true-false`, `matching`, `fill-in-the-blank`, or `numeric-entry` — NOT multiple-choice
  - 1 Understanding question (conceptual): scenario-based `fill-in-the-blank`, `categorization`, or `numeric-entry`
  - 1 Application question (procedural): `numeric-entry`, `equation-solver`, or `categorization` with novel data
- **1 Application Problem per learning objective**: A variation of that objective's lesson independent practice, adapted to an auto-gradeable format using cell-value validation
- All summative questions and problems must be auto-graded (`autoGrade: true`)
- All problems must use algorithmic generation (parameterized values from `problemTemplate`) so students can retest with different numbers
- `passingScore` must be set to 70% for summative assessments
- The assessment must link ALL unit standards (primary standard = first standard in sequence; all others secondary)

### FR-5: Algorithmic Problem Engine

Build a runtime system for generating and grading parameterized problems:

- **Problem Template Schema**: TypeScript type defining:
  - `parameters`: named variables with value ranges (e.g., `{ cash: { min: 1000, max: 10000, step: 100 } }`)
  - `answerFormula`: expression computing the correct answer from parameters (e.g., `"cash - liabilities"`)
  - `questionTemplate`: string template with `{{parameter}}` placeholders for rendering
  - `distractorFormulas`: (for MCQ fallback) expressions that generate plausible wrong answers
- **Generator Function**: `generateProblemInstance(template, seed?)` → concrete problem with specific values and correct answer
  - Deterministic when given a seed (same seed = same problem)
  - Random when no seed provided (for retesting)
- **Cell-Value Validator**: `validateCellValues(expected, submitted)` → grade result
  - Compares submitted cell values against expected values with configurable tolerance
  - Returns per-cell pass/fail and overall score
- **Component Integration**: The `comprehension-quiz`, `numeric-entry`, and `spreadsheet` components must accept `problemTemplate` in their props and generate instances at render time
- Full unit test coverage for the engine (generator determinism, edge cases, tolerance handling)

### FR-6: Enforcement Test Suite

A Vitest test suite (`__tests__/curriculum/`) that validates seed data against the quality definitions:

- `lesson-type-structure.test.ts` — validates phase counts and phase titles match lesson type
- `grading-config.test.ts` — validates autoGrade/passingScore rules per lesson type and phase
- `activity-completeness.test.ts` — validates required activity types exist per phase (guided practice has activity, independent practice has activity, assessment has exit ticket)
- `standards-linkage.test.ts` — validates standard linkage rules (one primary per lesson, all standards on summative)
- `assessment-depth.test.ts` — validates summative question counts (3 per objective + 1 application problem per objective)
- `algorithmic-support.test.ts` — validates that auto-graded activities include `problemTemplate` in their props
- Tests must import seed data directly from `supabase/seed/unit1/*.ts` exports
- Tests must be parameterized so they work for any unit, not just Unit 1

### FR-7: Unit 1 Seed Remediation

Fix all Unit 1 seeds to pass the enforcement test suite:

**Accounting Lessons (L1-L4):**
- **L1**: Reduce Notebook Organizer `passingScore` from 100 to 83 (5/6). Add `problemTemplate` to exit ticket.
- **L2**: Add `problemTemplate` to exit ticket. Guided practice activity exists (card sort) ✓
- **L3**: Add interactive activity to Guided Practice (transaction-effect tracer or equation-check). Add `problemTemplate` to exit ticket.
- **L4**: Add auto-graded cell-value validation to spreadsheet activity (`passingScore >= 60`). Add guided practice activity. Add `problemTemplate` to activities.

**Excel Lessons (L5-L7):**
- **L5**: Guided practice activity exists ✓. Independent practice is text-only — add `teacher-submission` section with deliverable/rubric description.
- **L6**: Guided practice activity exists ✓. Independent practice is text-only — add `teacher-submission` section.
- **L7**: Add guided practice activity. Add `teacher-submission` section to independent practice. Add auto-graded cell-value validation to spreadsheet activity (`passingScore >= 60`).

**Project Lessons (L8-L10):**
- **L8**: Restructure to Day 1 (Scaffolding) — project brief, team formation, deliverable checklist. Add `deliverables` array.
- **L9**: Restructure to Day 2 (Build) — dedicated Excel workbook construction, checkpoint. Add `deliverables` array.
- **L10**: Restructure to Day 3 (Present) — rehearsal, presentation, peer feedback. Add `deliverables` array.

**Summative Assessment (L11):**
- Expand from 1-phase / 7-question MCQ to multi-phase assessment per FR-4
- 7 standards × 3 questions = 21 tiered questions (knowledge + understanding + application)
- 7 standards × 1 application problem = 7 application problems using algorithmic templates
- Fix threshold text from "70%" to match `passingScore: 70`
- All questions and problems use `problemTemplate` for retest support

### FR-8: Updated Spec Templates

Update `docs/curriculum/templates/` with revised templates reflecting the new standards:

- `accounting.md` — updated with auto-graded guided + independent practice requirement
- `excel.md` — updated with teacher-submission independent practice pattern
- `project.md` — updated to 3-day scaffold/build/present structure
- `assessment.md` — updated with 3-per-objective + 1-application-problem structure, algorithmic problem support

## Non-Functional Requirements

- All enforcement tests must run in < 5 seconds (no DB required — they test exported seed constants)
- Templates must be self-documenting (include inline comments explaining each requirement)
- The algorithmic problem engine must be deterministic given a seed value
- Quality definitions must be unit-agnostic (work for Units 1-8)
- Cell-value tolerance for numeric comparisons: ±$1 (configurable per activity)

## Acceptance Criteria

1. `npm run test -- __tests__/curriculum/` passes with all Unit 1 seeds compliant
2. Every accounting lesson (L1-L4) has auto-graded Guided Practice and Independent Practice activities
3. Every Excel lesson (L5-L7) has an interactive Guided Practice activity and a teacher-submission Independent Practice section
4. L8-L10 follow the 3-day scaffold/build/present pattern with listed deliverables
5. L11 contains 21 tiered questions + 7 application problems across ACC-1.1 through ACC-1.7, all using `problemTemplate`
6. All four curriculum templates in `docs/curriculum/templates/` are updated
7. The algorithmic problem engine generates deterministic instances from seeds, and students can retest with new values
8. No regressions: existing seed tests (`__tests__/seed/unit1/`) continue to pass (updated as needed)
9. Enforcement tests are parameterized and reusable for Unit 2+ development

## Out of Scope

- Building new UI rendering components (existing components are extended with `problemTemplate` prop support)
- Creating Unit 2+ content (this track creates the standards and engine; content creation is separate)
- Teacher grading UI for Excel lesson submissions (teacher reviews submissions outside the platform)
- Real-time problem difficulty adaptation (problems are randomly parameterized, not adaptive)
