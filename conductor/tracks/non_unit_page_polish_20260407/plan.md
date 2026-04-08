# Implementation Plan: Non-Unit Page Evaluation and Polish

## Phase 1: Audit Setup

- [x] Enumerate the in-scope non-unit routes and their auth requirements
- [x] Capture desktop and mobile audit notes for each page
- [x] Identify shared layout defects versus page-local defects

## Phase 2: Shared Layout Fixes

- [x] Write or update targeted regression coverage for risky shared layout changes
- [x] Implement shared header, footer, shell, spacing, or container fixes needed across multiple non-unit pages
- [x] Verify the shared fixes on the affected page set

## Phase 3: Page-Level Polish

- [x] Fix public page issues
- [x] Fix auth page issues
- [x] Fix student non-unit page issues
- [x] Fix teacher non-unit page issues
- [x] Fix settings page issues

## Phase 4: Verification

- [x] Re-check all in-scope pages on desktop and mobile widths
- [x] Run `npm run lint`
- [x] Run targeted tests for touched components/routes
- [x] Run `npm run build`
- [x] Record residual risks or intentional deferrals
