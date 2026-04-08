# Unit 7 Page Evaluation and Polish — Audit Notes

## In-Scope Routes
- Curriculum overview page (`/curriculum`)
- Teacher unit overview (`/teacher/units/7`)
- Teacher lesson pages (`/teacher/units/7/lessons/[lessonId]`)
- Student lesson pages (`/student/lesson/[lessonSlug]`)

## Audit Results
### Desktop
- Curriculum overview Unit 7 card looks clean
- Teacher unit page looks clean
- Teacher lesson pages: need to check
- Student lesson pages: need to check

### Mobile
- Curriculum overview Unit 7 carousel card looks clean
- Teacher unit page: need to check
- Teacher lesson pages: need to check
- Student lesson pages: need to check

## Component-Level Findings
- **GrowthPuzzle**: "Back to Lesson" button only sets `isComplete(false)`; should call `resetGame()` to reset `submittedRef`
- **CapitalNegotiation**: "Continue Lesson" button only sets `isComplete(false)`; should call `reset()` to reset `submittedRef`
