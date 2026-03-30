# Implementation Plan: Curriculum Rollout

## Phase 1: Audit Current Curriculum Wiring ✅ COMPLETE

### Current Findings

**Practice Engine Status**: 19 families registered and ready (A-U complete)
**Activity Integration Status**: Partial
- TrialBalanceErrorMatrix uses practice families directly ✓
- Most drag-drop activities use `activity.componentKey` as family key
- JournalEntryActivity hardcodes 'journal-entry-building' family
- Activities use PracticeMode types but mostly static scenarios

**Key Discovery**: Curriculum uses activity component keys (e.g., 'journal-entry-building', 'account-categorization') which are mapped to family keys in submissions. No direct family key references in curriculum manifests.

### Audit Results

- [x] **Task: Audit Unit 1-8 + Capstone family key references**
  - [x] Reviewed curriculum manifest structure
  - [x] Documented activity-to-family mapping approach
  - [x] Verified: No deprecated keys (D, O standalone) in live code
  - [x] Verified: All curriculum config tests pass
  - [x] Finding: Component keys used, family keys assigned at submission layer

## Phase 2: Verify Activity-to-Family Wiring

### Goal

Ensure all activity components use the correct family keys in their practice submissions.

### Tasks

- [~] **Task: Verify drag-drop activities use correct family keys**
  - [ ] AccountCategorization → 'account-categorization' ✓
  - [ ] FinancialStatementMatching → 'financial-statement-matching' (should be 'statement-construction'?)
  - [ ] TrialBalanceSorting → 'trial-balance-sorting' (should be 'trial-balance-errors'?)
  - [ ] GeneralDragAndDrop → uses componentKey dynamically
  - [ ] BreakEvenComponents → 'break-even-components' (should be 'cvp-analysis'?)
  - [ ] BudgetCategorySort → 'budget-category-sort' (should be 'financial-analysis'?)
  - [ ] CashFlowTimeline → 'cash-flow-timeline' 
  - [ ] InventoryFlowDiagram → 'inventory-flow-diagram'
  - [ ] PercentageCalculationSorting → 'percentage-calculation-sorting'
  - [ ] RatioMatching → 'ratio-matching' (should be 'financial-analysis'?)

- [ ] **Task: Verify specialized activities**
  - [ ] JournalEntryActivity currently hardcodes 'journal-entry-building'
  - [ ] Should use 'journal-entry' family from registry
  - [ ] Check if activity props should include familyKey

- [ ] **Task: Create family key alignment report**
  - [ ] Document current componentKey → family mappings
  - [ ] Identify mismatches between component and family names
  - [ ] Propose alignment strategy

## Phase 3: Alignment Implementation (if needed)

### Tasks

- [ ] **Task: Align component family keys with practice registry**
  - [ ] Update activities to use canonical family keys from registry
  - [ ] Ensure backward compatibility for existing submissions
  - [ ] Update component props schemas if needed

- [ ] **Task: Add family key validation**
  - [ ] Create validation to ensure all family keys exist in registry
  - [ ] Add tests for family key consistency

## Phase 4: Verification and Finalization

### Tasks

- [ ] **Task: Full regression test**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test` — all tests must pass
  - [ ] Run `npm run build` — production build must succeed

- [ ] **Task: Archive track**
  - [ ] Move track folder to `conductor/archive/`
  - [ ] Update `conductor/tracks.md`
  - [ ] Commit with message: `chore(conductor): Archive completed track`
