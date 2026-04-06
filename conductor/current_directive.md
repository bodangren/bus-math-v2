# Current Strategic Directive

The full 8-unit curriculum, capstone, student study runtime, teacher monitoring, and Cloudflare deployment are complete (Milestones 1–6 closed 2026-03-16).

Milestone 7 is complete (2026-04-06). Code review audit of Tracks 6–8 completed 2026-04-06 with 5 bugs fixed and 12 new tech-debt items recorded.

Every active track must directly support one of these outcomes:

- close remaining open tech-debt items from Tracks 6–8 audit
- ensure all practice components have robust double-submit guards, input validation, and envelope assertion coverage
- resolve the ClassificationActivity schema key mismatch (activityPropsSchemas['classification'] does not exist)
- fix misapplied misconception tags in transaction-matrix and transaction-effects families
- remove legacy Supabase/Drizzle surfaces that inflate type-check surface area
- resolve pre-existing test failures (2 Supabase security test files)
- address npm dependency security advisories (rollup, serialize-javascript, tar) when dependency changes are approved

Admin tooling, in-app curriculum authoring, and new content beyond the existing 8 units + capstone are deferred.

## Next High-Level Priorities (post code-review 2026-04-06)

1. **ClassificationActivity Schema Fix** — `activityPropsSchemas['classification']` does not exist; component cannot be properly typed or instantiated. Add schema entry or remap to existing key.
2. **Misconception Tag Accuracy** — transaction-matrix and transaction-effects families misapply `debit-credit-reversal`/`computation-error` to reasoning-stage classification errors. Should use `classification-error` or context tags. This produces misleading teacher-facing analytics.
3. **Double-Submit Guard Standardization** — Most simulation components use useState-only guards; adopt GrowthPuzzle's useRef pattern across all simulations to prevent rapid double-clicks under React 18 batching.
4. **Depreciation Simulator NaN/Infinity Guards** — `usefulLife=0` configs produce Infinity/NaN in `calculateSL`, `calculateDDB`, `computeUOP`. Add guards in computation functions (not just user-input validation).
5. **Misconception Tag Test Coverage** — 3 families (posting-balances, transaction-effects, transaction-matrix) have zero test coverage for grade-function misconception tagging.
6. **Omitted-Entry Tag Gap** — 6 of 7 practice families do not emit `omitted-entry` for blank/undefined student responses; error analysis cannot distinguish "didn't answer" from "answered wrong."
7. **simulation-submission.ts Deduplication** — Import `normalizePracticeValue` from contract.ts instead of duplicating it locally.
8. **Supabase/Drizzle Legacy Surface Removal** — lib/db/schema/ still imported by active components; requires dedicated migration track to fully remove.
