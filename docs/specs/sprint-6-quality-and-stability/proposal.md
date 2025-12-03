---
title: Sprint 6 - Quality & Stability Proposal
type: proposal
status: draft
created: 2025-12-03
updated: 2025-12-03
epic: 6
description: Proposal to dedicate Sprint 6 to technical debt reduction and quality assurance.
tags: [sprint-6, proposal, quality]
---

# Proposal: Sprint 6 - Quality & Stability

## Problem
We have accumulated significant technical debt:
*   20 failing test files.
*   200+ TypeScript errors.
*   Missing E2E coverage for recent features.

Continuing to build features on this foundation risks regressions and makes debugging significantly harder.

## Solution
Dedicate one sprint (Sprint 6) exclusively to:
1.  **Fixing the Build**: Make `npm test` and `tsc` green.
2.  **Polishing Unit 1**: Ensure the first unit students see is flawless.

## Success Criteria
*   `npm test` passes with 0 failures.
*   `npx tsc --noEmit` returns 0 errors.
*   Teacher Command Center has E2E test coverage.
*   Unit 1 components (`AccountCategorization`, `DataCleaningExercise`, `SpreadsheetActivity`) are verified and registered in `activityRegistry`.
