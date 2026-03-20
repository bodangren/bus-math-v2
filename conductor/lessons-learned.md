## Lessons Learned

> Keep this file at or below **50 lines**. It is curated working memory, not a log.

### Architecture and Planning

- (2026-03-11, replan) Convex must remain the only runtime source of truth or product, monitoring, and curriculum delivery drift immediately.
- (2026-03-11, replan) Published lesson version helpers are foundational; student delivery and teacher monitoring must share them rather than recomputing progress independently.
- (2026-03-11, replan) Student write routes need explicit student-role request guards even when teacher preview paths exist elsewhere.
- (2026-03-11, replan) Curriculum planning and runtime implementation drift unless lesson archetypes are declared explicitly and reused across docs, seeds, and UI shells.
### Recurring Gotchas

- (2026-03-11, replan) “Full curriculum” claims are misleading unless the seeded and published runtime content actually matches the planned curriculum count.
- (2026-03-11, replan) Activity and standards contracts drift quickly when validators and Convex lookups use different identifiers.
- (2026-03-12, curriculum_runtime_foundation) Public prerendered pages must tolerate empty Convex results so a clean production build does not depend on seeded local data.
- (2026-03-12, curriculum_runtime_foundation) Migration-era Supabase and seed utilities can still break the production TypeScript graph even after the active runtime has moved to Convex.
- (2026-03-13, curriculum_authoring_publish_pipeline) Legacy authored lesson modules can block Convex/server bundling unless they are converted into a pure generated source module first.
- (2026-03-13, teacher_monitoring_core) Public prerendered pages need `Promise.allSettled`-style fallbacks around Convex reads or production builds will fail whenever local Convex is unavailable during static generation.
- (2026-03-13, unit1_canonicalization_archetypes) Canonicalizing authored curriculum at the source is safer than accumulating manifest exceptions because both validation drift and role-specific rendering bugs disappear together.
- (2026-03-13, auth bootstrap hotfix) JWT-protected proxy rules must explicitly allow unauthenticated auth bootstrap endpoints like `/api/auth/login` and `/api/auth/session`, or the login page will redirect its own API calls back to itself.
- (2026-03-14, curriculum_rollout_wave2) Later-unit project lessons regress back to generic placeholders unless Lesson 7-11 dataset, workbook, polish, and presentation obligations are asserted directly in manifest regression tests.
- (2026-03-14, capstone_textbook_completion) Capstone regressions hide in shared unit-oriented components unless the distinct segment label is asserted from the public card layer through student headers and teacher planning views.
- (2026-03-16, cloudflare_production_hardening_launch) Cloudflare launch assumptions drift unless the Worker handoff, required secrets, and build-first Wrangler sequence live in a checked-in checklist backed by source-level tests.
- (2026-03-19, practice_contract_planning) Practice components need one mode-aware contract across worked example, guided practice, independent practice, and assessment or curriculum authoring, persistence, and teacher evidence drift immediately.
- (2026-03-19, practice_contract_planning) Teacher review is only as useful as the stored submission envelope; score-only or spreadsheet-only evidence hides misconceptions and blocks later AI-assisted analysis.
- (2026-03-19, practice_track_deconfliction) When the practice rollout is split into contract, evidence, and backfill tracks, older curriculum/teacher umbrella tracks must be narrowed to residual authored rollout and interpretation work instead of owning the same deliverables twice.
- (2026-03-19, practice_contract_planning) A dedicated Convex validator for the shared `practice.v1` envelope keeps persistence, schema typing, and API mutations aligned without reintroducing `v.any()`.
- (2026-03-19, practice_contract_planning) Teacher evidence UIs should stay read-only and union-typed from the start so spreadsheet and non-spreadsheet branches are both exercised by build-time type checking.
- (2026-03-19, practice_component_legacy_backfill) Phase-1 backfill planning should be driven by generated curriculum and seed tests, not by registry shape alone, because the authored lessons reveal which practice families are actually on the student path; structured-response families are the safest first migration wave, while spreadsheet and simulation-backed families need their own pass because they carry artifact and storage assumptions that do not generalize cleanly.
- (2026-03-20, practice_component_legacy_backfill) Practice families should emit the canonical `practice.v1` envelope at the component boundary, especially for spreadsheet and simulation-backed activities, so the renderer only preserves compatibility and phase completion, not submission shape translation.
- (2026-03-20, practice_component_legacy_backfill) Once the last live practice family is canonical, remove alias resolution and direct-completion shims together so docs, validation, and renderer behavior stay aligned on one contract.
- (2026-03-20, practice_component_legacy_backfill) Legacy accounting-entry builders backfill cleanly when the student workbench keeps the account bank as an assistive input path and packages the submitted row snapshot directly into the practice artifact.
- (2026-03-20, practice_component_legacy_backfill) Categorization and sequence practice families need separate serializers; inventory-style ordering does not share the same item shape as bucket-based drag/drop.
- (2026-03-20, practice_component_legacy_backfill) Build-time type checks are useful for catching stale artifact metadata early, and they also catch registry typing issues; keep public string lookups and internal map keys aligned, and only serialize fields the source item actually owns.
- (2026-03-20, practice_component_legacy_backfill) Keyboard-move fallback should live inside the shared categorization surface so teacher review annotations, keyboard controls, and drag/drop state stay synchronized.
- (2026-03-20, normal_balance_family) Build-time type checks can catch readonly ontology union narrowing issues early; reuse existing helpers like `isContra` instead of probing optional fields directly in generator filters.
- (2026-03-20, adjustment_effects_family) Omission/consequence matrices work best when the scenario preamble is shown above the grid and the matrix auto-advances one row at a time; the prompt needs the classroom context before the choices.
### Patterns Worth Repeating

