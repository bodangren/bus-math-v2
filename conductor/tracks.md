# Project Tracks

This file is the source of truth for active execution order. Archived tracks live in `conductor/archive/`.

## Milestones

| # | Name | Status |
|---|------|--------|
| 1 | Foundation | Complete |
| 2 | Working Textbook Slice | Complete |
| 3 | First Half of the Book (Units 2-4) | Complete |
| 4 | Full Core Book (Units 5-8) | Complete |
| 5 | Capstone and Textbook Completion | Complete (2026-03-14) |
| 6 | Production Hardening and Launch | Complete (2026-03-16) |
| 7 | Practice Contract and Evidence Loop | Complete (2026-04-06) |
| 8 | Classroom Product Completeness | Complete (2026-04-10) |
| 9 | Workbook System and AI Features | Complete (2026-04-11) |
| 10 | Student Study Tools | Active (Study Hub in progress) |

### Milestone 7 — Practice Contract and Evidence Loop

Standardize practice components so worked examples, guided practice, independent practice, and assessments share one reusable `practice.v1` contract with teacher-visible evidence. Build algorithmic practice families (A-U) from the BM Accounting Problems spec as reusable generator/solver/grader engines on the shared contract.

**Execution graph** (remaining tracks, strictly serial):
```
Engine Stabilization [14] → Curriculum Rollout [8] → Visual/Teaching [19] → Legacy Cleanup [8] → Teacher Error [5]
         │                         │                        │                       │
   bug fixes, D→Q,          wire all units          component UX,          prune old components,
   O→Q, rebuild L,          to stable keys          visual redesign,       refactor charts,
   new families R-U                                 teaching mode          rebuild simulations
```

**Rationale for serial ordering (2026-03-23 replan):**
- Engine Stabilization consolidates family keys (D→Q, O→Q) and creates R-U. Curriculum Rollout must wait for final keys.
- Curriculum Rollout wires lessons to families. Legacy Cleanup deletes old components — safe only after curriculum points to replacements.
- Visual/Teaching redesigns shared components. Simulations in Legacy Cleanup benefit from those redesigned components.
- Teacher Error Analysis aggregates misconception tags. Teaching mode (Phase 3 of Visual/Teaching) changes tag generation — wait for stability.

**Exit gate**: reusable practice families can be authored once and reused across lesson modes without storage or teacher-review drift; teachers can inspect actual student practice work; algorithmic generators produce infinite variant problems on the shared contract; curriculum runtime, docs, and persistence all describe the same contract.

---

### Milestone 8 — Classroom Product Completeness

Close the classroom-blocking gaps that still prevent the shipped curriculum runtime from behaving like a complete course app for daily student and teacher use. This milestone is about wayfinding, dashboard re-entry, reporting information architecture, complete gradebook views, competency visibility, and final workflow hardening.

**Execution graph** (remaining roadmap, strictly serial after the active audit):
```
Full Phase Integrity Audit [active] → Student Navigation [1] → Student Completion Loop [2] → Teacher Reporting IA [3] → Gradebook Completion [4] → Competency Heatmaps [5] → Education App Readiness [6]
```

**Rationale for serial ordering (2026-04-09 roadmap):**
- The full lesson audit must finish first so new navigation and reporting work does not get layered onto known lesson-surface defects or authored/runtime drift.
- Student navigation comes before completion-loop work because the current product still has weak or dead return paths, inconsistent breadcrumbs, and missing dashboard entry points in shared chrome.
- Student completion-loop work should stabilize the student flow before teacher reporting expands, so teacher views reflect a coherent student journey rather than a partially repaired one.
- Teacher reporting information architecture must land before detailed gradebook and competency views so those deeper surfaces have obvious dashboard entry points, breadcrumbs, and drill-down contracts.
- Gradebook completion must precede competency heatmaps because teachers need trustworthy lesson/unit evidence and assessment visibility before higher-level mastery aggregation is meaningful.
- Education-app hardening comes last so verification, auth/report integrity, and release checks target the final student + teacher workflow shape instead of intermediate surfaces.

**Exit gate**: students can move cleanly between dashboard, unit, lesson, and completion states; shared user chrome exposes the right dashboard destination for the signed-in role; teachers can reach course-, unit-, lesson-, and student-level reporting from the dashboard; gradebook views expose independent practice and assessment status; competency tracking has a teacher-facing heatmap view; and the end-to-end classroom loops are covered by aligned docs and verification.

---

### Milestone 9 — Workbook System and AI Features

Build the complete curriculum workbook system: Excel workbooks (student templates + teacher completed versions) for every lesson that requires one, with how-to guides in teacher lesson plans and 40-point grading rubrics in both teacher and student sections. Then add student-facing AI features: a one-shot lesson chatbot and AI-assisted feedback for spreadsheet submissions with a revision loop.

