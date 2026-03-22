# Implementation Plan: Practice Production Readiness

> Source: all findings from `conductor/tracks/practice_family_pedagogical_review_20260322/spec.md`.
> Phases are ordered by dependency and priority: bugs first (unblocks testing), consolidation next (reduces surface area for later phases), then integration, visual language, teaching mode, and curriculum docs.

## Phase 1: Engine Bug Fixes

> Fix the 7 bugs that make problems unsolvable, trivial, or leak answers. Each fix is independently testable.

### Tasks

- [ ] **Task: G-1 — Add error side to transposition and slide narratives**
  - [ ] Write failing test: transposition/slide narrative must include "debit" or "credit"
  - [ ] Update narrative templates in `lib/practice/engine/errors.ts` to interpolate `errorSide`
  - [ ] Verify existing tests still pass

- [ ] **Task: J-1 — Add computation to accrual scenarios**
  - [ ] Write failing test: accrual scenario amount must differ from any number in the stem text
  - [ ] Update `generateAccrualAdjustmentScenario` to use daily-rate computation (amount = rate × days accrued)
  - [ ] Update stem template: "The business earns $X per day… Y days have been earned but not billed"
  - [ ] Verify adjusting-calculations family tests still pass

- [ ] **Task: J-2 — Add distractor accounts to journal-entry presentation**
  - [ ] Write failing test: `availableAccounts.length` must be >= 4 for journal-entry presentation
  - [ ] Update `buildJournalEntryDefinition` to add 3–5 distractor accounts from the account pool, filtered by account-type neighborhood
  - [ ] Verify journal-entry grading still works with distractors present

- [ ] **Task: J-3 — Add useful life to depreciation stem**
  - [ ] Write failing test: depreciation stem must contain `usefulLifeMonths` or a human-readable equivalent
  - [ ] Update both stem templates in `generateDepreciationAdjustmentScenario` to interpolate useful life
  - [ ] Verify adjusting-calculations family tests still pass

- [ ] **Task: Fix answer leaks in preview page (N-5.3, O-4)**
  - [ ] Update Family N derived-layout cue block to show a prompt ("Compute this value") instead of `parts[0].targetId`
  - [ ] Update Family O statement-variant facts card to show input data only (sale amount, cost, discount terms), not computed answers
  - [ ] Verify preview page still renders without errors

- [ ] **Task: Phase 1 verification**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test` for all practice engine family tests
  - [ ] Verify no regressions

## Phase 2: Family Consolidation

> Merge D→Q, O→Q, rebuild L. This reduces the family count and the surface area for later phases.

### Tasks

- [ ] **Task: Merge Family D into Family Q**
  - [ ] Write failing test: `statement-subtotals` family must accept all three of D's statement kinds with D's blank counts as a valid configuration
  - [ ] Add D's single-blank income-statement variant as a `density: 'low'` config option on Q (or retire it if Q's 3-blank version is strictly better — confirm with review spec Q-1)
  - [ ] Update family registry: remove `statement-completion` key, redirect any references to `statement-subtotals`
  - [ ] Migrate D's test assertions into Q's test file
  - [ ] Update preview page: remove Family D section, ensure Family Q section covers all statement kinds
  - [ ] Search codebase for `statement-completion` references and update

- [ ] **Task: Merge Family O into Family Q**
  - [ ] Write failing test: `statement-subtotals` family with `statementKind: 'retail-income-statement'` must accept a `presentation: 'numeric'` config option
  - [ ] Move O's numeric presentation logic (questionRows, compact layout) into Q's retail-income-statement builder
  - [ ] Update family registry: remove `merchandising-computation` key
  - [ ] Migrate O's test assertions into Q's test file
  - [ ] Update preview page: remove Family O section, add numeric variant to Family Q's retail preview
  - [ ] Search codebase for `merchandising-computation` references and update

- [ ] **Task: Rebuild Family L as cycle-closing capstone**
  - [ ] Write failing test: Family L definition must produce a cycle-closing scenario distinct from Family H journal entries
  - [ ] Redesign L per L-1: mini-ledger-driven closing entries that close revenue/expense to retained earnings
  - [ ] Remove the 3 duplicated journal-entry scenarios (correcting, reversing, closing overlap with H)
  - [ ] Update family registry and preview page

- [ ] **Task: Phase 2 verification**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test` — full suite (consolidation touches shared registry)
  - [ ] Verify `npm run build` succeeds
  - [ ] Confirm family registry has ~12 entries, not 15

