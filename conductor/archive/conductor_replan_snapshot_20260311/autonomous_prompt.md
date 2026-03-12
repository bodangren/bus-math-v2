$conductor

Operate in a strict Just-In-Time execution model with one centralized directive.

Step 1: Read `conductor/current_directive.md`, `conductor/tech-debt.md`, and `conductor/lessons-learned.md`.

Step 2: Check `conductor/tracks.md` and `conductor/tracks/` for active work. If there is an `[~] In Progress` track, finish it before doing anything else. If there is no `[~] In Progress` track, plan exactly ONE new track that aligns with `conductor/current_directive.md`. Do not plan multiple tracks, do not create a backlog burst, and do not open unrelated cleanup tracks.

Step 3: Implement the selected track completely, following `conductor/workflow.md`, the project tech stack, and the applicable product documentation.

Step 4: Verify the track with automated tests. Use the relevant project test commands and keep execution non-interactive.

Step 5: Finalize the completed track end-to-end:
- commit the implementation work with non-interactive git commands
- update memory files as needed, keeping `conductor/tech-debt.md` and `conductor/lessons-learned.md` under 50 lines each
- archive the completed track by updating its `metadata.json`, moving the track directory into `conductor/archive/`, removing its active entry from `conductor/tracks.md`, and committing the cleanup

CRITICAL:
- All shell commands MUST use non-interactive flags where applicable. This workflow is unattended.
- The autonomous agent MUST NOT drift from `conductor/current_directive.md`.
- Do not plan or implement more than one new track per run unless you are finishing a pre-existing `[~] In Progress` track.