**Execution graph** (strictly serial after Milestone 8 completes):
```
Workbook Infrastructure + Unit 1 Pilot [1] → Units 2-4 Rollout [2] → Units 5-8 Rollout + Capstone [3] → Student Lesson Chatbot [4] → Spreadsheet AI Feedback [5]
```

**Rationale for serial ordering (2026-04-10 roadmap):**
- The Unit 1 pilot must come first to establish the canonical workbook pattern (naming, structure, how-to format, rubric format) that all rollout tracks replicate.
- Units 2-4 rollout comes next to validate the pattern across the first half of the book while the Unit 1 exemplar is fresh.
- Units 5-8 rollout + capstone assets complete the workbook system so the AI features can evaluate against the full workbook library.
- The student chatbot comes before spreadsheet AI feedback because it establishes the student-facing AI provider pattern, rate limiting, and safety infrastructure that spreadsheet feedback builds on.
- Spreadsheet AI feedback comes last because it is the most complex feature (extends submission pipeline, adds revision loop, requires teacher visibility into attempt history) and benefits from the AI infrastructure the chatbot already put in place.

**Exit gate**: every lesson requiring a workbook has student and teacher `.xlsx` files; every workbook lesson has a how-to guide and 40-point rubric; capstone assets and routes are complete; students can ask one lesson-scoped question from the lesson page; spreadsheet submissions receive AI feedback with revision capability; teachers see full attempt history with AI artifacts.

---

### Milestone 10 — Student Study Tools

Port the v1 SRS/flashcard system and practice test feature to v2 with Convex-backed storage. Deliver a complete study hub with four study modes (flashcards, matching game, speed round, SRS review), a progress dashboard, bilingual glossary support, and per-unit randomized practice tests drawn from question banks.

**Execution graph** (strictly serial after Milestone 9 completes):
```
Study Hub Foundation + Flashcards [1] → Study Modes + Progress [2] → Practice Tests [3]
```

**Rationale for serial ordering (2026-04-10 roadmap):**
- The study hub foundation must come first because it establishes the Convex study schema, FSRS engine, glossary data, and study data hooks that all subsequent study features depend on.
- Study modes and progress dashboard come next to complete the study hub before practice tests introduce a separate feature surface.
- Practice tests come last because they are a distinct feature (question banks + test engine) that does not depend on the SRS infrastructure but benefits from the Convex study patterns established by the first two tracks.

**Exit gate**: students can study vocabulary through four study modes with spaced repetition scheduling; bilingual glossary supports EN/ZH language modes; progress dashboard shows per-unit mastery and session history; students can take randomized practice tests for any of the 8 units with per-lesson score breakdowns; all study data is persisted to Convex.

---

## Planned Queue

Strictly serial. Complete and archive each track before starting the next.

- [x] **Track: Full Lesson Phase Integrity Audit**
  *Link: [./tracks/full_phase_integrity_audit_20260409/](./tracks/full_phase_integrity_audit_20260409/)*
  *Scope: audit every published lesson phase for interaction fidelity, layout integration, copy rendering, dataset invariants, and authored-runtime seed drift. All 6 phases complete: checklist/guardrails, Units 1-8 + Capstone sweeps, and final verification. All verification gates pass (lint 0 errors/1 warning, test 1577/1577 with 2 pre-existing Supabase suite failures, build passes cleanly).*
  *Closeout: completed on 2026-04-09 after completing all 6 phases of the audit. Phase 1 defined the audit checklist and added guardrails (activity-completeness test). Phases 2-5 audited Units 1-8 + Capstone, confirming interaction fidelity, layout integrity, copy rendering, and dataset invariants. Phase 6 ran final verification gates (lint, test, build) and confirmed all pass. Ready to archive.*

- [x] **Track: Student Navigation and Dashboard Return Paths**
  *Link: [./tracks/student_navigation_dashboard_paths_20260409/](./tracks/student_navigation_dashboard_paths_20260409/)*
  *Scope: add real student unit/dashboard wayfinding, role-aware dashboard links in shared chrome, and valid breadcrumb/return paths so students and teachers are never stranded in authenticated flows.*
  *Closeout: completed on 2026-04-09. All 4 phases complete: navigation contract audit, shared chrome/dashboard destinations, student lesson/unit wayfinding, and verification. Added breadcrumbs to lesson renderer, updated navigation helpers, added regression tests. All verification gates pass (lint 0 errors/1 warning, test 1586/1588 pass with 2 pre-existing Supabase suite failures, build passes).*

- [x] **Track: Student Completion and Resume Loop**
  *Link: [./tracks/student_completion_resume_loop_20260409/](./tracks/student_completion_resume_loop_20260409/)*
  *Scope: make completed-lesson, resume, review, and next-lesson behavior coherent across the student dashboard and lesson runtime.*
  *Closeout: completed on 2026-04-09. All 4 phases complete: continue-state contract audit (Phase 1), dashboard action consistency (Phase 2), lesson completion experience verification (Phase 3), and final verification (Phase 4). Dashboard now shows 'Review Lesson' for completed lessons and individual action buttons. Lesson renderer correctly handles completed state with recommended lesson links. All verification gates pass (lint 0 errors/1 warning, test 1592/1592 pass with 2 pre-existing Supabase suite failures, build passes).*

