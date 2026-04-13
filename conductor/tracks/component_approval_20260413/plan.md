# Implementation Plan: Component Approval Workflow

## [x] Phase 1: Approval Contract and Schema

- [x] Audit reviewable component identity across examples, activities, and practice components
  - [x] Identify canonical component ids and placement metadata
  - [x] Document any components that lack stable ids as track tech debt
  - [x] Define the deterministic version hash inputs for each component type
- [x] Write tests for approval status/category validators and stale hash behavior
- [x] Implement Convex schema support for approval summaries and review history
  - [x] Add approval summary persistence on component records or a dedicated `componentApprovals` table
  - [x] Add `componentReviews` history records
  - [x] Add indexes for component lookup, status filtering, type filtering, and stale/needs-review queues
- [x] Implement shared approval types and validators
- [x] Run targeted schema/type tests and `npm run lint`

## [x] Phase 2: Review Mutations and Audit Queries

- [x] Write tests for review mutations
  - [x] Approve stores reviewer, timestamp, version hash, and history
  - [x] Changes requested requires improvement notes
  - [x] Rejected requires improvement notes
  - [x] Invalid issue categories are rejected
  - [x] Student and teacher roles cannot write approval records
- [x] Implement review mutations with developer/admin authorization
- [x] Write tests for review queue and LLM audit queries
  - [x] Filter by component type
  - [x] Filter by approval/effective status
  - [x] Filter by placement where known (placeholder, ready for future extension)
  - [x] Return stale components when hashes differ (added includeStale flag and effectiveStatus)
  - [x] Return unresolved notes and issue categories for rework audits
- [x] Implement review queue queries and unresolved review-note queries
- [x] Run relevant Convex/function tests and `npm run lint`

## [~] Phase 3: Dev Review Queue Surface

- [x] Write UI/access tests for the dev-only review queue route
  - [x] Developer/admin can load the queue
  - [x] Student/teacher access is denied or redirected
  - [x] Queue filters render and apply correctly
  - [x] Stale and changes-requested states are visible
- [x] Build the dev-only review queue route
  - [x] Add filters for type, status, placement, recently changed, and needs re-review
  - [x] Show identity, placement, current hash, effective status, reviewer, timestamp, notes, and categories
  - [ ] Link each row to the appropriate review harness
- [x] Add review action controls shared by all component types
  - [x] Approve
  - [x] Request changes with required notes
  - [x] Reject with required notes
  - [x] Optional approved-note support
- [x] Run targeted UI tests and `npm run lint`

## Phase 4: Component Review Harnesses

- [ ] Write tests for the example review harness
  - [ ] Renders all three modes
  - [ ] Allows manual mode switching
  - [ ] Exercises multiple practice variants
  - [ ] Prevents approval until required checks are completed
- [ ] Implement the example review harness
- [ ] Write tests for the practice review harness
  - [ ] Runs attempts
  - [ ] Tests answer validation and feedback
  - [ ] Shows evidence payloads where applicable
  - [ ] Exercises randomized variants where applicable
- [ ] Implement the practice review harness
- [ ] Write tests for the activity review harness
  - [ ] Renders instructions and interaction flow
  - [ ] Exercises completion behavior
  - [ ] Shows evidence/completion payloads where applicable
- [ ] Implement the activity review harness
- [ ] Run targeted harness tests and `npm run lint`

## Phase 5: Stale Approval and Rework Loop Integration

- [ ] Write tests for approval invalidation after component content changes
- [ ] Implement stale approval detection in queue/query paths
- [ ] Add a clear re-review path from stale or changes-requested components back to manual approval
- [ ] Add LLM-audit-ready query output for unresolved notes grouped by issue category and component type
- [ ] Ensure LLM/audit query paths cannot mark reviews resolved or approved
- [ ] Run relevant query/mutation tests and `npm run lint`

## Phase 6: Verification and Documentation

- [ ] Update `conductor/curriculum/` documentation if approval metadata becomes part of the canonical curriculum contract
- [ ] Update `conductor/tech-debt.md` with any components lacking stable ids or harness support
- [ ] Run `npm run lint`
- [ ] Run targeted Vitest suites for schema, mutations, stale detection, and UI review surfaces
- [ ] Run broader `npm test` because Convex review state and shared component harnesses touch multiple runtime contracts
- [ ] Run build verification
- [ ] Record verification results in this plan before closeout
- [ ] Update `conductor/tracks.md` with closeout details
- [ ] Archive the track when complete
