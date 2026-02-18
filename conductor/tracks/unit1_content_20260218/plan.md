# Implementation Plan: Unit 1 Curriculum Content — Balance by Design

## Phase 1: Competency Wiring Audit & Adaptation [checkpoint: TBD]

- [ ] Task: Audit `lesson_standards` schema and existing linkages
    - [ ] Read migration files to find `lesson_standards` table structure and FK columns
    - [ ] Check if any `lesson_standards` rows exist in existing seeds
    - [ ] Document table columns, FK relationships, and any unique constraints

- [ ] Task: Audit `complete_activity_atomic` RPC and `student_progress` for standard-code recording
    - [ ] Read the `complete_activity_atomic` migration SQL to understand its parameters and what it writes
    - [ ] Determine whether `student_progress.metadata` JSONB already carries or can carry `standardCodes: string[]`
    - [ ] Write failing test: completing an activity via the RPC stores a `standardCodes` array in the resulting progress row

- [ ] Task: Extend phase completion to carry standard codes (Green phase)
    - [ ] If `student_progress.metadata` supports arbitrary JSONB: update `usePhaseCompletion` hook (or its API route) to accept and persist `standardCodes`
    - [ ] If a schema migration is required: write migration, update TypeScript types, update seeds README
    - [ ] Pass the failing test from the previous task