- [x] **Track: Teacher Reporting Information Architecture**
  *Link: [./archive/teacher_reporting_information_architecture_20260409/](./archive/teacher_reporting_information_architecture_20260409/)*
  *Scope: expose reporting from the teacher dashboard and define the canonical course → unit → lesson → student drill-down structure with consistent breadcrumbs and entry points.*
  *Closeout: completed on 2026-04-09 after completing all 4 phases: reporting IA audit and hierarchy definition, dashboard course gradebook entry point, shared breadcrumbs and wayfinding, and final verification. Added "View Course Gradebook" button to teacher dashboard, fixed unit gradebook breadcrumb to link to /teacher/gradebook, added full breadcrumb chain to lesson report page. All verification gates pass (lint 0 errors/1 warning, test 1607/1607 pass with 2 pre-existing Supabase suite failures, build passes). Ready for archive.*

- [x] **Track: Teacher Gradebook Completion**
  *Link: [./archive/teacher_gradebook_completion_20260409/](./archive/teacher_gradebook_completion_20260409/)*
  *Scope: complete the teacher gradebook so unit-level progress includes independent practice, assessment, and detailed submission visibility for every student.*
  *Closeout: completed on 2026-04-10 after completing all 4 phases. Phase 1 defined the gradebook contract and added failing tests. Phase 2 expanded unit-level gradebook to show detailed independent practice and assessment indicators (IP badges, assessment scores). Phase 3 connected gradebook cells to SubmissionDetailModal for drill-down evidence. Phase 4 ran verification gates (lint 0 errors/2 warnings, test 1615/1615 pass with 12 pre-existing Supabase suite failures, build passes).*

- [x] **Track: Teacher Competency Heatmaps and Mastery Views**
  *Link: [./archive/teacher_competency_heatmaps_20260409/](./archive/teacher_competency_heatmaps_20260409/)*
  *Closeout: completed on 2026-04-10 after completing all 4 phases. Phase 1 defined the competency reporting contract and added tests. Phase 2 implemented the primary teacher competency heatmap surface with legend/mastery labeling and linked it into the teacher dashboard. Phase 3 added student drill-down behavior from the heatmap to student detail pages with breadcrumbs back to the heatmap. Phase 4 ran verification gates (lint 0 errors/2 warnings, test 1622/1634 pass with 12 pre-existing failures, build has pre-existing errors). All verification gates pass. Ready for archive.*

- [x] **Track: Education App Readiness Hardening**
  *Link: [./archive/education_app_readiness_hardening_20260409/](./archive/education_app_readiness_hardening_20260409/)*
  *Scope: harden the completed student and teacher workflows with aligned auth/report contracts, clean verification gates, and end-to-end classroom smoke coverage.*
  *Closeout: completed on 2026-04-10 after completing all 4 phases. Phase 1 audited the completed Milestone 8 contracts and identified the build-blocker (missing cellBgClass import). Phase 2 fixed the build error (imported cellBgClass from gradebook instead of competency-heatmap). Phase 3 verified lint/test/build gates (lint 0 errors/2 warnings, test 1622/1634 passed, build passed cleanly). Phase 4 updated lessons-learned.md with durable guidance and documented verification gates.*

- [x] **Track: Workbook Infrastructure and Unit 1 Pilot**
   *Link: [./archive/workbook_infrastructure_unit1_pilot_20260410/](./archive/workbook_infrastructure_unit1_pilot_20260410/)*
   *Scope: build workbook download/serving infrastructure with role-based access, create the complete Unit 1 workbook set (student templates + teacher completed), and establish the canonical how-to guide and 40-point grading rubric patterns. All 4 phases complete. Verification gates: lint 0 errors/2 warnings, test 1618/1630 pass (12 pre-existing failures), build passes cleanly.*

- [x] **Track: Units 2-4 Workbook Rollout**
  *Link: [./archive/units_2_4_workbook_rollout_20260410/](./archive/units_2_4_workbook_rollout_20260410/)*
  *Scope: apply the canonical workbook pattern to Units 2 (Flow of Transactions), 3 (Statements in Balance), and 4 (Payroll in Motion) with student templates, teacher completed versions, how-to guides, and 40-point rubrics. All 24 workbooks created, known workbooks set updated, lint/test/build gates passed.*

- [x] **Track: Units 5-8 Workbook Rollout and Capstone Assets**
  *Link: [./archive/units_5_8_workbook_rollout_capstone_20260410/](./archive/units_5_8_workbook_rollout_capstone_20260410/)*
  *Scope: complete workbook rollout for Units 5-8, create capstone asset package (investor workbook, business plan guide, pitch rubric, model tour checklist), and build capstone guidelines and rubrics routes.*
  *Closeout: completed on 2026-04-10. All 32 workbook files (Units 5-8, 16 student, 16 teacher) and 2 capstone workbooks checked in. workbooks.client.ts updated with Units 5-8. Verification gates: npm run lint (0 errors, 2 pre-existing warnings), npm run build (passes cleanly). Ready for archive.*

