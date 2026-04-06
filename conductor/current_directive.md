# Current Strategic Directive

The full 8-unit curriculum, capstone, student study runtime, teacher monitoring, and Cloudflare deployment are complete (Milestones 1–6 closed 2026-03-16).

Milestone 7 is complete (2026-04-06). Code review audits completed for Tracks 5–11 with 21+ bugs fixed and 30+ tech-debt items tracked.

**Code review audit for Tracks 9–11 completed 2026-04-06.** Findings: BusinessStressTest "Back to Lesson" left game in unplayable state (fixed), LemonadeStand resetGame didn't clear sales interval (fixed), CashFlowChallenge onSubmit missing optional chaining (fixed), StraightLineMastery missing division-by-zero guard (fixed). All 88 simulation tests and 72 engine tests pass; build clean. 21 open tech-debt items remain.

Every active track must directly support one of these outcomes:

- close remaining open tech-debt items from the full audit history
- standardize double-submit guards across all simulations (useRef pattern)
- remove legacy Supabase/Drizzle surfaces that inflate type-check surface area
- resolve pre-existing test failures (2 Supabase security test files)
- address npm dependency security advisories (rollup, serialize-javascript, tar) when dependency changes are approved

Admin tooling, in-app curriculum authoring, and new content beyond the existing 8 units + capstone are deferred.

## Next High-Level Priorities (post double-submit standardization, 2026-04-06)

1. ~~**Complete Track 11 Phase 3** — NotebookOrganizer useRef double-submit guard~~ — Done.
2. **DDBComparisonMastery submittedRef guard** — Exercise component's handleSubmit lacks ref-based double-submit protection; relies on disabled prop only.
3. **BusinessStressTest submitted state** — No visual disabled state on buttons after submission; submittedRef silently blocks with no UI feedback.
4. **Simulation Activity Prop Type Standardization** — 5 simulations (4–8) use ad-hoc inline types instead of Zod schemas. Standardize to match first 3 simulations.
5. **CashFlowChallenge Legacy Cleanup** — Remove `onSubmitLegacy` callback and migrate to `activity.id ?? fallback` pattern. Dual-callback path is a maintenance trap.
6. **Auth Fails-Open Hardening** — `requireActiveRequestSessionClaims` passes through deactivated users during Convex outages. Consider credential-state caching or 503 response.
7. **AI Retry Error Handling** — `lib/ai/retry.ts` extracts status codes via regex. Introduce custom error class with statusCode property.
8. **Supabase/Drizzle Legacy Surface Removal** — lib/db/schema/ still imported by active components; requires dedicated migration track.
9. **Omitted-Entry Tag Gap** — 6 of 7 practice families don't emit `omitted-entry` for blank/undefined responses. Error analysis cannot distinguish "didn't answer" from "answered wrong."
10. **Dead Props Cleanup** — PayStructureDecisionLab declares unused `onComplete` and `activity` props.
