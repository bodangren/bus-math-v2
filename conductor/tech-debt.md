## Tech Debt Registry

> Keep this file at or below **50 lines**. Track only debt that should influence near-term planning.

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-14 | curriculum_rollout_wave2 | Capstone still relies on a generated publish scaffold even though all eight instructional units are now authored and canonical | Critical | Open | Start the capstone completion track next so the textbook can close the remaining scope gap and teacher monitoring can cover the culminating experience. |
| 2026-03-13 | student_study_runtime | `baseline-browser-mapping` data is stale, so lint/test/build emit repeated warnings during verification | Low | Open | Refresh the pinned dev dependency when dependency changes are explicitly approved. |
| 2026-03-11 | replan | Signed session cookies remain valid until expiry even if the backing credential is deactivated | Medium | Open | Add revocation-aware validation or a shorter-lived credential strategy later. |
| 2026-03-12 | curriculum_runtime_foundation | Legacy Supabase/Drizzle seed and helper surfaces still remain in migration-era folders even though Convex is canonical for runtime flows | Medium | Open | They no longer drive active product routes, but they still increase maintenance and type-check surface area. |
