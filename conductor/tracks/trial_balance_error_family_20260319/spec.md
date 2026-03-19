# Spec: Trial Balance Error Analysis Family (G)

## Overview

Implement Family G — a specialized problem family where students reason about whether recording or posting errors affect trial-balance equality and by how much. This family is isolated into its own track because it requires a dedicated **error pattern library** distinct from the transaction and adjustment generators used by other families.

## Family G — Trial Balance Errors and Error Analysis
- **familyKey**: `trial-balance-errors`
- Students analyze error scenarios presented in a multi-column matrix:
  - Will the trial balance still balance?
  - If not, what is the amount of the difference?
  - Which column (debit or credit) becomes larger?
- Strong for infinite generation because the conceptual rule stays stable while amounts and error mechanisms vary widely

## Functional Requirements

### FR-1: Error Pattern Library (`lib/practice/engine/errors.ts`)
- Typed catalog of error archetypes:
  - Posting a correct amount to the wrong side
  - Posting one side with the wrong amount
  - Posting one side twice
  - Posting both sides with the same wrong amount
  - Omitting one side entirely
  - Transposition error in a single amount
  - Slide error in a single amount
- Each archetype stores:
  - Original correct entry (accounts, amounts, sides)
  - Error type identifier
  - Which side or account the error affects
  - Correct amount vs erroneous amount
- Supports variant generation by changing the underlying correct entry, dollar amounts, and error parameters

### FR-2: Family G Generator
- `generate(seed, config)` produces: a set of error scenarios (typically 3-6 per problem), each with a narrative description and the underlying error data
- Config controls: number of scenarios, error type mix, amount ranges, whether to include scenarios that still balance
- Deterministic given seed

### FR-3: Family G Solver
- For each scenario, determines:
  - Whether debits still equal credits after the error
  - If not, the numerical difference
  - Whether the debit or credit total is larger
- Must handle compound cases (e.g., transposition where the difference is always divisible by 9)

### FR-4: Family G Grader
- Scores per-scenario with three graded parts: still-balanced (boolean), difference amount (numeric with tolerance), larger column (debit/credit/N/A)
- Misconception tags for: confusing transposition with slide errors, forgetting that both-sides-wrong can still balance, assuming omission always creates a debit-heavy imbalance

### FR-5: Curriculum Integration
- Registered in activity registry with familyKey `trial-balance-errors`
- Emits practice.v1 submission envelope
- Preview route updated with sample problem

## Non-Functional Requirements

- Error pattern library is server-safe
- Generator deterministic given seed
- No new dependencies

## Acceptance Criteria

1. Error pattern library covers all seven listed archetypes
2. Generator produces valid multi-scenario problems for 10+ seeds
3. Solver correctly determines balance/imbalance, difference, and larger column for all archetypes
4. Grader scores per-scenario with appropriate misconception tags
5. Family round-trips through practice.v1 envelope building
6. UI renders correctly via SelectionMatrix (rows: scenarios, columns: balanced?/difference/larger) on preview route
7. Family key registry updated to `implemented` for G
8. `npm run lint`, `npm test`, and `npm run build` pass

## Out of Scope

- Integration with trial balance construction or posting families (those are separate families I and E)
- Curriculum lesson wiring
- Persistence changes
