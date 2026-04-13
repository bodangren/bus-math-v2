# Workbook Client Dynamic Lookup

## Overview

Replace the hardcoded `Set` in `workbooks.client.ts` with a dynamic lookup mechanism that derives workbook existence from the published lesson manifest. This prevents the workbook existence cache from becoming stale when new workbooks are added to the curriculum.

## Problem Statement

`workbooks.client.ts` contains a hardcoded `Set<string>` called `WORKBOOKS_WITH_LESSONS` that enumerates all lessons with workbooks. When a new workbook is added, this Set must be manually updated in each rollout track. If forgotten, `lessonHasWorkbooks()` returns `false` for a lesson that actually has workbooks.

## Solution

Derive the workbook set dynamically from the published lesson manifest (`lib/curriculum/published-manifest.ts`), which already contains the authoritative list of which lessons have workbooks. This ensures `lessonHasWorkbooks()` is always in sync with the runtime curriculum.

## Functional Requirements

1. `lessonHasWorkbooks(unitNumber, lessonId)` must return `true` for all lessons that have workbook files in `public/workbooks/`
2. `lessonHasWorkbooks()` must not require manual updates when new workbooks are added
3. The dynamic lookup must work correctly for all 8 units and all lessons within each unit
4. Existing behavior for lessons without workbooks must be preserved (return `false`)

## Non-Functional Requirements

- Must be client-safe (no Node.js filesystem access)
- Must not break existing workbook download flows
- Must not increase bundle size significantly

## Acceptance Criteria

- [ ] `lessonHasWorkbooks()` reads from published manifest instead of hardcoded Set
- [ ] All 66 existing workbooks continue to be recognized
- [ ] Unit test covers dynamic lookup for all units
- [ ] Lint passes with 0 errors
- [ ] Build passes cleanly

## Out of Scope

- Adding new workbooks (that is done in rollout tracks)
- Modifying the published lesson manifest structure