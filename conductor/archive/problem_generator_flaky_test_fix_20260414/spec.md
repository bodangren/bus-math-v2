# Problem Generator Flaky Test Fix

## Overview

The `problem-generator.test.ts` flaky test has an ~11% collision rate because the template uses only 9 possible cash values (1000-5000 with step 500). When two unseeded calls produce the same parameter value, the test fails.

## Functional Requirements

1. Reduce the collision rate for the "produces varied results without a seed" test to near-zero
2. Maintain backward compatibility with seeded generation (must remain deterministic)
3. Ensure parameter values still respect min/max/step constraints

## Technical Analysis

The collision occurs because:
- Template defines `cash: { min: 1000, max: 5000, step: 500 }` → 9 possible values
- `sampleParameterValue` uses `Math.floor(rng() * (totalSteps + 1))` which is uniform over 9 values
- Probability that two independent calls produce the same value: ~1/9 ≈ 11%

## Solution Options

1. **Increase cash range** (chosen): Change cash max from 5000 to 99000 with same step, yielding 198 possible values → collision rate ≈ 0.05%
2. **Change step**: Smaller step means more possible values but changes the problem space
3. **Add another parameter**: Would change test template semantics

## Acceptance Criteria

- [ ] Test template uses enough possible values that collision probability is < 1%
- [ ] All existing tests pass (determinism, alignment, placeholder replacement)
- [ ] No changes to the production `generateProblemInstance` function
- [ ] Only the test template is modified to have more possible values