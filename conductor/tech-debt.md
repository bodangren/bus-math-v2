## Tech Debt Registry

> Keep this file at or below **50 lines**. Track only debt that should influence near-term planning.

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-14 | security_audit | 26 vulns found: Rollup (8.8, RCE), tar (8.8, File Overwrite), minimatch (8.7, ReDoS), serialize-javascript (8.1, RCE), next (7.5, DoS), flatted (7.5, DoS), ajv (5.5, ReDoS), esbuild (5.3, CSRF) | High | Open | CRITICAL: Update rollup to v4.59.0+, serialize-javascript to v7.0.3+, and tar to v7.5.11+ immediately. Also requires Next.js v16.1.5+ and flatted v3.4.0+ to resolve DoS risks. |
| 2026-03-19 | practice_contract_planning | `activity_submissions.submissionData` is too generic to preserve part-level answers, artifacts, scaffold usage, or deterministic misconception tags consistently across practice families | Medium | Open | Blocks the shared practice contract and makes later teacher evidence or AI analysis rely on lossy payloads. |
| 2026-03-19 | practice_contract_planning | Teacher submission detail only shows spreadsheet artifacts, leaving non-spreadsheet practice work invisible after submission | Medium | Open | Must be generalized before the practice rollout can claim teacher-readable evidence across the course. |
| 2026-03-16 | cloudflare_production_hardening_launch | Cloudflare launch still depends on manual Wrangler secret setup and deploy execution because no CI-backed Worker deployment workflow exists yet | Medium | Open | The checked-in checklist now documents the exact handoff, but future launch work should automate it once credential ownership is defined. |
| 2026-03-13 | student_study_runtime | `baseline-browser-mapping` data is stale, so lint/test/build emit repeated warnings during verification | Low | Open | Refresh the pinned dev dependency when dependency changes are explicitly approved. |
| 2026-03-11 | replan | Signed session cookies remain valid until expiry even if the backing credential is deactivated | Medium | Open | Add revocation-aware validation or a shorter-lived credential strategy later. |
| 2026-03-12 | curriculum_runtime_foundation | Legacy Supabase/Drizzle seed and helper surfaces still remain in migration-era folders even though Convex is canonical for runtime flows | Medium | Open | They no longer drive active product routes, but they still increase maintenance and type-check surface area. |
