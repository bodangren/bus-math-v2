# Spec: Journal Entry and Transaction Practice Families (C, F, H, L, P)

## Overview

Implement five problem families unified by transaction analysis and journal-entry recording. This track builds the **transaction event library** — a typed catalog of transaction archetypes with account effects — and the **merchandising timeline generator** as shared infrastructure consumed by all five families. The primary UI components are JournalEntryTable and SelectionMatrix from the foundation track.

## Families

### Family C — Transaction Effects on Accounts
- **familyKey**: `transaction-effects`
- Students analyze how a transaction changes accounts, categories, and owner's equity
- Generator draws from the transaction event library
- One transaction may require multiple graded outputs: which accounts affected, direction, amount, equity reason
- UI: SelectionMatrix (rows: accounts or categories; columns: increase/decrease/no effect)

### Family F — Transaction Matrix and Composite Transaction Analysis
- **familyKey**: `transaction-matrix`
- Students analyze one transaction through a compound table or scaffolded reasoning path
- Uses same event engine as Family C but exposes answer through a structured instructional interface
- Captures intermediate reasoning (which accounts, direction, amount, equity reason) rather than only the final journal entry
- UI: SelectionMatrix (multi-column grid)

### Family H — Journal Entry Recording
- **familyKey**: `journal-entry`
- Students produce formal journal entries from transaction narratives
- Covers: ordinary transactions, adjusting entries, closing entries, correcting entries, reversing entries, merchandising entries (seller and buyer)
- Uses a transaction ontology with categories: service, owner, asset purchase, liability settlement, accrual/deferral adjustment, depreciation, closing, correcting, reversing, merchandising sale/purchase, return/allowance, discount settlement
- UI: JournalEntryTable (data-driven, multi-date support)

### Family L — Closing, Correcting, and Reversing Cycle Decisions
- **familyKey**: `cycle-decisions`
- Students reason about period-end mechanics: which entries to close, which to reverse, how to correct errors
- Generator models account status at period end (adjusted trial balance, net income, drawing, accrued items)
- Includes selection tasks (which entries should be reversed?) and journal-entry tasks (prepare the closing/correcting/reversing entry)
- UI: SelectionMatrix for decisions, JournalEntryTable for entry preparation

### Family P — Merchandising Journal Entries (Seller and Buyer)
- **familyKey**: `merchandising-entries`
- Students record merchandising transactions under perpetual inventory with returns, discounts, and freight
- Driven by the merchandising timeline generator: original sale/purchase -> return/allowance -> collection/payment
- Seller-side entries need both revenue-side and inventory-side lines
- Buyer-side gross vs net method changes payment logic
- UI: JournalEntryTable (multi-date)

## Functional Requirements

### FR-1: Transaction Event Library (`lib/practice/engine/transactions.ts`)
- Typed catalog of transaction archetypes:
  - owner invests cash, business earns revenue (cash/on-account), collects receivable, pays payable, pays expense, purchases supplies/equipment (cash/on-account), receives cash in advance, owner withdraws
- Each archetype stores: affected accounts, direction of change, amount rule, equity effect classification
- Supports variant generation by changing: account labels, dollar amounts, cash vs on-account, service vs merchandise context

### FR-2: Merchandising Timeline Generator (`lib/practice/engine/merchandising.ts`)
- Produces a timeline of events: original sale/purchase, return/allowance, collection/payment
- Parameters: role (seller/buyer), inventory system (perpetual), discount method (gross/net), sale/purchase amount, cost amount, discount terms, return amount, payment timing, freight details, FOB condition
- Solver processes timeline in order, emits journal lines per date
- Deterministic given seed

### FR-3: Family Generators, Solvers, and Graders
- Each family implements ProblemFamily interface from foundation track
- Family H solver supports: balance checking, row-level grading, equivalent-entry tolerance (especially for correcting entries)
- Family L generator tags each adjustment with "reversing recommended" property
- Family P solver handles paired revenue/inventory entries for seller-side perpetual

### FR-4: Curriculum Integration
- All five families registered in activity registry with familyKeys
- All emit practice.v1 submission envelopes
- Preview route updated with sample problems from each family

## Non-Functional Requirements

- Transaction event library and merchandising timeline generator are server-safe (no DOM)
- Generators deterministic given seed
- Journal entry grading supports tolerance for equivalent valid entries
- No new dependencies

## Acceptance Criteria

1. Transaction event library covers all archetypes listed in FR-1, each generating valid problems
2. Merchandising timeline generator produces correct seller and buyer timelines for 10+ seeds
3. Each of the five family generators produces valid problems, solvers produce correct answers, graders score per-part
4. Journal entry grading correctly handles balance validation and equivalent entries
5. All families round-trip through practice.v1 envelope building
6. UI renders correctly via JournalEntryTable/SelectionMatrix on preview route
7. Family key registry updated to `implemented` for C, F, H, L, P
8. `npm run lint`, `npm test`, and `npm run build` pass

## Out of Scope

- Adjusting entry scenarios beyond what's needed for closing/reversing context (owned by Statement & Computation track, Family J)
- Curriculum lesson wiring
- Persistence changes