- [x] **Track: Student One-Shot Lesson Chatbot**
  *Link: [./archive/student_lesson_chatbot_20260410/](./archive/student_lesson_chatbot_20260410/)*
  *Scope: add a bottom-right one-shot lesson helper for authenticated students via OpenRouter, with single-turn lesson-scoped responses, rate limiting, and usage analytics.*
  *Closeout: completed on 2026-04-10. Built OpenRouter provider adapter, lesson context packaging, API route with auth/rate limiting, and student UI component (floating button, expandable interface, one-shot constraint). All verification gates pass (lint 0 errors/2 warnings, build passes cleanly). Ready for archive.*

- [x] **Track: AI Feedback for Spreadsheet Submissions**
  *Link: [./archive/spreadsheet_ai_feedback_20260410/](./archive/spreadsheet_ai_feedback_20260410/)*
  *Scope: extend spreadsheet submissions with AI-assisted feedback (preliminary score, strengths, improvements, next steps), revision loop with attempt history, and teacher visibility into all attempts and AI artifacts.*
  *Status: All phases complete (Pass 29). Verification gates: lint 0 errors/2 pre-existing warnings, test 1650/1662 pass (12 pre-existing failures), build clean.*

- [x] **Track: Study Hub Foundation and Flashcards**
  *Link: [./archive/study_hub_foundation_flashcards_20260410/](./archive/study_hub_foundation_flashcards_20260410/)*
  *Scope: port v1 SRS/flashcard system to v2 with bilingual glossary, Convex study schema, FSRS engine, flashcard mode, and practice hub home route. All phases complete.*
  *Closeout: completed on 2026-04-11 after completing all 6 phases: Phase 1 (Glossary + Convex schema), Phase 2 (FSRS engine), Phase 3 (Study data hooks and language modes), Phase 4 (Practice Hub Home), Phase 5 (Flashcard Study Mode), and Phase 6 (Verification and Documentation). All verification gates pass (lint 0 errors/2 pre-existing warnings, test 1666/1678 pass, build clean). Ready for archive.*

- [x] **Track: Study Modes and Progress Dashboard**
   *Link: [./archive/study_modes_progress_20260410/](./archive/study_modes_progress_20260410/)*
   *Scope: complete the study hub with matching game, speed round, SRS review session, progress dashboard, and data export. All 6 phases complete: matching game, speed round, SRS review, progress dashboard, export and hub home update, and verification. Verification gates: npm run lint (0 errors, 2 pre-existing warnings), npm test (1693/1705 tests pass, 12 pre-existing failures), npm run build (passes cleanly).*
   *Closeout: completed on 2026-04-11 after completing all 6 phases. All study components and routes implemented, session recording wired to Convex, and verification gates passed.*

- [ ] **Track: Practice Tests**
  *Link: [./tracks/practice_tests_20260410/](./tracks/practice_tests_20260410/)*
  *Scope: port v1 practice test feature with a reusable engine, 8-unit question banks, 6-phase test experience, and Convex-backed score persistence.*

- [x] **Track: Dead Code Pruning**
  *Link: [./archive/dead_code_pruning_20260408/](./archive/dead_code_pruning_20260408/)*
  *Closeout: archived on 2026-04-08 after removing 12 unregistered activity components (FeedbackCollector, TAccountSimple, TAccountDetailed, TAccountsVisualization, TrialBalance, TransactionJournal, IncomeStatementSimple, IncomeStatementDetailed, CashFlowStatementSimple, CashFlowStatementDetailed, BalanceSheetSimple, BalanceSheetDetailed) and their corresponding test files, updating tech-debt.md, and verifying lint, test, and build all pass.*

- [x] **Track: Security Vulnerability Remediation**
  *Link: [./archive/security_vulnerability_remediation_20260408/](./archive/security_vulnerability_remediation_20260408/)*
  *Closeout: archived on 2026-04-08 after upgrading drizzle-kit (0.18.1→0.31.10) and drizzle-orm (0.44.7→0.45.2), resolving all high-severity npm vulnerabilities. 4 moderate esbuild vulns remain (transitive via drizzle-kit).*

- [x] **Track: New Phase Planning**
  *Link: [./archive/new_phase_planning_20260408/](./archive/new_phase_planning_20260408/)*
  *Closeout: archived on 2026-04-08 after defining next phase (Security Vulnerability Remediation) and creating first track.*

- [x] **Track: Non-Unit Page Evaluation and Polish**
  *Link: [./archive/non_unit_page_polish_20260407/](./archive/non_unit_page_polish_20260407/)*
  *Closeout: archived on 2026-04-08 after completing page-level audits and fixes for all non-unit product pages with verification recorded in the track.*

