# Refactor Spec: Phase Completion Consolidation

## Overview
Phase completion behavior is currently split across two endpoints and two client paradigms. This duplication increases maintenance cost and creates inconsistent behavior around idempotency, error handling, and progress refresh.

This track consolidates phase completion into one canonical API contract and one client integration path.

## Problem Statement
- Two active completion routes exist:
  - `/api/phases/complete`
  - `/api/progress/phase`
- Client usage is split across:
  - `usePhaseCompletion` hook
  - `PhaseCompleteButton` direct fetch logic
- Resulting behavior differs across timestamp, idempotency, and retry semantics.

## Functional Requirements
1. Select one canonical phase completion endpoint and response schema.
2. Migrate all clients to a shared completion client module/hook using that schema.
3. Preserve required behaviors:
   - idempotency
   - sequential access enforcement
   - robust error handling and user feedback
4. Remove/deprecate alternate route and duplicate client path.
5. Add integration tests proving equivalent or improved behavior after consolidation.

## Non-Functional Requirements
- No regression in lesson progression UX.
- Strong type safety for request and response contracts.
- Clear observability/logging for completion failures.

## Acceptance Criteria
1. Exactly one phase completion endpoint is used by runtime UI.
2. `PhaseCompleteButton` and lesson progression use shared completion logic.
3. Idempotency and access-control tests pass for canonical route.
4. Duplicate endpoint/client logic is removed or formally deprecated with clear timeline.
5. Documentation references only the canonical completion flow.

## Out Of Scope
- Broader redesign of activity completion APIs.
- Full offline queue redesign beyond what's needed for consolidation.
- UI redesign unrelated to completion flow behavior.
