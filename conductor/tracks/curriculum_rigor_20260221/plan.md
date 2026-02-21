# Implementation Plan: Curriculum Quality Standards & Unit 1 Remediation

## Phase 1: Quality Definitions & TypeScript Schemas [checkpoint: TBD]

- [ ] Task: Define `CurriculumLessonType` enum and per-type validation rules
    - [ ] Create `lib/curriculum/types.ts` with TypeScript types:
      - `LessonType`: `'accounting' | 'excel' | 'project' | 'assessment'`
      - `PhaseRequirement`: phase number, required title pattern, required activity types, grading rules
      - `LessonTypeSpec`: maps each `LessonType` to its `PhaseRequirement[]`
    - [ ] Define accounting spec: 6 phases, guided practice requires activity, independent practice requires auto-graded activity (passingScore >= 60)
    - [ ] Define excel spec: 6 phases, guided practice requires activity, independent practice requires teacher-submission, assessment requires auto-graded exit ticket (passingScore >= 80)
    - [ ] Define project spec: 1 phase per day, 3-day sequence (scaffold/build/present), deliverables array required
    - [ ] Define assessment spec: multi-phase, 3 questions per objective (knowledge/understanding/application), 1 application problem per objective, all auto-graded, passingScore 70
    - [ ] Write unit tests for type validation helpers

- [ ] Task: Define `ProblemTemplate` schema for algorithmic problem generation
    - [ ] Create `lib/curriculum/problem-template.ts` with types:
      - `ParameterDef`: `{ min: number, max: number, step: number }`
      - `ProblemTemplate`: `{ parameters: Record<string, ParameterDef>, answerFormula: string, questionTemplate: string, tolerance?: number }`
      - `CellValueExpectation`: `{ cellRef: string, expectedFormula: string, tolerance: number }`
      - `SpreadsheetProblemTemplate`: extends ProblemTemplate with `cellExpectations: CellValueExpectation[]`
    - [ ] Write unit tests for schema validation (valid/invalid templates)

- [ ] Task: Update curriculum spec templates in `docs/curriculum/templates/`
    - [ ] Update `accounting.md` — add auto-graded guided + independent practice requirements, problemTemplate reference
    - [ ] Update `excel.md` — add teacher-submission pattern for independent practice, guided practice activity requirement
    - [ ] Update `project.md` — restructure to 3-day scaffold/build/present with deliverables arrays
    - [ ] Update `assessment.md` — add 3-per-objective + 1-application-problem structure, algorithmic problem support, non-MCQ question types

- [ ] Task: Conductor — User Manual Verification 'Phase 1: Quality Definitions & TypeScript Schemas' (Protocol in workflow.md)

---

## Phase 2: Algorithmic Problem Engine [checkpoint: TBD]

- [ ] Task: Build problem instance generator
    - [ ] Write failing tests for `generateProblemInstance(template, seed?)`:
      - Deterministic: same seed → same output
      - Random: no seed → different output on successive calls
      - Parameters respect min/max/step constraints
      - Answer computed correctly from formula
      - Question text has placeholders replaced with concrete values
    - [ ] Implement `lib/curriculum/problem-generator.ts`
    - [ ] Pass all tests

- [ ] Task: Build cell-value validator for spreadsheet grading
    - [ ] Write failing tests for `validateCellValues(expected, submitted, tolerance?)`:
      - Exact match passes
      - Within tolerance passes
      - Outside tolerance fails
      - Missing cells fail
      - Returns per-cell results and overall score
      - Handles string cells (category labels) vs numeric cells (balances)
    - [ ] Implement `lib/curriculum/cell-validator.ts`
    - [ ] Pass all tests

- [ ] Task: Build formula evaluator for answer computation
    - [ ] Write failing tests for `evaluateFormula(formula, parameters)`:
      - Basic arithmetic: `"cash - liabilities"` with `{ cash: 10000, liabilities: 4000 }` → 6000
      - Multi-step: `"assets - liabilities - equity"` → computed
      - Division and percentage: `"correct / total * 100"` → computed
      - Edge cases: division by zero returns error, unknown parameter returns error
    - [ ] Implement `lib/curriculum/formula-evaluator.ts` (safe expression parser — no eval())
    - [ ] Pass all tests

