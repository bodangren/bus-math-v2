# Implementation Plan: Teacher Intervention Dashboard

## Phase 1: Shared Analytics and Export Contract

- [x] Task: Define intervention analytics utilities
  - [x] Write unit tests for status derivation, priority sorting, and filter behavior
  - [x] Implement shared teacher intervention utility module
  - [x] Refactor teacher dashboard and CSV export code to consume shared analytics helpers

- [x] Task: Extend teacher CSV export contract
  - [x] Write or update CSV utility tests for new intervention columns
  - [x] Implement export changes for display name, status, and needs-attention fields
  - [x] Verify CSV formatting remains stable for missing display names and invalid activity dates

## Phase 2: Teacher Dashboard Intervention Experience

- [x] Task: Add dashboard intervention summary and filtered roster
  - [x] Write failing component tests for summary cards, status badges, filter controls, and empty states
  - [x] Implement the intervention panel UI with accessible filter buttons and status badges
  - [x] Ensure layout works for mobile and desktop widths

- [x] Task: Wire dashboard ordering and shared analytics into the teacher page
  - [x] Write or update page-level tests for the new intervention content
  - [x] Integrate derived analytics into teacher dashboard props and rendering
  - [x] Validate no regressions to existing course overview content

## Phase 3: Verification and Track Closeout

- [x] Task: Run automated verification for the track
  - [x] Execute targeted tests for teacher dashboard and CSV utilities
  - [x] Execute `CI=true npm run lint`
  - [x] Execute `CI=true npm test`
  - [x] Execute `CI=true npm run build`

- [x] Task: Update documentation for the new dashboard capability
  - [x] Update README teacher dashboard functionality summary
  - [x] Record any implementation deviations in track metadata if needed

- [x] Task: Close out the conductor track
  - [x] Mark completed tasks and metadata counts
  - [x] Archive the track and update the tracks registry
