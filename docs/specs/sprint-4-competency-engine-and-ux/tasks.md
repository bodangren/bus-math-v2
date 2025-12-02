---
title: Sprint 4 - Competency Engine & Seamless UX Tasks
type: tasks
status: active
created: 2025-11-25
updated: 2025-11-25
epic: 4
description: Implementation tasks for building competency tracking engine and seamless phase navigation UX
tags: [sprint-4, competency, ux, spreadsheet-evaluator]
---

# Tasks: Sprint 4 - Competency Engine & Seamless UX

## Phase 1: Schema & Backend
- [ ] Create `competency_standards` and `student_competency` tables.
- [ ] Add relations/FKs to `activities` and `lessons`.
- [ ] Update `seed.ts` to include basic Accounting standards for Unit 1.
- [ ] Create RLS policies for new tables (Students read own, Teachers read class).

## Phase 2: Components
- [ ] Implement `SpreadsheetEvaluator` component.
    - [ ] Integrate with `react-spreadsheet`.
    - [ ] Implement validation logic (value and formula checking).
    - [ ] Add feedback UI (toast or modal).
- [ ] Update `ActivityRenderer` to handle `onActivityComplete` events.

## Phase 3: UX & Logic
- [ ] Create `LessonStepper` component (visual progress indicator).
- [ ] Refactor `LessonLayout` to support "Locked" navigation state.
- [ ] Implement "Auto-Capture" hook:
    - [ ] `usePhaseCompletion` hook to handle API calls on unmount/navigation.
    - [ ] Connect "Next" button to completion logic for "Read" phases.
    - [ ] Connect Activity success events to completion logic for "Do" phases.

## Phase 4: Content Authoring
- [ ] Author **Unit 1, Lesson 1 (v2)** in the database.
    - [ ] Define Phases 1-6.
    - [ ] Create `SpreadsheetEvaluator` activity for the practice phase.
    - [ ] Link to `ACC-1.x` standards.
- [ ] Verify end-to-end flow: Start Lesson -> Auto-complete Read phases -> Solve Spreadsheet -> Unlock Next -> Competency Recorded.

**Acceptance Criteria**
- Schema successfully migrated.
- Unit 1 Lesson 1 playable without errors.
- "Next" button unlocks only after spreadsheet task is solved.
- `student_competency` table populates correctly upon success.
- No "Mark Complete" button visible in UI.
