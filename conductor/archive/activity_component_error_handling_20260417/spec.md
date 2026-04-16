# Specification: Activity Component Error Handling

## Overview

Approximately 30 activity components across the codebase call `onSubmit?.()` without any error handling. When the parent handler throws (e.g., due to a failed Convex mutation or network error), the unhandled exception can leave the component in a permanently locked or inconsistent state. This track systematically wraps all `onSubmit?.()` calls in activity components with try/catch blocks and surfaces user-visible error feedback where appropriate.

## Functional Requirements

1. Every activity component that invokes `onSubmit?.()` must wrap the call in a `try/catch` block.
2. In the `catch` block, the component must:
   - Log the error via `console.error` (for debugging)
   - Reset any local submission-locking state (e.g., `isSubmitting`, `submittedRef`) so the user can retry
   - Surface user-visible error feedback when the component already has an error display mechanism
3. Changes must be purely additive — no behavioral changes to happy-path flows.
4. Existing tests must continue to pass; new regression tests should verify error handling for representative components.

## Non-Functional Requirements

- Preserve the established visual language and component contracts.
- Keep error handling consistent across component categories (exercises, simulations, quizzes, drag-drop, accounting).
- Do not introduce new dependencies.

## Acceptance Criteria

- [ ] All exercise components have try/catch around `onSubmit?.()` calls.
- [ ] All simulation components have try/catch around `onSubmit?.()` calls.
- [ ] All quiz, drag-drop, and accounting components have try/catch around `onSubmit?.()` calls.
- [ ] At least one representative component per category has a regression test for error handling.
- [ ] `npm run lint`, `npm test`, and `npm run build` all pass.

## Out of Scope

- Refactoring parent handlers (ActivityRenderer, LessonRenderer) — their error handling is a separate concern.
- Adding brand-new UI error states to components that currently have no error display surface; minimal `console.error` + state reset is sufficient.
- Practice-family components (these use a different `onSubmit` contract and are not in scope).
