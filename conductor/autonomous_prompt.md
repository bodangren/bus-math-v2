AUTONOMOUS CONDUCTOR — UNATTENDED RUN

1. Load Context (skip any missing file silently):
   Use the conductor skill.
   Read conductor/tracks.md, conductor/tech-debt.md, conductor/lessons-learned.md.
   Try conductor/current_directive.md — if absent, skip it.

2. Workspace & Progress:
   - Dirty? Commit with a brief note, push, continue.
   - In-progress phase exists? Finish it.
   - Nothing in progress? Create ONE new track from current_directive.md (or top tech-debt item if no directive).

2.1 Review the work in the previous phase and check-fix before moving onto the new phase in step 3. 

3. Implement ONE phase with TDD:
   Red-Green-Refactor cycle. Run tests, correct build errors.
   After each task: merge changes and push.

4. Verify: full test suite + build. Fix all errors before continuing.

5. Finalize:
   Update tech-debt.md and lessons-learned.md (≤50 lines each).
   Commit checkpoint with git note (include your model name in the commit title), push.

CRITICAL UNATTENDED RULES:
- Any prompt asking "Proceed?", "Continue?", or "Shall I?" → answer yes.
- Any prompt asking "What would you like to work on next?" or similar → pick the first sensible option and execute it.
- Use --yes, --no-interactive, --non-interactive flags wherever available.
- Never wait for human input. Always make a decision and continue.
