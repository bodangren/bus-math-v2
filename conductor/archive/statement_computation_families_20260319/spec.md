# Spec: Statement and Computation Practice Families (B, D, E, I, J, N, O, Q)

## Overview

Implement eight problem families unified by numeric computation and financial statement interaction patterns. This track builds the **adjustment scenario generator** (deferral, accrual, depreciation) as shared infrastructure. The primary UI components are StatementLayout and numeric Input from the foundation track, with the mini-ledger generator as the core data source for most families.

## Families

### Family B — Accounting Equation and Equation Completion
- **familyKey**: `accounting-equation`
- Students solve for missing amounts in the basic accounting equation or related statement equations
- Generator uses mini-ledger to produce a consistent underlying financial state, then hides one or more target fields
- UI: numeric input fields within an equation layout

### Family D — Financial Data Completion (Guided Statement Completion)
- **familyKey**: `statement-completion`
- Students compute missing values inside partially completed accounting statements
- Generator produces full statement from mini-ledger, then blanks selected rows
- Statement position matters: each row carries meaning
- UI: StatementLayout (prefilled rows + editable blanks)

### Family E — Full Financial Statement Construction
- **familyKey**: `statement-construction`
- Students build a complete financial statement from a flat account list
- Students must determine: which accounts belong, correct order/section, subtotals and totals
- Harder than Family D: includes account selection and placement, not just arithmetic
- Advanced variants: contra assets, beginning vs ending capital, temporary account exclusion
- UI: StatementLayout (blank template + account bank)

### Family I — Posting, Ending Balances, and Account-Level Computation
- **familyKey**: `posting-balances`
- Students compute ending balances after journalized amounts are posted
- Generator: starting balances + sequence of postings -> ask for ending balances of selected accounts
- Solver maintains signed debit/credit balances internally
- UI: numeric input fields per account

### Family J — Adjusting Entries and Deferral/Accrual Calculations
- **familyKey**: `adjusting-calculations`
- Students compute amounts for accruals, deferrals, and depreciation adjustments
- Richest family for algorithmic generation: prepaid expense (asset/expense method), accrued revenue, depreciation
- Generator parameters: account label, original amount, start date, coverage period, reporting date, initial recording method, recognition pattern
- Depreciation parameters: asset category, cost, salvage value, useful life, purchase date, reporting date, method
- UI: numeric calculation fields or journal entry (delegates to JournalEntryTable when entry is required)

### Family N — Depreciation, Contra Accounts, and Balance Sheet Presentation
- **familyKey**: `depreciation-presentation`
- Students present long-lived assets net of accumulated depreciation
- Generator produces an asset register: class, cost, accumulated depreciation, useful life, depreciable status
- Land creates contrast case (not depreciated)
- Direct presentation (depreciation given) and derived presentation (compute depreciation first)
- UI: StatementLayout (balance sheet PP&E section)

### Family O — Merchandising Computation
- **familyKey**: `merchandising-computation`
- Students compute payment amounts, discount eligibility, shipping responsibility, and retail income statement values
- Uses merchandising timeline parameters from the Journal/Transaction track's merchandising generator, but asks for numeric results instead of journal entries
- Same raw facts drive: discount applicability, freight responsibility, amount due, amount received, net sales, gross profit, net income, COGS
- UI: numeric input fields, multi-step income statement via StatementLayout

### Family Q — Statement Elements, Subtotals, and Multi-Step Retail Statements
- **familyKey**: `statement-subtotals`
- Students compute missing amounts in statement structures where subtotal logic matters
- Generator produces full statement, then blanks specific subtotal lines
- Difficulty scales by number of dependent subtotals that must be inferred
- Overlaps with D and O but isolates statement arithmetic and section logic
- UI: StatementLayout

## Functional Requirements

### FR-1: Adjustment Scenario Generator (`lib/practice/engine/adjustments.ts`)
- Generates deferral, accrual, and depreciation scenarios with full date/amount parameters
- Deferral parameters: account label, original amount, start date, coverage period, reporting date, initial recording method
- Depreciation parameters: asset category, cost, salvage value, useful life, purchase date, reporting date, method
- Deterministic given seed
- Reusable by Families J, K (from Classification track), and N

### FR-2: Family Generators, Solvers, and Graders (one per family)
- Each implements ProblemFamily interface from foundation track
- Family B: uses mini-ledger, hides 1+ fields, numeric grading with tolerance
- Family D: uses mini-ledger, generates statement with blanked rows, per-row grading
- Family E: uses mini-ledger, provides flat account list, grades placement + arithmetic
- Family I: generates starting balances + posting sequence, grades per-account ending balance
- Family J: uses adjustment scenario generator, grades numeric computation or delegates entry grading to JournalEntryTable
- Family N: generates asset register, grades PP&E section presentation
- Family O: consumes merchandising parameters (from Journal/Transaction track or local), grades multi-step numeric results
- Family Q: generates full statement then blanks subtotal lines, grades dependent-subtotal inference

### FR-3: Curriculum Integration
- All eight families registered in activity registry with familyKeys
- All emit practice.v1 submission envelopes
- Preview route updated with sample problems from each family

## Non-Functional Requirements

- Adjustment scenario generator is server-safe
- Mini-ledger consumption must not mutate the shared ledger instance
- Numeric grading supports configurable tolerance for rounding
- Statement grading distinguishes placement errors from arithmetic errors
- No new dependencies

## Acceptance Criteria

1. Adjustment scenario generator produces valid deferral, accrual, and depreciation scenarios for 10+ seeds
2. Each of the eight family generators produces valid problems, solvers produce correct answers, graders score per-part
3. Statement families (D, E, N, Q) correctly distinguish placement from arithmetic errors in grading
4. Numeric families (B, I, J, O) support tolerance-based grading
5. All families round-trip through practice.v1 envelope building
6. UI renders correctly via StatementLayout/Input on preview route
7. Family key registry updated to `implemented` for B, D, E, I, J, N, O, Q
8. `npm run lint`, `npm test`, and `npm run build` pass

## Out of Scope

- Transaction event library and merchandising timeline generator (owned by Journal/Transaction track; this track consumes their interfaces)
- Curriculum lesson wiring
- Persistence changes
