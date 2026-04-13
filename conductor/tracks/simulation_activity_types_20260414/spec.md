# Track: Simulation Activity Type Standardization

## Overview

Fix simulations using ad-hoc inline activity prop types to instead use the canonical `Activity` type pattern that the first 3 simulations (NotebookOrganizer, LemonadeStand, AssetTimeMachine) already follow.

## Problem Statement

The first 3 simulations use the correct canonical pattern:
```typescript
export type NotebookOrganizerActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'notebook-organizer'
  props: NotebookOrganizerActivityProps
}
```

However, 7 other simulations use ad-hoc inline types, some with `Buffer` and `any` instead of proper types:
- StartupJourney: uses `Buffer`, `any` inline type
- BudgetBalancer: uses `Buffer`, `any` inline type
- DynamicMethodSelector: uses `{ id?: string; props?: { ... } }`
- MethodComparisonSimulator: uses `{ id?: string; props?: { ... } }`
- AssetRegisterSimulator: uses `{ id?: string; props?: { ... } }`
- DepreciationMethodComparisonSimulator: uses `{ id?: string; props?: { ... } }`
- CashFlowChallenge: uses `CashFlowChallengeActivityProps & { id?: string }`

## Canonical Activity Type Pattern

Each simulation should define:
```typescript
export type XxxSimulationActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'xxx'
  props: XxxSimulationActivityProps
}
```

Where `Activity` is imported from `@/lib/db/schema/validators` and `XxxSimulationActivityProps` is the type for that simulation's props (imported from `@/types/activities` or defined inline).

## Scope

Fix the following simulations:
1. StartupJourney
2. BudgetBalancer
3. DynamicMethodSelector
4. MethodComparisonSimulator
5. AssetRegisterSimulator
6. DepreciationMethodComparisonSimulator
7. CashFlowChallenge

## Out of Scope

- Do NOT modify simulations that already follow the pattern (NotebookOrganizer, LemonadeStand, AssetTimeMachine, CafeSupplyChaos, BusinessStressTest, CapitalNegotiation, GrowthPuzzle, InventoryManager, PayStructureDecisionLab, PitchPresentationBuilder, ScenarioSwitchShowTell)
- Do NOT add Zod schemas for props types - only fix the Activity type wrapper

## Verification

- All simulations must compile without TypeScript errors
- `npm run lint` passes with 0 errors
- `npm run build` passes
- All existing tests pass