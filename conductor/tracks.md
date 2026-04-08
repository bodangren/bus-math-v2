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

## Planned Queue

Strictly serial. Complete and archive each track before starting the next.

- [x] **Track: Non-Unit Page Evaluation and Polish**
  *Link: [./archive/non_unit_page_polish_20260407/](./archive/non_unit_page_polish_20260407/)*
  *Closeout: archived on 2026-04-08 after completing page-level audits and fixes for all non-unit product pages with verification recorded in the track.*

- [x] **Track: Unit 1 Page Evaluation and Polish**
  *Link: [./tracks/unit1_page_polish_20260407/](./tracks/unit1_page_polish_20260407/)*
  *Closeout: completed on 2026-04-08 after verifying all Unit 1 surfaces look clean on desktop and mobile widths with all lint, test, and build gates passing.*

- [x] **Track: Unit 2 Page Evaluation and Polish**
  *Link: [./tracks/unit2_page_polish_20260407/](./tracks/unit2_page_polish_20260407/)*
  *Closeout: completed on 2026-04-08 after adding submittedRef guards to AssetRegisterSimulator, DepreciationMethodComparisonSimulator, and MethodComparisonSimulator, updating tech-debt.md, and verifying all lint/test/build gates pass.*

- [ ] **Track: Unit 3 Page Evaluation and Polish**
  *Link: [./tracks/unit3_page_polish_20260407/](./tracks/unit3_page_polish_20260407/)*
  *Status: Queued after Unit 2.*

- [ ] **Track: Unit 4 Page Evaluation and Polish**
  *Link: [./tracks/unit4_page_polish_20260407/](./tracks/unit4_page_polish_20260407/)*
  *Status: Queued after Unit 3.*

- [ ] **Track: Unit 5 Page Evaluation and Polish**
  *Link: [./tracks/unit5_page_polish_20260407/](./tracks/unit5_page_polish_20260407/)*
  *Status: Queued after Unit 4.*

- [ ] **Track: Unit 6 Page Evaluation and Polish**
  *Link: [./tracks/unit6_page_polish_20260407/](./tracks/unit6_page_polish_20260407/)*
  *Status: Queued after Unit 5.*

- [ ] **Track: Unit 7 Page Evaluation and Polish**
  *Link: [./tracks/unit7_page_polish_20260407/](./tracks/unit7_page_polish_20260407/)*
  *Status: Queued after Unit 6.*

- [ ] **Track: Unit 8 Page Evaluation and Polish**
  *Link: [./tracks/unit8_page_polish_20260407/](./tracks/unit8_page_polish_20260407/)*
  *Status: Queued after Unit 7.*

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
