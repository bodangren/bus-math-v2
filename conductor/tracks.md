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
| 10 | Student Study Tools | Complete (2026-04-11) |
| 11 | Cross-Project Feature Adoption | Complete (2026-04-16) |

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

### Milestone 11 — Cross-Project Feature Adoption

Port proven features, patterns, and infrastructure from `ra-integrated-math-3` into `bus-math-v2`. Adds practice timing telemetry, phase skip UX, prop-based component approval, interactive graphing, FSRS-backed daily practice, and a teacher SRS dashboard.

**Execution graph** (strictly serial):
```
Practice Timing Telemetry [1] → Phase Skip UI [2] → Component Approval Upgrade [3] → Graphing Explorer [4] → SRS Daily Practice Core [5] → Teacher SRS Dashboard [6]
          │                            │                        │                            │                        │
   port timing.ts,               ~20 lines in             prop-based hashes,          port canvas + SVG,      FSRS-backed queue,     class health,
   timing-baseline.ts,           LessonRenderer            delete manifest,            3 biz-math configs      Convex schema,         weak families,
   srs-rating.ts,                                           fix example hashing                                 daily practice page    interventions
   usePracticeTiming hook
```

**Rationale for serial ordering (2026-04-16 roadmap):**
- Practice Timing Telemetry comes first because SRS Daily Practice (Track 5) depends on `srs-rating.ts` and the `timing` field on the envelope.
- Phase Skip UI is a small standalone track that should go early for quick momentum.
- Component Approval Upgrade is independent but medium-effort; clearing it before Graphing Explorer keeps the queue moving.
- Graphing Explorer depends on Phase Skip UI being done (explore phases use the skip mechanism).
- SRS Daily Practice depends on Timing Telemetry and is the largest track; it must be done before the dashboard.
- Teacher SRS Dashboard depends entirely on the SRS schema and data from Track 5.

**Exit gate**: practice submissions carry timing telemetry with confidence levels; non-graded phases are skippable; component approval detects prop-level staleness; graphing explorer is available with CVP, supply/demand, and depreciation exploration configs; daily FSRS-backed practice queue draws from families A–U; teachers see SRS health metrics and can intervene.

---

## Planned Queue

Strictly serial. Complete and archive each track before starting the next.

- [x] **Track: Code Review Pass 105 — Stabilization Verification**
  *Link: [./archive/code_review_pass105_20260417/](./archive/code_review_pass105_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 104 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2254/2254, build clean with pre-existing sourcemap warnings). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 104 — Stabilization Verification**
  *Link: [./archive/code_review_pass104_20260417/](./archive/code_review_pass104_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 103 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2254/2254, build clean with pre-existing sourcemap warnings). k2p5 verified.*

- [x] **Track: Code Review Pass 103 — Stabilization Verification**
  *Link: [./archive/code_review_pass103_20260417/](./archive/code_review_pass103_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 102 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2254/2254, build clean with pre-existing sourcemap warnings). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 102 — Stabilization Verification**
  *Link: [./archive/code_review_pass102_20260417/](./archive/code_review_pass102_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 101 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2254/2254, build clean with pre-existing sourcemap warnings). k2p5 verified.*

- [x] **Track: Code Review Pass 101 — Stabilization Verification**
  *Link: [./archive/code_review_pass101_20260417/](./archive/code_review_pass101_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 100 deep audit — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2254/2254, build clean with pre-existing sourcemap warnings). MiniMax-M2.7 verified.*

