# Specification: Remaining Simulation Double-Submit Guards

## Overview

Four simulation components (AssetTimeMachine, CapitalNegotiation, CafeSupplyChaos, ScenarioSwitchShowTell) have NO double-submit protection. Every user completion click fires `onSubmit` with no guard, allowing duplicate `practice.v1` envelope emissions under React 18 batching.

Three additional components (PitchPresentationBuilder, PayStructureDecisionLab, InventoryManager) set `useState` AFTER `onSubmit`, creating a race window where rapid double-clicks can bypass the `if (submitted) return` check.

The established canonical pattern (from Tracks 8, 11) uses `const submittedRef = useRef(false)` with synchronous read/write as the primary guard.

## Functional Requirements

1. Each of the 4 HIGH-priority components must use `submittedRef = useRef(false)` as the primary race-condition guard in submit handlers.
2. Each of the 3 MEDIUM-priority components must move the `submittedRef` check before `onSubmit` and set `submittedRef.current = true` synchronously before `onSubmit`.
3. Reset functions must reset both `submittedRef.current = false` and `setSubmitted(false)`.
4. Components with "Back to Lesson" / "Try Other" buttons must reset `submittedRef.current`.

## Non-Functional Requirements

- No change to user-visible behavior or UI layout.
- All existing tests must continue to pass.
- New source-level tests must verify the submittedRef pattern exists.

## Acceptance Criteria

- [ ] AssetTimeMachine has submittedRef guard in its submit path
- [ ] CapitalNegotiation has submittedRef guard in handleFinalize
- [ ] CafeSupplyChaos has submittedRef guard in handleNextDay completion path
- [ ] ScenarioSwitchShowTell has submittedRef guard in handleComplete
- [ ] PitchPresentationBuilder moves submittedRef check before onSubmit
- [ ] PayStructureDecisionLab moves submittedRef check before onSubmit
- [ ] InventoryManager moves submittedRef check before onSubmit
- [ ] Source-level tests verify submittedRef pattern in each component
- [ ] `npm run lint` passes
- [ ] `npm test` passes (affected test files)
- [ ] `npm run build` passes

## Out of Scope

- Deprecation simulators (AssetRegisterSimulator, DepreciationMethodComparisonSimulator, MethodComparisonSimulator) — separate LOW priority item.
- Refactoring useState for submitted away entirely (UI disabled state still useful).
- Changes to the practice.v1 envelope shape.
