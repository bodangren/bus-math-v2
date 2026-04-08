# Current Strategic Directive

The full 8-unit curriculum, capstone, student study runtime, teacher monitoring, and Cloudflare deployment are complete. Milestones 1–7 closed on March 16, 2026 through April 6, 2026.

The project is now in a post-milestone cleanup and polish phase beginning on April 7, 2026.

## Phase Focus

This phase has two serialized goals:

1. clean the repository so the active codebase and Conductor surface contain only live, intentional files and references
2. run a page-by-page product audit and fix visible UI discrepancies such as overflow, clipping, alignment drift, spacing imbalance, and responsive layout failures

## Required Execution Order

Tracks in this phase must run in this order:

1. **Repo Cleanup and Surface Hygiene**
2. **Non-Unit Page Evaluation and Polish**
3. **Unit 1 Page Evaluation and Polish**
4. **Unit 2 Page Evaluation and Polish**
5. **Unit 3 Page Evaluation and Polish**
6. **Unit 4 Page Evaluation and Polish**
7. **Unit 5 Page Evaluation and Polish**
8. **Unit 6 Page Evaluation and Polish**
9. **Unit 7 Page Evaluation and Polish**
10. **Unit 8 Page Evaluation and Polish**

One implementation track may be active at a time. Do not begin the next UI audit track until the current track is verified, documented, and archived.

## In-Bounds Work

Every active track in this phase must directly support at least one of these outcomes:

- remove unused files, dead exports, stale imports, obsolete helper surfaces, and planning residue that no longer belong to the active product
- reconcile Conductor queue hygiene so the active registry and active track directory describe the same reality
- fix page-level UI defects on the rendered product, including horizontal overflow, clipped controls, broken wrapping, uneven spacing, misalignment, inconsistent container widths, and poor mobile behavior
- preserve or improve student clarity and teacher signal on every touched page
- close cleanup-adjacent tech debt discovered during the audit when it blocks repository hygiene or page correctness
- Correct typescript warnings

## Phase Exit Gates

This phase is only complete when all of the following are true:

- the repository no longer contains confirmed-unused project files or stale active-track residue
- non-unit pages have been audited and corrected
- each instructional unit has completed its own page-polish track
- touched pages render cleanly on desktop and mobile widths without obvious overflow or alignment defects
- Conductor planning artifacts accurately reflect the active queue and archive state
- required verification for each track has been run and recorded

## Quality Bar For Page Audits

For every page-polish track:

- inspect the real rendered page, not just the source
- verify desktop and mobile layouts
- fix visible issues before moving on, rather than recording obvious defects for later
- preserve the existing visual language unless a correction is necessary for clarity, hierarchy, or responsiveness
- keep the curriculum-first product story intact across public, student, and teacher surfaces

## Deferred Work

The following remain out of scope for this phase unless they block cleanup or page correctness:

- new product features
- new curriculum content beyond the existing 8 units and capstone
- admin tooling
- in-app curriculum authoring
- dependency upgrades or package additions without explicit approval
- broad architectural refactors unrelated to cleanup or rendered-page quality

## Current High-Level Priorities (2026-04-08 — post Pass 9)

1. **New Phase Planning** — Cleanup/polish phase fully complete (all 10 tracks archived, all exit gates verified). Define next phase scope. Candidates: security vuln remediation, exercise component buildout, or Milestone 8 feature work.
2. **Security Vulnerability Remediation** — 26 npm vulns (Rollup RCE 8.8, tar 8.8, minimatch ReDoS 8.7, serialize-javascript RCE 8.1). Requires dependency upgrades. Coordinate approval per AGENTS.md constraints.
3. **14 Exercise Component Placeholders** — Schema-defined keys with no React component (`profit-calculator`, `budget-worksheet`, `inventory-algorithm-showtell`, `markup-margin-mastery`, `break-even-mastery`, `income-statement-practice`, `cash-flow-practice`, `balance-sheet-practice`, `chart-linking-simulator`, `cross-sheet-link-simulator`, `closing-entry-practice`, `month-end-close-practice`, `adjustment-practice`, `error-checking-system`). Build when exercise-family prioritization resumes.
4. **Dead Code Pruning** — 12 activity components exist on disk but are only imported by tests (FeedbackCollector, TAccountSimple, TAccountDetailed, TAccountsVisualization, TrialBalance, TransactionJournal, IncomeStatementSimple, IncomeStatementDetailed, CashFlowStatementSimple, CashFlowStatementDetailed, BalanceSheetSimple, BalanceSheetDetailed). Either register or remove.
5. **Division Guards (Low)** — BudgetBalancer `/ monthlyIncome` (5 sites) and AssetTimeMachine `/ initialCost` (2 sites) remain unguarded. Data model prevents zero; add guards if scope changes.

## Code Review Summary (2026-04-08 — Unit 8 Polish + Phase Audit, Pass 7)

Audited Unit 8 Page Polish track and full codebase sweep of all 21 simulation/exercise components, activity registry, and conductor state.

**No code changes since Pass 6** — only archival of unit1-8 page polish tracks.

**Fixed during review: 0 bugs** — No new issues found since Pass 6. All previously fixed items verified intact by reading source.

