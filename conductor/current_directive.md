# Current Strategic Directive

The full 8-unit curriculum, capstone, student study runtime, teacher monitoring, and Cloudflare deployment are complete (Milestones 1–6 closed 2026-03-16).

Current focus is **Milestones 7–8 transition**: practice contract closure and post-practice hardening.

Milestone 7 is complete (2026-04-06). Remaining tech debt from code review has been resolved or explicitly deferred.

Every active track must directly support one of these outcomes:

- close Milestone 7 exit gate: remaining tech debt resolved or explicitly deferred
- ensure all practice components have robust double-submit guards, input validation, and envelope assertion coverage
- remove legacy Supabase/Drizzle surfaces that inflate type-check surface area
- resolve pre-existing test failures (2 Supabase security test files)
- address npm dependency security advisories (rollup, serialize-javascript, tar) when dependency changes are approved

Admin tooling, in-app curriculum authoring, and new content beyond the existing 8 units + capstone are deferred.

## Next High-Level Priorities (post code-review 2026-04-06)

1. **Milestone 7 Closure Phase 3 — Legacy Cleanup**: Remove Supabase/Drizzle migration-era surfaces; verify reduced type-check surface area.
2. **Envelope Test Quality Gap**: Add `parts` (length > 0), `status`, and `familyKey` assertions to all 12 simulation envelope test files.
3. **Simulation Input Validation**: Add NaN/empty-input guards to AssetRegisterSimulator, DepreciationMethodComparisonSimulator, MethodComparisonSimulator submit handlers.
4. **GrowthPuzzle Double-Submit Guard**: Add `submitted` state for defense-in-depth alongside existing `isComplete` UI guard.
5. **Exercise Component Polish**: Fix StraightLineMastery options re-shuffle on render; fix CapitalizationExpenseMastery "Show Example" misleading feedback; add DDB final-year catch-up.
6. **CashFlowChallenge Legacy Cleanup**: Remove `onSubmitLegacy` prop and finalize `activity.id` migration (requires props interface refactor).
