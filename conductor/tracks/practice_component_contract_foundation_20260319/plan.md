# Implementation Plan: Practice Component Contract Foundation

## Phase 1: Contract Red Tests

### Tasks

- [x] **Task: Add failing contract coverage tests**
  - [x] Add source-level tests for the canonical practice mode vocabulary and normalized submission envelope
  - [x] Add coverage that compares the active curriculum contract doc against the shared runtime contract surface where practical
  - [x] Add a red-path test for legacy payload compatibility expectations

## Phase 2: Canonical Contract Surface

### Tasks

- [x] **Task: Check in the canonical curriculum contract**
  - [x] Add the active curriculum doc for reusable practice components
  - [x] Update the Conductor index and implementation-model references
  - [x] Document mode semantics, teacher-review expectations, and persistence requirements

- [x] **Task: Add shared runtime contract helpers**
  - [x] Introduce shared `practice.v1` types or schemas for normalized submissions (`lib/practice/contract.ts`)
  - [x] Define the compatibility seam for legacy components
  - [x] Keep existing activity keys and registry behavior stable

## Phase 3: Runtime and Validator Alignment

### Tasks

- [x] **Task: Align activity-renderer submission expectations**
  - [x] Update runtime payload handling to accept the canonical submission envelope
  - [x] Normalize older `answers` / `responses` payloads through a temporary compatibility path
  - [x] Preserve current auto-graded submission behavior while introducing the new envelope

- [x] **Task: Align validator and persistence seams**
  - [x] Update schema/validator surfaces that govern practice submissions
  - [x] Ensure the normalized envelope can be persisted without losing artifacts or part-level evidence
  - [x] Keep full migration of existing stored records out of scope unless required for safety

## Phase 4: Verification and Closeout

### Tasks

- [ ] **Task: Run contract verification**
  - [ ] Run the targeted tests added for the contract and compatibility seams
  - [ ] Run `npm run lint`
  - [ ] Fix any regressions

- [ ] **Task: Update Conductor memory files if needed**
  - [ ] Add lessons learned if the new contract reveals a reusable planning pattern
  - [ ] Record any new near-term debt that should shape the queued backfill or teacher-evidence tracks
