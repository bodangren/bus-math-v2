# Current Strategic Directive

The full 8-unit curriculum, capstone, student study runtime, teacher monitoring, and Cloudflare deployment are complete. Milestones 1–7 closed on March 16, 2026 through April 6, 2026.

The project is now in a post-milestone cleanup and polish phase beginning on April 7, 2026.

## Phase Focus

This phase has two serialized goals:

1. clean the repository so the active codebase and Conductor surface contain only live, intentional files and references
2. run a page-by-page product audit and fix visible UI discrepancies such as overflow, clipping, alignment drift, spacing imbalance, and responsive layout failures

## Required Execution Order

Tracks in this phase must run in this order:

1. **Repo Cleanup and Surface Hygiene**
2. **Non-Unit Page Evaluation and Polish**
3. **Unit 1 Page Evaluation and Polish**
4. **Unit 2 Page Evaluation and Polish**
5. **Unit 3 Page Evaluation and Polish**
6. **Unit 4 Page Evaluation and Polish**
7. **Unit 5 Page Evaluation and Polish**
8. **Unit 6 Page Evaluation and Polish**
9. **Unit 7 Page Evaluation and Polish**
10. **Unit 8 Page Evaluation and Polish**

One implementation track may be active at a time. Do not begin the next UI audit track until the current track is verified, documented, and archived.

## In-Bounds Work

Every active track in this phase must directly support at least one of these outcomes:

- remove unused files, dead exports, stale imports, obsolete helper surfaces, and planning residue that no longer belong to the active product
- reconcile Conductor queue hygiene so the active registry and active track directory describe the same reality
- fix page-level UI defects on the rendered product, including horizontal overflow, clipped controls, broken wrapping, uneven spacing, misalignment, inconsistent container widths, and poor mobile behavior
- preserve or improve student clarity and teacher signal on every touched page
- close cleanup-adjacent tech debt discovered during the audit when it blocks repository hygiene or page correctness

## Phase Exit Gates

This phase is only complete when all of the following are true:

- the repository no longer contains confirmed-unused project files or stale active-track residue
- non-unit pages have been audited and corrected
- each instructional unit has completed its own page-polish track
- touched pages render cleanly on desktop and mobile widths without obvious overflow or alignment defects
- Conductor planning artifacts accurately reflect the active queue and archive state
- required verification for each track has been run and recorded

## Quality Bar For Page Audits

For every page-polish track:

- inspect the real rendered page, not just the source
- verify desktop and mobile layouts
- fix visible issues before moving on, rather than recording obvious defects for later
- preserve the existing visual language unless a correction is necessary for clarity, hierarchy, or responsiveness
- keep the curriculum-first product story intact across public, student, and teacher surfaces

## Deferred Work

The following remain out of scope for this phase unless they block cleanup or page correctness:

- new product features
- new curriculum content beyond the existing 8 units and capstone
- admin tooling
- in-app curriculum authoring
- dependency upgrades or package additions without explicit approval
- broad architectural refactors unrelated to cleanup or rendered-page quality

## Current High-Level Priorities (2026-04-07)

1. **Repo Cleanup and Surface Hygiene** — active first track; establish a clean, trustworthy baseline.
2. **Non-Unit Page Evaluation and Polish** — next track after cleanup closes.
3. **Unit-by-Unit Page Evaluation and Polish** — execute one unit per track after the non-unit pass is complete.

## Notes

- Existing open tech-debt items still matter, but this phase prioritizes the items that directly affect cleanup, rendered-page correctness, or the reliability of follow-on UI audits.
- If a page audit exposes a deeper runtime or auth defect, fix it in the owning track only when it is necessary to make the page correct and testable; otherwise record it and keep the serialized queue moving.
