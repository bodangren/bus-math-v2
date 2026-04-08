# Implementation Plan: Non-Unit Page Evaluation and Polish

## Phase 1: Audit Setup

- [x] Enumerate the in-scope non-unit routes and their auth requirements
- [x] Capture desktop and mobile audit notes for each page
- [x] Identify shared layout defects versus page-local defects

## Phase 2: Shared Layout Fixes

- [ ] Write or update targeted regression coverage for risky shared layout changes
- [ ] Implement shared header, footer, shell, spacing, or container fixes needed across multiple non-unit pages
- [ ] Verify the shared fixes on the affected page set

## Phase 3: Page-Level Polish

- [ ] Fix public page issues
- [ ] Fix auth page issues
- [ ] Fix student non-unit page issues
- [ ] Fix teacher non-unit page issues
- [ ] Fix settings page issues

## Phase 4: Verification

- [ ] Re-check all in-scope pages on desktop and mobile widths
- [ ] Run `npm run lint`
- [ ] Run targeted tests for touched components/routes
- [ ] Run `npm run build`
- [ ] Record residual risks or intentional deferrals
