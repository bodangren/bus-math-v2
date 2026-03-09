# Project Tracks

This file is the source of truth for active execution order and archived track history.

---

## Active Execution Queue (progressive order)

- [x] **Track: Assessment Regression Hotfix**
  *Link: [./conductor/tracks/assessment_regression_hotfix_20260221/](./conductor/tracks/assessment_regression_hotfix_20260221/)*

- [x] **Track: Unit 1 Curriculum Content — Balance by Design**
  *Link: [./conductor/tracks/unit1_content_20260218/](./conductor/tracks/unit1_content_20260218/)*

- [x] **Track: Curriculum Quality Standards & Unit 1 Remediation**
  *Link: [./conductor/tracks/curriculum_rigor_20260221/](./conductor/tracks/curriculum_rigor_20260221/)*

## Upcoming / Unplanned

1. Convex Auth Runtime Verification & Closeout
     Goal: prove username/password auth works locally and in the intended deployment model, including internal Convex calls, seeded demo users, session persistence,
     and failure handling.
     Deliverables: smoke-tested login/logout/session flow, seeded local workflow, cleaned-up stale migration notes, archive/supersede old migration track.
  2. Instructional Component Framework
     Goal: define the canonical component contract for pedagogically meaningful lesson blocks.
     Deliverables: phase-2 demonstration components, phase-3 guided-practice components, shared event/attempt/progress schema, and Convex persistence that records
     useful learning data rather than just completion flags.
  3. Spreadsheet Component System
     Goal: ship both noninteractive spreadsheet display and interactive spreadsheet practice components.
     Deliverables: read-only worked-example spreadsheet for phase 2, scaffolded “lead-by-the-nose” spreadsheet for phase 3, validation/grading hooks, attempt
     recording, and teacher-useful telemetry.
  4. Algorithmic Assessment Engine
     Goal: build templated, parameterized accounting questions and grading primitives.
     Deliverables: question template schema, deterministic generator, answer evaluation, retry/versioning rules, and reusable support for phase-5 lesson assessments.
  5. Unit 1 Assessment Assembly
     Goal: use the assessment engine to build lesson-level phase-5 checks and lesson 11 unit assessment.
     Deliverables: standards-aligned question banks, generated variants, recorded outcomes, and reporting-ready data for later teacher/dashboard use.
  6. Unit Component Authoring Pack
     Goal: create the actual pedagogically useful building blocks per unit using the new systems.
     Deliverables: a minimum viable component set for each instruction pattern you expect to reuse across units, with seeded examples and tests.

## Archive Ledger

- [x] **Track: Security Surface Hardening**
  *Link: [./conductor/archive/security_surface_hardening_20260310/](./conductor/archive/security_surface_hardening_20260310/)*
  *Checkpoint: `pending` (2026-03-10 closeout)*

- [x] **Track: Teacher Convex Data Paths**
  *Link: [./conductor/archive/teacher_convex_data_paths_20260309/](./conductor/archive/teacher_convex_data_paths_20260309/)*
  *Checkpoint: `pending` (2026-03-09 closeout)*

- [x] **Track: Dashboard Helper Consolidation & Dev Stack Closeout**
  *Link: [./conductor/archive/dashboard_refactor_dev_stack_20260309/](./conductor/archive/dashboard_refactor_dev_stack_20260309/)*
  *Checkpoint: `pending` (2026-03-09 closeout)*

- [x] **Track: Student Progress Hub & Resume Navigation**
  *Link: [./conductor/archive/student_progress_hub_20260309/](./conductor/archive/student_progress_hub_20260309/)*

- [x] **Track: Account Settings & Self-Service Password Changes**
  *Link: [./conductor/archive/account_settings_password_20260309/](./conductor/archive/account_settings_password_20260309/)*
  *Checkpoint: `e5487cd` (2026-03-09 closeout)*

- [x] **Track: Teacher Intervention Dashboard**
  *Link: [./conductor/archive/teacher_intervention_dashboard_20260309/](./conductor/archive/teacher_intervention_dashboard_20260309/)*
  *Checkpoint: `e195777` (2026-03-09 closeout)*