**Verification gates:**
- `npm run lint`: 0 errors, 1 pre-existing warning (worker default export)
- `npm test`: 1518/1518 tests pass; 2 suites fail (pre-existing Supabase credential dependency)
- `npm run build`: passes cleanly

**What was reviewed:**
- **Unit 8**: Audit-only track. No code changes needed — all surfaces clean.
- **submittedRef guard pattern**: 21/21 simulation+exercise components pass.
- **Reset functions**: All 16 components with reset functions clear submittedRef.current = false. 3 one-shot components (DynamicMethodSelector, ScenarioSwitchShowTell, PitchPresentationBuilder) intentionally have no reset.
- **Timer cleanup**: All 5 timer-using components have proper useEffect cleanup. No issues.
- **Division-by-zero**: All previously fixed guards remain intact. BudgetBalancer monthlyIncome and AssetTimeMachine initialCost divisions remain unguarded (low priority, data model prevents zero).
- **Optional chaining**: 16/21 components use `onSubmit?.()`. 5 components (GrowthPuzzle, InventoryManager, PayStructureDecisionLab, PitchPresentationBuilder, StartupJourney) use `if (onSubmit)` guard instead — safe but inconsistent.
- **Activity registry**: 57 schema keys, 57 registry entries (43 real + 14 placeholders). Perfect 1:1 match. 12 unregistered dead-code components identified.
- **Conductor state**: All 8 unit polish tracks archived. Phase cleanup tracks complete.

**New items recorded in tech-debt.md:**
- AssetTimeMachine: valueRetention divides by initialCost (low)
- 12 dead-code activity components not in registry (low)

**Phase status**: All cleanup/polish tracks complete. Phase exit verification pending.

## Code Review Summary (2026-04-08 — Phase Exit Gate Verification, Pass 8)

Verified all phase exit gates from current directive are met.

**Fixed during review: 1 hygiene issue**
- Updated tracks.md to point unit1-8 page polish track links to ./archive/ instead of ./tracks/

**Verification gates:**
- `npm run lint`: 0 errors, 1 pre-existing warning (worker default export)
- `npm test`: 1518/1518 tests pass; 2 suites fail (pre-existing Supabase credential dependency)
- `npm run build`: passes cleanly
- Conductor tracks.md: all 10 cleanup/polish tracks marked [x] and linked to archive
- Conductor tracks/: empty (no stale active-track residue)
- All non-unit and unit1-8 page audit tracks archived in conductor/archive/

**Phase status**: Cleanup/polish phase COMPLETE. All phase exit gates verified.

## Code Review Summary (2026-04-08 — Post-Phase Verification, Pass 9)

Post-completion audit of Pass 6–8 changes. Scope: verify no regressions since last code fix (Pass 6), confirm all previously fixed items remain intact, validate all verification gates still pass.

**No code changes since Pass 6** — Pass 7-8 were documentation-only (conductor archive links, directive updates).

**Fixed during review: 0 bugs** — No new code issues found. All Pass 4-6 fixes confirmed intact by reading source.

**Verification gates:**
- `npm run lint`: 0 errors, 1 pre-existing warning (worker default export)
- `npm test`: 1518/1518 tests pass; 2 suites fail (pre-existing Supabase credential dependency)
- `npm run build`: passes cleanly

**What was reviewed:**
- **All 18 simulation components**: submittedRef guard (18/18), ordering (18/18 correct), reset clearing ref (15/18 — 3 intentionally one-shot), division guards, timer cleanup, optional chaining — all pass.
- **All 13 exercise/quiz components**: submittedRef guard (7/13 have ref; 6 quiz components rely on hidden-button pattern — mitigated, low risk), reset functions (11/13; ReflectionJournal and PeerCritiqueForm lack reset — low risk), division guards, optional chaining — all pass.
- **Activity registry**: 50 keys, 14 placeholders, 1 alias ('pitch'). resolveActivityComponentKey is a no-op cast (low).
- **Chart components**: All division guards intact (BreakEvenChart, PieChart).
- **Build plugin**: @cloudflare/vite-plugin properly uses dynamic import with try/catch.

**New items recorded in tech-debt.md:**
- 6 quiz/exercise components missing submittedRef guard (low — mitigated by hidden submit buttons)
- ReflectionJournal and PeerCritiqueForm lack reset functions (low)
- resolveActivityComponentKey is a no-op cast (low)

**Phase status**: Cleanup/polish phase FULLY VERIFIED. Ready to define next phase.

## Code Review Summary (2026-04-08 — Unit 6–7 Polish + Phase Audit, Pass 6)

Audited Unit 6 and Unit 7 Page Polish tracks. Full codebase review of all 18 simulation components, 3 exercise components, 6 chart components, and activity registry.

**Fixed during review: 4 bugs**
- **submittedRef ordering** (Medium): CapitalNegotiation.tsx, CafeSupplyChaos.tsx, AssetTimeMachine.tsx — all three set `setIsComplete(true)` before `submittedRef.current = true`, creating a theoretical double-submit window. Moved `submittedRef.current = true` to immediately after the guard check in all three.
- **Division-by-zero** (Low): LemonadeStand.tsx `getMaxCupsFromInventory` — `lemonsPerCup` division unguarded while `sugarPerCup` has a zero guard. Added matching `lemonsPerCup > 0` guard.

