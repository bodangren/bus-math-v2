## Lessons Learned

> Keep this file at or below **50 lines**. It is curated working memory, not a log.

### Architecture and Planning

- (2026-03-11, replan) Convex must remain the only runtime source of truth or product, monitoring, and curriculum delivery drift immediately.
- (2026-03-11, replan) Published lesson version helpers are foundational; student delivery and teacher monitoring must share them rather than recomputing progress independently.
- (2026-03-11, replan) Student write routes need explicit student-role request guards even when teacher preview paths exist elsewhere.
- (2026-03-11, replan) Curriculum planning and runtime implementation drift unless lesson archetypes are declared explicitly and reused across docs, seeds, and UI shells.
- (2026-03-11, replan) Cloudflare-hosted Vinext should be treated as the production target early so Vercel-only assumptions do not keep leaking back into the repo.

### Recurring Gotchas

- (2026-03-11, replan) Old PRDs and migration-era docs look authoritative unless they are moved entirely out of the active Conductor surface.
- (2026-03-11, replan) “Full curriculum” claims are misleading unless the seeded and published runtime content actually matches the planned curriculum count.
- (2026-03-11, replan) Activity and standards contracts drift quickly when validators and Convex lookups use different identifiers.
- (2026-03-12, curriculum_runtime_foundation) Public prerendered pages must tolerate empty Convex results so a clean production build does not depend on seeded local data.
- (2026-03-12, curriculum_runtime_foundation) Migration-era Supabase and seed utilities can still break the production TypeScript graph even after the active runtime has moved to Convex.
- (2026-03-13, curriculum_authoring_publish_pipeline) Legacy authored lesson modules can block Convex/server bundling unless they are converted into a pure generated source module first.
- (2026-03-13, curriculum_authoring_publish_pipeline) Publish-time normalization is safer than expanding the runtime schema when legacy authored sections still include migration-era block types such as teacher submission.
- (2026-03-13, teacher_monitoring_core) Public prerendered pages need `Promise.allSettled`-style fallbacks around Convex reads or production builds will fail whenever local Convex is unavailable during static generation.

### Patterns Worth Repeating

- (2026-03-11, replan) A non-destructive archive snapshot is safer than trying to patch stale planning docs in place.
- (2026-03-11, replan) A narrow phase-1 scope of student study plus teacher monitoring keeps the platform coherent while the curriculum is still being fully implemented.
- (2026-03-12, curriculum_runtime_foundation) Source-level guard tests are effective for catching stale runtime surfaces such as debug routes, legacy admin pages, and missing deployment scaffolding.
- (2026-03-13, curriculum_authoring_publish_pipeline) Source-level generator plus manifest tests are a practical bridge when authored curriculum exists in legacy files but the runtime must import a pure Convex-safe module.
- (2026-03-13, student_study_runtime) Completed lessons should reopen on their final published phase and use the dashboard-derived next-lesson recommendation, or the student loop drifts between dashboard and lesson routes.
- (2026-03-13, teacher_monitoring_core) A pure lesson-monitoring mapper plus page-route tests is a safe way to add teacher drill-down routes without coupling server pages directly to legacy lesson-plan component internals.