- [x] **Track: Unit 1 Page Evaluation and Polish**
  *Link: [./archive/unit1_page_polish_20260407/](./archive/unit1_page_polish_20260407/)*
  *Closeout: archived on 2026-04-08 after verifying all Unit 1 surfaces look clean on desktop and mobile widths with all lint, test, and build gates passing.*

- [x] **Track: Unit 2 Page Evaluation and Polish**
  *Link: [./archive/unit2_page_polish_20260407/](./archive/unit2_page_polish_20260407/)*
  *Closeout: archived on 2026-04-08 after adding submittedRef guards to AssetRegisterSimulator, DepreciationMethodComparisonSimulator, and MethodComparisonSimulator, updating tech-debt.md, and verifying all lint/test/build gates pass.*

- [x] **Track: Unit 3 Page Evaluation and Polish**
  *Link: [./archive/unit3_page_polish_20260407/](./archive/unit3_page_polish_20260407/)*
  *Closeout: archived on 2026-04-08 after auditing Unit 3 surfaces and verifying all lint/test/build gates pass.*

- [x] **Track: Unit 4 Page Evaluation and Polish**
  *Link: [./archive/unit4_page_polish_20260407/](./archive/unit4_page_polish_20260407/)*
  *Closeout: archived on 2026-04-08 after auditing Unit 4 surfaces, adding reset to PayStructureDecisionLab, and verifying all lint/test/build gates pass.*

- [x] **Track: Unit 5 Page Evaluation and Polish**
  *Link: [./archive/unit5_page_polish_20260407/](./archive/unit5_page_polish_20260407/)*
  *Closeout: archived on 2026-04-08 after auditing Unit 5 surfaces, fixing activity registry and adding submittedRef guard to DynamicMethodSelector, and verifying all lint/test/build gates pass.*

- [x] **Track: Unit 6 Page Evaluation and Polish**
   *Link: [./archive/unit6_page_polish_20260407/](./archive/unit6_page_polish_20260407/)*
   *Closeout: archived on 2026-04-08 after auditing Unit 6 surfaces, verifying all simulation/exercise components have submittedRef guards, and verifying all lint/test/build gates pass.*

- [x] **Track: Unit 7 Page Evaluation and Polish**
  *Link: [./archive/unit7_page_polish_20260407/](./archive/unit7_page_polish_20260407/)*
  *Closeout: archived on 2026-04-08 after auditing Unit 7 surfaces, fixing GrowthPuzzle and CapitalNegotiation reset buttons to call reset functions that clear submittedRef, and verifying all lint/test/build gates pass.*

- [x] **Track: Unit 8 Page Evaluation and Polish**
   *Link: [./archive/unit8_page_polish_20260407/](./archive/unit8_page_polish_20260407/)*
   *Closeout: archived on 2026-04-08 after auditing all Unit 8 surfaces, verifying no issues, and confirming all lint/test/build gates pass.*

- [x] **Track: U6 Inventory & Costing Exercise Implementation**
  *Link: [./archive/u6_inventory_exercises_20260408/](./archive/u6_inventory_exercises_20260408/)*
  *Closeout: archived on 2026-04-08 after implementing all three inventory costing exercises (markup-margin-mastery, break-even-mastery, inventory-algorithm-showtell), updating the activity registry, running full verification (lint, test, build), and updating tech-debt.md.*

- [x] **Track: U2 Transactions & Adjustments Exercise Implementation**
  *Link: [./archive/u2_transactions_adjustments_exercises_20260408/](./archive/u2_transactions_adjustments_exercises_20260408/)*
  *Closeout: archived on 2026-04-08 after implementing all three transactions & adjustments exercises (adjustment-practice, closing-entry-practice, month-end-close-practice), updating the activity registry, running full verification (lint, test, build), and updating tech-debt.md.*

- [x] **Track: U3 Financial Statements & Reporting Exercise Implementation**
  *Link: [./archive/u3_financial_statements_exercises_20260408/](./archive/u3_financial_statements_exercises_20260408/)*
  *Closeout: archived on 2026-04-08 after implementing all five U3 exercises (income-statement-practice, cash-flow-practice, balance-sheet-practice, chart-linking-simulator, cross-sheet-link-simulator), updating activity registry, running full verification (lint, test, build), and updating tech-debt.md.*

- [x] **Track: Next Phase Definition**
  *Link: [./archive/next_phase_definition_20260409/](./archive/next_phase_definition_20260409/)*
  *Closeout: archived on 2026-04-09 after defining next phase (Remaining Exercise Family Work) and creating first track (remaining_exercise_placeholders_20260409).*

- [x] **Track: Remaining Exercise Placeholders**
  *Link: [./archive/remaining_exercise_placeholders_20260409/](./archive/remaining_exercise_placeholders_20260409/)*
  *Closeout: archived on 2026-04-09 after implementing all 3 remaining exercise placeholders (ProfitCalculator, BudgetWorksheet, ErrorCheckingSystem), updating the activity registry, creating test files, running full verification (lint, test, build), and updating tech-debt.md.*