- [x] **Track: Convex Authorization Hardening & Server Boundary Cleanup**
  *Link: [./conductor/archive/convex_authz_hardening_20260309/](./conductor/archive/convex_authz_hardening_20260309/)*
  *Checkpoint: `2d104a0` (2026-03-09 closeout)*

- [x] **Track: Convex Runtime Parity & Auth Resilience**
  *Link: [./conductor/archive/convex_runtime_auth_cleanup_20260308/](./conductor/archive/convex_runtime_auth_cleanup_20260308/)*
  *Checkpoint: `36fcadb` (2026-03-08 closeout)*

- [x] **Track: Migrate to Vinext and Convex** *(superseded umbrella track)*
  *Link: [./conductor/archive/vinext_convex_migration_20260225/](./conductor/archive/vinext_convex_migration_20260225/)*
  *Closeout: archived on 2026-03-09 after follow-on runtime/auth cleanup tracks absorbed the remaining work.*

- [x] **Track: Component Reorganization & Simulation Placeholders**
  *Link: [./conductor/archive/component_reorganization_20260220/](./conductor/archive/component_reorganization_20260220/)*
  *Checkpoint: `4fd4571` (2026-02-20 closeout)*

- [x] **Track: Establish granular lesson plan infrastructure (one file per lesson) and implement Unit 1 pilot.**
  *Link: [./conductor/archive/lesson_plan_infra_20260219/](./conductor/archive/lesson_plan_infra_20260219/)*
  *Checkpoint: `836d18d` (2026-02-20 closeout)*

- [x] **Track: Sprint 5: Teacher Command Center**
  *Link: [./conductor/archive/sprint5_teacher_cc_20251125/](./conductor/archive/sprint5_teacher_cc_20251125/)*
  *Checkpoint: `77670f4` (2026-02-18 close-out)*

- [x] **Track: Sprint 4: Competency Engine & Lesson Gating**
  *Link: [./conductor/archive/sprint4_competency_20251101/](./conductor/archive/sprint4_competency_20251101/)*
  *Checkpoint: `b801c9c` (2026-02-18 closeout)*

- [x] **Track: Sprint 3: Core Platform Completion (Rebaseline)**
  *Link: [./conductor/archive/sprint3_core_platform_20251111/](./conductor/archive/sprint3_core_platform_20251111/)*
  *Checkpoint: `5722e1e` (2026-02-09 closeout)*

- [x] **Track: Sprint 1: Database Foundation**
  *Link: [./conductor/archive/sprint1_database_20251105/](./conductor/archive/sprint1_database_20251105/)*

- [x] **Track: Sprint 2: V1 Component Migration**
  *Link: [./conductor/archive/sprint2_migration_20251106/](./conductor/archive/sprint2_migration_20251106/)*

- [x] **Track: Sprint 5: Tablet UX & Design Overhaul** *(archived historical branch)*
  *Link: [./conductor/archive/sprint5_ux_tablet_20251202/](./conductor/archive/sprint5_ux_tablet_20251202/)*

- [x] **Track: Sprint 6: Quality & Stability** *(superseded by `arch_refactor_20260206`)*
  *Link: [./conductor/archive/sprint6_quality_20260101/](./conductor/archive/sprint6_quality_20260101/)*

- [x] **Track: Refactor - API Security Hardening**
  *Link: [./conductor/archive/api_security_hardening_20260206/](./conductor/archive/api_security_hardening_20260206/)*

- [x] **Track: Refactor - Database Migration Unification**
  *Link: [./conductor/archive/db_migration_unification_20260206/](./conductor/archive/db_migration_unification_20260206/)*

- [x] **Track: Refactor - Phase Completion Consolidation**
  *Link: [./conductor/archive/phase_completion_consolidation_20260206/](./conductor/archive/phase_completion_consolidation_20260206/)*

- [x] **Track: Architectural Refactor & Stability**
  *Link: [./conductor/archive/arch_refactor_20260206/](./conductor/archive/arch_refactor_20260206/)*
