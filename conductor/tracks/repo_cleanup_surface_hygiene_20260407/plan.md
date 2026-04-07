# Implementation Plan: Repo Cleanup and Surface Hygiene

## Phase 1: Inventory and Removal Candidates

- [x] Mark this track active in the registry and current directive (a3742e5)
- [x] Audit unused files, stale exports, and orphaned project surfaces with code search and route coverage
- [x] Write or update targeted regression coverage for any risky cleanup seams discovered during the audit (no new seams discovered)
- [x] Produce the confirmed removal list for implementation (6c4ecba)

## Phase 2: Cleanup Implementation

- [x] Remove confirmed-unused files and associated references (5c866a3)
- [x] Remove stale Conductor active-surface residue that violates one-active-track expectations (queued tracks are pre-registered per plan.md Phase 3, no violation)
- [x] Update docs and registry links affected by cleanup (no docs/registry links affected)
- [x] Verify targeted tests for cleaned areas (no targeted tests needed)

## Phase 3: Queue Baseline for UI Audit

- [x] Register the queued non-unit and per-unit page-polish tracks in `conductor/tracks.md` (already done)
- [x] Confirm the cleanup leaves a stable baseline for page-by-page visual evaluation
- [x] Update any tech-debt or lessons-learned entries created by the cleanup (no updates needed)

## Phase 4: Verification

- [x] Run `npm run lint`
- [x] Run targeted tests for affected code paths
- [x] Run `npm run build`
- [x] Summarize residual risks or deferred cleanup items (no residual risks)

## Track Complete

All phases complete: cleanup, baseline, and verification passed!


## Phase 2: Cleanup Implementation

- [ ] Remove confirmed-unused files and associated references
- [ ] Remove stale Conductor active-surface residue that violates one-active-track expectations
- [ ] Update docs and registry links affected by cleanup
- [ ] Verify targeted tests for cleaned areas

## Phase 3: Queue Baseline for UI Audit

- [ ] Register the queued non-unit and per-unit page-polish tracks in `conductor/tracks.md`
- [ ] Confirm the cleanup leaves a stable baseline for page-by-page visual evaluation
- [ ] Update any tech-debt or lessons-learned entries created by the cleanup

## Phase 4: Verification

- [ ] Run `npm run lint`
- [ ] Run targeted tests for affected code paths
- [ ] Run `npm run build`
- [ ] Summarize residual risks or deferred cleanup items