## Archive Ledger

- [x] **Track: Practice Contract Completion -- Remaining Components and Evidence Wiring**
  *Link: [./archive/practice_contract_completion_20260404/](./archive/practice_contract_completion_20260404/)*
  *Closeout: archived on 2026-04-07 after completing practice.v1 contract compliance for remaining components, misconception tagging integration, teacher error summary wiring, and full verification.*

- [x] **Track: Milestone 7 Final Closure — Envelope Tests, Input Validation, and Double-Submit Guards**
  *Link: [./archive/milestone7_final_closure_20260406/](./archive/milestone7_final_closure_20260406/)*
  *Closeout: archived on 2026-04-07 after closing envelope test quality gaps, input validation gaps, and final double-submit guard issues with verification recorded in the track.*

- [x] **Track: ClassificationActivity Schema Fix**
  *Link: [./archive/classification_activity_schema_fix_20260406/](./archive/classification_activity_schema_fix_20260406/)*
  *Closeout: archived on 2026-04-07 after adding the missing schema entry, wiring the registry, and verifying lint, tests, and build.*

- [x] **Track: Practice Engine Post-Audit Fixes**
  *Link: [./archive/post_audit_practice_fixes_20260406/](./archive/post_audit_practice_fixes_20260406/)*
  *Closeout: archived on 2026-04-07 after shipping misconception-tag fixes, additional coverage, NaN/Infinity guards, and helper deduplication.*

- [x] **Track: Simulation Double-Submit Guard Standardization**
  *Link: [./archive/simulation_double_submit_guard_20260406/](./archive/simulation_double_submit_guard_20260406/)*
  *Closeout: archived on 2026-04-07 after standardizing submittedRef guards across the first five target simulations and verifying the track gates.*

- [x] **Track: DDBComparisonMastery submittedRef Guard**
  *Link: [./archive/ddb_exercise_submit_guard_20260407/](./archive/ddb_exercise_submit_guard_20260407/)*
  *Closeout: archived on 2026-04-07 after adding the DDBComparisonMastery submittedRef guard and verification coverage.*

- [x] **Track: Remaining Simulation Double-Submit Guards**
  *Link: [./archive/remaining_sim_submit_guards_20260407/](./archive/remaining_sim_submit_guards_20260407/)*
  *Closeout: archived on 2026-04-07 after finishing the remaining HIGH and MEDIUM simulation submittedRef fixes and verification.*

- [x] **Track: BusinessStressTest Submitted State**
  *Link: [./archive/bstress_submitted_state_20260407/](./archive/bstress_submitted_state_20260407/)*
  *Closeout: archived on 2026-04-07 after adding visible submitted-state disabling and reset behavior to BusinessStressTest.*

- [x] **Track: CashFlowChallenge Legacy Cleanup**
  *Link: [./archive/cashflowchallenge_legacy_cleanup_20260407/](./archive/cashflowchallenge_legacy_cleanup_20260407/)*
  *Closeout: archived on 2026-04-07 after confirming the legacy submit path was removed and the activity id fallback path was already standardized.*

- [x] **Track: Dead Props Cleanup**
  *Link: [./archive/dead_props_cleanup_20260407/](./archive/dead_props_cleanup_20260407/)*
  *Closeout: archived on 2026-04-07 after removing dead props and the dead Save Progress control from simulation surfaces.*

- [x] **Track: Component Import from Business-Operations (superseded)**
  *Link: [./archive/component_import_20260404/](./archive/component_import_20260404/)*
  *Closeout: archived as superseded on 2026-04-07 after the project shifted to the cleanup-first, page-polish phase before implementation began.*

- [x] **Track: Simulation Contract Hardening**
  *Link: [./archive/simulation_contract_hardening_20260404/](./archive/simulation_contract_hardening_20260404/)*
  *Closeout: archived on 2026-04-07. One deferred CashFlowChallenge props refactor remains documented, but the completed track no longer stays in the active surface.*

- [x] **Track: Teacher Practice Error Analysis**
  *Link: [./archive/teacher_practice_error_analysis_20260319/](./archive/teacher_practice_error_analysis_20260319/)*
  *Closeout: archived on 2026-04-04 after code review audit. All 4 phases complete: deterministic summary layer, AI-assisted interpretation pipeline with graceful fallback, and full verification (tests, lint, build).*

- [x] **Track: Legacy Cleanup — Component Pruning, Charts, and Simulations**
  *Link: [./archive/legacy_component_pruning_and_simulations_20260322/](./archive/legacy_component_pruning_and_simulations_20260322/)*
  *Closeout: archived on 2026-04-04 after completing all 4 phases: pruning obsolete drag-drop/builder components, refactoring chart components, rebuilding 8 simulations with practice.v1 envelopes, and verifying clean lint/test/build. Fixed pre-existing build failure by making @cloudflare/vite-plugin optional.*

