/conductor
Step 1: Check State. Read `conductor/current_directive.md`, `conductor/tech-debt.md`, and `conductor/lessons-learned.md`. 
Step 2: Resume or Plan. 
  - If there is an `[~] In Progress` track in `conductor/tracks.md`, DO NOT create a new track. Your sole job is to finish the next phase in that track.
  - If there are no incomplete tracks, define exactly ONE new track that strictly adheres to the goals in `conductor/current_directive.md`. Create the track artifacts.
Step 3: Implement the track phase autonomously with high fidelity.
  - For tracks that involve UI components (e.g., accounting engine or practice family tracks), spawn the `ui_designer` subagent (`.codex/agents/ui-designer.toml`) before implementation to get visual design specs. Build from those specs rather than inventing layout and interaction design inline.
Step 4: Verify the implementation. You MUST run the full automated test suite and ensure a successful production build. Do not commit if tests fail.
Step 5: Finalize. 
  - Commit changes and push to remote (include model/version in commit message). 
  - Update `tech-debt.md` and `lessons-learned.md` (keep under 50 lines).
  - Move any completed track folder to `conductor/archive/` and remove it from `conductor/tracks.md`.
  - Commit this cleanup with the message `chore(conductor): Archive completed track`.
CRITICAL: All shell commands MUST use non-interactive flags (e.g., --yes, --no-interactive). This is an unattended run.
