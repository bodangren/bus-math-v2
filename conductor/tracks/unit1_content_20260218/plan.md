# Implementation Plan: Unit 1 Curriculum Content — Balance by Design

## Phase 1: Competency Wiring Audit & Adaptation [checkpoint: 520f54c]

- [x] Task: Audit `lesson_standards` schema and existing linkages
    - [x] Read migration files to find `lesson_standards` table structure and FK columns
    - [x] Check if any `lesson_standards` rows exist in existing seeds
    - [x] Document table columns, FK relationships, and any unique constraints
    <!-- Findings: lesson_standards(id, lesson_version_id→lesson_versions, standard_id→competency_standards, is_primary bool, created_at); UNIQUE(lesson_version_id, standard_id). L1 seed already seeds two lesson_standards rows. -->

- [~] Task: Audit `complete_activity_atomic` RPC and `student_progress` for standard-code recording
    - [x] Read the `complete_activity_atomic` migration SQL to understand its parameters and what it writes
    - [x] Determine whether `student_progress.metadata` JSONB already carries or can carry `standardCodes: string[]`
    - [x] Write failing test: completing an activity via the RPC stores a `standardCodes` array in the resulting progress row
    <!-- Findings: student_progress has NO metadata column. RPC writes to student_competency (not student_progress). /api/phases/complete does NOT record standard codes. Approach: add linkedStandardId to CompletePhaseRequest and have route upsert student_competency. -->

- [x] Task: Extend phase completion to carry standard codes (Green phase) [8cc9454]
    - [x] student_progress.metadata not available; used student_competency table approach (no migration needed)
    - [x] Added linkedStandardId?: string to CompletePhaseRequest type and Zod schema
    - [x] /api/phases/complete upserts student_competency when linkedStandardId is provided
    - [x] Pass the failing test from the previous task

- [x] Task: Update `ActivityRenderer` to forward standard codes [8cc9454]
    - [x] Added linkedStandardId?: string to activity content block schema (phase-content.ts)
    - [x] PhaseRenderer forwards block.linkedStandardId to ActivityRenderer
    - [x] ActivityRenderer accepts linkedStandardId and passes it to usePhaseCompletion
    - [x] usePhaseCompletion includes it in CompletePhaseRequest payload
    - [x] Write unit test covering the prop forwarding
    - [x] Pass tests

- [x] Task: Conductor — User Manual Verification 'Phase 1: Competency Wiring Audit & Adaptation' (Protocol in workflow.md) [520f54c]

---

## Phase 2: Lesson Seeds L1–L4 [checkpoint: TBD]

<!-- ⚠️ ERRORS DISCOVERED (2026-02-19) — Seeds L1–L4 require correction before Phase 2 can close.

Root cause: Seeds were authored using only `docs/curriculum/unit_01_lesson_matrix.md` (one-cell-per-phase
summaries). No detailed per-lesson plans exist in the repo. The following errors were identified in review:

ERROR 1 — L1 Phase 1 (Hook) missing unit-launch structure:
  Unit-launch lessons (L1 of every unit) must contain three specific elements that were omitted:
    (a) Launch video
    (b) Business simulation activity
    (c) Turn-and-talk discussion prompts
  What was authored instead: text block + why-this-matters callout + text block.

ERROR 2 — L2–L4 Phase 1 content unverified:
  Phase 1 content for L2–L4 was inferred from single-cell "Entry/Launch" matrix descriptions
  ("Quick case warm-up", "Scenario hook", "Prompt with sample BS"). No detailed lesson plan
  was consulted. Content may not match teacher intent.

ERROR 3 — L8–L10 phase count wrong in plan (see Phase 4 below):
  Plan tasks say L8–L10 "each return 6 phases". Correct structure: L8–L10 are project days
  with 1 phase each (group work + checkpoint).

ERROR 4 — L11 phase count wrong in plan (see Phase 4 below):
  Plan tasks say L11 returns "6 phases". Correct structure: L11 is the summative assessment
  lesson with 1 phase.

