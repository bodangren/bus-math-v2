# Exercise Test Quality Improvement — SPEC

## Overview

Improve shallow exercise tests that claim behavior verification but only check rendering. These tests provide false confidence and mask regressions.

## Problem Statement

Exercise and simulation component tests have names suggesting behavior verification (e.g., "renders correctly", "shows feedback on answer") but only assert on shallow rendering (snapshot, element presence). This means:
- Submit handlers are not tested
- Answer grading logic is not tested
- Error states are not tested
- Edge cases are not covered

## Scope

Focus on exercise and simulation components that have practice.v1 envelopes. Identify the shallowest tests and improve them to verify actual component behavior.

## Functional Requirements

1. Audit existing exercise/simulation test files to identify shallow tests
2. Improve selected tests to verify:
   - Answer submission flow
   - Correct/incorrect feedback display
   - Error state handling
   - User interaction sequences
3. Maintain >80% code coverage for improved components
4. Ensure all improved tests pass

## Non-Functional Requirements

- Tests must use existing test infrastructure (Vitest, React Testing Library)
- Mock Convex queries/mutations appropriately
- Follow existing test naming conventions
- Don't break existing passing tests

## Acceptance Criteria

- [ ] At least 5 exercise/simulation tests upgraded from shallow to behavior-verifying
- [ ] All upgraded tests pass
- [ ] Coverage for upgraded components remains >80%
- [ ] No regression in existing test suite

## Out of Scope

- Adding new tests for components without existing tests
- Changing component implementation (only test improvements)
- Modifying simulation engine logic
