# Implementation Plan

## Phase 1: Contract Coverage Tests
- [x] Task: Add failing tests for centralized activity catalog behavior
  - [x] Add runtime registry tests for canonical key + alias resolution
  - [x] Add validation/schema tests that cover components currently missing from the manual union
  - [x] Add a docs-catalog regression test for `docs/components.yaml` coverage

## Phase 2: Catalog Consolidation
- [x] Task: Centralize activity component metadata
  - [x] Implement canonical key + alias metadata in the activity registry layer
  - [x] Refactor runtime resolution helpers to use the centralized metadata
- [x] Task: Remove schema drift
  - [x] Refactor activity validation/schema utilities to derive supported props from the centralized catalog
  - [x] Preserve existing canonical seed keys and documented aliases

## Phase 3: Verification and Closeout
- [x] Task: Run lint, automated tests, and production build
- [x] Task: Update README and Conductor memory files with the refactor outcome
- [x] Task: Archive the track and finalize registry/metadata updates
