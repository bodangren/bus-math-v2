# Implementation Plan: Practice Component Contract Foundation

## Phase 1: Contract Red Tests

### Tasks

- [ ] **Task: Add failing contract coverage tests**
  - [ ] Add source-level tests for the canonical practice mode vocabulary and normalized submission envelope
  - [ ] Add coverage that compares the active curriculum contract doc against the shared runtime contract surface where practical
  - [ ] Add a red-path test for legacy payload compatibility expectations

## Phase 2: Canonical Contract Surface

### Tasks

- [ ] **Task: Check in the canonical curriculum contract**
  - [ ] Add the active curriculum doc for reusable practice components
  - [ ] Update the Conductor index and implementation-model references
  - [ ] Document mode semantics, teacher-review expectations, and persistence requirements

- [ ] **Task: Add shared runtime contract helpers**
  - [ ] Introduce shared `practice.v1` types or schemas for normalized submissions
  - [ ] Define the compatibility seam for legacy components
  - [ ] Keep existing activity keys and registry behavior stable

## Phase 3: Runtime and Validator Alignment

### Tasks

- [ ] **Task: Align activity-renderer submission expectations**
  - [ ] Update runtime payload handling to accept the canonical submission envelope
  - [ ] Normalize older `answers` / `responses` payloads through a temporary compatibility path
  - [ ] Preserve current auto-graded submission behavior while introducing the new envelope

- [ ] **Task: Align validator and persistence seams**
  - [ ] Update schema/validator surfaces that govern practice submissions
  - [ ] Ensure the normalized envelope can be persisted without losing artifacts or part-level evidence
  - [ ] Keep full migration of existing stored records out of scope unless required for safety

## Phase 4: Verification and Closeout

### Tasks

- [ ] **Task: Run contract verification**
  - [ ] Run the targeted tests added for the contract and compatibility seams
  - [ ] Run `npm run lint`
  - [ ] Fix any regressions

- [ ] **Task: Update Conductor memory files if needed**
  - [ ] Add lessons learned if the new contract reveals a reusable planning pattern
  - [ ] Record any new near-term debt that should shape the queued backfill or teacher-evidence tracks
