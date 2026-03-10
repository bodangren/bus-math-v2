# Specification: React Test Signal Cleanup & Conductor Queue Closeout

## Overview

The March 9 dashboard/auth hardening work improved product behavior but left two cleanup gaps that now reduce unattended verification quality: `InventoryManager` can emit duplicate React keys when multiple notifications are generated in the same millisecond, and several async tests still produce `act(...)` warnings that hide real regressions in CI logs. Conductor state also still shows completed February tracks as active, which makes the execution queue unreliable for future autonomous runs.

This first cleanup/refactor track for March 10, 2026 addresses those issues directly. It focuses on deterministic React rendering, warning-free async test patterns, and Conductor queue hygiene without changing curriculum or auth product behavior.

## Functional Requirements

### FR1: Deterministic Inventory Notification Keys

`InventoryManager` shall generate stable unique identifiers for notifications and market events even when several state updates happen in the same event loop tick.

- Notification cards must not share a React `key`.
- Market event identifiers must remain unique across rapid successive generations.
- Existing gameplay behavior and user-facing text must remain unchanged.

### FR2: Warning-Free Async Tests

Targeted tests around teacher submission detail rendering and phase completion shall stop emitting avoidable React `act(...)` warnings.

- `SubmissionDetailModal` tests must await the async fetch lifecycle before finishing.
- `usePhaseCompletion` hook tests must wrap stateful completion calls with the correct async test utilities.
- New assertions shall prove the cleaned-up paths no longer trigger React warning output.

### FR3: Conductor Queue Hygiene

Conductor planning state shall stop presenting completed historical tracks as active work.

- The stale completed February tracks currently under `conductor/tracks/` shall be archived or otherwise removed from the active execution queue.
- `conductor/tracks.md` shall reflect the cleanup so only genuinely active work remains listed as active.
- Track metadata status shall align with archived placement.

## Non-Functional Requirements

- Follow TDD: add or tighten tests first and confirm a red phase before relying on implementation changes.
- Do not add or upgrade dependencies.
- Keep shell commands non-interactive and unattended-safe.
- Preserve current Vinext, React 19, TypeScript, Tailwind, and Convex architecture.
- Keep new shared logic covered above 80% for touched modules.

## Acceptance Criteria

- [ ] Given multiple notifications are created during the same action in `InventoryManager`, when the component renders, then React does not emit duplicate-key warnings.
- [ ] Given the submission detail modal tests run, when fetch-driven state updates settle, then the tests pass without `act(...)` warnings.
- [ ] Given the phase completion hook tests run, when async completion and retry flows execute, then the tests pass without `act(...)` warnings.
- [ ] Given Conductor state is reviewed after implementation, when `conductor/tracks.md` and track directories are checked, then stale completed February tracks are no longer left in the active queue.
- [ ] Given unattended verification runs, when `CI=true npm run lint`, `CI=true npm test`, and `CI=true npm run build` execute, then all commands succeed.

## Out of Scope

- New lesson content, new dashboard features, or schema changes.
- Reworking the broader simulation UX beyond deterministic key generation.
- Reopening already archived March 9-10 feature tracks except for queue bookkeeping.