- [ ] Task: Integration — wire generator into activity grading pipeline
    - [ ] Write integration test: given a seed activity with `problemTemplate`, calling `generateProblemInstance` produces a valid question, and `validateCellValues` can grade a correct submission
    - [ ] Ensure the pipeline works end-to-end: template → instance → render data → grade submission
    - [ ] Pass integration test

- [ ] Task: Conductor — User Manual Verification 'Phase 2: Algorithmic Problem Engine' (Protocol in workflow.md)

---

## Phase 3: Enforcement Test Suite [checkpoint: TBD]

- [ ] Task: Write `lesson-type-structure.test.ts`
    - [ ] Test: accounting lessons have exactly 6 phases
    - [ ] Test: excel lessons have exactly 6 phases
    - [ ] Test: project lessons have exactly 1 phase each
    - [ ] Test: assessment lesson phase count matches spec (Instructions + tiers)
    - [ ] Parameterize by unit number so tests work for any unit
    - [ ] Import seed data directly from `supabase/seed/unit1/*.ts` exports
    - [ ] Verify tests FAIL on current Unit 1 seeds (red phase confirmation)

- [ ] Task: Write `grading-config.test.ts`
    - [ ] Test: accounting Phase 4 (Independent) activity has `autoGrade: true` and `passingScore >= 60`
    - [ ] Test: accounting Phase 3 (Guided) has at least one interactive activity
    - [ ] Test: excel Phase 5 (Assessment) exit ticket has `autoGrade: true` and `passingScore >= 80`
    - [ ] Test: project activities have `autoGrade: false` (ungraded deliverables)
    - [ ] Test: assessment activities all have `autoGrade: true`
    - [ ] Verify tests FAIL on current seeds where applicable

- [ ] Task: Write `activity-completeness.test.ts`
    - [ ] Test: every L1-L7 Phase 3 contains at least one activity section
    - [ ] Test: every L1-L7 Phase 5 contains a required activity section
    - [ ] Test: excel lessons Phase 4 contains a teacher-submission section or equivalent
    - [ ] Test: project lessons declare a `deliverables` array

- [ ] Task: Write `standards-linkage.test.ts`
    - [ ] Test: every non-project lesson has exactly one primary standard
    - [ ] Test: project lessons have no primary standard (integration days)
    - [ ] Test: summative assessment links ALL unit standards

- [ ] Task: Write `assessment-depth.test.ts`
    - [ ] Test: summative has >= 3 questions per linked standard
    - [ ] Test: questions include non-MCQ types (true-false, fill-in-blank, numeric-entry, categorization)
    - [ ] Test: summative has >= 1 application problem per linked standard
    - [ ] Test: application problems have `problemTemplate` with valid schema

- [ ] Task: Write `algorithmic-support.test.ts`
    - [ ] Test: all auto-graded activities with `problemTemplate` have valid template schema
    - [ ] Test: `generateProblemInstance` succeeds for every template in seed data
    - [ ] Test: generated instances have all placeholders resolved

- [ ] Task: Conductor — User Manual Verification 'Phase 3: Enforcement Test Suite' (Protocol in workflow.md)

---

## Phase 4: Unit 1 Remediation — Lessons 1–7 [checkpoint: TBD]

- [ ] Task: Fix L1 — Launch Unit (ACC-1.1)
    - [ ] Reduce Notebook Organizer `passingScore` from 100 to 83
    - [ ] Add `problemTemplate` to exit ticket comprehension-quiz
    - [ ] Verify enforcement tests pass for L1

- [ ] Task: Fix L2 — Classify Accounts (ACC-1.2)
    - [ ] Add `problemTemplate` to exit ticket and card-sort activity
    - [ ] Verify enforcement tests pass for L2

- [ ] Task: Fix L3 — Apply A/L/E to Business Events (ACC-1.4)
    - [ ] Add interactive guided practice activity (transaction-effect tracer or equation-balance checker)
    - [ ] Add `problemTemplate` to exit ticket
    - [ ] Verify enforcement tests pass for L3

- [ ] Task: Fix L4 — Build the Balance Sheet (ACC-1.3)
    - [ ] Add guided practice activity (account-to-section mapping drag-sort or similar)
    - [ ] Add cell-value validation to spreadsheet activity: define expected cell values for key totals (Total Assets, Total Liabilities, Total Equity, equation check)
    - [ ] Set spreadsheet `autoGrade: true`, `passingScore: 60`
    - [ ] Add `problemTemplate` with parameterized account balances to spreadsheet and exit ticket
    - [ ] Verify enforcement tests pass for L4