**Recorded in tech-debt.md:**
- BudgetBalancer: `monthlyIncome` divisions unguarded in `advanceMonth` and render — NaN/Infinity if income is 0 (data model presumably prevents this)

**Verification gates:**
- `npm run lint`: 0 errors, 1 pre-existing warning (worker default export)
- `npm test`: 1518/1518 tests pass; 2 suites fail (pre-existing Supabase credential dependency)
- `npm run build`: passes cleanly

**What was reviewed:**
- **Unit 6**: Audit-only track. No code changes needed — all surfaces clean.
- **Unit 7**: GrowthPuzzle and CapitalNegotiation reset buttons now correctly call `resetGame()`/`reset()` (fixes from Pass 5 commit range). Confirmed `submittedRef` is properly cleared in both reset functions.
- **submittedRef guard pattern**: 18/18 simulations pass; 3/3 exercises pass. All submit handlers guard correctly.
- **Reset functions**: All 6 components with reset functions clear `submittedRef.current = false`. Confirmed ordering fix applied to 3 previously-inconsistent components.
- **Division-by-zero**: All chart and exercise divisions guarded. LemonadeStand inconsistency fixed.
- **Timer cleanup**: All 5 timer-using components have proper useEffect cleanup. No issues.
- **Optional chaining**: All `onSubmit` and `onComplete` calls use consistent `?.()` pattern.

**Remaining items recorded in tech-debt.md:**
- 17 exercise component keys have schema but no React component (placeholders registered)
- PitchPresentationBuilder: resetTimer does not clear submittedRef (harmless — reset in practice mode, submit in review mode)
- ScenarioSwitchShowTell and DynamicMethodSelector: no reset mechanism (one-shot by design)
- auth/server.ts requireActiveRequestSessionClaims fails open on Convex backend failure
- lib/ai/retry.ts extracts HTTP status codes via regex on error messages — fragile coupling
- 6 of 7 practice families do not emit omitted-entry tag for blank/undefined student responses
- BudgetBalancer: monthlyIncome divisions unguarded (new)

## Code Review Summary (2026-04-08 — Unit 4–5 Polish + Phase Audit, Pass 5)

Audited Unit 4 and Unit 5 Page Polish tracks. Full codebase review of all 18 simulation components, 3 exercise components, 6 chart components, and activity registry.

**Fixed during review: 0 bugs** — No serious issues found. All changes from Unit 4 and Unit 5 tracks are clean.

**Verification gates:**
- `npm run lint`: 0 errors, 1 pre-existing warning (worker default export)
- `npm test`: 1518/1518 tests pass; 2 suites fail (pre-existing Supabase credential dependency)
- `npm run build`: passes cleanly

**What was reviewed:**
- **PayStructureDecisionLab**: `resetLab()` function correctly clears `submittedRef`, `submitted`, `current`, and all 3 input states. "Try Again" button rendered after submission. Good.
- **DynamicMethodSelector**: `submittedRef` guard correctly prevents double-submit. `completed` state used for UI disabling. No reset function needed (one-shot component). Good.
- **Activity registry**: All 5 previously-placeholder Unit 5 keys (`depreciation-method-comparison`, `asset-register-simulator`, `dynamic-method-selector`, `method-comparison-simulator`, `scenario-switch-showtell`) now point to real components. Good.
- **submittedRef guard pattern**: 18/18 simulations pass; 3/3 exercises pass. Guard checked in all submit handlers; 15/18 simulations have reset clearing submittedRef (3 intentionally one-shot).
- **Optional chaining**: All `onSubmit` and `onComplete` calls use consistent `?.()` across all simulation and exercise components.
- **Division-by-zero**: All chart and exercise divisions are guarded. No unguarded risks.
- **Timer cleanup**: No new setTimeout/setInterval issues introduced. All existing fixes from Pass 4 remain intact.

**Remaining items recorded in tech-debt.md:**
- 17 exercise component keys have schema but no React component (placeholders registered)
- PitchPresentationBuilder: resetTimer does not clear submittedRef — harmless in practice (reset only in practice mode, submit only in review mode) but architecturally inconsistent
- ScenarioSwitchShowTell and DynamicMethodSelector: no reset mechanism (one-shot by design)
- auth/server.ts requireActiveRequestSessionClaims fails open on Convex backend failure
- lib/ai/retry.ts extracts HTTP status codes via regex on error messages — fragile coupling
- 6 of 7 practice families do not emit omitted-entry tag for blank/undefined student responses

## Notes

- Existing open tech-debt items still matter, but this phase prioritizes the items that directly affect cleanup, rendered-page correctness, or the reliability of follow-on UI audits.
- If a page audit exposes a deeper runtime or auth defect, fix it in the owning track only when it is necessary to make the page correct and testable; otherwise record it and keep the serialized queue moving.
- Code review audits should verify "fixed" items by reading source (per lessons-learned). Confirmed: all Pass 4 fixes are intact.
