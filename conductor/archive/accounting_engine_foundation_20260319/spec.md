# Spec: Accounting Domain Engine Foundation

## Overview

Build the shared infrastructure that all algorithmic practice families (A-Q) depend on: a typed account ontology, a mini-ledger fact generator, a practice engine interface contract, and four reusable compound UI components. This track produces no student-facing features directly but unblocks all subsequent family implementation tracks.

## Functional Requirements

### FR-1: Account Ontology (`lib/practice/engine/accounts.ts`)
- Static typed array of accounting accounts, each with:
  - label, accountType (asset | liability | equity | revenue | expense)
  - normalBalance (debit | credit)
  - statementPlacement (balance-sheet | income-statement | equity-statement)
  - contraOf (optional reference to parent account)
  - retailApplicable (boolean)
  - subcategory (e.g., current-asset, long-term-liability, operating-expense)
  - commonConfusionPairs (optional, for difficulty scaling)
- Lookup helpers: byType, byStatement, byNormalBalance, isContra
- Minimum 40 accounts covering all families A-Q scope (service and retail)

### FR-2: Mini-Ledger Generator (`lib/practice/engine/mini-ledger.ts`)
- Accepts a seed and difficulty config
- Produces a coherent financial snapshot: account balances that satisfy A = L + OE
- Supports configurable complexity: number of accounts, presence of contra accounts, beginning vs ending capital
- Deterministic given the same seed (reproducible for tests and grading)
- Output shape is a typed `MiniLedger` consumed by family generators

### FR-3: Practice Engine Interface (`lib/practice/engine/types.ts`)
- Generic `ProblemFamily<TDefinition, TResponse>` interface:
  - `generate(seed, config) -> TDefinition` (produces the problem)
  - `solve(definition) -> TResponse` (produces canonical answer)
  - `grade(definition, studentResponse) -> GradeResult` (part-level scoring with misconception tags)
  - `toEnvelope(definition, studentResponse, gradeResult) -> PracticeSubmissionEnvelope`
- `GradeResult` type with per-part: isCorrect, score, maxScore, misconceptionTags
- All families implemented in later tracks must conform to this interface

### FR-4: Compound UI Components (`components/activities/shared/`)

#### FR-4a: SelectionMatrix
- Rows x columns grid with radio (exclusive) or checkbox (multi-select) per cell
- Accepts: row labels, column labels, selection mode per row
- Emits: selected values keyed by row ID
- Supports: read-only mode, correct/incorrect highlighting, teacher-view overlay

#### FR-4b: StatementLayout
- Labeled rows with section headers, editable numeric cells, and auto-computed subtotals
- Accepts: statement template (sections -> rows), which rows are editable vs prefilled vs computed
- Emits: student-entered values keyed by row ID
- Supports: read-only mode, correct/incorrect highlighting, blank-target variation

#### FR-4c: JournalEntryTable
- Data-driven journal entry table accepting generated transaction data
- Accepts: available accounts list, expected line count, date visibility, hints config
- Emits: array of {date?, accountId, debit?, credit?} lines
- Supports: balance validation, row-level grading feedback, multi-date entries, keyboard navigation
- Replaces hardcoded JournalEntryActivity scenario logic with generator-driven input

#### FR-4d: CategorizationList (refactor)
- Refactor existing AccountCategorization to accept generator output directly
- Accepts: items with IDs, target zone IDs, optional hint/confusion metadata
- No change to drag-drop UX; the change is in the input contract

### FR-5: Family Key Registry
- Update `conductor/curriculum/practice-component-contract.md` with a family key table:
  - familyKey (e.g., `classification`, `accounting-equation`, `journal-entry`, etc.)
  - status (planned | foundation | implemented)
  - UI component dependency
  - generator dependency
- This becomes the traceability surface for what's built and what's pending

### FR-6: Highlights Preview Route
- Dev-only route (e.g., `/dev/practice-preview`) rendering each compound UI component with sample mini-ledger data
- One section per component, with representative props
- Not shipped to production; guarded behind dev mode or feature flag

## Non-Functional Requirements

- All generators must be deterministic given a seed
- UI components must be accessible (keyboard navigation, ARIA labels for grids/tables)
- No new npm dependencies without explicit approval
- Engine modules must be server-safe (no DOM, no React imports) so they can run in Convex actions or test harnesses

## Acceptance Criteria

1. Account ontology contains >=40 accounts covering service and retail domains with all required metadata fields
2. Mini-ledger generator produces balanced snapshots that pass A = L + OE for any seed
3. ProblemFamily interface is exported and documented; at least one trivial reference implementation exists for test purposes
4. All four compound UI components render correctly on the preview route with sample data
5. Each UI component supports read-only, editable, and graded-feedback states
6. Contract conformance tests prove that the reference family implementation round-trips through practice.v1 envelope building
7. Family key registry in practice-component-contract.md lists all 17 families with status and dependencies
8. `npm run lint`, `npm test`, and `npm run build` all pass

## Out of Scope

- Actual family generators beyond the reference implementation (those belong to subsequent tracks)
- Transaction event library, merchandising timeline generator, adjustment scenario generator (built by consuming tracks)
- Convex schema changes or persistence updates (owned by the Evidence track)
- Teacher review surfaces (owned by the Evidence track)
- Production routing of the preview page
