# Implementation Plan: BusinessStressTest Submitted State

## Phase 1: Add submitted state and disable post-submission buttons

### Tasks

1. [x] Write source-level test verifying submitted state pattern in BusinessStressTest
2. [x] Add `const [submitted, setSubmitted] = useState(false)` to BusinessStressTest
3. [x] Add `setSubmitted(true)` to survival submission path (handleNextRound, after submittedRef)
4. [x] Add `setSubmitted(true)` to bankruptcy submission path (useEffect, after submittedRef)
5. [x] Add `disabled={submitted}` to "Restart Test" button
6. [x] Add `disabled={submitted}` to "Back to Lesson" button
7. [x] Add `setSubmitted(false)` to reset() function
8. [x] Verify: lint, tests, build for Phase 1
9. [x] Close tech-debt item for BusinessStressTest submitted state
10. [x] Update tech-debt.md and lessons-learned.md
11. [x] Checkpoint commit with git note
