## Tech Debt Registry

> Keep this file at or below **50 lines**. Track only debt that should influence near-term planning.

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-12 | curriculum_runtime_foundation | Runtime curriculum implementation is far behind planning: detailed content is mostly Unit 1 and Convex seed coverage is only Unit 1 Lesson 1 | Critical | Open | Next track should establish the canonical authoring-to-publish pipeline and expand publishable lesson coverage. |
| 2026-03-11 | replan | Signed session cookies remain valid until expiry even if the backing credential is deactivated | Medium | Open | Add revocation-aware validation or a shorter-lived credential strategy later. |
| 2026-03-12 | curriculum_runtime_foundation | Legacy Supabase/Drizzle seed and helper surfaces still remain in migration-era folders even though Convex is canonical for runtime flows | Medium | Open | They no longer drive active product routes, but they still increase maintenance and type-check surface area. |
