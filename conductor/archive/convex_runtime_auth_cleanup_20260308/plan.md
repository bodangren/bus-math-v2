# Implementation Plan: Convex Runtime Parity & Auth Resilience

## Phase 1: Review, Tests, and Track Setup

- [x] Task 1.1: Mark this track active in Conductor and capture the review findings that motivated it
- [x] Task 1.2: Write failing tests for a shared Convex runtime config module
  - [x] Add coverage for canonical URL resolution
  - [x] Add coverage for deploy-key precedence over local fallback
  - [x] Add coverage for local `.convex` admin-key fallback
  - [x] Add coverage for explicit production failure when admin auth is unavailable
- [x] Task 1.3: Run the new focused config tests and confirm they fail
- [x] Task: Conductor - User Manual Verification 'Phase 1: Review, Tests, and Track Setup' (Automated verification only; unattended run)

## Phase 2: Shared Runtime Adapter and Auth Hardening

- [x] Task 2.1: Implement `lib/convex/config.ts` and refactor `lib/convex/server.ts` to use it
  - [x] Preserve public/internal query and mutation helpers
  - [x] Keep internal auth server-only
  - [x] Return actionable admin-auth/config errors
- [x] Task 2.2: Update login and demo-provisioning tests to reflect the hardened error flow
- [x] Task 2.3: Run focused auth/runtime tests and confirm they pass
- [x] Task: Conductor - User Manual Verification 'Phase 2: Shared Runtime Adapter and Auth Hardening' (Automated verification only; unattended run)

## Phase 3: Remove URL Duplication and Refresh UX/Docs

- [x] Task 3.1: Refactor Convex client consumers to use the canonical URL helper
  - [x] `components/ConvexClientProvider.tsx`
  - [x] landing/curriculum/preface/dashboard/teacher server pages that create Convex clients
- [x] Task 3.2: Update page/provider tests affected by the shared config change
- [x] Task 3.3: Refresh README and Conductor docs to match the Convex-first runtime and local setup
- [x] Task: Conductor - User Manual Verification 'Phase 3: Remove URL Duplication and Refresh UX/Docs' (Automated verification only; unattended run)

## Phase 4: Verification, Build, and Cleanup

- [x] Task 4.1: Run non-interactive verification commands for lint, tests, and production build
- [x] Task 4.2: Update track metadata and registry state for completion
- [x] Task 4.3: Commit implementation, push remote branch, and archive the completed track
