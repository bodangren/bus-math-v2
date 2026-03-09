Step 1: Define a new high-value feature, improvement, refactor, missing test implementation, or tech-debt solution for this project based on the Product Definition and current codebase. Create the corresponding Conductor track artifacts (metadata, spec, and plan).
Step 2: Implement the entire track autonomously with high fidelity, following the Tech Stack and Product Guidelines.
Step 3: Verify the implementation with automated tests and a successful production build.
Step 4: Commit all changes, push to remote, archive the track, and update the README.md with the new functionality. (attach model name and version to commit messages.)
CRITICAL: All shell commands MUST use non-interactive flags (e.g., --yes, --no-interactive) to prevent hanging. This run is entirely unattended.
CAVEAT 1: If the previous LLM run did not complete, there may be hanging unfinished tracks which you need to finish and clean up before moving on.
CAVEAT 2: The first new track of any calendar day should be a refactor / cleanup track: find and refactor duplicate code; update documentation; improve UI and UX; do a security review and patch any serious or critical issues.
