# Implementation Plan: Artifact Packaging

## Phase 1: Inventory and Infrastructure Audit
- [x] Inventory existing artifacts (CSV datasets, PDF guides, capstone resources) — No existing CSVs; PDFs referenced in capstone-authored.ts are missing
- [x] Review existing workbook download infrastructure — Reviewed app/api/workbooks/[unit]/[lesson]/[type]/route.ts; will extend this pattern for PDFs and CSVs
- [x] Define file structure for new artifacts — public/datasets/ for CSVs, public/pdfs/ for PDFs
- [x] Update tracks.md to mark track as in-progress (e3df335)

## Phase 2: CSV Dataset Packaging
- [ ] Identify all CSV datasets used in the curriculum
- [ ] Add CSV files to public assets directory
- [ ] Extend download API to support CSV files
- [ ] Add CSV download links to relevant lesson pages
- [ ] Write tests for CSV download functionality

## Phase 3: PDF Artifact Packaging
- [ ] Identify all PDF guides/rubrics/checklists
- [ ] Add PDF files to protected assets directory
- [ ] Extend download API to support PDF files with role-based access
- [ ] Add PDF download links to lesson and capstone pages
- [ ] Write tests for PDF download functionality

## Phase 4: Capstone Routes
- [ ] Create capstone guidelines page (public)
- [ ] Create capstone resources page (protected)
- [ ] Add navigation links to capstone pages
- [ ] Write tests for capstone routes

## Phase 5: Verification and Documentation
- [ ] Run full test suite
- [ ] Run build and fix any errors
- [ ] Update tech-debt.md and lessons-learned.md
- [ ] Update tracks.md to mark track as complete