## Phase 3: Component Integration

> Move scenario context into components. Remove dev-only props from public API. Fix mode-driven behavior.

### Tasks

- [ ] **Task: CX-6 — Build scenario panels into shared components**
  - [ ] Design a `scenarioPanel` prop (or slot pattern) for StatementLayout, SelectionMatrix, and JournalEntryTable
  - [ ] Write failing test: components render scenario context from definition data when `scenarioPanel` is provided
  - [ ] Implement scenario panel rendering in each component
  - [ ] Update preview page to pass scenario data through component props instead of page-level JSX
  - [ ] Verify Families K, C/F, N, O/Q, E, H scenario context renders correctly

- [ ] **Task: CX-6 — Fix Family E answer leakage**
  - [ ] Write failing test: editable row placeholders must not contain the expected account name
  - [ ] Replace answer-leaking placeholders with generic text ("Select account", "Enter amount")
  - [ ] Redesign account bank as a prominent reference panel inside the component, not a cramped badge strip
  - [ ] Verify statement-construction family tests still pass

- [ ] **Task: CX-8 — Remove metadataBadges from public component API**
  - [ ] Remove `metadataBadges` prop from StatementLayout
  - [ ] Move badge rendering into preview page JSX only (outside the component)
  - [ ] Check SelectionMatrix, JournalEntryTable, CategorizationList for similar dev-only props
  - [ ] Update tests that reference metadataBadges

- [ ] **Task: CX-2 — Make hint visibility mode-driven**
  - [ ] Write failing test: CategorizationList must not render a hint toggle checkbox
  - [ ] Remove the "Show context hints" checkbox from CategorizationList
  - [ ] Drive hint visibility from `mode` prop: always on for teaching/guided, always off for independent/assessment
  - [ ] Replace raw `JSON.stringify(details)` hint rendering with human-readable text

- [ ] **Task: CX-4 — Verify production renderers start empty**
  - [ ] Audit production activity wrappers (AccountCategorization and others) for initial state
  - [ ] Write tests confirming guided and assessment modes initialize with empty `defaultValue`
  - [ ] Fix any wrappers that pre-fill answers in student-facing modes

- [ ] **Task: Phase 3 verification**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test`
  - [ ] Verify preview page still renders all families correctly

## Phase 4: Visual Language

> Redesign shared components to visually represent real financial documents. Reference the 1ed components in `components/activities/accounting/` and `components/activities/reports/` for presentation conventions.

### Tasks

- [ ] **Task: CX-5 — Redesign StatementLayout**
  - [ ] Study 1ed components (`IncomeStatementSimple`, `BalanceSheetSimple`) for visual conventions
  - [ ] Write snapshot/visual test for the redesigned layout
  - [ ] Implement indentation hierarchy: line items indented under section headers, subtotals outdented
  - [ ] Implement two-column amount layout: inner column for line items, outer column for section totals
  - [ ] Implement single/double underline convention: single before subtotal, double under final total
  - [ ] Implement centered header block: company name, statement name, period
  - [ ] Apply `tabular-nums` formatting and parenthesized negatives
  - [ ] Verify all StatementLayout consumers (D/Q, E, N, J-calculation, O/Q) render correctly

- [ ] **Task: CX-5 — Redesign JournalEntryTable**
  - [ ] Study real journal page conventions for visual reference
  - [ ] Write snapshot/visual test for the redesigned layout
  - [ ] Implement debit account at normal indent, credit account indented further
  - [ ] Implement two-column amount layout (debit column, credit column)
  - [ ] Implement ruling lines between journal entries
  - [ ] Implement date column with grouped-date header treatment
  - [ ] Verify all JournalEntryTable consumers (H, J-journal, L, P) render correctly

- [ ] **Task: A-1 — Redesign CategorizationList for A=L+E layout**
  - [ ] Write failing test: account-type categorySet renders Assets in left column, L+E stacked in right column
  - [ ] Implement two-column layout for `account-type` (5 buckets): Assets left, Liabilities/Equity right, Revenue/Expenses below equity
  - [ ] Implement two-column layout for `statement-placement` (3 buckets): Balance Sheet left, Income Statement right
  - [ ] Keep `permanent-temporary` (2 buckets) as left/right split
  - [ ] CX-3: Add subtle zone tint colors per category
  - [ ] Verify drag-and-drop and keyboard select still work in the new layout

- [ ] **Task: I-1 — Build interactive T-account component**
  - [ ] Write failing tests for T-account rendering and interaction
  - [ ] Build `TAccountInteractive` component: debit-left / credit-right spatial layout, classic T shape
  - [ ] Support editable balance cells with numeric input
  - [ ] Replace PostingBalanceList with TAccountInteractive in Family I
  - [ ] Update family registry and preview page

- [ ] **Task: Phase 4 verification**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test`
  - [ ] Run `npm run build`
  - [ ] Visual review of all redesigned components in the preview page

