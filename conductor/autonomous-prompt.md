/conductor
Step 1: Load Context. Read `conductor/current_directive.md`, `conductor/tech-debt.md`, `conductor/lessons-learned.md`, `conductor/tracks.md`.
Step 2: Resume or Plan.
- If there is an `[~] In Progress` phase, finish it. Do not start a new phase.
- If no incomplete phases, define exactly ONE new track serving `current_directive.md`. Create track artifacts.
Step 3: Implement a SINGLE PHASE autonomously with TDD (Red-Green-Refactor). Use appropriate skills for all implementation.
- For each task: attach git notes per conductor protocol, merge changes, and push.
Step 4: Verify. Run full test suite, run build, correct any build errors.
Step 5: Finalize.
- Update `tech-debt.md` and `lessons-learned.md` (keep ≤50 lines).
- Commit and push phase checkpoint.
CRITICAL: All shell commands MUST use non-interactive flags (--yes, --no-interactive, etc.). Unattended run only.
