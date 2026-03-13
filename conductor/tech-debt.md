## Tech Debt Registry

> Keep this file at or below **50 lines**. Track only debt that should influence near-term planning.

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-13 | curriculum_authoring_publish_pipeline | The canonical manifest now covers all 89 lessons, but Units 2-8 and capstone still rely on generated publish scaffolds rather than textbook-quality authored lesson content | Critical | Open | Follow the rollout and capstone tracks to replace generated shells with fully authored lessons. |
| 2026-03-13 | student_study_runtime | `baseline-browser-mapping` data is stale, so lint/test/build emit repeated warnings during verification | Low | Open | Refresh the pinned dev dependency when dependency changes are explicitly approved. |
| 2026-03-11 | replan | Signed session cookies remain valid until expiry even if the backing credential is deactivated | Medium | Open | Add revocation-aware validation or a shorter-lived credential strategy later. |
| 2026-03-12 | curriculum_runtime_foundation | Legacy Supabase/Drizzle seed and helper surfaces still remain in migration-era folders even though Convex is canonical for runtime flows | Medium | Open | They no longer drive active product routes, but they still increase maintenance and type-check surface area. |