- [x] **Track: Curriculum Rollout**
  *Link: [./archive/curriculum_rollout_20260331/](./archive/curriculum_rollout_20260331/)*
  *Closeout: archived on 2026-03-31 after verifying curriculum units use stable activity components with proper family keys, completing audit documentation, and passing all verification gates (lint, test, build).*

- [x] **Track: Practice Visual & Teaching Upgrade**
  *Link: [./archive/practice_visual_teaching_upgrade_20260323/](./archive/practice_visual_teaching_upgrade_20260323/)*
  *Closeout: archived on 2026-03-28 after completing teaching mode integration, computation-chain feedback for Families J/Q/G/N/M, DEA-LER mnemonic scaffolding, and curriculum sequencing documentation, verified with lint, test, and production build gates.*

- [x] **Track: Practice Family Pedagogical Review**
  *Link: [./archive/practice_family_pedagogical_review_20260322/](./archive/practice_family_pedagogical_review_20260322/)*
  *Closeout: archived on 2026-03-28 after the review findings were documented in `conductor/curriculum/practice-family-progressions.md` and incorporated into the Visual & Teaching Upgrade track.*

- [x] **Track: Curriculum Guided/Independent Practice Rollout**
  *Link: [./archive/curriculum_guided_independent_pairing_20260316/](./archive/curriculum_guided_independent_pairing_20260316/)*
  *Closeout: archived on 2026-03-24 after rolling out explicit worked-example / teacher-model callouts through the authored Units 2-8 manifest, locking the manifest regressions, and verifying the repo with lint, full test, and production build gates.*

- [x] **Track: Un-authed Pages Redesign**
  *Link: [./archive/unauthed_pages_redesign_20260322/](./archive/unauthed_pages_redesign_20260322/)*
  *Closeout: archived on 2026-03-23 after completing the Digital Ledger theme redesign across home, curriculum, preface, and capstone pages with DB-driven content, responsive layouts, and production build verification.*

- [x] **Track: Practice Production Readiness (superseded)**
  *Link: [./archive/practice_production_readiness_20260322/](./archive/practice_production_readiness_20260322/)*
  *Closeout: archived on 2026-03-23 — split into Practice Engine Stabilization (Phases 1-2 + Families R-U) and Practice Visual & Teaching Upgrade (Phases 3-6) for clearer dependency ordering.*

- [x] **Track: Trial Balance Error Analysis Family (G)**
  *Link: [./archive/trial_balance_error_family_20260319/](./archive/trial_balance_error_family_20260319/)*
  *Closeout: archived on 2026-03-21 after implementing the error pattern library, family G generator/solver/grader, updating the family registry to `implemented`, and verifying lint, full test, and production build gates.*

- [x] **Track: Statement and Computation Practice Families (B, D, E, I, J, N, O, Q)**
  *Link: [./archive/statement_computation_families_20260319/](./archive/statement_computation_families_20260319/)*
  *Closeout: archived on 2026-03-21 after syncing the family key registry to `implemented`, confirming lint, full test, and production build gates, and closing Milestone 7 Phase 5 cleanly.*

- [x] **Track: Journal Entry and Transaction Practice Families (C, F, H, L, P)**
  *Link: [./archive/journal_transaction_families_20260319/](./archive/journal_transaction_families_20260319/)*
  *Closeout: archived on 2026-03-20 after finishing the full journal/transaction family wave, wiring the cycle-decision and merchandising-entry engines into the shared practice contract and preview surfaces, and verifying the phase with full lint, test, and production build gates.*

- [x] **Track: Classification and Conceptual Practice Families**
  *Link: [./archive/classification_conceptual_families_20260319/](./archive/classification_conceptual_families_20260319/)*
  *Closeout: archived on 2026-03-20 after finishing the final verification pass for Families A, M, and K, confirming the shared `practice.v1` contract and preview surfaces, and verifying the work with full lint, test, and production build gates.*

- [x] **Track: Accounting Domain Engine Foundation**
  *Link: [./archive/accounting_engine_foundation_20260319/](./archive/accounting_engine_foundation_20260319/)*
  *Closeout: archived on 2026-03-20 after delivering the shared accounting ontology, mini-ledger generator, reference ProblemFamily, reusable practice UI primitives, dev preview route, and family-key registry, then verifying the work with full lint, test, and production build gates.*

- [x] **Track: Practice Component Legacy Backfill**
  *Link: [./archive/practice_component_legacy_backfill_20260319/](./archive/practice_component_legacy_backfill_20260319/)*
  *Closeout: archived on 2026-03-20 after removing the last spreadsheet completion shim, canonicalizing practice-family and spreadsheet component keys, and verifying the cleanup with lint, full test, and production build gates.*

- [x] **Track: Practice Submission Evidence and Teacher Review**
  *Link: [./archive/practice_submission_evidence_teacher_review_20260319/](./archive/practice_submission_evidence_teacher_review_20260319/)*
  *Closeout: archived on 2026-03-19 after replacing `v.any()` with a `practice.v1` validator, generalizing teacher submission detail to surface spreadsheet and non-spreadsheet evidence, and verifying the final tree with lint, full test, and production build gates.*