- [ ] Task: Fix L5 — Detect and Fix Ledger Errors (ACC-1.5)
    - [ ] Add `teacher-submission` section to Phase 4 (Independent Practice) with deliverable description and rubric criteria
    - [ ] Add `problemTemplate` to exit ticket
    - [ ] Verify enforcement tests pass for L5

- [ ] Task: Fix L6 — Data Validation and Integrity (ACC-1.6)
    - [ ] Add `teacher-submission` section to Phase 4 (Independent Practice) with deliverable description and rubric criteria
    - [ ] Add `problemTemplate` to fill-in-the-blank and exit ticket activities
    - [ ] Verify enforcement tests pass for L6

- [ ] Task: Fix L7 — Balance Snapshot with Visual (ACC-1.7)
    - [ ] Add guided practice activity (chart-reading quiz or visual interpretation check)
    - [ ] Add `teacher-submission` section to Phase 4 with deliverable description and rubric criteria
    - [ ] Add cell-value validation to spreadsheet activity: define expected cell values for chart data and totals
    - [ ] Set spreadsheet `autoGrade: true`, `passingScore: 60`
    - [ ] Add `problemTemplate` to spreadsheet and exit ticket activities
    - [ ] Verify enforcement tests pass for L7

- [ ] Task: Conductor — User Manual Verification 'Phase 4: Unit 1 Remediation — Lessons 1–7' (Protocol in workflow.md)

---

## Phase 5: Unit 1 Remediation — Lessons 8–10 (Projects) [checkpoint: TBD]

- [ ] Task: Restructure L8 — Day 1: Scaffolding
    - [ ] Rewrite Phase 1 as project scaffolding day: project brief review, team formation, goal setting
    - [ ] Add structured `deliverables` array: team roster, initial account list, project timeline
    - [ ] Include detailed project brief text with requirements checklist
    - [ ] Keep `peer-critique-form` but add structured rubric for initial review
    - [ ] Verify enforcement tests pass for L8

- [ ] Task: Restructure L9 — Day 2: Build
    - [ ] Rewrite Phase 1 as Excel workbook construction day: dedicated build time, checkpoint verification
    - [ ] Add structured `deliverables` array: completed Excel workbook, equation-check screenshot, validation-pass screenshot
    - [ ] Include detailed checkpoint criteria (equation balances, formatting meets rubric, all accounts present)
    - [ ] Replace `reflection-journal` with a `project-checklist` activity tracking completion of build milestones
    - [ ] Verify enforcement tests pass for L9

- [ ] Task: Restructure L10 — Day 3: Present
    - [ ] Rewrite Phase 1 as presentation day: rehearsal, live delivery, peer feedback
    - [ ] Add structured `deliverables` array: final Balance Sheet package, presentation slides/script, peer feedback received
    - [ ] Include presentation rubric (content accuracy, visual clarity, verbal explanation, time management)
    - [ ] Replace `reflection-journal` with `presentation-rubric` activity (peer evaluation form)
    - [ ] Verify enforcement tests pass for L10

- [ ] Task: Conductor — User Manual Verification 'Phase 5: Unit 1 Remediation — Lessons 8–10' (Protocol in workflow.md)

---

## Phase 6: Unit 1 Remediation — Lesson 11 (Summative) [checkpoint: TBD]

