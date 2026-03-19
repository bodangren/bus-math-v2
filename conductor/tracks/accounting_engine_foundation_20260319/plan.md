# Implementation Plan: Accounting Domain Engine Foundation

## Phase 1 — Account Ontology and Engine Types

- [x] Task: Define practice engine types (`lib/practice/engine/types.ts`)
    - [x] Write unit tests for ProblemFamily interface contract (type-level and runtime shape validation)
    - [x] Implement ProblemFamily<TDefinition, TResponse> generic interface
    - [x] Implement GradeResult type with per-part scoring and misconception tags
    - [x] Implement toEnvelope helper type that maps to PracticeSubmissionEnvelope
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build account ontology (`lib/practice/engine/accounts.ts`)
    - [x] Write unit tests: lookup helpers (byType, byStatement, byNormalBalance, isContra), minimum 40 accounts, all required metadata fields present
    - [x] Implement typed account record and static account array (>=40 accounts covering service and retail)
    - [x] Implement lookup helpers
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build mini-ledger generator (`lib/practice/engine/mini-ledger.ts`)
    - [x] Write unit tests: determinism (same seed -> same output), A = L + OE balance invariant, configurable complexity (account count, contra accounts, beginning/ending capital)
    - [x] Implement seeded random utility (or reuse existing)
    - [x] Implement MiniLedger type and generator function
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Implement reference ProblemFamily for contract conformance
    - [x] Write integration test: generate -> solve -> grade -> toEnvelope round-trip produces valid practice.v1 envelope
    - [x] Implement a trivial reference family (e.g., a single-part accounting-equation problem using the mini-ledger)
    - [x] Verify: `npm run lint` and `npm test` pass (broad run — touches shared contract)

## Phase 2 — Compound UI Components

- [x] Task: Build SelectionMatrix component (`components/activities/shared/SelectionMatrix.tsx`)
    - [x] Write component tests: renders rows x columns, radio vs checkbox mode, emits selected values, read-only and graded-feedback states, keyboard navigation
    - [x] Implement SelectionMatrix with shadcn primitives (checkbox, label) + ARIA grid role
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build StatementLayout component (`components/activities/shared/StatementLayout.tsx`)
    - [x] Write component tests: renders section headers and rows, editable vs prefilled vs computed cells, auto-subtotals, read-only and graded-feedback states
    - [x] Implement StatementLayout with shadcn primitives (input, card) + table semantics
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build JournalEntryTable component (`components/activities/shared/JournalEntryTable.tsx`)
    - [x] Write component tests: renders account/debit/credit columns, accepts generated account list, balance validation, row-level grading feedback, multi-date entries, keyboard navigation
    - [x] Implement data-driven JournalEntryTable with shadcn primitives
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Refactor CategorizationList (`components/activities/shared/CategorizationList.tsx`)
    - [x] Write component tests: accepts generator-shaped input (items with IDs, target zones, hint metadata), preserves existing drag-drop UX
    - [x] Extract reusable CategorizationList from existing AccountCategorization, accepting generic generator output
    - [x] Update AccountCategorization to delegate to new CategorizationList
    - [x] Verify: `npm run lint` and tests pass; existing categorization activities still work

## Phase 3 — Preview Route and Documentation

- [x] Task: Create practice preview route (`/dev/practice-preview`)
    - [x] Create dev-guarded page rendering all four compound UI components with sample mini-ledger data
    - [x] One section per component with representative props (editable, read-only, graded states)
    - [x] Verify: route renders without errors in dev mode; not reachable in production build

- [x] Task: Update family key registry in practice-component-contract.md
    - [x] Add family key table listing all 17 families (A-Q) with familyKey, status, UI component dependency, generator dependency
    - [x] Mark foundation-track deliverables as `foundation`; all others as `planned`
    - [x] Verify: table is complete and consistent with spec sheet family list

- [x] Task: Final verification
    - [x] Run `npm run lint`, `npm test`, and `vinext build`
    - [x] Verify all acceptance criteria are met
    - [x] Update lessons-learned.md and tech-debt.md if warranted
