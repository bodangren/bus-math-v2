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
| 7 | Practice Contract and Evidence Loop | **Active** |

### Milestone 7 — Practice Contract and Evidence Loop

Standardize practice components so worked examples, guided practice, independent practice, and assessments share one reusable `practice.v1` contract with teacher-visible evidence. Build algorithmic practice families (A-Q) from the BM Accounting Problems spec as reusable generator/solver/grader engines on the shared contract. The `practice_*` tracks are the controlling decomposition; older curriculum and teacher tracks retain only residual scope.

**Execution graph** (not fully serial):
```
Track 1 (Contract Foundation, DONE)
  ├──→ Track 2 (Evidence) ──────────────→ Track 8 (Curriculum Rollout)
  ├──→ Track 3 (Legacy Backfill) ────────↗        ↕ (parallel)
  │      Track 2 + 3 done ──────────────→ Track 9 (Teacher Error Analysis)
  │
  └──→ Track 6 (Engine Foundation)
         ├──→ Track 7a (Classification Families A,M,K)
         ├──→ Track 7b (Journal/Transaction Families C,F,H,L,P)
         ├──→ Track 7c (Statement/Computation Families B,D,E,I,J,N,O,Q)
         └──→ Track 7d (Trial Balance Error Family G)
```

Tracks 6-7d form a serial chain (Foundation first, then families in parallel). The evidence/backfill/rollout chain (Tracks 2-3-8-9) runs independently but must converge before families can be wired into curriculum lessons.

**Exit gate**: reusable practice families can be authored once and reused across lesson modes without storage or teacher-review drift; teachers can inspect actual student practice work; algorithmic generators produce infinite variant problems on the shared contract; curriculum runtime, docs, and persistence all describe the same contract.

---

## Planned Queue

The `practice_*` split is now the governing execution sequence for Milestone 7. The evidence/backfill chain (Tracks 2-3) runs in parallel after Track 1. The engine foundation (Track 6) also starts after Track 1, with family tracks (7a-7d) in parallel after Track 6. Curriculum rollout (Track 8) and teacher error analysis (Track 9) start after Tracks 2+3 converge.

- [~] **Track: Statement and Computation Practice Families (B, D, E, I, J, N, O, Q)**
  *Link: [./tracks/statement_computation_families_20260319/](./tracks/statement_computation_families_20260319/)*
  *Status: In Progress; phase 1 complete, phase 2 shared equation/balance families next.*

- [ ] **Track: Trial Balance Error Analysis Family (G)**
  *Link: [./tracks/trial_balance_error_family_20260319/](./tracks/trial_balance_error_family_20260319/)*
  *Status: Starts after Track 6; builds error pattern library; implements trial-balance-errors (G) family.*

- [ ] **Track: Curriculum Guided/Independent Practice Rollout**
  *Link: [./tracks/curriculum_guided_independent_pairing_20260316/](./tracks/curriculum_guided_independent_pairing_20260316/)*
  *Status: Starts after Tracks 2+3 converge; owns lesson-source and manifest alignment. Consumes Track 3's audit mapping.*

- [ ] **Track: Teacher Practice Error Analysis**
  *Link: [./tracks/teacher_practice_error_analysis_20260319/](./tracks/teacher_practice_error_analysis_20260319/)*
  *Status: Parallel with Track 8 after Tracks 2+3; owns misconception-tag population logic and cross-submission aggregation. Does not depend on Track 8.*

## Archive Ledger

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
