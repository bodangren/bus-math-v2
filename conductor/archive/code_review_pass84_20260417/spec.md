# Specification: Code Review Pass 84 — Stabilization Verification

## Overview

An autonomous stabilization verification pass to confirm project stability after Pass 83. This is a periodic code review pass with no expected code changes unless regressions are discovered.

## Functional Requirements

1. Run `npm run lint` and confirm zero errors and zero warnings.
2. Run `npm test` and confirm all tests pass with zero failures.
3. Run `npm run build` and confirm a clean build.
4. If any gate fails, fix the issue and re-run.
5. Update `conductor/current_directive.md` and `README.md` with the Pass 84 summary.

## Non-Functional Requirements

- Do not introduce new dependencies.
- Do not make speculative code changes.

## Acceptance Criteria

- `npm run lint`: 0 errors, 0 warnings
- `npm test`: all tests pass, 0 failures
- `npm run build`: passes cleanly
- `conductor/current_directive.md` contains Pass 84 summary at the top
- `README.md` pass number and test counts are accurate

## Out of Scope

- New features or refactors
- Addressing deferred tech-debt items unless they are causing gate failures