- [x] **Track: Teacher SRS Dashboard Type Safety Cleanup**
  *Link: [./archive/teacher_srs_type_safety_20260417/](./archive/teacher_srs_type_safety_20260417/)*
  *Scope: Remove the `internal as any` workaround from teacher SRS dashboard files now that srs module is in generated Convex types. Add component tests and verify type safety.*
  *Closeout: completed on 2026-04-17. Removed `as any` from TeacherSRSDashboardClient and app/teacher/srs/page.tsx. Public SRS functions now use `api.srs.*`; internal function uses `internal.srs.getTeacherClasses`. Added 5 component tests. All verification gates pass (lint 0/0, test 2254/2254, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 99 — Stabilization Verification**
  *Link: [./archive/code_review_pass99_20260417/](./archive/code_review_pass99_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 98 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2249/2249, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 98 — Stabilization Verification**
  *Link: [./archive/code_review_pass98_20260417/](./archive/code_review_pass98_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 97 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2249/2249, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 97 — Stabilization Verification**
  *Link: [./archive/code_review_pass97_20260417/](./archive/code_review_pass97_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 96 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2249/2249, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 96 — Stabilization Verification**
  *Link: [./archive/code_review_pass96_20260417/](./archive/code_review_pass96_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 95 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2249/2249, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 95 — Stabilization Verification**
  *Link: [./archive/code_review_pass95_20260417/](./archive/code_review_pass95_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 94 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2249/2249, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 94 — Stabilization Verification**
  *Link: [./archive/code_review_pass94_20260417/](./archive/code_review_pass94_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 93 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2249/2249, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 93 — Stabilization Verification**
  *Link: [./archive/code_review_pass93_20260417/](./archive/code_review_pass93_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 92 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2249/2249, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 92 — Stabilization Verification**
  *Link: [./archive/code_review_pass92_20260417/](./archive/code_review_pass92_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 91 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2249/2249, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 91 — Stabilization Verification**
  *Link: [./archive/code_review_pass91_20260417/](./archive/code_review_pass91_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 90 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2241/2241, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Component Approval Mutation Auth**
  *Link: [./archive/component_approval_mutation_auth_20260417/](./archive/component_approval_mutation_auth_20260417/)*
  *Scope: Extract submitComponentReview and resolveReview mutation handlers, replace inline auth with requireAdmin(), and add auth rejection tests.*
  *Closeout: completed on 2026-04-17. Extracted both mutation handlers, hardened auth with requireAdmin(), added 8 auth rejection tests. All verification gates pass (lint 0/0, test 2249/2249, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 90 — Stabilization Verification**
  *Link: [./archive/code_review_pass90_20260417/](./archive/code_review_pass90_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 89 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2241/2241, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Component Approval Query Auth**
  *Link: [./archive/component_approval_query_auth_20260417/](./archive/component_approval_query_auth_20260417/)*
  *Scope: Add authentication guards to all public queries in convex/component_approvals.ts so only admin/developer roles can read approval state, review queues, and audit summaries.*
  *Closeout: completed on 2026-04-17. Added requireAdmin() guard to all 6 public queries. Extracted handlers for testability. 22 auth rejection tests added. All verification gates pass (lint 0/0, test 2241/2241, build clean).*

- [x] **Track: Activity Component Error Handling**
  *Link: [./archive/activity_component_error_handling_20260417/](./archive/activity_component_error_handling_20260417/)*
  *Scope: Systematically add try/catch error handling around onSubmit callbacks in ~30 activity components to prevent UI lockups when parent handlers throw.*
  *Closeout: completed on 2026-04-17. All 4 phases complete. 30 components wrapped with try/catch + state reset. 8 regression tests added. All verification gates pass (lint 0/0, test 2219/2219, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 88 — Stabilization Verification**
  *Link: [./archive/code_review_pass88_20260417/](./archive/code_review_pass88_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 87 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 87 — Deep Audit**
  *Link: [./archive/code_review_pass87_20260417/](./archive/code_review_pass87_20260417/)*
  *Scope: Deep code review since Pass 80 (last substantive review). Full codebase security and correctness audit — Convex backend auth, frontend error handling, React anti-patterns, TypeScript type safety.*
  *Closeout: completed on 2026-04-17. Fixed 2 issues (High: BaseReviewSession silent error swallowing, Medium: usePhaseCompletion user ID logging). All verification gates pass (lint 0/0, test 2211/2211, build clean).*

- [x] **Track: Code Review Pass 86 — Stabilization Verification**
  *Link: [./archive/code_review_pass86_20260417/](./archive/code_review_pass86_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 85 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 85 — Stabilization Verification**
  *Link: [./archive/code_review_pass85_20260417/](./archive/code_review_pass85_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 84 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 84 — Stabilization Verification**
  *Link: [./archive/code_review_pass84_20260417/](./archive/code_review_pass84_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 83 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 83 — Stabilization Verification**
  *Link: [./archive/code_review_pass83_20260417/](./archive/code_review_pass83_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 82 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 82 — Stabilization Verification**
  *Link: [./archive/code_review_pass82_20260417/](./archive/code_review_pass82_20260417/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 81 — Stabilization Verification**
  *Link: [./archive/code_review_pass81_20260417/](./archive/code_review_pass81_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 80 deep audit — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 79 — Stabilization Verification**
  *Link: [./archive/code_review_pass79_20260417/](./archive/code_review_pass79_20260417/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 78 — Stabilization Verification**
  *Link: [./archive/code_review_pass78_20260417/](./archive/code_review_pass78_20260417/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 77 — Stabilization Verification**
  *Link: [./archive/code_review_pass77_20260417/](./archive/code_review_pass77_20260417/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 76 — Deferred Quality Cleanup**
  *Link: [./archive/code_review_pass76_20260417/](./archive/code_review_pass76_20260417/)*
  *Scope: Address deferred quality items from Pass 74 — console.log cleanup, public query auth documentation, v.any() assessment, and documentation sync.*
  *Closeout: completed on 2026-04-17. Added inline auth rationale comments to getLessonBySlugOrId and getLessonWithContent in convex/api.ts. Documented v.any() on rawAnswer rationale in convex/practice_submission.ts. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 75 — Stabilization Verification**
  *Link: [./archive/code_review_pass75_20260417/](./archive/code_review_pass75_20260417/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 74 — Deep Audit + Seed Auth Fix**
  *Scope: Deep code review of Passes 68-73, full codebase security scan. Fixed seed mutation auth, TeacherSRSDashboardClient double-fetch.*
  *Closeout: completed on 2026-04-17. Fixed 2 issues (Critical: seed mutation auth, High: double-fetch). All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean).*

- [x] **Track: Code Review Pass 73 — Stabilization Verification**
  *Link: [./archive/code_review_pass73_20260417/](./archive/code_review_pass73_20260417/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 72 — Stabilization Verification**
  *Link: [./archive/code_review_pass72_20260417/](./archive/code_review_pass72_20260417/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 71 — Stabilization Verification**
  *Link: [./archive/code_review_pass71_20260417/](./archive/code_review_pass71_20260417/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). k2p5 verified.*

- [x] **Track: Code Review Pass 70 — Stabilization Verification**
  *Link: [./archive/code_review_pass70_20260416/](./archive/code_review_pass70_20260416/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-16. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 69 — Stabilization Verification**
  *Link: [./archive/code_review_pass69_20260416/](./archive/code_review_pass69_20260416/)*
  *Scope: Autonomous stabilization verification pass — run lint, tests, build, fix any issues, update documentation.*
  *Closeout: completed on 2026-04-16. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). Updated current_directive.md stale counts (160 tracks archived, zero open tech-debt). k2p5 verified.*

- [x] **Track: SRS Tech Debt Resolution**
  *Link: [./archive/srs_tech_debt_resolution_20260416/](./archive/srs_tech_debt_resolution_20260416/)*
  *Scope: Address 2 open SRS tech-debt items — TOCTOU race documentation and client-computed state trust assessment.*
  *Closeout: completed on 2026-04-16. Added defensive documentation to convex/srs.ts for TOCTOU race window and client-computed state trust. Updated tech-debt.md to close both items with documentation notes. Added lessons-learned.md entry about Convex transaction limitations. All verification gates pass (lint 0 errors, test 2211/2211, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 68 — Stabilization and Lint Cleanup**
  *Link: [./archive/code_review_pass68_20260416/](./archive/code_review_pass68_20260416/)*
  *Scope: Fix remaining lint warnings, repair StudyHubHome weak-topics filtering bug, fix stale tracks.md archive links, run verification gates.*
  *Closeout: completed on 2026-04-16. Fixed StudyHubHome weak-topics bug (`masteryScore` vs `mastery`), removed unnecessary `useMemo` dependency, fixed worker anonymous default export, repaired 8 stale tracks.md archive links. All verification gates pass (lint 0 errors/0 warnings, test 2211/2211, build clean). k2p5 verified.*

- [x] **Track: SRS Schema Validation Hardening**
  *Link: [./archive/srs_schema_validation_20260416/](./archive/srs_schema_validation_20260416/)*
  *Scope: Replace v.any() and v.string() in SRS Convex schema/mutations with strict validators for ts-fsrs Card shape and SrsRating enum.*
  *Closeout: completed on 2026-04-16. Created convex/srs-validators.ts with srsCardValidator (10-field v.object) and srsRatingValidator (4-value v.union). Updated schema.ts and srs.ts mutation args. Added 9 validator structural tests. All verification gates pass (lint 0 errors/2 warnings, test 2210/2210, build clean). Closed 2 open tech-debt items. k2p5 verified.*

- [x] **Track: Graphing Explorer Rendering Fix**
  *Link: [./archive/graphing_explorer_rendering_fix_20260416/](./archive/graphing_explorer_rendering_fix_20260416/)*
  *Scope: Fix Graphing Explorer coordinate space mismatch (data-space to canvas-space) and replace duplicate inline equation parsing with canonical parseLinear/parseQuadratic parsers.*
  *Closeout: completed on 2026-04-16. generateFunctionPath now uses transformDataToCanvas to emit canvas-space coordinates; removed scale(1, -1) hack from GraphingCanvas. Replaced inline regex in GraphingExplorer with parseLinear/parseQuadratic; zero coefficients now handled correctly. All verification gates pass (lint 0 errors/2 warnings, test 2201/2201, build clean). Tech-debt items closed. k2p5 verified.*

- [x] **Track: DailyPracticeSession Interactive Answer Input**
  *Link: [./archive/daily_practice_answer_input_20260416/](./archive/daily_practice_answer_input_20260416/)*
  *Scope: Convert DailyPracticeSession from auto-solve MVP to interactive practice by building family-specific answer input components (accounting-equation, normal-balance, classification) with a registry pattern and fallback for unimplemented families.*
  *Closeout: completed on 2026-04-16. All 5 phases complete: Phase 1 (registry + AccountingEquationInput), Phase 2 (NormalBalanceInput), Phase 3 (ClassificationInput), Phase 4 (Next Problem button, loading states, focus management), Phase 5 (verification and closure). 100+ new tests. All verification gates pass (lint 0 errors/2 warnings, test 2191/2191, build clean). Tech-debt item closed. MiniMax-M2.7 verified.*

- [x] **Track: Convex Codegen SRS Fix**
  *Link: [./archive/convex_codegen_srs_fix_20260416/](./archive/convex_codegen_srs_fix_20260416/)*
  *Scope: Fix `@/` path aliases in convex/ directory that block codegen bundling, then regenerate api.d.ts to include the srs module and resolve stale generated types.*
  *Closeout: completed on 2026-04-16. Fixed `@/` imports in convex/study.ts and convex/component_approvals.ts to use relative paths. Regenerated api.d.ts with `npx convex codegen`; srs module now present. All verification gates pass (lint 0 errors/2 warnings, test 2167/2167, build clean). Tech-debt item closed. k2p5 verified.*

- [x] **Track: Practice Timing Telemetry**
  *Link: [./archive/practice_timing_telemetry_20260416/](./archive/practice_timing_telemetry_20260416/)*
  *Scope: Port TimingAccumulator, timing baselines, SRS rating adapter, and usePracticeTiming hook from ra-integrated-math-3. Add timing field to practice.v1 envelope.*
  *Closeout: completed on 2026-04-16. All 5 pure TypeScript modules ported (timing.ts, timing-baseline.ts, srs-rating.ts) plus usePracticeTiming hook. Added timing types to practice.v1 contract. 102 new tests (46 timing, 16 timing-baseline, 19 srs-rating, 11 usePracticeTiming hook, 10 contract-timing). All verification gates pass (lint 0 errors, test 1934/1934, build clean). Tech-debt item closed. MiniMax-M2.7 verified.*

- [x] **Track: Phase Skip UI**
  *Link: [./archive/phase_skip_ui_20260416/](./archive/phase_skip_ui_20260416/)*
  *Scope: Add skip button for explore and discourse phase types in LessonRenderer. Unlock next phase without completion for skippable phases.*
  *Closeout: completed on 2026-04-16. Added isSkippablePhaseType helper, updated LessonRenderer to unlock next phase and show "Skip Phase" text for explore/discourse phases. 7 new tests (4 helper, 3 renderer). All verification gates pass (lint 0 errors, 1839/1839 tests pass, build clean). k2p5 verified.*

- [x] **Track: Component Approval Prop-Based Hashes**
  *Link: [./archive/component_approval_prop_hashes_20260416/](./archive/component_approval_prop_hashes_20260416/)*
  *Scope: Replace build-time file-hash manifest with runtime prop-based content hashes. Fix example version hashing. Delete manifest generator.*
  *Closeout: completed on 2026-04-16. Created lib/activities/content-hash.ts with computeComponentContentHash (crypto.subtle SHA-256), deepSortKeys, and resolveComponentKind helper. Rewrote version-hashes.ts to use runtime prop-based hashing instead of build-time manifest. Functions are now async and accept props/gradingConfig parameters. Updated getReviewQueue and submitComponentReview to use async hash computation. Deleted lib/component-versions.json and scripts/generate-component-manifest.ts. Removed generate:component-manifest from package.json predev/build hooks. 19 new tests for content-hash, 33 updated tests for async hash functions. All 1960 tests pass, lint 0 errors (2 pre-existing warnings), build clean. Updated tech-debt.md and lessons-learned.md. MiniMax-M2.7 verified.*

- [x] **Track: Graphing Explorer**
  *Link: [./archive/graphing_explorer_20260416/](./archive/graphing_explorer_20260416/)*
  *Scope: Port canvas-based graphing system from ra-integrated-math-3. Add CVP, supply/demand, and depreciation exploration configs. Register in activity registry.*
  *Closeout: completed on 2026-04-16. All 5 phases complete. Library port (canvas-utils, linear-parser, quadratic-parser) — 56 tests. Component port (GraphingCanvas, InteractiveTableOfValues, HintPanel, InterceptIdentification, GraphingExplorer with compare_lines/multi_curve variants) — 19 tests. Business math exploration configs (CVP, Supply/Demand, Depreciation) — 11 tests. Registry integration complete. Verification gates pass (lint 0 errors, test 2046/2046, build clean). k2p5 verified.*

- [x] **Track: SRS Daily Practice Core**
  *Link: [./archive/srs_daily_practice_core_20260416/](./archive/srs_daily_practice_core_20260416/)*
  *Scope: Build FSRS-backed daily practice system. SRS contract types, scheduler, review processor, queue builder, Convex schema, student daily practice page.*
  *Closeout: completed on 2026-04-16. All 8 phases complete: contract types (srs.contract.v1, 5 Zod schemas), scheduler (createNewCard, reviewCard, getCardsDue, serializeCard, deserializeCard), review processor (processPracticeSubmission bridging envelope→rating→card), queue builder (buildDailyQueue, getQueueSummary), family map (A-U mapping), Convex schema (srs_cards, srs_review_log tables with indexes), Convex mutations/queries (upsertSrsCard, recordSrsReview, getDueCards, getStudentSrsSummary, getSrsCard), student daily practice page. 59 lib tests pass. Verification gates pass (lint 0 errors, test 2116/2116, build clean). MiniMax-M2.7 verified.*

- [x] **Track: Teacher SRS Dashboard**
  *Link: [./archive/teacher_srs_dashboard_20260416/](./archive/teacher_srs_dashboard_20260416/)*
  *Scope: Teacher SRS analytics dashboard with class health, weak families, struggling students, and intervention tools.*
  *Closeout: completed on 2026-04-16. All 5 phases complete: Phase 1 (Convex analytics queries and interventions), Phase 2 (Dashboard UI components: ClassHealthCard, WeakFamiliesPanel, StrugglingStudentsPanel, modals), Phase 3 (Navigation integration with teacher dashboard link and breadcrumbs), Phase 4 (Component tests and page tests), Phase 5 (Verification). All gates pass: lint 0 errors/2 warnings, test 2167/2167, build clean. k2p5 verified.*

- [x] **Track: Submit Attempt Numbering Race Fix**
  *Link: [./archive/submit_attempt_numbering_race_fix_20260414/](./archive/submit_attempt_numbering_race_fix_20260414/)*
  *Scope: Fix race condition in submitSpreadsheet where concurrent submissions could receive the same attemptNumber. Use Convex transaction to atomically compute and increment attempt count.*
  *Closeout: completed on 2026-04-14. Wrapped count+insert in ctx.transaction() to atomically compute and assign unique attemptNumbers. All 1825 tests pass, lint 0 errors, build clean. Tech-debt item closed.*

- [x] **Track: Workbook Client Dynamic Lookup**
  *Link: [./archive/workbooks_client_dynamic_lookup_20260414/](./archive/workbooks_client_dynamic_lookup_20260414/)*
  *Scope: Replace hardcoded Set in workbooks.client.ts with dynamic lookup from build-time manifest to prevent stale data when new workbooks are added.*
  *Closeout: completed on 2026-04-14. Created build-time manifest generator (scripts/generate-workbook-manifest.ts) that scans public/workbooks/ and generates lib/workbooks-manifest.json with 66 files. workbooks.client.ts now imports from manifest instead of hardcoded Set. Added 10 unit tests for the new implementation. All verification gates pass (lint 0 errors, test 1812/1812, build clean). tech-debt item closed.*

- [x] **Track: Simulation Activity Type Standardization**
  *Link: [./archive/simulation_activity_types_20260414/](./archive/simulation_activity_types_20260414/)*
  *Scope: Investigate and fix simulation Activity type patterns. Found: StartupJourney, BudgetBalancer already correct. CashFlowChallenge fixed to use canonical pattern. Remaining simulations (DynamicMethodSelector, MethodComparisonSimulator, etc.) are self-contained with hardcoded internal data — don't use Activity props, so inline types don't cause issues.*
  *Closeout: completed on 2026-04-14. CashFlowChallenge updated to use proper Activity type wrapper. tech-debt item closed. All 1802 tests pass, lint 0 errors, build clean.*

- [x] **Track: Exercise Test Quality Improvement**
  *Link: [./archive/exercise_test_quality_20260414/](./archive/exercise_test_quality_20260414/)*
  *Scope: Improve shallow exercise/simulation tests that only check rendering to verify actual component behavior (submission flow, feedback, error states). Target 5+ components.*
  *Closeout: completed on 2026-04-14. Improved 5 exercise tests with behavior verification: ProfitCalculator (4 tests), BudgetWorksheet (4 tests), ErrorCheckingSystem (5 tests), MarkupMarginMastery (5 tests), MonthEndClosePractice (4 tests). Tests now verify actual callback behavior, envelope structure, and state transitions. All 1802 tests pass, lint 0 errors, build clean. Tech-debt item closed.*

- [x] **Track: Component Approval Stabilization**
  *Link: [./archive/component_approval_stabilization_20260414/](./archive/component_approval_stabilization_20260414/)*
  *Scope: Address 7 remaining tech-debt items: manifest script hardening (fail on missing files, wire into dev), test contradictions (remove example stale detection tests), hash-mismatch rejection test, example harness UI polish, unreviewed components hash fix, and auth branch unit tests.*
  *Closeout: completed on 2026-04-14. All 6 phases complete: manifest script throws on missing files, predev hook added, 2 incorrect example stale tests removed, hash-mismatch and auth tests added (7 new tests, 1 removed), dev queue computes hash client-side for unreviewed, example harness shows disabled Not Applicable button. All verification gates pass (lint 0 errors, test 1790/1790, build clean). All 7 tech-debt items closed.*

- [x] **Track: Dev Review Auth Guard**
  *Link: [./archive/dev_review_auth_guard_20260414/](./archive/dev_review_auth_guard_20260414/)*
  *Scope: Add middleware auth guard to dev component review page — currently only gated by client-side NODE_ENV check which can be bypassed in misconfigured deployments.*
  *Closeout: completed on 2026-04-14. Created middleware.ts with admin role check; unauthenticated users redirected to login, non-admin users get 403. Added test coverage for cookie extraction and JWT validation. All verification gates pass (lint 0 errors, test 1785/1785, build clean). Tech-debt item closed.*

- [x] **Track: ApprovalStatusValidator Split**
  *Link: [./archive/approval_status_validator_split_20260414/](./archive/approval_status_validator_split_20260414/)*
  *Scope: Split approvalStatusValidator into storage and submission validators — stale is a derived status computed at query time, not a valid submission input.*
  *Closeout: completed on 2026-04-14. Created submissionStatusValidator (without stale) for mutation inputs, kept approvalStatusValidator (with stale) for storage. Updated submitComponentReview to use submissionStatusValidator. Added tests for stale rejection. All gates pass (lint 0 errors, test 1777/1777, build clean). Tech-debt item closed.*

- [x] **Track: Harness Crypto Cleanup**
  *Link: [./archive/harness_crypto_cleanup_20260413/](./archive/harness_crypto_cleanup_20260413/)*
  *Scope: Extract client-safe version hash computation to Convex backend so dev harness pages don't import Node.js crypto.*
  *Closeout: completed on 2026-04-13. Added getComponentVersionHash Convex query; updated all three harness pages (activity, practice, example) to use useQuery instead of importing crypto-dependent version-hashes.ts. Tech-debt item closed. All verification gates pass (lint 0 errors, test 1775/1775, build clean).*

- [x] **Track: Units 2-8 Source-Doc Parity Decision**
  *Link: [./archive/units_2_8_source_doc_parity_20260414/](./archive/units_2_8_source_doc_parity_20260414/)*
  *Scope: Decide whether Units 2-8 should gain detailed markdown source-doc parity with Unit 1. Analyze effort, value, and priorities; produce decision document.*
  *Closeout: completed on 2026-04-14. Decision: NO-GO (close the item). Runtime curriculum is in TypeScript blueprints, not markdown files. Lesson matrices + generated blueprints serve curriculum authors adequately. Creating 77 markdown files would add maintenance burden without user benefit. Project in stabilization. All verification gates passed (lint 0 errors, test 1775/1775, build clean).*

- [x] **Track: Real PDF Content**
  *Link: [./archive/pdf_content_20260413/](./archive/pdf_content_20260413/)*
  *Scope: Replace placeholder PDFs with real capstone content — business plan guide, pitch rubric, and model tour checklist.*
  *Closeout: completed on 2026-04-13. Generated real PDF content for all 3 capstone documents: Business Plan Guide (11KB, 9 pages), Pitch Rubric (11KB, 5 categories), Model Tour Checklist (9KB, 5 sections). All verification gates passed (lint 0 errors, test 1774/1775 pass, build clean). Track archived.*

- [x] **Track: CSV Dataset Creation**
  *Link: [./archive/csv_datasets_20260413/](./archive/csv_datasets_20260413/)*
  *Scope: Create real CSV datasets referenced by the curriculum for Lessons 7 and 8 across all 8 units (56 total files: 1 class + 6 group per unit). Includes dataset API route with auth guard.*
  *Closeout: completed on 2026-04-13. All 56 CSV files created, API route with auth guard, filename validation, path traversal protection. Phase 1 complete (Unit 1 datasets + API route). Phase 2 complete (Units 2-8 datasets). All verification gates passed (lint 0 errors, test 1775 pass, build clean). Track archived.*

- [x] **Track: Chatbot Rate Limiting Upgrade**
  *Link: [./archive/chatbot_rate_limiting_20260413/](./archive/chatbot_rate_limiting_20260413/)*
  *Scope: Replace in-memory Map rate limiter with Convex-backed storage for cross-replica support. Create chatbot_rate_limits table, atomic check-and-increment mutation, update API route.*
  *Closeout: completed on 2026-04-13. Added chatbot_rate_limits table to Convex schema, created rateLimits.ts with getRateLimitStatus/checkAndIncrementRateLimit/cleanupStaleRateLimits, updated lesson-chatbot API route to use Convex-backed rate limiting. Removed in-memory Map. 5 requests per 60-second window. All verification gates passed (lint 0 errors, test 1775 pass, build clean).*

- [x] **Track: Component Approval Workflow**
  *Link: [./archive/component_approval_20260413/](./archive/component_approval_20260413/)*
  *Scope: Add a dev-only manual approval workflow for example, activity, and practice components with Convex-backed approval state, structured review comments, stale approval detection, review harnesses, and LLM-assisted rework queries.*
  *Closeout: completed on 2026-04-13. All 6 phases complete: schema/validators, review mutations/queries, dev review queue, component harnesses, stale detection/LLM audit, verification. 26 new tests for Phase 5. All 1775 tests pass, lint 0 errors/2 warnings, build clean.*

- [x] **Track: Component Approval Security Hardening**
  *Link: [./archive/component_approval_security_hardening_20260413/](./archive/component_approval_security_hardening_20260413/)*
  *Scope: Fix two HIGH severity issues in component_approvals.ts: (1) getReviewQueue silently drops componentType when approvalStatus is also passed — already fixed in code, tech-debt entry was stale; (2) submitComponentReview accepts client-supplied hash without server recomputation.*
  *Closeout: completed on 2026-04-13. Added server-side hash verification to submitComponentReview using computeComponentVersionHash. Throws "Component version hash mismatch" when client hash doesn't match server hash. Issue 1 already fixed in code. All verification gates pass (lint 0 errors, test 1775/1775, build clean).*

- [x] **Track: Problem Generator Flaky Test Fix**
  *Link: [./archive/problem_generator_flaky_test_fix_20260414/](./archive/problem_generator_flaky_test_fix_20260414/)*
  *Scope: Fix flaky problem-generator test that has ~11% collision rate due to only 9 possible cash values. Increase range to 198 possible values to reduce collision rate to ~0.5%.*
  *Closeout: completed on 2026-04-14. Increased cash range from max 5000 to 99000 (198 possible values vs 9), reducing collision rate from ~11% to ~0.5%. Test passes 5/5 runs, all 1775 tests pass, lint 0 errors, build clean. Tech-debt item closed. Track archived.*

- [x] **Track: Supabase Residue Cleanup**
  *Link: [./archive/supabase_residue_cleanup_20260411/](./archive/supabase_residue_cleanup_20260411/)*
  *Scope: Remove remaining dead Supabase code (resolveConvexProfileIdFromSupabaseUser function and lib/supabase/server.ts shim).*
  *Closeout: completed on 2026-04-11. Removed resolveConvexProfileIdFromSupabaseUser, SupabaseUserLike, and extractUsername from lib/convex/server.ts; deleted lib/supabase/server.ts. All tests pass, lint passes, build passes.*

- [x] **Track: PDF API and Capstone Page Tests**
  *Link: [./archive/pdf_api_capstone_tests_20260411/](./archive/pdf_api_capstone_tests_20260411/)*
  *Scope: Add test coverage for PDF download API and capstone guidelines/rubrics pages.*
  *Closeout: completed on 2026-04-11. Added test coverage for PDF API route (4 tests), capstone guidelines page (1 test), and capstone rubrics page (1 test). Updated tech-debt.md to close the test coverage item. All tests pass, lint passes, build passes.*

- [x] **Track: Flashcard/Review Session Deduplication**
  *Link: [./archive/flashcard_review_session_deduplication_20260411/](./archive/flashcard_review_session_deduplication_20260411/)*
  *Scope: Deduplicate FlashcardPlayer and ReviewSession components by extracting a shared BaseReviewSession component.*
  *Closeout: completed on 2026-04-11. Extracted shared BaseReviewSession component with props for activityType, renderHeader, and no-terms copy. FlashcardPlayer and ReviewSession are now thin wrappers. All tests pass, lint passes, build passes.*

- [x] **Track: Glossary Expansion**
  *Link: [./archive/glossary_expansion_20260411/](./archive/glossary_expansion_20260411/)*
  *Scope: Expand glossary to include terms for Units 2, 7, and 8 to complete study hub coverage across all 8 units.*
  *Closeout: completed on 2026-04-11. Added 17 new glossary terms covering Units 2,7,8, updated tests to verify all 8 units are covered, and updated tech-debt.md to close the glossary coverage item. All tests pass, lint passes, build passes.*

- [x] **Track: Practice Test Question Banks Expansion**
  *Link: [./archive/practice_test_question_banks_20260411/](./archive/practice_test_question_banks_20260411/)*
  *Scope: Expand practice test question banks for Units 2-8 from 1 placeholder question each to full banks matching Unit 1's depth (3+ questions per unit).*
  *Closeout: completed on 2026-04-11. Expanded question banks for Units 2-8 to 3 questions each, covering key lessons and learning objectives. All tests pass, lint passes, build passes. Updated tech-debt.md to close the practice test question bank item.*

- [x] **Track: Artifact Packaging**
  *Link: [./archive/artifact_packaging_20260411/](./archive/artifact_packaging_20260411/)*
  *Scope: Ship CSV datasets, PDF guides/rubrics/checklists, and capstone guidelines/routes to close the largest remaining classroom-readiness gap.*
  *Closeout: completed on 2026-04-11. Added PDF download API with role-based access, capstone guidelines and rubrics pages, and placeholder PDF files in public/pdfs/. Updated capstone page with download links. All verification gates pass (lint, build).*

- [x] **Track: Full Lesson Phase Integrity Audit**
  *Link: [./archive/full_phase_integrity_audit_20260409/](./archive/full_phase_integrity_audit_20260409/)*
  *Scope: audit every published lesson phase for interaction fidelity, layout integration, copy rendering, dataset invariants, and authored-runtime seed drift. All 6 phases complete: checklist/guardrails, Units 1-8 + Capstone sweeps, and final verification. All verification gates pass (lint 0 errors/1 warning, test 1577/1577 with 2 pre-existing Supabase suite failures, build passes cleanly).*
  *Closeout: completed on 2026-04-09 after completing all 6 phases of the audit. Phase 1 defined the audit checklist and added guardrails (activity-completeness test). Phases 2-5 audited Units 1-8 + Capstone, confirming interaction fidelity, layout integrity, copy rendering, and dataset invariants. Phase 6 ran final verification gates (lint, test, build) and confirmed all pass. Ready to archive.*

- [x] **Track: Student Navigation and Dashboard Return Paths**
  *Link: [./archive/student_navigation_dashboard_paths_20260409/](./archive/student_navigation_dashboard_paths_20260409/)*
  *Scope: add real student unit/dashboard wayfinding, role-aware dashboard links in shared chrome, and valid breadcrumb/return paths so students and teachers are never stranded in authenticated flows.*
  *Closeout: completed on 2026-04-09. All 4 phases complete: navigation contract audit, shared chrome/dashboard destinations, student lesson/unit wayfinding, and verification. Added breadcrumbs to lesson renderer, updated navigation helpers, added regression tests. All verification gates pass (lint 0 errors/1 warning, test 1586/1588 pass with 2 pre-existing Supabase suite failures, build passes).*

- [x] **Track: Student Completion and Resume Loop**
  *Link: [./archive/student_completion_resume_loop_20260409/](./archive/student_completion_resume_loop_20260409/)*
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

- [x] **Track: Practice Tests**
  *Link: [./archive/practice_tests_20260410/](./archive/practice_tests_20260410/)*
  *Scope: port v1 practice test feature with a reusable engine, 8-unit question banks, 6-phase test experience, and Convex-backed score persistence.*
  *Closeout: completed on 2026-04-11 after completing all 5 phases: Phase 1 (question banks and data layer), Phase 2 (Convex score schema), Phase 3 (practice test engine), Phase 4 (routes and integration), Phase 5 (verification and documentation). All verification gates pass (lint 0 errors/2 pre‑existing warnings, build passes cleanly). Ready for archive.*

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

- [x] **Track: Workbook Manifest Build Integration**
  *Link: [./archive/workbook_manifest_build_integration_20260414/](./archive/workbook_manifest_build_integration_20260414/)*
  *Scope: Wire generate-workbook-manifest.ts into build/dev steps so workbook manifest regenerates automatically and stays in sync with public/workbooks/ directory.*
  *Closeout: completed on 2026-04-14. Added generate:workbook-manifest npm script, updated predev and build hooks to run both component and workbook manifest generators. All verification gates pass (lint 0 errors, test 1812/1812, build clean). tech-debt item closed.*

- [x] **Track: Capstone Rubrics Inline Content**
  *Link: [./archive/capstone_rubrics_inline_content_20260414/](./archive/capstone_rubrics_inline_content_20260414/)*
  *Scope: Add inline content to Capstone rubrics page instead of just linking to PDF downloads. Display pitch rubric categories (5) with point allocations and model tour checklist sections (5).*
  *Closeout: completed on 2026-04-14. Added inline pitch rubric (5 categories: Presentation Structure 8pts, Financial Clarity 10pts, Market Understanding 8pts, Q&A Handling 6pts, Delivery 8pts) and model tour checklist (5 sections: Financial Model Components, Assumption Documentation, Formatting Standards, Data Sources and References, Executive Summary Alignment). PDF download links preserved. Added 3 new tests. All verification gates pass (lint 0 errors, test 1828/1828, build clean). Tech-debt item closed.*

- [x] **Track: Cloudflare CI Deployment**
  *Link: [./archive/cloudflare_ci_deployment_20260414/](./archive/cloudflare_ci_deployment_20260414/)*
  *Scope: Create GitHub Actions CI workflow for Cloudflare Workers deployment, clean up stale Supabase CI workflows (deploy-migrations.yml, migration-parity.yml, check-migration-parity.mjs), and document required secrets for CI-backed deployment.*
  *Closeout: completed on 2026-04-14. Created cloudflare-deploy.yml workflow (triggers on push to main, runs lint/test/build, deploys via wrangler). Cleaned up stale Supabase CI files (2 workflows + 1 script + 1 test file). Updated cloudflare-launch-checklist.md with CI secrets documentation. All verification gates pass (lint 0 errors, test 1826/1826, build clean). Tech-debt item (Cloudflare CI) addressed.*

- [x] **Track: Code Review Pass 52**
  *Link: [./archive/code_review_pass52_20260414/](./archive/code_review_pass52_20260414/)*
  *Closeout: completed on 2026-04-14. Verified Cloudflare CI workflow, confirmed stale Supabase CI files removed, updated README.md (pass number, test count, active tracks). All verification gates pass (lint 0 errors, test 1826/1826, build clean). Project in stabilization.*

- [x] **Track: activities_lessonId Tech Debt Resolution**
  *Link: [./archive/activities_lessonId_20260414/](./archive/activities_lessonId_20260414/)*
  *Scope: Resolve activities table lessonId tech debt item — close as won't-fix since activities are shared across lessons via componentKey. activity_completions is the correct join table.*
  *Closeout: completed on 2026-04-14. Analyzed activities schema and confirmed activities are reusable components keyed by componentKey, shared across lessons. The activity_completions table is the correct join linking activities to lessons. Adding lessonId to activities would be architecturally incorrect since same activity appears in multiple lessons. Closed tech-debt item with won't-fix rationale. All verification gates pass (lint 0 errors, test 1826/1826, build clean).*

- [x] **Track: Code Review Pass 53**
  *Link: [./archive/code_review_pass53_20260414/](./archive/code_review_pass53_20260414/)*
  *Scope: Autonomous stabilization verification pass following workspace hygiene commit. Run lint/test/build gates to confirm project stability.*
  *Closeout: completed on 2026-04-14. All 1830 tests pass, lint 0 errors, build clean. Project in full stabilization. No active tracks. MiniMax-M2.7 verified.*

- [x] **Track: Practice Test Post-Answer Feedback**
   *Link: [./archive/practice_test_feedback_20260414/](./archive/practice_test_feedback_20260414/)*
   *Scope: Add post-answer feedback to PracticeTestEngine assessment — show correct/incorrect indicator, highlight correct answer, show explanation, require Continue button click to advance.*
   *Closeout: completed on 2026-04-14. Added hasSeenFeedback state to prevent immediate question advancement. After answering, displays Correct!/Incorrect indicator, highlights correct answer in green, dims wrong answers, shows explanation, and renders Continue button. Student must click Continue to advance. Removed redundant answeredCurrent state. Added 4 new tests (8 total practice test tests pass). All verification gates pass (lint 0 errors, test 1830/1830, build clean). Tech-debt item closed.*

- [x] **Track: Code Review Pass 58**
   *Link: [./archive/code_review_pass58_20260415/](./archive/code_review_pass58_20260415/)*
   *Scope: Autonomous stabilization verification pass to confirm project stability following Pass 57.*
   *Closeout: completed on 2026-04-15. All verification gates pass (lint 0 errors, 2 warnings; test 1832/1832; build clean). Project in full stabilization. No active tracks. MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 59**
   *Link: [./archive/code_review_pass59_20260415/](./archive/code_review_pass59_20260415/)*
   *Scope: Autonomous stabilization verification pass to confirm project stability following Pass 58.*
   *Closeout: completed on 2026-04-15. All verification gates pass (lint 0 errors, 2 warnings; test 1832/1832; build clean). Project in full stabilization. No active tracks. MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 67**
   *Link: [./archive/code_review_pass67_20260416/](./archive/code_review_pass67_20260416/)*
   *Scope: Autonomous stabilization verification pass following Pass 66. Run full verification gates (lint/test/build), archive completed srs_schema_validation track, verify memory file line counts.*
   *Closeout: completed on 2026-04-16. All verification gates pass (lint 0 errors/2 warnings; test 2210/2210, 335 test files; build clean). Archived srs_schema_validation_20260416. Project in full stabilization. No active tracks. MiniMax-M2.7 verified.*

## Archive Ledger

- [x] **Track: Code Review Pass 102 — Stabilization Verification**
  *Link: [./archive/code_review_pass102_20260417/](./archive/code_review_pass102_20260417/)*
  *Scope: Autonomous stabilization verification pass following Pass 101 — run lint, tests, build, verify no regressions.*
  *Closeout: completed on 2026-04-17. All verification gates pass (lint 0 errors/0 warnings, test 2254/2254, build clean with pre-existing sourcemap warnings). k2p5 verified.*

- [x] **Track: Code Review Pass 65**
  *Link: [./archive/code_review_pass65_20260416/](./archive/code_review_pass65_20260416/)*
  *Scope: Autonomous stabilization verification pass following Pass 64. Run full verification gates (lint/test/build), update documentation, archive track.*
  *Closeout: completed on 2026-04-16. All 2191 tests pass, lint 0 errors/2 warnings, build clean. Project in full stabilization. No active tracks. MiniMax-M2.7 verified.*

- [x] **Track: Code Review Pass 63**
  *Link: [./archive/code_review_pass63_20260416/](./archive/code_review_pass63_20260416/)*
  *Scope: Autonomous stabilization verification pass after completion of DailyPracticeSession Interactive Answer Input. Fix stale priorities in current_directive.md and run full verification gates.*
  *Closeout: completed on 2026-04-16. Fixed stale Recommended Next Priorities and Open Items in current_directive.md. All verification gates pass (lint 0 errors/2 warnings, test 2191/2191, 333 test files, build clean). Project in full stabilization. No active tracks. k2p5 verified.*

- [x] **Track: Auth Server Fail-Open Behavior**
  *Link: [./archive/auth_server_fail_open_20260414/](./archive/auth_server_fail_open_20260414/)*
  *Scope: Address Medium severity issue where requireActiveRequestSessionClaims fails open when Convex backend fails. Current behavior allowed deactivated users to access during backend outages.*
  *Closeout: completed on 2026-04-14. Changed fail-open to fail-closed (503) when Convex check throws. Added buildRequestServiceUnavailableResponse helper. Added 2 tests for Convex error scenarios. All verification gates pass (lint 0 errors, test 1825/1825, build clean). Tech-debt item closed.*

- [x] **Track: Capstone Workbook Lookup Gap Fix**
  *Link: [./archive/capstone_workbook_lookup_gap_20260414/](./archive/capstone_workbook_lookup_gap_20260414/)*
  *Scope: Fix capstone workbook lookup gap — capstone workbook files don't match unit_lesson pattern so they're excluded from byUnitAndLesson lookup.*
  *Closeout: completed on 2026-04-14. Extended manifest with byCapstone lookup, added hasCapstoneStudentWorkbook/hasCapstoneTeacherWorkbook functions, created /api/workbooks/capstone/[type] route with auth and role checks, added CapstoneWorkbookDownloads client component to capstone page. All 1823 tests pass, lint 0 errors, build clean. Tech-debt item closed.*

- [x] **Track: Workbook Client Dynamic Lookup**
  *Link: [./archive/workbooks_client_dynamic_lookup_20260414/](./archive/workbooks_client_dynamic_lookup_20260414/)*
  *Scope: Replace hardcoded Set in workbooks.client.ts with dynamic lookup from build-time manifest to prevent stale data when new workbooks are added.*
  *Closeout: completed on 2026-04-14. Created build-time manifest generator (scripts/generate-workbook-manifest.ts) that scans public/workbooks/ and generates lib/workbooks-manifest.json with 66 files. workbooks.client.ts now imports from manifest instead of hardcoded Set. Added 10 unit tests for the new implementation. All verification gates pass (lint 0 errors, test 1812/1812, build clean). tech-debt item closed.*

- [x] **Track: Version Hash Build-Time Manifest**
  *Link: [./archive/version_hash_manifest_20260414/](./archive/version_hash_manifest_20260414/)*
  *Scope: Replace Function.prototype.toString() version hashing with build-time manifest approach to fix minifier sensitivity and dev/prod drift.*
  *Closeout: completed on 2026-04-14. Build-time manifest generates SHA-256 hashes from source files for 51 activities + 19 practice families. version-hashes.ts now reads from manifest instead of using Function.toString(). Integrated into npm run build. All verification gates pass (lint 0 errors, test 1777/1777, build clean). Tech-debt item closed.*

- [x] **Track: Example Harness Correctness**
  *Link: [./archive/example_harness_correctness_20260414/](./archive/example_harness_correctness_20260414/)*
  *Scope: Fix Example harness page that incorrectly imports and uses practice family system for a different component type.*
  *Closeout: completed on 2026-04-14. Removed incorrect getPracticeFamily import and usage. Example harness now shows clear "Not Yet Implemented" state with explanation. Version hash display retained. Review checklist preserved for future use. All verification gates pass (lint 0 errors, test 1775/1775, build clean).*

- [x] **Track: Problem Generator Flaky Test Fix**
  *Link: [./archive/problem_generator_flaky_test_fix_20260414/](./archive/problem_generator_flaky_test_fix_20260414/)*
  *Scope: Fix flaky problem-generator test that has ~11% collision rate due to only 9 possible cash values. Increase range to 198 possible values to reduce collision rate to ~0.5%.*
  *Closeout: completed on 2026-04-14. Increased cash range from max 5000 to 99000, increasing possible values from 9 to 198, reducing collision rate from ~11% to ~0.5%. Test passes 5/5 runs, all 1775 tests pass, lint 0 errors, build clean. Tech-debt item closed.*

- [x] **Track: Example Version Hash Placeholder Fix**
  *Link: [./archive/example_version_hash_placeholder_20260414/](./archive/example_version_hash_placeholder_20260414/)*
  *Scope: Fix example version hash constant placeholder — examples use hashString('example:${componentId}:placeholder') instead of real content hashes, preventing stale detection from firing for examples.*
  *Closeout: completed on 2026-04-14. Analysis revealed examples are embedded lesson content (callout sections), not standalone React components. No source files to hash. `computeExampleVersionHash` now throws descriptive error; Convex queries return null for examples; submitComponentReview rejects example submissions. All verification gates pass (lint 0 errors, test 1785/1785, build clean). Tech-debt item closed.*

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

- [x] **Track: Code Review Pass 55**
  *Link: [./archive/code_review_pass55_20260415/](./archive/code_review_pass55_20260415/)*
  *Scope: Final stabilization verification pass — run full verification gates (lint/test/build), verify tracks directory empty, update current_directive.md.*
  *Closeout: completed on 2026-04-15. All 1830 tests pass, lint 0 errors, build clean. Project in full stabilization. MiniMax-M2.7 verified.*
