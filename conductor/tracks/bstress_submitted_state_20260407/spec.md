# Specification: BusinessStressTest Submitted State

## Overview

BusinessStressTest uses `submittedRef` as a double-submit guard but has no `submitted` state variable. Post-submission buttons ("Restart Test" on bankruptcy, "Back to Lesson" on survival) have no disabled state, providing no visual feedback that the submission has been recorded. This track adds a `submitted` boolean state variable and wires it to disable post-submission buttons.

## Functional Requirements

1. **submitted state variable**: Add `const [submitted, setSubmitted] = useState(false)` to BusinessStressTest.
2. **Set submitted on submission**: Set `setSubmitted(true)` in both submission paths (survival `handleNextRound` and bankruptcy `useEffect`).
3. **Disable post-submission buttons**: Add `disabled={submitted}` to "Restart Test" and "Back to Lesson" buttons.
4. **Reset submitted in reset()**: Add `setSubmitted(false)` to the existing `reset` function.
5. **Source-level test**: Verify the submitted state pattern exists in the component source.

## Non-Functional Requirements

- `submittedRef.current` must still be set to `true` before `setSubmitted(true)` (existing guard pattern).
- No behavioral change to the submission envelope or grading logic.
- Follow the pattern established in Track 11 for simulation double-submit guards.

## Acceptance Criteria

- [ ] BusinessStressTest has `const [submitted, setSubmitted] = useState(false)`
- [ ] `setSubmitted(true)` is called in survival submission path (handleNextRound)
- [ ] `setSubmitted(true)` is called in bankruptcy submission path (useEffect)
- [ ] "Restart Test" button has `disabled={submitted}`
- [ ] "Back to Lesson" button has `disabled={submitted}`
- [ ] `reset()` includes `setSubmitted(false)`
- [ ] Source-level test verifies submitted state pattern
- [ ] All existing tests pass
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Out of Scope

- Other simulation components
- Changing the submittedRef guard pattern (only adding the state variable alongside it)
