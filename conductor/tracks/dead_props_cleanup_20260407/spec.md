# Dead Props Cleanup Specification

## Overview
Clean up dead props and unused buttons in simulation components to reduce code clutter and potential confusion.

## Functional Requirements
1. Remove unused `onComplete` and `activity` props from PayStructureDecisionLab
2. Remove dead "Save Progress" button from PitchPresentationBuilder

## Non-Functional Requirements
- All existing tests must pass
- No changes to component behavior beyond removing unused code
- Linting must pass

## Acceptance Criteria
- PayStructureDecisionLab no longer declares or uses `onComplete` and `activity` props
- PitchPresentationBuilder no longer renders the "Save Progress" button
- `npm run lint` passes
- `npm test` passes (excluding pre-existing Supabase tests)
- `npm run build` passes

## Out of Scope
- No functional changes to simulation logic
- No changes to other components
