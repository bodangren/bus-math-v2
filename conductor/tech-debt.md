## Tech Debt Registry

> Keep this file at or below **50 lines**. Track only debt that should influence near-term planning.

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-11 | replan | Supabase, Drizzle, Vercel, and old Next-era residue still exists in dependencies, docs, test routes, and helper modules | High | Open | Foundation work should remove or quarantine anything that still looks active. |
| 2026-03-11 | replan | Cloudflare Worker deployment baseline is not present in the repo yet (`wrangler` config and worker entry are missing) | High | Open | The active stack says Cloudflare, but the repo is not wired for it yet. |
| 2026-03-11 | replan | Runtime curriculum implementation is far behind planning: detailed content is mostly Unit 1 and Convex seed coverage is only Unit 1 Lesson 1 | Critical | Open | Full rollout requires a canonical authoring-to-publish pipeline. |
| 2026-03-11 | replan | `linkedStandardId` is validated as a UUID in the route layer but read as a competency code in Convex | High | Open | Fix this before expanding assessment and phase telemetry. |
| 2026-03-11 | replan | Signed session cookies remain valid until expiry even if the backing credential is deactivated | Medium | Open | Add revocation-aware validation or a shorter-lived credential strategy later. |
| 2026-03-11 | replan | Legacy Drizzle teacher data modules still exist and can confuse future work even if some routes already moved to Convex | Medium | Open | Remove once the Convex replacements are fully verified. |
