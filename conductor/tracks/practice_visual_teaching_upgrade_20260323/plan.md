# Implementation Plan: Practice Visual & Teaching Upgrade

> Split from Practice Production Readiness (Phases 3-6).
> Depends on Practice Engine Stabilization and Curriculum Rollout being complete.
> Reference `visual_language_standard.md` and `current_state_of_components.md` for design context.

## Phase 1: Component Integration

> Move scenario context into components. Remove dev-only props from public API. Fix mode-driven behavior.

### Tasks

- [x] **Task: CX-6 — Build scenario panels into shared components**
  - [x] Design a `scenarioPanel` prop (or slot pattern) for StatementLayout, SelectionMatrix, and JournalEntryTable
  - [x] Write failing test: components render scenario context from definition data when `scenarioPanel` is provided
  - [x] Implement scenario panel rendering in each component
  - [x] Update preview page to pass scenario data through component props instead of page-level JSX
  - [x] Verify Families K, C/F, N, O/Q, E, H scenario context renders correctly

- [x] **Task: CX-6 — Fix Family E answer leakage**
  - [x] Write failing test: editable row placeholders must not contain the expected account name
  - [x] Replace answer-leaking placeholders with generic text ("Select account", "Enter amount")
  - [x] Redesign account bank as a prominent reference panel inside the component, not a cramped badge strip
  - [x] Verify statement-construction family tests still pass

- [x] **Task: CX-8 — Remove metadataBadges from public component API**
  - [x] Remove `metadataBadges` prop from StatementLayout
  - [x] Move badge rendering into preview page JSX only (outside the component)
  - [x] Check SelectionMatrix, JournalEntryTable, CategorizationList for similar dev-only props
  - [x] Update tests that reference metadataBadges

- [x] **Task: CX-2 — Make hint visibility mode-driven**
  - [x] Write failing test: CategorizationList must not render a hint toggle checkbox
  - [x] Remove the "Show context hints" checkbox from CategorizationList
  - [x] Drive hint visibility from `mode` prop: always on for teaching/guided, always off for independent/assessment
  - [x] Replace raw `JSON.stringify(details)` hint rendering with human-readable text

- [x] **Task: CX-4 — Verify production renderers start empty**
  - [x] Audit production activity wrappers (AccountCategorization and others) for initial state
  - [x] Write tests confirming guided and assessment modes initialize with empty `defaultValue`
  - [x] Fix any wrappers that pre-fill answers in student-facing modes

- [x] **Task: Phase 1 verification**
  - [x] Run `npm run lint`
  - [x] Run `npm test`
  - [x] Verify preview page still renders all families correctly

## Phase 2: Visual Language

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
  - [ ] Verify all StatementLayout consumers (Q, E, N, J-calculation) render correctly

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

- [ ] **Task: Phase 2 verification**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test`
  - [ ] Run `npm run build`
  - [ ] Visual review of all redesigned components in the preview page

## Phase 3: Teaching Mode and Feedback Quality

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

- [ ] **Task: Phase 3 verification**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test` — full suite
  - [ ] Run `npm run build`
  - [ ] Visual review of teaching mode in the preview page

## Phase 4: Curriculum Sequencing Documentation

> Document the pedagogical progressions identified in the review for teacher-facing curriculum materials.

### Tasks

- [ ] **Task: Document practice family progressions**
  - [ ] Add sequencing guidance to curriculum-facing materials
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
