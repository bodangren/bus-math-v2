# Specification: Milestone 7 Final Closure — Envelope Tests, Input Validation, and Double-Submit Guards

## Overview

Complete the Milestone 7 exit gate by addressing the three highest-priority open tech debt items from the 2026-04-06 code review audit: envelope test quality gaps, simulation input validation, and double-submit guard coverage.

## Functional Requirements

### FR-1: Envelope Test Quality
- All 12 simulation envelope test files must assert `status` and `parts` (with `length > 0`) on emitted practice.v1 envelopes.
- Tests must follow the established pattern from GrowthPuzzle.test.tsx and InventoryManager.test.tsx.

### FR-2: Simulation Input Validation
- AssetRegisterSimulator, DepreciationMethodComparisonSimulator, and MethodComparisonSimulator must guard against NaN/empty-input propagation in their submit handlers.
- Add empty-input check or NaN guard before envelope construction.

### FR-3: GrowthPuzzle Double-Submit Guard
- Add `submitted` boolean state to GrowthPuzzle component.
- Guard `onSubmit` callback with `if (submitted) return`.
- Disable submit button when `submitted` is true.

### FR-4: Exercise Component Polish (if scope permits)
- StraightLineMastery: move options shuffle to `useMemo` keyed on problem reset.
- CapitalizationExpenseMastery: fix "Show Example" misleading feedback.
- DDBComparisonMastery: add final-year catch-up to salvage value.

## Non-Functional Requirements

- All changes must pass `npm run lint`, `npm test`, and `npm run build`.
- No new dependencies.
- Follow existing code style and patterns.

## Acceptance Criteria

1. Every simulation envelope test asserts `status` and `parts.length > 0`.
2. AssetRegisterSimulator, DepreciationMethodComparisonSimulator, and MethodComparisonSimulator reject NaN inputs before submit.
3. GrowthPuzzle has a `submitted` state guard preventing duplicate envelope emission.
4. All existing tests continue to pass.
5. Build completes without errors.

## Out of Scope

- Removing Supabase/Drizzle legacy surfaces (requires dedicated migration track).
- CashFlowChallenge `onSubmitLegacy` removal (requires props interface refactor).
- Addressing npm dependency security advisories (requires dependency change approval).
