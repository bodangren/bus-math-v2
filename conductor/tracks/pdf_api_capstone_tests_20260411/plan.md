# Implementation Plan: PDF API and Capstone Page Tests

## Phase 1: PDF API Tests

- [x] Write tests for PDF API route (app/api/pdfs/[pdfName]/route.ts)
  - [x] Test 404 for unknown PDF names
  - [x] Test 200 for valid PDF names
  - [x] Test Content-Disposition header
  - [x] Test path traversal protection
  - [x] Test invalid PDF name validation
- [x] Run tests and verify they pass

## Phase 2: Capstone Guidelines Page Tests

- [x] Write tests for capstone guidelines page (app/capstone/guidelines/page.tsx)
  - [x] Test page renders for authenticated users
  - [x] Test content and download links
  - [x] Test unauthenticated redirect (not needed, page is public)
- [x] Run tests and verify they pass

## Phase 3: Capstone Rubrics Page Tests

- [x] Write tests for capstone rubrics page (app/capstone/rubrics/page.tsx)
  - [x] Test page renders for authenticated users
  - [x] Test content and download links
  - [x] Test unauthenticated redirect (not needed, page is public)
- [x] Run tests and verify they pass

## Phase 4: Verification and Documentation

- [ ] Run full test suite to ensure no regressions
- [ ] Run npm run build to ensure no build errors
- [ ] Update tech-debt.md to close the "PDF API and capstone pages have no test coverage" item
- [ ] Update tracks.md to mark this track as complete
- [ ] Archive the track
