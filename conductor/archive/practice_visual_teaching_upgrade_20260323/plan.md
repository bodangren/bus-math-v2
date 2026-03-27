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

- [x] **Task: CX-5 — Redesign StatementLayout**
  - [x] Study 1ed components (`IncomeStatementSimple`, `BalanceSheetSimple`) for visual conventions
  - [x] Write snapshot/visual test for the redesigned layout
  - [x] Implement indentation hierarchy: line items indented under section headers, subtotals outdented
  - [x] Implement two-column amount layout: inner column for line items, outer column for section totals
  - [x] Implement single/double underline convention: single before subtotal, double under final total
  - [x] Implement centered header block: company name, statement name, period
  - [x] Apply `tabular-nums` formatting and parenthesized negatives
  - [x] Verify all StatementLayout consumers (Q, E, N, J-calculation) render correctly

- [x] **Task: CX-5 — Redesign JournalEntryTable**
  - [x] Study real journal page conventions for visual reference
  - [x] Write snapshot/visual test for the redesigned layout
  - [x] Implement debit account at normal indent, credit account indented further
  - [x] Implement two-column amount layout (debit column, credit column)
  - [x] Implement ruling lines between journal entries
  - [x] Implement date column with grouped-date header treatment
  - [x] Verify all JournalEntryTable consumers (H, J-journal, L, P) render correctly

- [x] **Task: A-1 — Redesign CategorizationList for A=L+E layout**
  - [x] Write failing test: account-type categorySet renders Assets in left column, L+E stacked in right column
  - [x] Implement two-column layout for `account-type` (5 buckets): Assets left, Liabilities/Equity right, Revenue/Expenses below equity
  - [x] Implement two-column layout for `statement-placement` (3 buckets): Balance Sheet left, Income Statement right
  - [x] Keep `permanent-temporary` (2 buckets) as left/right split
  - [x] CX-3: Add subtle zone tint colors per category
  - [x] Verify drag-and-drop and keyboard select still work in the new layout

- [x] **Task: I-1 — Build interactive T-account component**
  - [x] Write failing tests for T-account rendering and interaction
  - [x] Build `TAccountInteractive` component: debit-left / credit-right spatial layout, classic T shape
  - [x] Support editable balance cells with numeric input
  - [x] Replace PostingBalanceList with TAccountInteractive in Family I
  - [x] Update family registry and preview page

- [x] **Task: Phase 2 verification**
  - [x] Run `npm run lint`
  - [x] Run `npm test`
  - [x] Run `npm run build`
  - [x] Visual review of all redesigned components in the preview page

## Phase 3: Teaching Mode and Feedback Quality

> Add the missing teaching mode across all families. Upgrade feedback from "answer was X" to computation-chain explanations.

### Tasks

- [x] **Task: CX-1 — Add teaching mode to engine and components**
  - [x] Add `'teaching'` to the mode union type in `ProblemDefinition`
  - [x] Define teaching mode behavior: all hints/explanations always visible, step-by-step annotations, "next step" control for instructor
  - [x] Write failing tests: teaching mode definition includes visible hints and narration steps
  - [x] Implement teaching mode in engine config across all families
  - [x] Update shared components to render teaching chrome when `mode === 'teaching'`

- [x] **Task: Implement computation-chain feedback — Families J, Q**
  - [x] Write failing test: J deferral feedback includes intermediate values ("$1,200 × (3/12) = $300")
  - [x] Write failing test: J depreciation feedback includes the full chain ("($4,800 − $480) ÷ 36 × 3 = $360")
  - [x] Write failing test: Q feedback includes dependent chain ("Total Revenues ($8,400) − Total Expenses ($5,250) = Net Income ($3,150)")
  - [x] Update feedback builders to interpolate scenario/definition intermediate values
  - [x] Implement for Q retail variant (conditional discount reasoning from O-5)

- [x] **Task: Implement computation-chain feedback — Families G, N, M**
  - [x] Write failing test: G transposition feedback explains divisible-by-9 rule with the actual numbers
  - [x] Write failing test: N derived feedback shows full depreciation chain
  - [x] Write failing test: M non-contra feedback explains the normal balance rule ("Revenue increases equity → credit side")
  - [x] Update feedback builders for G, N, M

- [x] **Task: Per-family pedagogical enhancements**
  - [x] M-1: Add DEA-LER mnemonic rendering at three detail levels by mode
  - [x] G-3: Add divisible-by-9 explanation in teaching mode ("10a + b vs 10b + a → 9|a−b|")
  - [x] K-1: Implement row subsetting (3–4 of 6 elements per instance) and directional variations (over-adjustment, double-recording)
  - [x] G-2: Suppress `whatToDecideFirst` hints in independent/assessment modes
  - [x] N-1: Default derived layout; reserve direct for teaching/warm-up only
  - [x] N-3: Expand asset categories from 2 to 4+ (add Vehicles, Furniture, Computers)
  - [x] H-1: Add difficulty progression metadata (`lineComplexity` or `eventCount`)
  - [x] I-2: Support multiple postings per account in Family I engine
  - [x] J-5: Add paired asset-vs-expense method comparison mode for teaching demos

- [x] **Task: Phase 3 verification**
  - [x] Run `npm run lint`
  - [x] Run `npm test` — full suite
  - [x] Run `npm run build`
  - [x] Visual review of teaching mode in the preview page

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
