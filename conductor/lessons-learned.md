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

### Patterns Worth Repeating

- (2026-03-11, replan) A non-destructive archive snapshot is safer than trying to patch stale planning docs in place.
- (2026-03-11, replan) A narrow phase-1 scope of student study plus teacher monitoring keeps the platform coherent while the curriculum is still being fully implemented.
- (2026-03-12, curriculum_runtime_foundation) Source-level guard tests are effective for catching stale runtime surfaces such as debug routes, legacy admin pages, and missing deployment scaffolding.
