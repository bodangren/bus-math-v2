# Track: activities_lessonId Tech Debt Resolution

## Specification

### Problem Statement

Tech debt item: "activities table lacks lessonId — gradebook IP/assessment columns depend on activity_completions for lesson mapping"

### Analysis

After examining the codebase:

1. **Activities are reusable components** - They are keyed by `componentKey` and can be shared across multiple lessons. The `replaceOrInsertActivity` function in `seed.ts` creates activities independently of any specific lesson context.

2. **The activity_completions table is the proper join** - This table correctly links activities to lessons with `lessonId`, `phaseNumber`, and `activityId`. It is the authoritative source for determining which lesson an activity completion belongs to.

3. **Gradebook already uses the correct architecture** - The gradebook queries use `activity_completions` to join activities with lessons. The architecture is sound.

### Decision

**Won't Fix** - Adding `lessonId` to the `activities` table would be architecturally incorrect because:

- The same activity component can appear in multiple lessons
- Activities are lesson-agnostic components defined once and reused
- The `activity_completions` join table is the correct design pattern

### Resolution

Close the tech debt item with rationale documented in `tech-debt.md`.

## Implementation Plan

- [x] Analyze activities schema and confirm architectural reasoning
- [x] Close tech debt item in `tech-debt.md` with won't-fix rationale
- [x] Verify lint, tests, and build pass
- [ ] Commit and push