- [ ] Task: Design L11 assessment blueprint
    - [ ] Map 7 standards (ACC-1.1 through ACC-1.7) to 3 questions each:
      - ACC-1.1 (Equation): K=true-false, U=numeric-entry (solve for missing), A=numeric-entry (multi-step)
      - ACC-1.2 (Classification): K=matching, U=categorization (gray-zone accounts), A=categorization (novel accounts)
      - ACC-1.3 (BS Structure): K=fill-in-blank (section names), U=categorization (current vs non-current), A=numeric-entry (compute subtotals)
      - ACC-1.4 (Transactions): K=true-false (dual-impact), U=numeric-entry (trace event effect), A=numeric-entry (multi-event cumulative)
      - ACC-1.5 (Error Detection): K=matching (error types), U=fill-in-blank (identify error), A=numeric-entry (compute corrected total)
      - ACC-1.6 (Data Validation): K=true-false (validation rules), U=fill-in-blank (formula), A=categorization (valid vs invalid entries)
      - ACC-1.7 (Visual Communication): K=fill-in-blank (chart reading), U=numeric-entry (equity from chart), A=numeric-entry (interpret snapshot)
    - [ ] Design 7 application problems (one per standard) as variations of independent practice:
      - ACC-1.1: Solve for missing equation component given 2 of 3 values (algorithmic)
      - ACC-1.2: Categorize 6 novel accounts into A/L/E (algorithmic account names/balances)
      - ACC-1.3: Place accounts into BS sections and compute subtotals (cell-value graded)
      - ACC-1.4: Trace 3 transactions and compute final balances (algorithmic events)
      - ACC-1.5: Identify and correct 3 errors in a mini-ledger (cell-value graded)
      - ACC-1.6: Determine which validation rule catches each of 4 data entry attempts
      - ACC-1.7: Read a bar chart and compute equity, then interpret financial health
    - [ ] Write `problemTemplate` for each of the 7 application problems
    - [ ] Document the blueprint in a comment block at the top of `lesson-11.ts`

- [ ] Task: Rebuild L11 seed — Phase 1: Instructions
    - [ ] Write clear assessment instructions covering all tiers
    - [ ] Include standard-to-question mapping table
    - [ ] Set time expectations (full class period)
    - [ ] Allow 2 attempts with algorithmic regeneration

- [ ] Task: Rebuild L11 seed — Phase 2: Knowledge Check (7 questions)
    - [ ] Implement 7 knowledge-tier questions (1 per standard, non-MCQ)
    - [ ] Each question uses `problemTemplate` for algorithmic generation
    - [ ] Activity: `tiered-assessment` component with `tier: 'knowledge'`
    - [ ] `autoGrade: true`

- [ ] Task: Rebuild L11 seed — Phase 3: Understanding Check (7 questions)
    - [ ] Implement 7 understanding-tier questions (1 per standard, scenario-based)
    - [ ] Each question uses `problemTemplate` for algorithmic generation
    - [ ] Activity: `tiered-assessment` component with `tier: 'understanding'`
    - [ ] `autoGrade: true`

- [ ] Task: Rebuild L11 seed — Phase 4: Application Check (7 questions + 7 problems)
    - [ ] Implement 7 application-tier questions (1 per standard, procedural)
    - [ ] Implement 7 application problems using independent practice variations
    - [ ] Each problem uses `problemTemplate` with `cellExpectations` for auto-grading
    - [ ] Activity: `tiered-assessment` component with `tier: 'application'`
    - [ ] `autoGrade: true`, `passingScore: 70`

- [ ] Task: Wire L11 standards linkage
    - [ ] Link all 7 standards: ACC-1.1 (primary), ACC-1.2 through ACC-1.7 (secondary)
    - [ ] Fix threshold text to match `passingScore: 70`
    - [ ] Verify all enforcement tests pass for L11

- [ ] Task: Conductor — User Manual Verification 'Phase 6: Unit 1 Remediation — Lesson 11' (Protocol in workflow.md)

---

## Phase 7: Integration, Regression & Documentation [checkpoint: TBD]

- [ ] Task: Run full enforcement test suite
    - [ ] `npm run test -- __tests__/curriculum/` — all tests pass
    - [ ] Verify no false positives (tests correctly accept compliant seeds)
    - [ ] Verify parameterization works (test helper accepts unit number)

- [ ] Task: Run existing seed tests
    - [ ] `npm run test -- __tests__/seed/unit1/` — update tests as needed for structural changes
    - [ ] No regressions in existing test assertions (or justified updates documented)

- [ ] Task: Run lint
    - [ ] `npm run lint` — no new errors

- [ ] Task: Update documentation
    - [ ] Update `supabase/seed/README.md` to reflect new seed structure and quality standards
    - [ ] Update `conductor/tracks.md` with this track
    - [ ] Update `docs/RETROSPECTIVE.md` with curriculum rigor learnings
    - [ ] Add quality standards summary to `conductor/` canonical docs

- [ ] Task: Conductor — User Manual Verification 'Phase 7: Integration, Regression & Documentation' (Protocol in workflow.md)
