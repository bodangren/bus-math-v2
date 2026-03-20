# Spec: Classification and Conceptual Practice Families (A, M, K)

## Overview

Implement three problem families that share a selection/categorization interaction pattern. All three use the account ontology and SelectionMatrix or CategorizationList UI components from the foundation track. These families produce the highest volume of low-complexity practice items and are the natural starting point after the engine foundation is in place.

## Families

### Family A — Classification and Statement Mapping
- **familyKey**: `classification`
- Students categorize accounts or items into groups (asset/liability/equity, revenue/expense, balance sheet/income statement, permanent/temporary, cash equivalents, inventory costs)
- Generator pulls from the account ontology with controlled contrast (confusion pairs)
- Supports variable option sets, variable item count, and difficulty scaling by conceptual similarity
- UI: CategorizationList (drag-drop) or SelectionMatrix (radio per row)

### Family M — Normal Balances and Account Nature
- **familyKey**: `normal-balance`
- Students identify debit/credit normal balances and conceptual nature of accounts
- Generator selects accounts from ontology with difficulty driven by confusing accounts (contra accounts, retail-specific accounts)
- UI: SelectionMatrix (two-column debit/credit)

### Family K — Effects of Missing Adjustments on Financial Statements
- **familyKey**: `adjustment-effects`
- Students determine overstatement, understatement, or no effect on statement elements when an adjusting entry is omitted
- Generator reuses adjustment scenario data (from Family J's generator interface, or a local simplified version if J is not yet available)
- Computes correct adjustment, then derives the consequence matrix
- UI: SelectionMatrix (rows: revenue, expense, net income, assets, liabilities, equity; columns: overstated, understated, no effect)

## Functional Requirements

### FR-1: Family A Generator and Solver
- `generate(seed, config)` produces: item list with labels, correct category per item, distractor categories, difficulty tier
- Config controls: category set, item count, confusion-pair density, whether categories are evenly distributed
- `solve()` returns canonical category assignments
- `grade()` scores per-item with misconception tags for common confusion pairs (e.g., prepaid insurance vs insurance expense)

### FR-2: Family M Generator and Solver
- `generate(seed, config)` produces: account list with labels, correct normal balance per account
- Config controls: account count, inclusion of contra accounts, retail vs service scope
- `solve()` returns debit/credit assignments
- `grade()` scores per-account with misconception tags for contra-account errors

### FR-3: Family K Generator and Solver
- `generate(seed, config)` produces: adjustment scenario description, correct adjustment, statement-element effect matrix
- Config controls: adjustment type (accrual, deferral, depreciation), complexity
- `solve()` returns the 6-element effect classification
- `grade()` scores per-element with misconception tags

### FR-4: Curriculum Integration
- Each family registered in the activity registry with its familyKey
- Each family emits practice.v1 submission envelopes via the ProblemFamily interface
- Preview route updated with sample problems from each family

## Non-Functional Requirements

- Generators deterministic given seed
- All families conform to ProblemFamily interface from foundation track
- No new dependencies

## Acceptance Criteria

1. Each family generator produces valid, balanced problems for 10+ different seeds
2. Each family solver produces correct answers verified by unit tests
3. Each family grader scores per-part with appropriate misconception tags
4. All three families round-trip through practice.v1 envelope building
5. UI renders correctly via SelectionMatrix/CategorizationList on preview route
6. Family key registry updated to `implemented` for A, M, K
7. `npm run lint`, `npm test`, and `npm run build` pass

## Out of Scope

- Adjustment scenario generator as a shared engine piece (that belongs to the Statement & Computation track for Family J; Family K may use a simplified local version)
- Curriculum lesson wiring (owned by Curriculum Rollout track)
- Persistence changes