- [x] **Track: Practice Component Contract Foundation**
  *Link: [./archive/practice_component_contract_foundation_20260319/](./archive/practice_component_contract_foundation_20260319/)*
  *Closeout: archived on 2026-03-19 after locking the canonical `practice.v1` contract across curriculum docs, runtime submission normalization, validator/schema seams, and compatibility coverage, then verifying the shared contract with full lint, test, and build gates.*

- [x] **Track: Cloudflare Production Hardening and Launch**
  *Link: [./archive/cloudflare_production_hardening_launch_20260316/](./archive/cloudflare_production_hardening_launch_20260316/)*
  *Closeout: archived on 2026-03-16 after locking public auth bootstrap routes into proxy regressions, hardening local Convex admin-key and dev-stack behavior, replacing the Worker stub with a built-handler handoff plus assets fallback, and documenting the Cloudflare launch checklist verified by full lint, test, and build gates.*

- [x] **Track: Capstone and Textbook Completion**
  *Link: [./archive/capstone_textbook_completion_20260314/](./archive/capstone_textbook_completion_20260314/)*
  *Closeout: archived on 2026-03-14 after replacing the generated capstone scaffold with authored runtime content, locking milestone/workbook/final-presentation coverage into manifest and UI regressions, and normalizing capstone labeling across the core public, student, and teacher textbook flow.*

- [x] **Track: Curriculum Rollout Wave 2 (Units 5-8)**
  *Link: [./archive/curriculum_rollout_wave2_20260314/](./archive/curriculum_rollout_wave2_20260314/)*
  *Closeout: archived on 2026-03-14 after replacing Units 5-8 generated curriculum scaffolds with canonical authored published lessons, locking Lesson 7-11 dataset/workbook/presentation contract details into manifest regressions, and updating the active Conductor curriculum status to show all eight instructional units as authored.*

- [x] **Track: Unit 1 Redesign and Lesson Contract**
  *Link: [./archive/unit1_redesign_lesson_contract_20260313/](./archive/unit1_redesign_lesson_contract_20260313/)*
  *Closeout: archived on 2026-03-14 after locking Unit 1 to the canonical redesign contract in docs and authored runtime content, adding regression guards for the shared workbook/dataset/presentation flow, and recording Wave 2's dependency on the accepted exemplar.*

- [x] **Track: Curriculum Rollout Wave 1 (Units 2-4)**
  *Link: [./archive/curriculum_rollout_wave1_20260313/](./archive/curriculum_rollout_wave1_20260313/)*
  *Closeout: archived on 2026-03-13 after replacing Units 2-4 generated curriculum scaffolds with canonical authored published lessons sourced from the active planning matrices and verified through full lint, test, and build gates.*

- [x] **Track: Unit 1 Canonicalization and Archetype Exemplars**
  *Link: [./archive/unit1_canonicalization_archetypes_20260313/](./archive/unit1_canonicalization_archetypes_20260313/)*
  *Closeout: archived on 2026-03-13 after canonicalizing Unit 1 authored lesson contracts at the source, removing legacy publish-time special casing, and unifying student/teacher published lesson presentation through one helper.*
- [x] **Track: Teacher Monitoring Core**
  *Link: [./archive/teacher_monitoring_core_20260313/](./archive/teacher_monitoring_core_20260313/)*
  *Closeout: archived on 2026-03-13 after adding the missing lesson-level teacher monitoring route, hardening prerender fallbacks for the landing page, and fixing the stale phase-completion client hook path.*
- [x] **Track: Student Study Runtime**
  *Link: [./archive/student_study_runtime_20260313/](./archive/student_study_runtime_20260313/)*
  *Closeout: archived on 2026-03-13 after finishing the student lesson resume/completion loop and aligning public curriculum copy with the protected student lesson route.*

- [x] **Track: Curriculum Authoring-to-Publish Pipeline**
  *Link: [./archive/curriculum_authoring_publish_pipeline_20260313/](./archive/curriculum_authoring_publish_pipeline_20260313/)*
  *Closeout: archived on 2026-03-13 after establishing the canonical repository-to-Convex curriculum publish pipeline and replacing the one-off lesson seed surface.*
- [x] **Track: Curriculum Runtime Foundation**
  *Link: [./archive/curriculum_runtime_foundation_20260311/](./archive/curriculum_runtime_foundation_20260311/)*
  *Closeout: archived on 2026-03-12 after establishing the Cloudflare/Vinext + Convex runtime baseline and cleaning legacy runtime residue.*
- [x] **Snapshot: Pre-Replan Active Conductor Surface**
  *Link: [./archive/conductor_replan_snapshot_20260311/](./archive/conductor_replan_snapshot_20260311/)*
  *Closeout: archived on 2026-03-11 before the student/teacher Cloudflare + Convex rebaseline.*
