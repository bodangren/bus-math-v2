# Implementation Plan: Repo Cleanup and Surface Hygiene

## Phase 1: Inventory and Removal Candidates

- [ ] Mark this track active in the registry and current directive
- [ ] Audit unused files, stale exports, and orphaned project surfaces with code search and route coverage
- [ ] Write or update targeted regression coverage for any risky cleanup seams discovered during the audit
- [ ] Produce the confirmed removal list for implementation

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
