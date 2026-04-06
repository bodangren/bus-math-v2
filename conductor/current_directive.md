# Current Strategic Directive

The full 8-unit curriculum, capstone, student study runtime, teacher monitoring, and Cloudflare deployment are complete (Milestones 1–6 closed 2026-03-16).

Milestone 7 is complete (2026-04-06). Code review audits completed for Tracks 5–10 with 17+ bugs fixed and 30+ tech-debt items tracked.

**Code review audit for Tracks 8–10 completed 2026-04-06.** Findings: DDBComparisonMastery compute functions lacked division-by-zero guards (fixed). All 1462 tests pass; build clean. 19 open tech-debt items remain.

Every active track must directly support one of these outcomes:

- close remaining open tech-debt items from the full audit history
- standardize double-submit guards across all simulations (useRef pattern)
- remove legacy Supabase/Drizzle surfaces that inflate type-check surface area
- resolve pre-existing test failures (2 Supabase security test files)
- address npm dependency security advisories (rollup, serialize-javascript, tar) when dependency changes are approved

Admin tooling, in-app curriculum authoring, and new content beyond the existing 8 units + capstone are deferred.

## Next High-Level Priorities (post code-review Tracks 8–10, 2026-04-06)

1. **Simulation Double-Submit Guard Standardization** — 5 simulation components (CashFlowChallenge, BusinessStressTest, BudgetBalancer, LemonadeStand, NotebookOrganizer) use useState-only guards. Convert all to useRef pattern like GrowthPuzzle/StartupJourney. Medium severity but affects data integrity.
2. **CashFlowChallenge Legacy Cleanup** — Remove `onSubmitLegacy` callback and migrate to `activity.id ?? fallback` pattern. Dual-callback path is a maintenance trap.
3. **Simulation Activity Prop Type Standardization** — 5 simulations (4–8) use ad-hoc inline types instead of Zod schemas. Standardize to match first 3 simulations.
4. **Auth Fails-Open Hardening** — `requireActiveRequestSessionClaims` passes through deactivated users during Convex outages. Consider credential-state caching or 503 response.
5. **AI Retry Error Handling** — `lib/ai/retry.ts` extracts status codes via regex. Introduce custom error class with statusCode property.
6. **Supabase/Drizzle Legacy Surface Removal** — lib/db/schema/ still imported by active components; requires dedicated migration track.
7. **Omitted-Entry Tag Gap** — 6 of 7 practice families don't emit `omitted-entry` for blank/undefined responses. Error analysis cannot distinguish "didn't answer" from "answered wrong."
8. **Dead Props Cleanup** — PayStructureDecisionLab declares unused `onComplete` and `activity` props.
