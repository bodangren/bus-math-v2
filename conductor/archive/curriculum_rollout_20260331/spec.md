# Specification: Curriculum Rollout

## Goal

Wire all curriculum units to stable practice family keys from the stabilized engine registry. Ensure every lesson's guided practice, independent practice, and assessment activities point to the correct algorithmic generators (Families A-U).

## Background

The Practice Engine Stabilization track (completed) consolidated family keys and built Families R-U. Now the curriculum must be updated to reference these stable keys instead of legacy identifiers or placeholder values.

## Requirements

### 1. Family Key Alignment

- Review all 8 units + capstone lesson manifests
- Update activity references to use canonical family keys:
  - Classification: A, K, M
  - Computation: B, E, G, J, N, Q
  - Journal: C, F, H, L, P
  - Statement: D→Q (consolidated), I, O→Q (consolidated)
  - New families: R (CVP), S (Interest), T (Depreciation), U (Financial Analysis)

### 2. Mode-Aware Configuration

- Ensure guided practice uses appropriate difficulty/scaffolding
- Ensure independent practice uses full difficulty
- Verify assessment configurations match learning objectives

### 3. Validation

- All family keys must exist in the registry
- No orphaned references to deleted families (D, O as standalone)
- Lesson manifests must validate against practice.v1 contract

## Acceptance Criteria

- [ ] Every lesson activity references a valid, implemented family key
- [ ] No references to deprecated family keys (statement-completion, merchandising-computation)
- [ ] Unit 1-8 + capstone lessons load without family lookup errors
- [ ] Full test suite passes with new curriculum wiring
- [ ] Production build succeeds

## Dependencies

- ✅ Practice Engine Stabilization (Track 1) - COMPLETE
- ✅ Visual/Teaching Upgrade - COMPLETE (archived)

## Blocks

- Track 4: Legacy Cleanup — Component Pruning, Charts, and Simulations
- Track 5: Teacher Practice Error Analysis
