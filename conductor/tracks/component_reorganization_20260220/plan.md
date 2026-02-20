# Implementation Plan: Component Reorganization & Simulation Placeholders

This plan outlines the extraction of the component reorganization work that was originally committed as part of the `lesson_plan_infra_20260219` track checkpoint (`b203a92`). That work represented a significant architectural refactor and warrants its own dedicated track to avoid scope creep.

## Phase 1: Reorganize Component Library
Moved various domain-specific components into the `components/activities/` directory to construct a structured registry.

- [x] Task: Move `accounting`, `business-simulations`, `charts`, `drag-drop-exercises`, and `spreadsheet` into `components/activities/`.
- [x] Task: Create `lib/activities/registry.ts` and update documentation.
- [x] Task: Commit simulation placeholders for future curriculum units.

## Phase 2: Fix Broken Import Paths
The aforementioned component shifts resulted in broken import paths in the `__tests__` directory.

- [x] Task: Determine new component mappings.
- [x] Task: Execute an automated script to update import statements across all 50 failing files in `__tests__/`.
- [x] Task: Verify test suit succeeds with 0 failing test files regarding imports.