BLOCKER: Detailed per-lesson plans do not exist in docs/curriculum/. The matrix tables are
insufficient as content specs for seeding. Per-lesson plans must be authored or provided
before L1–L4 can be corrected and before L5–L11 can be seeded.

Resolution: Stopped at user direction on 2026-02-19. Awaiting per-lesson plan docs.
-->

- [x] Task: Seed Lesson 1 — Launch Unit: A=L+E (ACC-1.1) ⚠️ NEEDS CORRECTION — see errors above
    - [x] Write integration test: `__tests__/seed/unit1/lesson-01.test.ts` — 9 tests covering 6 phases, ≥2 sections, hook callout, narrative, standard, activity, idempotency
    - [x] Authored `supabase/seed/unit1/lesson-01.ts` with full 6-phase content from L1 matrix row
    - [x] Phase 1 (Hook) has `why-this-matters` callout and Sarah Chen narrative
    - [x] Standards linked: ACC-1.1 (primary)
    - [x] Assessment phase has required `comprehension-quiz` exit ticket (5 questions, 80% pass)
    - [ ] Run seed script against DB and confirm idempotency (deferred to Phase 5 E2E run)
    - [x] Pass integration test (all 9 tests pass)
    - [ ] ⚠️ CORRECTION NEEDED: Add launch video, business simulation, and turn-and-talk to Phase 1

- [x] Task: Seed Lesson 2 — Classify Accounts into A/L/E (ACC-1.2) ⚠️ PHASE 1 UNVERIFIED
    - [x] Write integration test: `__tests__/seed/unit1/lesson-02.test.ts` — 9 tests (6 phases, sections, hook callout, activities, standard, slug, namespace, no placeholders)
    - [x] Created `supabase/seed/unit1/lesson-02.ts` with full 6-phase authored content from L2 matrix row
    - [x] Guided Practice (3) has required `account-categorization` activity (11 TechStart accounts drag-sort)
    - [x] Assessment (5) has required `comprehension-quiz` exit ticket (5 questions, 80% pass)
    - [x] Standards linked: ACC-1.2 (primary)
    - [ ] Run seed against DB and verify idempotency (deferred to Phase 5 E2E run)
    - [x] All 9 tests pass
    - [ ] ⚠️ CORRECTION NEEDED: Verify Phase 1 content against detailed lesson plan when available

- [x] Task: Seed Lesson 3 — Apply A/L/E to Business Events (ACC-1.4) ⚠️ PHASE 1 UNVERIFIED
    - [x] Write integration test: `__tests__/seed/unit1/lesson-03.test.ts` — 10 tests (6 phases, sections, hook callout, Sarah narrative, assessment activity, standard, slug, namespace, no placeholders, ≥5 quiz questions)
    - [x] Created `supabase/seed/unit1/lesson-03.ts` with 7 TechStart event scenarios, dual-impact concept, SUMIF verification
    - [x] Assessment (5) has required `comprehension-quiz` exit ticket (5 questions tracing event effects on A/L/E)
    - [x] Standards linked: ACC-1.4 (primary)
    - [ ] Run seed against DB and verify idempotency (deferred to Phase 5 E2E run)
    - [x] All 10 tests pass
    - [ ] ⚠️ CORRECTION NEEDED: Verify Phase 1 content against detailed lesson plan when available

- [x] Task: Seed Lesson 4 — Build the Balance Sheet (ACC-1.3) ⚠️ PHASE 1 UNVERIFIED
    - [x] Write integration test: `__tests__/seed/unit1/lesson-04.test.ts` — 10 tests (6 phases, sections, hook callout, spreadsheet activity in phase 4, comprehension-quiz in phase 5, standard, slug, namespace, no placeholders, balance-sheet template)
    - [x] Created `supabase/seed/unit1/lesson-04.ts` with BS skeleton structure, Current/Non-Current sections, subtotals walkthrough
    - [x] Independent Practice (4) has required `spreadsheet` activity (balance-sheet template, ≥6 accounts)
    - [x] Assessment (5) has required `comprehension-quiz` exit ticket (5 questions on BS structure)
    - [x] Standards linked: ACC-1.3 (primary)
    - [ ] Run seed against DB and verify idempotency (deferred to Phase 5 E2E run)
    - [x] All 10 tests pass
    - [ ] ⚠️ CORRECTION NEEDED: Verify Phase 1 content against detailed lesson plan when available

