# Dead Code Pruning Plan

## Phase 1: Delete the 12 unregistered activity components
- [x] Delete components/activities/quiz/FeedbackCollector.tsx
- [x] Delete components/activities/accounting/TAccountSimple.tsx
- [x] Delete components/activities/accounting/TAccountDetailed.tsx
- [x] Delete components/activities/accounting/TAccountsVisualization.tsx
- [x] Delete components/activities/accounting/TrialBalance.tsx
- [x] Delete components/activities/accounting/TransactionJournal.tsx
- [x] Delete components/activities/reports/IncomeStatementSimple.tsx
- [x] Delete components/activities/reports/IncomeStatementDetailed.tsx
- [x] Delete components/activities/reports/CashFlowStatementSimple.tsx
- [x] Delete components/activities/reports/CashFlowStatementDetailed.tsx
- [x] Delete components/activities/reports/BalanceSheetSimple.tsx
- [x] Delete components/activities/reports/BalanceSheetDetailed.tsx

## Phase 2: Delete corresponding test files
- [x] Find and delete all test files for the deleted components

## Phase 3: Update tech-debt.md
- [x] Update tech-debt.md to mark the 12 unregistered components item as closed

## Phase 4: Verify
- [x] Run `npm run lint`
- [x] Run `npm test`
- [x] Run `npm run build`
