# Track Spec: DailyPracticeSession Interactive Answer Input

## Problem Statement

The DailyPracticeSession component currently auto-solves every practice problem and presents a single "Submit Answer" button. The student never actually inputs an answer; they simply click Submit to record an auto-generated correct response. This defeats the pedagogical purpose of daily SRS practice.

## Goal

Convert DailyPracticeSession from an auto-solve MVP into an interactive practice experience where students input answers using family-appropriate UI controls, receive grading feedback, and then advance through their queue.

## Acceptance Criteria

- [ ] A registry maps each practice family to a dedicated answer-input React component.
- [ ] Families without a dedicated input fall back to the existing auto-solve behavior (no regression).
- [ ] `accounting-equation` renders a numeric input for the hidden term with visible facts displayed.
- [ ] `normal-balance` renders debit/credit selection controls for each account.
- [ ] `classification` renders a categorization/dropdown control for each item.
- [ ] Each input component calls `family.grade()` with the student response and displays per-part correct/incorrect feedback.
- [ ] DailyPracticeSession passes the graded envelope to the SRS review processor as before.
- [ ] All new code has >80% test coverage.
- [ ] `npm run lint`, `npm test`, and `npm run build` all pass.

## Out of Scope

- Timing telemetry integration (already present in envelope pipeline but not required for this track).
- Visual redesign beyond basic Tailwind utility classes.
- Adding inputs for families beyond the three specified above.

## Related Files

- `components/student/DailyPracticeSession.tsx`
- `lib/practice/engine/family-registry.ts`
- `lib/practice/engine/families/accounting-equation.ts`
- `lib/practice/engine/families/normal-balance.ts`
- `lib/practice/engine/families/classification.ts`
- `lib/practice/contract.ts`
