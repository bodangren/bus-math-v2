# Tasks: Refactor - Phase Completion Consolidation

## Phase 1: Contract Selection And Red Tests
- [ ] Task: Choose canonical completion contract
    - [ ] Task: Compare `/api/phases/complete` vs `/api/progress/phase` behaviors
    - [ ] Task: Document canonical request/response schema and status codes
- [ ] Task: Write failing contract tests (Red phase)
    - [ ] Task: Add tests for idempotency replay behavior
    - [ ] Task: Add tests for unauthorized, forbidden, conflict, and success cases
    - [ ] Task: Add tests for progress refresh expectations after completion

## Phase 2: Shared Client Path Migration
- [ ] Task: Implement shared client completion module/hook
    - [ ] Task: Centralize fetch, schema parsing, and error normalization
    - [ ] Task: Ensure completion callbacks and state transitions are preserved
- [ ] Task: Migrate `PhaseCompleteButton` to shared client path
    - [ ] Task: Remove duplicate request parsing/formatting logic from component
    - [ ] Task: Keep UX messaging and optimistic updates aligned with canonical contract
- [ ] Task: Update lesson flow consumers to use shared completion path
    - [ ] Task: Ensure cache invalidation/progress refresh occurs reliably

## Phase 3: Decommission Duplicate Path
- [ ] Task: Remove or deprecate non-canonical completion endpoint
    - [ ] Task: Remove dead client usage (`usePhaseCompletion` or direct fetch path, based on chosen contract)
    - [ ] Task: Clean up obsolete tests and mocks
- [ ] Task: Run route + component integration tests (Green phase)
    - [ ] Task: Confirm no behavior regression in lesson progression
    - [ ] Task: Confirm idempotency and lock enforcement remain correct

## Phase 4: Documentation And Follow-Through
- [ ] Task: Update architecture docs with canonical completion flow
    - [ ] Task: Document endpoint, client entry point, and error semantics
    - [ ] Task: Add migration notes for future contributors
