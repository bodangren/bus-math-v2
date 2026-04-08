# Track Specification: Next Phase Definition

## Overview
Define the next phase of work for the project after completing all cleanup/polish tracks and all exercise implementation tracks (U2, U3, U6).

## Functional Requirements
1. Review the current state of the project (all completed tracks, remaining placeholders, tech debt, current_directive.md)
2. Identify and prioritize the remaining work options:
   a. Remaining exercise-family work (U1, U4, U5, U7, U8 exercise clusters)
   b. Move to the Milestone 7 planned queue (Engine Stabilization → Curriculum Rollout → Visual/Teaching → Legacy Cleanup → Teacher Error)
3. Select the next phase with clear rationale
4. Define the first track for the selected phase
5. Update current_directive.md to reflect the new phase

## Non-Functional Requirements
- Decision must be documented in spec.md
- Next phase must be aligned with project goals
- First track must be well-defined with clear phases

## Decision
- Next phase: **Remaining Exercise Family Work**
- Rationale: Continue completing exercise clusters to fill remaining gaps, starting with the 3 remaining placeholders, then moving to other units
- First track: Implement remaining 3 exercise placeholders (profit-calculator, budget-worksheet, error-checking-system)

## Acceptance Criteria
1. spec.md and plan.md are created for this track
2. Current project state is summarized
3. Next phase is selected with rationale
4. First track for next phase is defined
5. current_directive.md is updated with new phase
6. All verification gates (npm run lint, npm test, npm run build) pass

## Out of Scope
- Implementing any new features or exercises in this track
- Modifying any product code in this track
