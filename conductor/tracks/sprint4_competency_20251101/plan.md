# Tasks: Sprint 4 - Competency Engine & Seamless UX

## Phase 1: Schema & Backend
- [ ] Task: Create `competency_standards` and `student_competency` tables.
- [ ] Task: Add relations/FKs to `activities` and `lessons`.
- [ ] Task: Update `seed.ts` to include basic Accounting standards for Unit 1.
- [ ] Task: Create RLS policies for new tables (Students read own, Teachers read class).

## Phase 2: Components
- [ ] Task: Implement `SpreadsheetEvaluator` component.
    - [ ] Task: Integrate with `react-spreadsheet`.
    - [ ] Task: Implement validation logic (value and formula checking).
    - [ ] Task: Add feedback UI (toast or modal).
- [ ] Task: Update `ActivityRenderer` to handle `onActivityComplete` events.

## Phase 3: UX & Logic
- [ ] Task: Create `LessonStepper` component (visual progress indicator).
- [ ] Task: Refactor `LessonLayout` to support "Locked" navigation state.
- [ ] Task: Implement "Auto-Capture" hook:
    - [ ] Task: `usePhaseCompletion` hook to handle API calls on unmount/navigation.
    - [ ] Task: Connect "Next" button to completion logic for "Read" phases.
    - [ ] Task: Connect Activity success events to completion logic for "Do" phases.

## Phase 4: Content Authoring
- [ ] Task: Author **Unit 1, Lesson 1 (v2)** in the database.
    - [ ] Task: Define Phases 1-6.
    - [ ] Task: Create `SpreadsheetEvaluator` activity for the practice phase.
    - [ ] Task: Link to `ACC-1.x` standards.
- [ ] Task: Verify end-to-end flow: Start Lesson -> Auto-complete Read phases -> Solve Spreadsheet -> Unlock Next -> Competency Recorded.

**Acceptance Criteria**
- Schema successfully migrated.
- Unit 1 Lesson 1 playable without errors.
- "Next" button unlocks only after spreadsheet task is solved.
- `student_competency` table populates correctly upon success.
- No "Mark Complete" button visible in UI.
