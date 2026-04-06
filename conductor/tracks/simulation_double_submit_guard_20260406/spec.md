# Specification: Simulation Double-Submit Guard Standardization

## Overview

Five simulation components (CashFlowChallenge, BusinessStressTest, BudgetBalancer, LemonadeStand, NotebookOrganizer) use `useState`-only guards against double submission. In React 18 batching, two rapid clicks can both pass the `submitted` check before the re-render cycle sets it to `true`, causing duplicate `practice.v1` envelope emissions.

Two components (GrowthPuzzle, StartupJourney) already use `const submittedRef = useRef(false)` with synchronous read/write — the canonical pattern.

## Functional Requirements

1. Each of the 5 target components must use a `submittedRef = useRef(false)` as the primary race-condition guard in submit handlers.
2. The `useState` for `submitted` may be retained for UI purposes (`disabled={submitted}` on buttons) but must not be the sole guard.
3. `submittedRef.current = true` must be set synchronously before any async work or `onSubmit` calls.
4. Reset functions must reset both `submittedRef.current = false` and `setSubmitted(false)`.
5. Components with useEffect-based auto-submission (BusinessStressTest, NotebookOrganizer) must guard the effect with `submittedRef.current` to prevent re-execution.

## Non-Functional Requirements

- No change to user-visible behavior or UI layout.
- All existing tests must continue to pass.
- New tests must verify double-submit protection.

## Acceptance Criteria

- [ ] Each of 5 components has `submittedRef = useRef(false)` alongside existing `useState`.
- [ ] Submit handlers check `submittedRef.current` before proceeding.
- [ ] `submittedRef.current = true` is set synchronously in the submit path.
- [ ] Reset functions clear `submittedRef.current`.
- [ ] New tests verify calling submit twice only invokes `onSubmit` once.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes (affected test files).
- [ ] `npm run build` passes.

## Out of Scope

- Other simulation components not listed in the directive.
- Refactoring the `useState` for `submitted` away entirely (UI disabled state is still useful).
- Changes to the `practice.v1` envelope shape.