- [ ] Task: Update `ActivityRenderer` to forward standard codes
    - [ ] Add an optional `standardCodes?: string[]` prop to `ActivityRenderer`
    - [ ] Pass `standardCodes` through to the `completePhase` call
    - [ ] Update `LessonRenderer` / `PhaseRenderer` to supply `standardCodes` when rendering a required activity block (derived from the lesson's `lesson_standards` rows)
    - [ ] Write unit test covering the prop forwarding
    - [ ] Pass tests

- [ ] Task: Conductor — User Manual Verification 'Phase 1: Competency Wiring Audit & Adaptation' (Protocol in workflow.md)

---

## Phase 2: Lesson Seeds L1–L4 [checkpoint: TBD]

- [ ] Task: Seed Lesson 1 — Launch Unit: A=L+E (ACC-1.1)
    - [ ] Write integration test: `GET /api/lessons/unit-1-lesson-1` (or Drizzle query) returns lesson with 6 phases and ≥ 2 sections each
    - [ ] Audit existing `supabase/seed/03-unit-1-lesson-1-v2.ts` — replace placeholder content with fully authored phase content drawn from L1 of `unit_01_lesson_matrix.md`
    - [ ] Ensure phase 1 (Hook) has a `why-this-matters` callout block and Sarah Chen narrative
    - [ ] Seed `lesson_standards` link: lesson → ACC-1.1
    - [ ] Create/update activity seed for L1 exit ticket (`comprehension-quiz`, Assessment phase)
    - [ ] Run seed script and confirm idempotency
    - [ ] Pass integration test

- [ ] Task: Seed Lesson 2 — Classify Accounts into A/L/E (ACC-1.2)
    - [ ] Write integration test: lesson `unit-1-lesson-2` returns 6 phases with substantive content
    - [ ] Create `supabase/seed/unit1/lesson-02.ts` with full 6-phase authored content from L2 matrix row
    - [ ] Include `account-categorization` activity in Guided Practice phase (drag-sort TechStart accounts)
    - [ ] Include `comprehension-quiz` exit ticket in Assessment phase
    - [ ] Seed `lesson_standards` link: lesson → ACC-1.2
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Seed Lesson 3 — Apply A/L/E to Business Events (ACC-1.4)
    - [ ] Write integration test: lesson `unit-1-lesson-3` returns 6 phases
    - [ ] Create `supabase/seed/unit1/lesson-03.ts` with full content (5–7 business event scenarios, A/L/E equation-check concept)
    - [ ] Include `comprehension-quiz` activity: identify how 5 events change A/L/E
    - [ ] Seed `lesson_standards` link: lesson → ACC-1.4
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Seed Lesson 4 — Build the Balance Sheet (ACC-1.3)
    - [ ] Write integration test: lesson `unit-1-lesson-4` returns 6 phases
    - [ ] Create `supabase/seed/unit1/lesson-04.ts` with full content (BS skeleton structure, sections and subtotals)
    - [ ] Include `spreadsheet` activity in Independent Practice: draft mini Balance Sheet with ≥ 6 accounts
    - [ ] Seed `lesson_standards` link: lesson → ACC-1.3
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Conductor — User Manual Verification 'Phase 2: Lesson Seeds L1–L4' (Protocol in workflow.md)

---

## Phase 3: Lesson Seeds L5–L7 [checkpoint: TBD]

- [ ] Task: Seed Lesson 5 — Detect and Fix Ledger Errors (ACC-1.5)
    - [ ] Write integration test: lesson `unit-1-lesson-5` returns 6 phases
    - [ ] Create `supabase/seed/unit1/lesson-05.ts` (error patterns: misclassification, missing entries)
    - [ ] Include `comprehension-quiz` activity: identify which items in a ledger are misclassified
    - [ ] Seed `lesson_standards` link: lesson → ACC-1.5
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Seed Lesson 6 — Data Validation and Integrity (ACC-1.6)
    - [ ] Write integration test: lesson `unit-1-lesson-6` returns 6 phases
    - [ ] Create `supabase/seed/unit1/lesson-06.ts` (data validation lists, zero-blank rules)
    - [ ] Include `fill-in-the-blank` activity in Guided Practice: complete validation logic statements
    - [ ] Seed `lesson_standards` link: lesson → ACC-1.6
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Seed Lesson 7 — Balance Snapshot with Visual (ACC-1.7)
    - [ ] Write integration test: lesson `unit-1-lesson-7` returns 6 phases
    - [ ] Create `supabase/seed/unit1/lesson-07.ts` (Balance Snapshot v0.9, bar chart instructions)
    - [ ] Include `spreadsheet` activity in Independent Practice: assemble balance snapshot and note chart requirements
    - [ ] Seed `lesson_standards` link: lesson → ACC-1.7
    - [ ] Milestone ① note in Assessment phase: "Balance Snapshot v0.9 submitted"
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Conductor — User Manual Verification 'Phase 3: Lesson Seeds L5–L7' (Protocol in workflow.md)

---

## Phase 4: Lesson Seeds L8–L11 [checkpoint: TBD]

- [ ] Task: Seed Lessons 8–10 — Group Project Days
    - [ ] Write integration test: lessons `unit-1-lesson-8`, `unit-1-lesson-9`, `unit-1-lesson-10` each return 6 phases
    - [ ] Create `supabase/seed/unit1/lessons-08-10.ts` (simplified phases: group work instructions, peer review, polish)
    - [ ] L8 phases: Group ledger refinement instructions + `peer-critique-form` activity
    - [ ] L9 phases: Visual polish instructions + `reflection-journal` on audience expectations
    - [ ] L10 phases: Final submission checklist markdown + `reflection-journal` (personal checklist)
    - [ ] Milestone ② note in L10 Assessment phase: "Final Mini Balance Sheet submitted"
    - [ ] No primary standard for L8–L10 (project integration days)
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Seed Lesson 11 — Individual Assessment (ACC-1.1–ACC-1.7)
    - [ ] Write integration test: lesson `unit-1-lesson-11` returns 6 phases; Assessment phase has a required activity
    - [ ] Create `supabase/seed/unit1/lesson-11.ts`
    - [ ] Assessment phase: summative `comprehension-quiz` with 7 questions (one per ACC-1.x standard), auto-graded
    - [ ] Closing phase: `reflection-journal` prompt
    - [ ] Seed `lesson_standards` links: lesson → ACC-1.1 through ACC-1.7 (all 7 standards)
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Update `supabase/seed/README.md` with unit1/ seed directory instructions

- [ ] Task: Conductor — User Manual Verification 'Phase 4: Lesson Seeds L8–L11' (Protocol in workflow.md)

---

## Phase 5: End-to-End Verification [checkpoint: TBD]

- [ ] Task: Browser walkthrough — all 11 lessons navigable
    - [ ] Use Chrome MCP to navigate to each `/student/lesson/unit-1-lesson-N` (N = 1–11)
    - [ ] Verify all 6 phases render with substantive content and no "Content coming soon" placeholders
    - [ ] Verify activities load and UI is functional

- [ ] Task: Competency recording integration test
    - [ ] Write test: after completing a required activity in L2, `student_progress.metadata` contains `standardCodes: ["ACC-1.2"]`
    - [ ] Run test against seeded data
    - [ ] Pass test

- [ ] Task: Curriculum page smoke test
    - [ ] Navigate to `/curriculum` and verify all 11 Unit 1 lessons appear

- [ ] Task: Run `npm run lint` — no new errors

- [ ] Task: Conductor — User Manual Verification 'Phase 5: End-to-End Verification' (Protocol in workflow.md)
