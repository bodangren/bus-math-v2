# Implementation Plan: Statement and Computation Practice Families (B, D, E, I, J, N, O, Q)

## Phase 1 — Shared Infrastructure: Adjustment Scenario Generator

- [x] Task: Build adjustment scenario generator (`lib/practice/engine/adjustments.ts`)
    - [x] Write unit tests: deferral scenarios (asset/expense method), accrual scenarios, depreciation scenarios (straight-line, variable salvage), date math, deterministic per seed
    - [x] Implement deferral generator with parameters: account label, original amount, start date, coverage period, reporting date, initial recording method
    - [x] Implement depreciation generator with parameters: asset category, cost, salvage value, useful life, purchase date, reporting date, method
    - [x] Verify: `npm run lint` and tests pass

## Phase 2 — Equation and Balance Families (B, I)

- [x] Task: Build Family B generator, solver, and grader (`lib/practice/engine/families/accounting-equation.ts`)
    - [x] Write unit tests: generates consistent financial state from mini-ledger, hides 1+ fields, solver finds missing values, grader with numeric tolerance
    - [x] Implement generator, solver, and grader
    - [x] Verify: `npm run lint`, `npm test`, and `npm run build` pass

- [x] Task: Wire Family B to practice.v1 envelope and UI
    - [x] Write integration test: full round-trip
    - [x] Implement toEnvelope, register familyKey `accounting-equation`
    - [x] Implement equation layout with numeric inputs
    - [x] Update preview route
    - [x] Verify: `npm run lint`, `npm test`, and `npm run build` pass

- [x] Task: Build Family I generator, solver, and grader (`lib/practice/engine/families/posting-balances.ts`)
    - [x] Write unit tests: starting balances + posting sequence, solver computes signed ending balances, grader scores per-account
    - [x] Implement generator, solver, and grader
    - [x] Verify: `npm run lint`, `npm test`, and `npm run build` pass

- [x] Task: Wire Family I to practice.v1 envelope and UI
    - [x] Write integration test: full round-trip
    - [x] Implement toEnvelope, register familyKey `posting-balances`
    - [x] Implement account-list numeric input layout
    - [x] Update preview route
    - [x] Verify: `npm run lint`, `npm test`, and `npm run build` pass

- Phase 2 completed on 2026-03-20 after verifying the shared equation and balance families with the full test suite and production build.

## Phase 3 — Statement Families (D, E, Q)

- [ ] Task: Build Family D generator, solver, and grader (`lib/practice/engine/families/statement-completion.ts`)
    - [ ] Write unit tests: generates full statement from mini-ledger, blanks selected rows, solver fills blanks, grader scores per-row
    - [ ] Implement generator for income statement, balance sheet, and equity statement variants
    - [ ] Implement solver and grader
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family D to practice.v1 envelope and StatementLayout UI
    - [ ] Write integration test: full round-trip with prefilled + editable rows
    - [ ] Implement toEnvelope, register familyKey `statement-completion`
    - [ ] Implement adapter to StatementLayout props
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build Family E generator, solver, and grader (`lib/practice/engine/families/statement-construction.ts`)
    - [ ] Write unit tests: generates flat account list from mini-ledger, solver determines correct placement + order + totals, grader distinguishes placement vs arithmetic errors
    - [ ] Implement generator with advanced variants (contra assets, temporary account exclusion)
    - [ ] Implement solver and grader
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family E to practice.v1 envelope and StatementLayout UI
    - [ ] Write integration test: full round-trip with account bank + blank template
    - [ ] Implement toEnvelope, register familyKey `statement-construction`
    - [ ] Implement adapter to StatementLayout props (blank template mode)
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build Family Q generator, solver, and grader (`lib/practice/engine/families/statement-subtotals.ts`)
    - [ ] Write unit tests: generates full statement then blanks subtotal lines, solver infers dependent subtotals, grader scores per-line
    - [ ] Implement generator supporting service and retail income statements, equity statements
    - [ ] Implement solver and grader with dependent-subtotal awareness
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family Q to practice.v1 envelope and StatementLayout UI
    - [ ] Write integration test: full round-trip
    - [ ] Implement toEnvelope, register familyKey `statement-subtotals`
    - [ ] Implement adapter to StatementLayout props
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

## Phase 4 — Adjustment, Depreciation, and Merchandising Families (J, N, O)

- [ ] Task: Build Family J generator, solver, and grader (`lib/practice/engine/families/adjusting-calculations.ts`)
    - [ ] Write unit tests: generates deferral/accrual/depreciation scenarios, solver computes adjustment amounts, grader with numeric tolerance, delegates to JournalEntryTable when entry is required
    - [ ] Implement generator consuming adjustment scenario generator
    - [ ] Implement solver and grader
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family J to practice.v1 envelope and UI
    - [ ] Write integration test: numeric-only and journal-entry variants
    - [ ] Implement toEnvelope, register familyKey `adjusting-calculations`
    - [ ] Implement dual UI mode: numeric fields for calculation problems, JournalEntryTable for entry problems
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build Family N generator, solver, and grader (`lib/practice/engine/families/depreciation-presentation.ts`)
    - [ ] Write unit tests: asset register generation, land contrast case, direct vs derived presentation, solver computes net book values and section totals
    - [ ] Implement generator consuming adjustment scenario generator for depreciation
    - [ ] Implement solver and grader
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family N to practice.v1 envelope and StatementLayout UI
    - [ ] Write integration test: PP&E balance sheet section rendering
    - [ ] Implement toEnvelope, register familyKey `depreciation-presentation`
    - [ ] Implement adapter to StatementLayout props (PP&E section)
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build Family O generator, solver, and grader (`lib/practice/engine/families/merchandising-computation.ts`)
    - [ ] Write unit tests: discount eligibility, freight allocation, amount due/received, net sales, gross profit, COGS under periodic inventory
    - [ ] Implement generator consuming merchandising parameters (from Journal/Transaction track or local)
    - [ ] Implement solver and grader for multi-step numeric results
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family O to practice.v1 envelope and UI
    - [ ] Write integration test: numeric fields and multi-step income statement via StatementLayout
    - [ ] Implement toEnvelope, register familyKey `merchandising-computation`
    - [ ] Implement dual UI: numeric inputs for single-answer problems, StatementLayout for income statement problems
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

## Phase 5 — Final Verification

- [ ] Task: Update family key registry and final verification
    - [ ] Update practice-component-contract.md: mark families B, D, E, I, J, N, O, Q as `implemented`
    - [ ] Run `npm run lint`, `npm test`, and `vinext build`
    - [ ] Verify all acceptance criteria are met
    - [ ] Update lessons-learned.md and tech-debt.md if warranted
