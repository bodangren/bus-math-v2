# Track: CSV Dataset Creation

## Overview

Create real CSV datasets referenced by the curriculum for Lessons 7 and 8 across all 8 units. Each unit needs one class snapshot dataset and six group datasets. These datasets are the classroom-ready gap preventing the curriculum from functioning as a complete product.

## Functional Requirements

1. **Unit 1 Datasets** (TechStart running case)
   - `unit_01_class_snapshot_dataset.csv` — 14 accounts with balances matching the Month 3 validated ledger
   - `unit_01_group_dataset_01.csv` through `unit_01_group_dataset_06.csv` — 6 differentiated datasets with different account balances but same structure

2. **Units 2-4 Datasets** (Wave 1)
   - Each unit: 1 class dataset + 6 group datasets
   - Datasets must be pedagogically coherent with the unit's accounting theme

3. **Units 5-8 Datasets** (Wave 2)
   - Each unit: 1 class dataset + 6 group datasets
   - Datasets must be pedagogically coherent with the unit's accounting theme

4. **API Route** for serving datasets
   - `/api/datasets/[filename]` route for authenticated access
   - Valid filename pattern: `unit_0[N]_(class_snapshot|group_dataset_[0-9][0-9])\.csv`
   - Return 404 for missing files
   - Serve with `text/csv` content type

## Non-Functional Requirements

- All datasets must balance (Assets = Liabilities + Equity) or be intentionally unbalanced for teaching error detection
- Class datasets should be clean and complete; group datasets can vary in difficulty
- CSV format: header row + data rows, no trailing whitespace, UTF-8 encoding
- Datasets stored in `resources/datasets/` directory

## Acceptance Criteria

- All 56 CSV files exist in `resources/datasets/` (7 datasets × 8 units)
- API route serves files correctly with auth guard
- Unit 1 datasets match the TechStart case with $11,960 total assets
- All datasets pass a balance validation check (balance sheet equation or intentional error flag)
- Existing tests that reference these filenames pass
- `npm run lint` passes
- `npm test` passes (including published-manifest tests that assert CSV filename presence)
- `npm run build` passes

## Out of Scope

- Real PDF content (placeholder PDFs exist)
- Chatbot rate limiting upgrade
- Harness crypto import cleanup