## Phase 5: Teaching Mode and Feedback Quality

> Add the missing teaching mode across all families. Upgrade feedback from "answer was X" to computation-chain explanations.

### Tasks

- [ ] **Task: CX-1 — Add teaching mode to engine and components**
  - [ ] Add `'teaching'` to the mode union type in `ProblemDefinition`
  - [ ] Define teaching mode behavior: all hints/explanations always visible, step-by-step annotations, "next step" control for instructor
  - [ ] Write failing tests: teaching mode definition includes visible hints and narration steps
  - [ ] Implement teaching mode in engine config across all families
  - [ ] Update shared components to render teaching chrome when `mode === 'teaching'`

- [ ] **Task: Implement computation-chain feedback — Families J, Q**
  - [ ] Write failing test: J deferral feedback includes intermediate values ("$1,200 × (3/12) = $300")
  - [ ] Write failing test: J depreciation feedback includes the full chain ("($4,800 − $480) ÷ 36 × 3 = $360")
  - [ ] Write failing test: Q feedback includes dependent chain ("Total Revenues ($8,400) − Total Expenses ($5,250) = Net Income ($3,150)")
  - [ ] Update feedback builders to interpolate scenario/definition intermediate values
  - [ ] Implement for Q retail variant (conditional discount reasoning from O-5)

- [ ] **Task: Implement computation-chain feedback — Families G, N, M**
  - [ ] Write failing test: G transposition feedback explains divisible-by-9 rule with the actual numbers
  - [ ] Write failing test: N derived feedback shows full depreciation chain
  - [ ] Write failing test: M non-contra feedback explains the normal balance rule ("Revenue increases equity → credit side")
  - [ ] Update feedback builders for G, N, M

- [ ] **Task: Per-family pedagogical enhancements**
  - [ ] M-1: Add DEA-LER mnemonic rendering at three detail levels by mode
  - [ ] G-3: Add divisible-by-9 explanation in teaching mode ("10a + b vs 10b + a → 9|a−b|")
  - [ ] K-1: Implement row subsetting (3–4 of 6 elements per instance) and directional variations (over-adjustment, double-recording)
  - [ ] G-2: Suppress `whatToDecideFirst` hints in independent/assessment modes
  - [ ] N-1: Default derived layout; reserve direct for teaching/warm-up only
  - [ ] N-3: Expand asset categories from 2 to 4+ (add Vehicles, Furniture, Computers)
  - [ ] H-1: Add difficulty progression metadata (`lineComplexity` or `eventCount`)
  - [ ] I-2: Support multiple postings per account in Family I engine
  - [ ] J-5: Add paired asset-vs-expense method comparison mode for teaching demos

- [ ] **Task: Phase 5 verification**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test` — full suite
  - [ ] Run `npm run build`
  - [ ] Visual review of teaching mode in the preview page

## Phase 6: Curriculum Sequencing Documentation

> Document the pedagogical progressions identified in the review for teacher-facing curriculum materials.

### Tasks

- [ ] **Task: Document practice family progressions**
  - [ ] Add sequencing guidance to curriculum-facing materials (likely `conductor/curriculum/practice-component-contract.md` or a new practice sequencing doc)
  - [ ] Document: F→C (reasoning scaffold → application)
  - [ ] Document: J→K (compute the adjustment → reason about missing it)
  - [ ] Document: D/Q→E (complete subtotals → construct from scratch)
  - [ ] Document: Statement→Numeric presentation (scaffolded → unscaffolded)
  - [ ] Document: J→N (compute depreciation → present on balance sheet)
  - [ ] Document: H simple→complex (2-line entries → 10-line entries, using H-1 metadata)

- [ ] **Task: Archive the review track**
  - [ ] Move `practice_family_pedagogical_review_20260322` to `conductor/archive/`
  - [ ] Update tracks.md

- [ ] **Task: Final verification and closeout**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test` — full suite
  - [ ] Run `npm run build`
  - [ ] Update tracks.md: mark this track complete
  - [ ] Update tech-debt.md if any items were resolved or created
  - [ ] Update lessons-learned.md with insights from this track
