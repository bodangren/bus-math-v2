## Tech Debt Registry

> Keep this file at or below **50 lines**. Track only debt that should influence near-term planning.

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-03-14 | security_audit | 26 vulns found: Rollup (8.8, RCE), tar (8.8, File Overwrite), minimatch (8.7, ReDoS), serialize-javascript (8.1, RCE), next (7.5, DoS), flatted (7.5, DoS), ajv (5.5, ReDoS), esbuild (5.3, CSRF) | High | Open | CRITICAL: Update rollup to v4.59.0+, serialize-javascript to v7.0.3+, and tar to v7.5.11+ immediately. Also requires Next.js v16.1.5+ and flatted v3.4.0+ to resolve DoS risks. |
| 2026-03-21 | statement_completion_preview_shell | Family D guided-plus-review shell likely repeated for remaining statement families unless factored into shared helper | Low | Open | Keep explicit for now; extract if another family needs the same pattern. |
| 2026-03-21 | trial_balance_error_family | Trial Balance Error Analysis uses bespoke worksheet-card preview shell | Low | Open | Keep custom shell; extract shared helper if another family needs same pattern. |
| 2026-03-16 | cloudflare_production_hardening | Cloudflare launch depends on manual Wrangler secret setup — no CI-backed Worker deployment | Medium | Open | Automate once credential ownership is defined. |
| 2026-03-13 | student_study_runtime | `baseline-browser-mapping` data is stale, lint/test/build emit repeated warnings | Low | Open | Refresh pinned dev dependency when dependency changes are approved. |
| 2026-03-23 | practice_engine_stabilization | Full `npm test` still reports 2 baseline failures (Supabase RLS suites) | Medium | Open | `npm run lint` and `npm run build` pass; 1518/1518 tests pass. Only 2 test files fail due to missing Supabase credentials. |
| 2026-04-04 | code_review_legacy_cleanup | Simulations 4-8 use ad-hoc inline activity prop types instead of canonical Zod schemas | Medium | Open | First 3 simulations wrap the Activity type; last 5 should follow. |
| 2026-04-04 | code_review_legacy_cleanup | 2 pre-existing security test files (competency-rls.test.ts, rls.test.ts) failing | Medium | Open | Require Supabase client credentials; not related to current changes. |
| 2026-04-04 | code_review_track5_phase2-4 | `canTeacherAccessSubmission` and `canTeacherAccessLessonSummary` exported/tested but never called in production | Low | Open | Wire into Convex query guards or remove if API-layer auth is sufficient. |
| 2026-04-04 | code_review_track5_phase2-4 | `getLessonErrorSummary` uses N+1 queries (one per activityId) | Low | Open | Acceptable at current scale; refactor to batch if activity count grows. |
| 2026-04-06 | code_review_audit_m7 | AssetRegisterSimulator, DepreciationMethodComparison, MethodComparison: onComplete fires on every cycle with no ref guard | Medium | Open | hasCompleted ref exists for mastery but not for onComplete replay. Low priority since replay is user-initiated. |
| 2026-04-07 | code_review_audit_t10-11 | 3 depreciation simulators have no early-return guard in handleSubmit: AssetRegisterSimulator, DepreciationMethodComparisonSimulator, MethodComparisonSimulator | Low | Closed | Fixed: added submittedRef useRef guard, check at beginning of handleSubmit, and reset on handleReset for all three simulators. |
| 2026-04-06 | code_review_tracks6-8 | auth/server.ts requireActiveRequestSessionClaims fails open on Convex backend failure | Medium | Open | Design decision documented. Consider 503 or credential-state caching. |
| 2026-04-06 | code_review_tracks6-8 | lib/ai/retry.ts extracts HTTP status codes via regex on error messages — fragile coupling | Low | Open | Should use custom error class with statusCode property. |
| 2026-04-06 | code_review_tracks6-8 | 6 of 7 practice families do not emit omitted-entry tag for blank/undefined student responses | Low | Open | Error analysis cannot distinguish "didn't answer" from "answered wrong". |
| 2026-04-07 | code_review_audit_t12-ddb | ScenarioSwitchShowTell has no reset mechanism — submittedRef never cleared, component cannot be reused without unmounting | Low | Open | Likely single-use per mount. Add reset path if parent ever caches instances. |
| 2026-04-07 | code_review_audit_t12-ddb | InventoryManager addNotification setTimeout not cleaned up on unmount — React state-update-on-unmounted warning | Low | Open | Minor; only fires if component unmounts within 5s of a notification. |
| 2026-04-08 | code_review_apr8_audit | 17 exercise component keys have schema but no React component (placeholders registered) | Low | Open | Components need to be built when exercise families are prioritized. |
| 2026-04-08 | code_review_apr8_unit1 | PitchPresentationBuilder hardcoded activityId 'pitch-presentation-builder' — analytics tracking broken for DB-driven activities | Medium | Closed | Fixed: now uses `activity?.id ?? 'pitch-presentation-builder'`; test assertion updated to match mock id. |
| 2026-04-08 | code_review_apr8_unit1 | BusinessStressTest survivalRate divides by disasters.length — NaN when disasters array is empty | Medium | Closed | Fixed: added `disasters.length > 0` guard on both division sites (lines 112, 184). |
| 2026-04-08 | code_review_apr8_unit1 | InventoryManager margin display divides by product.price — Infinity when price is 0 | Low | Closed | Fixed: added `product.price > 0` guard before division. |
