# activities_lessonId Tech Debt Resolution

## Decision: Won't Fix

**Rationale:** Activities are reusable components keyed by `componentKey`, shared across multiple lessons. The `activity_completions` table is the proper join table linking activities to lessons with `lessonId`, `phaseNumber`, and `activityId`. Adding `lessonId` to `activities` would be architecturally incorrect since the same activity can appear in multiple lessons.

**Conclusion:** The gradebook IP/assessment columns correctly depend on `activity_completions` for lesson mapping. This is the intended design, not a debt item.