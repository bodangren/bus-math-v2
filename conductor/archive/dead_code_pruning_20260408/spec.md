# Dead Code Pruning Specification

## Overview
Remove 12 unregistered activity components that are only imported by tests and not used in production code.

## Functional Requirements
1. Delete the following files:
   - components/activities/quiz/FeedbackCollector.tsx
   - components/activities/accounting/TAccountSimple.tsx
   - components/activities/accounting/TAccountDetailed.tsx
   - components/activities/accounting/TAccountsVisualization.tsx
   - components/activities/accounting/TrialBalance.tsx
   - components/activities/accounting/TransactionJournal.tsx
   - components/activities/reports/IncomeStatementSimple.tsx
   - components/activities/reports/IncomeStatementDetailed.tsx
   - components/activities/reports/CashFlowStatementSimple.tsx
   - components/activities/reports/CashFlowStatementDetailed.tsx
   - components/activities/reports/BalanceSheetSimple.tsx
   - components/activities/reports/BalanceSheetDetailed.tsx
2. Delete any corresponding test files for these components
3. Update tech-debt.md to mark this item as closed

## Non-Functional Requirements
- `npm run lint` must pass
- `npm test` must pass (excluding any tests that only test deleted components)
- `npm run build` must pass

## Acceptance Criteria
- All 12 components are deleted
- All corresponding test files are deleted
- tech-debt.md is updated
- lint, test, and build all pass

## Out of Scope
- Modifying any other files
- Adding new features
