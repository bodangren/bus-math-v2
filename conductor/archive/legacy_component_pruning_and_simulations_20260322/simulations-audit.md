# Simulations Practice.v1 Compliance Audit

> Part of Track 4: Legacy Cleanup — Component Pruning, Charts, and Simulations
> Created: 2026-04-01
> Status: In Progress

## Summary

This document tracks the practice.v1 compliance status of all 8 core simulations.
Each simulation must emit a `practice.v1` compliant submission envelope with:
- `parts`: Key decisions/milestones made during gameplay
- `artifact`: Teacher-readable summary report

## Compliance Status Overview

| # | Simulation | File | Current Status | onSubmit/onComplete | practice.v1 Compliant | Notes |
|---|------------|------|----------------|---------------------|----------------------|-------|
| 1 | Startup Journey | `StartupJourney.tsx` | ⚠️ Non-compliant | `onStateChange` only | ❌ No | No submission envelope; internal state only |
| 2 | Cash Flow Challenge | `CashFlowChallenge.tsx` | ⚠️ Non-compliant | `onSubmit` exists | ❌ No | Passes raw game state, not practice.v1 envelope |
| 3 | Business Stress Test | `BusinessStressTest.tsx` | ⚠️ Non-compliant | `onComplete` exists | ❌ No | Passes simple results object |
| 4 | Pay Structure Decision Lab | `PayStructureDecisionLab.tsx` | ⚠️ Non-compliant | Needs audit | ❌ No | Needs audit |
| 5 | Inventory Manager | `InventoryManager.tsx` | ⚠️ Non-compliant | `onSubmit` exists | ❌ No | Passes raw game state, not practice.v1 envelope |
| 6 | Asset Time Machine | `AssetTimeMachine.tsx` | ⚠️ Non-compliant | `onComplete` exists | ❌ No | Passes simple results object |
| 7 | Capital Negotiation | `CapitalNegotiation.tsx` | ⚠️ Non-compliant | Needs audit | ❌ No | Needs audit |
| 8 | Notebook Organizer | `NotebookOrganizer.tsx` | ⚠️ Non-compliant | `onSubmit` exists | ❌ No | Has submission but not practice.v1 compliant |

## Detailed Findings

### 1. Startup Journey (`StartupJourney.tsx`)

**Current Implementation:**
- Uses internal game state with `onStateChange` callback
- No submission mechanism for practice.v1
- Tracks: stage, funding, monthlyBurn, users, revenue, month, decisions, gameStatus

**Required Changes:**
- Add `onSubmit` callback prop
- Define 5 parts: funding-decision, team-decision, product-decision, growth-decision, final-stage
- Generate artifact with: summary, financials, metrics, decisions, outcome
- Emit practice.v1 envelope on game completion

**Part IDs (per simulations-spec.md):**
- `startup-funding-decision`
- `startup-team-decision`
- `startup-product-decision`
- `startup-growth-decision`
- `startup-final-stage`

---

### 2. Cash Flow Challenge (`CashFlowChallenge.tsx`)

**Current Implementation:**
- Has `onSubmit` callback but passes raw game state:
```typescript
onSubmit({
  ...gameState,
  finalProfit,
  actionsLog
})
```
- Not practice.v1 compliant

**Required Changes:**
- Transform submission to practice.v1 envelope
- Define 5 parts: expedite-decision, negotiate-decision, credit-decision, delay-decision, final-position
- Generate artifact with: summary, cashFlows, creditUsage, actionsSummary

**Part IDs (per simulations-spec.md):**
- `cashflow-expedite-decision`
- `cashflow-negotiate-decision`
- `cashflow-credit-decision`
- `cashflow-delay-decision`
- `cashflow-final-position`

---

### 3. Business Stress Test (`BusinessStressTest.tsx`)

**Current Implementation:**
- Has `onComplete` callback passing simple results:
```typescript
onComplete?.({ finalCash: number; roundsSurvived: number })
```
- No practice.v1 envelope

**Required Changes:**
- Add practice.v1 submission envelope
- Define parts for each disaster round response
- Generate artifact with crisis response summary

---

### 4. Inventory Manager (`InventoryManager.tsx`)

**Current Implementation:**
- Has `onSubmit` callback but passes raw game state:
```typescript
onSubmit({
  ...gameState,
  finalProfit
})
```
- Not practice.v1 compliant

**Required Changes:**
- Transform to practice.v1 envelope
- Define parts: ordering-decisions, inventory-levels, profit-achievement
- Generate artifact with: summary, inventoryPerformance, productBreakdown, strategyAnalysis

---

### 5. Asset Time Machine (`AssetTimeMachine.tsx`)

**Current Implementation:**
- Has `onComplete` callback passing simple results:
```typescript
onComplete?.({ totalExpenses, finalValue, history })
```
- No practice.v1 envelope

**Required Changes:**
- Add practice.v1 submission envelope
- Define parts for each year's asset management decision
- Generate artifact with depreciation/valuation report

---

### 6. Pay Structure Decision Lab (`PayStructureDecisionLab.tsx`)

**Current Implementation:**
- Needs audit - not yet examined

**Required Changes:**
- TBD after audit

---

### 7. Capital Negotiation (`CapitalNegotiation.tsx`)

**Current Implementation:**
- Needs audit - not yet examined

**Required Changes:**
- TBD after audit

---

### 8. Notebook Organizer (`NotebookOrganizer.tsx`)

**Current Implementation:**
- Has `onSubmit` but needs verification of practice.v1 compliance

**Required Changes:**
- TBD after audit

---

## Implementation Plan

### Phase 4a: Create Simulation Submission Utilities (Current)

Create shared utilities for simulations to build practice.v1 submissions:

1. Create `lib/practice/simulation-submission.ts` with:
   - `buildSimulationSubmissionEnvelope()` - wrapper around practice.v1 builder
   - Type definitions for simulation-specific parts and artifacts
   - Helper functions for common simulation submission patterns

2. Update each simulation component:
   - Import submission utilities
   - Define part IDs and artifact structures
   - Transform game state into practice.v1 envelope
   - Call `onSubmit` with practice.v1 compliant payload

### Phase 4b: Update Simulations (Upcoming)

Update each simulation in priority order:
1. Startup Journey (Unit 1 - Discovery)
2. Cash Flow Challenge (Unit 2 - Discovery)
3. Inventory Manager (Unit 6 - Synthesis)
4. Business Stress Test (Unit 3 - Synthesis)
5. Pay Structure Decision Lab (Unit 4 - Synthesis)
6. Asset Time Machine (Unit 5 - Discovery)
7. Capital Negotiation (Unit 7 - Synthesis)
8. Notebook Organizer (Unit 8 - Synthesis)

## Testing Requirements

Each simulation update must include:
1. Unit tests for submission envelope generation
2. Verification that artifact is teacher-readable
3. Verification that all key decisions are captured in parts
4. Integration test with practice.v1 validator

## References

- [practice-component-contract.md](../../curriculum/practice-component-contract.md)
- [simulations-spec.md](./simulations-spec.md)
- [lib/practice/contract.ts](../../../lib/practice/contract.ts)
