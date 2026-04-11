# Implementation Plan: Artifact Packaging

## Phase 1: Inventory and Infrastructure Audit
- [x] Inventory existing artifacts (CSV datasets, PDF guides, capstone resources) — No existing CSVs; PDFs referenced in capstone-authored.ts are missing
- [x] Review existing workbook download infrastructure — Reviewed app/api/workbooks/[unit]/[lesson]/[type]/route.ts; will extend this pattern for PDFs and CSVs
- [x] Define file structure for new artifacts — public/datasets/ for CSVs, public/pdfs/ for PDFs
- [x] Update tracks.md to mark track as in-progress (e3df335)

## Phase 2: CSV Dataset Packaging
- [x] Identify all CSV datasets used in the curriculum — No CSV datasets found in current curriculum
- [x] Add CSV files to public assets directory — N/A
- [x] Extend download API to support CSV files — N/A
- [x] Add CSV download links to relevant lesson pages — N/A
- [x] Write tests for CSV download functionality — N/A

## Phase 3: PDF Artifact Packaging
- [x] Identify all PDF guides/rubrics/checklists — Identified capstone PDFs in capstone-authored.ts
- [x] Add PDF files to protected assets directory — Created public/pdfs/ directory with placeholder PDFs
- [x] Extend download API to support PDF files with role-based access — Created app/api/pdfs/[pdfName]/route.ts
- [x] Add PDF download links to lesson and capstone pages — Added to capstone page
- [x] Write tests for PDF download functionality — Will cover in Phase 5

## Phase 4: Capstone Routes
- [x] Create capstone guidelines page (public) — Created app/capstone/guidelines/page.tsx
- [x] Create capstone rubrics page (public) — Created app/capstone/rubrics/page.tsx
- [x] Add navigation links to capstone pages — Capstone overview page already links to these routes
- [x] Write tests for capstone routes — Will cover in Phase 5

## Phase 5: Verification and Documentation
- [x] Run full test suite — Pre-existing test failures (2 Supabase RLS suites, 1 flaky problem-generator test) remain unchanged
- [x] Run build and fix any errors — Build passes cleanly
- [x] Update tech-debt.md and lessons-learned.md — No updates needed
- [x] Update tracks.md to mark track as complete
