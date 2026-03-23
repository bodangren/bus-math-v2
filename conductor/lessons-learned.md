## Lessons Learned

> Keep this file at or below **50 lines**. It is curated working memory, not a log.

### Architecture and Planning

- (2026-03-11, replan) Convex must remain the only runtime source of truth, and published lesson version helpers must be shared rather than recomputed, or product, monitoring, and curriculum delivery drift immediately.

### Recurring Gotchas

- (2026-03-11, replan) “Full curriculum” claims and activity/standards contracts are misleading unless seeded runtime content and lookup identifiers match the planned curriculum surface.
- (2026-03-12, curriculum_runtime_foundation) Public prerendered pages must tolerate empty Convex results so a clean production build does not depend on seeded local data.
- (2026-03-12, curriculum_runtime_foundation) Migration-era Supabase and seed utilities can still break the production TypeScript graph even after the active runtime has moved to Convex.
- (2026-03-13, auth bootstrap hotfix) JWT-protected proxy rules must explicitly allow unauthenticated auth bootstrap endpoints like `/api/auth/login` and `/api/auth/session`, or the login page will redirect its own API calls back to itself.
- (2026-03-19, practice_contract_planning) Practice components need one mode-aware contract across worked example, guided practice, independent practice, and assessment or curriculum authoring, persistence, and teacher evidence drift immediately.
- (2026-03-19, practice_track_deconfliction) When the practice rollout is split into contract, evidence, and backfill tracks, older curriculum/teacher umbrella tracks must be narrowed to residual authored rollout and interpretation work instead of owning the same deliverables twice.
- (2026-03-20, practice_component_legacy_backfill) Practice families should emit the canonical `practice.v1` envelope at the component boundary so the renderer only preserves compatibility and phase completion, not submission shape translation.
- (2026-03-21, curriculum_guided_independent_pairing_20260316) Guided and independent practice need separate authored ids once the prompts or artifacts diverge, and the published-manifest regression is the fastest guard against backsliding.
- (2026-03-21, statement_computation_families_20260319) Teacher-review layouts expect a complete feedback record and row-part contracts expect `prompt` on every part, so normalize partial grader output before handing it to shared UI shells.
- (2026-03-21, trial_balance_error_family_20260319) Worksheet-style error-analysis previews are clearer when the scenario brief sits above both guided and teacher states and the row controls advance in a strict `balanced? -> difference -> larger column` order.

### Patterns Worth Repeating

- (2026-03-12, curriculum_runtime_foundation) Source-level guard tests are effective for catching stale runtime surfaces such as debug routes, legacy admin pages, and missing deployment scaffolding.
- (2026-03-13, curriculum_authoring_publish_pipeline) Source-level generator plus manifest tests are a practical bridge when authored curriculum exists in legacy files but the runtime must import a pure Convex-safe module.
- (2026-03-13, unit1_canonicalization_archetypes) A shared published-lesson presentation helper is the right seam for keeping student and teacher lesson views aligned while still letting each surface add role-specific chrome.
- (2026-03-19, practice_contract_planning) When active architecture docs are testable contract surfaces, keep the live copy under `conductor/docs/architecture/` and mirror the runtime checklist links in README/runtime docs so archive cleanup does not strand the active surface; preview slices should reuse the live family generator/solver/grader outputs so guided and teacher states stay synchronized.
- (2026-03-20, classification_conceptual_families) Final verification is easiest when the family registry, preview samples, and plan are already aligned; archive only after lint, full test, and build all pass against the same shared practice contract surface.
- (2026-03-23, practice_engine_stabilization_20260323) Preview copy should expose source facts and prompts, not answer-bearing legacy ids, or the dev surface leaks solved state back into the contract.
- (2026-03-23, practice_engine_stabilization_20260323) Phase 1 closure still needs a repo-wide test pass; keep baseline failures separate from the phase artifact when they are outside the practice-engine slice.
- (2026-03-23, curriculum_guided_independent_pairing_20260316) When an instruction phase reuses a practice family, make the worked example explicit in source and manifest tests so the intro reads as teaching, not hidden submission reuse.
- (2026-03-24, curriculum_guided_independent_pairing_20260316) Later authored units benefit from the same explicit teacher-model callouts as the Unit 1 exemplar; otherwise the manifest can look correct while the lesson prose still feels generic.
