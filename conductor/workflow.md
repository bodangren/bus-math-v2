# Project Workflow

## Operating Rules

1. **One Active Track Per Branch**: keep exactly one active implementation track in `conductor/tracks/`.
2. **Plan Before Code**: if product scope, architecture, or deployment assumptions change, update active Conductor docs before implementation continues.
3. **Convex Is Canonical**: do not add or revive parallel runtime database paths.
4. **Cloudflare Is The Deployment Target**: avoid new Vercel-only assumptions in code or docs.
5. **No Unapproved Dependency Changes**: no `npm install` or dependency upgrades without explicit approval.
6. **Non-Destructive Git Only**: no destructive reset/checkout workflows.

## Task Lifecycle

1. Select the next unchecked task from the active track `plan.md`.
2. Mark it `[~]` before implementation.
3. Write or update failing tests first.
4. Implement the smallest change that satisfies the task.
5. Run `npm run lint` and the relevant test suite before marking the task complete.
6. Update related Conductor docs when behavior, architecture, curriculum contracts, or deployment assumptions change.
7. Mark the task `[x]` when verification is complete. Record the commit hash when work is committed.

## Verification Expectations

Minimum verification before a task is marked complete:

- `npm run lint`
- targeted Vitest coverage for changed code
- broader `npm test` when the change touches shared runtime contracts
- `vinext build` for changes that affect deployment/runtime integration

Additional expectations:

- For Convex schema or function changes, verify the local Convex workflow still works.
- For auth and teacher/student boundary changes, include negative tests for unauthorized access.
- For curriculum changes, verify the runtime contract still matches the active curriculum docs.

## Documentation Sync Rules

- Active files in `conductor/` are the source of truth.
- Files in `conductor/archive/` are historical context only.
- `conductor/docs/curriculum/` defines the canonical curriculum structure and lesson archetypes.
- `conductor/tech-stack.md` and `conductor/architecture.md` must stay aligned with the actual runtime, not legacy residue in the repo.

## Track Completion and Archiving

When a track is complete:

1. Confirm all tasks are complete or explicitly deferred.
2. Confirm required tests and linting were run.
3. Move the track directory from `conductor/tracks/<track_id>/` to `conductor/archive/<track_id>/`.
4. Remove the active registry entry from `conductor/tracks.md`.
5. Add or update an archive ledger entry in `conductor/tracks.md` if historical lookup is still needed.

Completed tracks do not stay in the active queue.
