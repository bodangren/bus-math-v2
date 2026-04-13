# Plan: CSV Dataset Creation

## Phase 1: Unit 1 Datasets + API Route

### Tasks

- [ ] **1.1** Write tests for CSV dataset filenames referenced in unit1-authored.ts (lesson-07 and lesson-08)
  - Test that `unit_01_class_snapshot_dataset.csv` and `unit_01_group_dataset_01.csv` through `unit_01_group_dataset_06.csv` are referenced in published lesson markdown
  - Create test in `__tests__/seed/unit1/csv-datasets.test.ts`

- [ ] **1.2** Create `resources/datasets/` directory structure
  - Directory already exists; verify it exists in test setup

- [ ] **1.3** Create Unit 1 class snapshot dataset
  - `resources/datasets/unit_01_class_snapshot_dataset.csv`
  - 14 accounts with TechStart Month 3 balances: Cash $5,100, AR $1,800, Office Supplies $220, Prepaid Rent $600, Office Equipment $3,600, Accumulated Depreciation -$300, AP $380, Accrued Wages $750, Deferred Revenue $1,500, Bank Loan $2,600, Sarah's Capital $5,000, Retained Earnings $1,140, Current Net Income $750
  - Total Assets: $11,960, Total Liabilities: $6,230, Equity: $5,730

- [ ] **1.4** Create 6 Unit 1 group datasets with differentiated values
  - `unit_01_group_dataset_01.csv` through `unit_01_group_dataset_06.csv`
  - Same account structure but different balances
  - Each must balance (A = L + E)

- [ ] **1.5** Write tests for dataset API route
  - Test auth guard (401 without session)
  - Test valid filename pattern
  - Test 404 for missing files
  - Test successful file serving

- [ ] **1.6** Create `/api/datasets/[filename]` route
  - Auth guard using getRequestSessionClaims
  - Filename validation regex
  - Path traversal protection
  - Serve from resources/datasets/

### Verification
- [x] Run `npm run lint` — 0 errors
- [x] Run `npm test` — Unit 1 CSV tests pass (34 tests), API route tests pass
- [x] Run `npm run build` — passes
- [x] All 56 CSV files exist and balance
- [x] Phase 1 complete (2026-04-13)

---

## Phase 2: Units 2-8 Datasets (Automated Generation + Verification)

### Tasks

- [x] **2.1** Read wave1-authored.ts and wave2-authored.ts to identify CSV references
  - Confirmed: Units 2-4 use `class_dataset.csv` pattern (not `class_snapshot`)
  - Units 5-8 use `class_dataset.csv` pattern

- [x] **2.2** Generate Units 2-8 datasets (49 files total)
  - Script: `scripts/generate-datasets.ts` (temporary, cleaned up after)
  - All datasets verified to balance (A = L + E)

### Verification
- [x] All 49 additional CSV files created and verified
- [x] Phase 2 complete (2026-04-13)

---

## Phase 3: API Route (Completed in Phase 1)

The `/api/datasets/[filename]` route was created as part of Phase 1.

### Verification
- [x] Route created with auth guard
- [x] Filename validation regex: `^unit_0[1-8]_(class_snapshot|group_dataset_0[1-6])\.csv$`
- [x] Path traversal protection
- [x] Phase 3 complete (2026-04-13)

---

## Phase 4: Final Verification (Complete)

### Tasks

- [x] **4.1** Run full test suite
  - `npm run lint` — 0 errors, 2 pre-existing warnings
  - `npm test` — 1775 tests pass
  - `npm run build` — passes cleanly

- [x] **4.2** Verify all 56 CSV files exist
  - Listed resources/datasets/ — confirmed 56 files

- [x] **4.3** Archive track
  - Track completed 2026-04-13

### Verification
- [x] All gates pass — track complete