# Project Tracks

This file is the source of truth for active execution order. Archived tracks live in `conductor/archive/`. The milestone-level delivery sequence lives in [./roadmap.md](./roadmap.md).

---

## Active Track

- [ ] **Track: Practice Component Contract Foundation**
  *Link: [./tracks/practice_component_contract_foundation_20260319/](./tracks/practice_component_contract_foundation_20260319/)*
  *Status: Define and implement the canonical `practice.v1` contract across curriculum docs, runtime activity submission payloads, validator/schema seams, and compatibility coverage so later rollout tracks have one stable target.*

## Planned Queue

- [ ] **Track: Practice Submission Evidence and Teacher Review**
  *Link: [./tracks/practice_submission_evidence_teacher_review_20260319/](./tracks/practice_submission_evidence_teacher_review_20260319/)*
  *Status: Persist normalized practice submissions, expose teacher-readable evidence beyond spreadsheets, and add deterministic error-tagging seams for later analysis.*

- [ ] **Track: Practice Component Legacy Backfill**
  *Link: [./tracks/practice_component_legacy_backfill_20260319/](./tracks/practice_component_legacy_backfill_20260319/)*
  *Status: Refactor previously built practice components to emit `practice.v1` inputs/outputs, including worked-example, guided-practice, and independent-practice compatibility where applicable.*

- [ ] **Track: Curriculum Guided/Independent Practice Rollout**
  *Link: [./tracks/curriculum_guided_independent_pairing_20260316/](./tracks/curriculum_guided_independent_pairing_20260316/)*
  *Status: Update authored lessons and published-manifest regression coverage so instruction, guided practice, independent practice, and assessment phases use mode-correct activity definitions with distinct ids, scaffolds, and fresh data.*

- [ ] **Track: Teacher Practice Error Analysis**
  *Link: [./tracks/teacher_practice_error_analysis_20260319/](./tracks/teacher_practice_error_analysis_20260319/)*
  *Status: Layer rule-based and AI-assisted error summaries onto the normalized practice evidence model once teacher review and component backfills are complete.*

## Archive Ledger

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