- [ ] Task: Conductor — User Manual Verification 'Phase 2: Lesson Seeds L1–L4' (Protocol in workflow.md)

---

## Phase 3: Lesson Seeds L5–L7 [checkpoint: TBD]

<!-- BLOCKER: Do not begin L5–L7 seeds until detailed per-lesson plans are provided.
     Matrix table descriptions are insufficient content specs. -->

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

<!-- ⚠️ PLAN CORRECTED (2026-02-19): Original plan had wrong phase counts for L8–L11.
     Correct structure per product owner:
       L8–L10: Project days — 1 phase each (group work + checkpoint), NOT 6 phases
       L11: Summative assessment day — 1 phase, NOT 6 phases
     Tasks below updated to reflect correct structure. -->

- [ ] Task: Seed Lessons 8–10 — Group Project Days
    - [ ] Write integration test: lessons `unit-1-lesson-8`, `unit-1-lesson-9`, `unit-1-lesson-10` each return exactly 1 phase
    - [ ] Create `supabase/seed/unit1/lessons-08-10.ts` (1 phase each: group work instructions + checkpoint activity)
    - [ ] L8 (1 phase): Group ledger refinement instructions + `peer-critique-form` activity
    - [ ] L9 (1 phase): Visual polish instructions + `reflection-journal` on audience expectations
    - [ ] L10 (1 phase): Final submission checklist markdown + `reflection-journal` (personal checklist); Milestone ② note
    - [ ] No primary standard for L8–L10 (project integration days)
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Seed Lesson 11 — Individual Assessment (ACC-1.1–ACC-1.7)
    - [ ] Write integration test: lesson `unit-1-lesson-11` returns exactly 1 phase with a required activity
    - [ ] Create `supabase/seed/unit1/lesson-11.ts`
    - [ ] 1 phase: summative `comprehension-quiz` with 7 questions (one per ACC-1.x standard), auto-graded
    - [ ] Seed `lesson_standards` links: lesson → ACC-1.1 through ACC-1.7 (all 7 standards)
    - [ ] Run seed, verify idempotency
    - [ ] Pass integration test

- [ ] Task: Update `supabase/seed/README.md` with unit1/ seed directory instructions

- [ ] Task: Conductor — User Manual Verification 'Phase 4: Lesson Seeds L8–L11' (Protocol in workflow.md)

---

## Phase 5: End-to-End Verification [checkpoint: TBD]

- [ ] Task: Browser walkthrough — all 11 lessons navigable
    - [ ] Use Chrome MCP to navigate to each `/student/lesson/unit-1-lesson-N` (N = 1–11)
    - [ ] L1–L7: Verify all 6 phases render with substantive content and no "Content coming soon" placeholders
    - [ ] L8–L10: Verify 1 phase each renders correctly (project day structure)
    - [ ] L11: Verify 1 phase renders correctly (summative assessment)
    - [ ] Verify activities load and UI is functional

- [ ] Task: Competency recording integration test
    - [ ] Write test: after completing a required activity in L2, `student_progress.metadata` contains `standardCodes: ["ACC-1.2"]`
    - [ ] Run test against seeded data
    - [ ] Pass test

- [ ] Task: Curriculum page smoke test
    - [ ] Navigate to `/curriculum` and verify all 11 Unit 1 lessons appear

- [ ] Task: Run `npm run lint` — no new errors

- [ ] Task: Conductor — User Manual Verification 'Phase 5: End-to-End Verification' (Protocol in workflow.md)