- (2026-03-12, curriculum_runtime_foundation) Source-level guard tests are effective for catching stale runtime surfaces such as debug routes, legacy admin pages, and missing deployment scaffolding.
- (2026-03-13, curriculum_authoring_publish_pipeline) Source-level generator plus manifest tests are a practical bridge when authored curriculum exists in legacy files but the runtime must import a pure Convex-safe module.
- (2026-03-13, student_study_runtime) Completed lessons should reopen on their final published phase and use the dashboard-derived next-lesson recommendation, or the student loop drifts between dashboard and lesson routes.
- (2026-03-13, teacher_monitoring_core) A pure lesson-monitoring mapper plus page-route tests is a safe way to add teacher drill-down routes without coupling server pages directly to legacy lesson-plan component internals.
- (2026-03-13, unit1_canonicalization_archetypes) A shared published-lesson presentation helper is the right seam for keeping student and teacher lesson views aligned while still letting each surface add role-specific chrome.
- (2026-03-13, curriculum_rollout_wave1) Lesson-planning matrices are a workable source for authored rollout waves when they are converted into canonical lesson blueprints and validated through manifest regression tests before runtime wiring.
- (2026-03-13, unit1_redesign_lesson_contract) Old infrastructure tests should validate canonical phase numbers and contract outcomes rather than stale phase labels, or redesign tracks will appear broken even when the authored curriculum and published runtime agree.
- (2026-03-14, curriculum_rollout_wave2) Unit-level authored blueprint modules are a practical way to scale later curriculum waves because they keep matrix detail, contract resources, and published lesson text aligned without reintroducing runtime-only generators.
- (2026-03-14, capstone_textbook_completion) A shared curriculum-segment label helper is the simplest way to keep capstone naming coherent across public, student, and teacher flows without creating capstone-only storage or route forks.
- (2026-03-19, practice_contract_planning) When active architecture docs are testable contract surfaces, keep the live copy under `conductor/docs/architecture/` and mirror the runtime checklist links in README/runtime docs so archive cleanup does not strand the active surface; preview slices should reuse the live family generator/solver/grader outputs so guided and teacher states stay synchronized.
- (2026-03-20, classification_conceptual_families) Final verification is easiest when the family registry, preview samples, and plan are already aligned; archive only after lint, full test, and build all pass against the same shared practice contract surface.
