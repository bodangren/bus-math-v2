# Practice Test Post-Answer Feedback

## Overview

Add per-question feedback to the PracticeTestEngine assessment flow. After a student selects an answer, they should see whether it was correct or incorrect, view the correct answer highlighted, and read an explanation before advancing to the next question.

## Problem Statement

Currently, the PracticeTestEngine assessment phase shows no feedback when a student selects an answer. Students proceed through questions without knowing which they got right or wrong until the final score reveal. This reduces the learning value of practice tests.

## Functional Requirements

1. After selecting an answer, immediately display feedback showing:
   - Whether the selected answer was correct or incorrect
   - The correct answer (highlighted)
   - An explanation of why the answer is correct
2. Disable answer buttons after selection to prevent changing the answer
3. Show a "Continue" or "Next" button after feedback is displayed
4. Only advance to the next question after the student acknowledges the feedback
5. Maintain the existing scoring logic - feedback display does not change score calculation

## Non-Functional Requirements

- Feedback must not be shown before the student selects an answer
- Explanation text is sourced from the question bank (per-question explanations)
- The feedback UI should be consistent with existing practice test visual language
- All existing tests must continue to pass

## Out of Scope

- Changing the question selection/shuffle logic
- Modifying the score calculation or attempt limits
- Adding feedback to non-assessment phases (review mode)

## Acceptance Criteria

- [ ] Student sees correct/incorrect indicator after selecting an answer
- [ ] Correct answer is visually highlighted
- [ ] Explanation text is displayed
- [ ] Answer buttons are disabled after selection
- [ ] Continue/Next button appears after feedback
- [ ] Student cannot change answer after selection
- [ ] All existing practice test tests pass
- [ ] Lint and build pass