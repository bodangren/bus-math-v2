# Current Strategic Directive

The full 8-unit curriculum, capstone, student study runtime, teacher monitoring, and Cloudflare deployment are complete (Milestones 1–6 closed 2026-03-16).

Milestone 7 is complete (2026-04-06). Code review audits completed for Tracks 5–11 + DDB guard track with 25+ bugs fixed and 35+ tech-debt items tracked.

**Code review audit for Tracks 10–11 + DDB guard track completed 2026-04-07.** Findings: StraightLineMastery and CapitalizationExpenseMastery had no submittedRef guard (fixed), depreciation-schedules.ts used `??` instead of `||` for totalUnits zero-guard (fixed), 4 simulation components have NO double-submit protection (tracked as HIGH tech debt), 3 more have fragile state-after-onSubmit guards (tracked as MEDIUM). All 255 non-Supabase tests pass; build clean. 27 open tech-debt items remain.

Every active track must directly support one of these outcomes:

- close remaining open tech-debt items from the full audit history
- standardize double-submit guards across ALL remaining simulation components (useRef pattern)
- remove legacy Supabase/Drizzle surfaces that inflate type-check surface area
- resolve pre-existing test failures (2 Supabase security test files)
- address npm dependency security advisories (rollup, serialize-javascript, tar) when dependency changes are approved

Admin tooling, in-app curriculum authoring, and new content beyond the existing 8 units + capstone are deferred.

## Next High-Level Priorities (2026-04-07)

1. ~~**Complete Track 11 Phase 3** — NotebookOrganizer useRef double-submit guard~~ — Done.
2. ~~**DDBComparisonMastery submittedRef guard**~~ — Done.
3. **Remaining Simulation submittedRef Guards (HIGH)** — AssetTimeMachine, CapitalNegotiation, CafeSupplyChaos, ScenarioSwitchShowTell have NO double-submit protection. Every user completion click fires onSubmit with no guard.
4. **Remaining Simulation submittedRef Guards (MEDIUM)** — PitchPresentationBuilder, PayStructureDecisionLab, InventoryManager set useState AFTER onSubmit; race window allows double-submit bypass.
5. **BusinessStressTest submitted state** — No visual disabled state on buttons after submission; submittedRef silently blocks with no UI feedback.
6. **Simulation Activity Prop Type Standardization** — 5 simulations (4–8) use ad-hoc inline types instead of Zod schemas. Standardize to match first 3 simulations.
7. **CashFlowChallenge Legacy Cleanup** — Remove `onSubmitLegacy` callback and migrate to `activity.id ?? fallback` pattern. Dual-callback path is a maintenance trap.
8. **Auth Fails-Open Hardening** — `requireActiveRequestSessionClaims` passes through deactivated users during Convex outages. Consider credential-state caching or 503 response.
9. **AI Retry Error Handling** — `lib/ai/retry.ts` extracts status codes via regex. Introduce custom error class with statusCode property.
10. **Supabase/Drizzle Legacy Surface Removal** — lib/db/schema/ still imported by active components; requires dedicated migration track.
11. **Omitted-Entry Tag Gap** — 6 of 7 practice families don't emit `omitted-entry` for blank/undefined responses.
12. **Dead Props Cleanup** — PayStructureDecisionLab declares unused `onComplete` and `activity` props.
