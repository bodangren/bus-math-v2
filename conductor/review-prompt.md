/review

CODE REVIEW — PAST 24 HOURS

You are reviewing all work done in the past 24 hours. Be thorough but focused.

1. Gather recent changes:
   - Run: git log --since="24 hours ago" --oneline
   - Run: git diff --name-only HEAD~20 HEAD
   - Read: conductor/tracks.md, conductor/tech-debt.md

2. Review each changed code file for:
   - Correctness: logic errors, edge cases, type safety
   - Style: follows project conventions (see conductor/code_styleguides/)
   - Tests: each changed module has corresponding tests
   - Security: no hardcoded secrets, inputs sanitized
   - Performance: no obvious N+1 queries, unnecessary re-renders, memory leaks

3. Run the full test suite: CI=true npm test (or equivalent)

4. Run lint/typecheck: npm run lint && npm run typecheck (or equivalent)

5. Fix up to 5-7 lint warnings or minor issues if found. Do NOT refactor unrelated code.

6. If you find architectural problems, note them in tech-debt.md (≤50 lines) — do not fix them now.

7. Commit any fixes with message: "chore(review): fix N lint/style issues"

8. Report: list the files reviewed, issues found, issues fixed, and any architectural concerns for tech-debt.md.

9. Adjust the current-priority.md if you see a trend.

CRITICAL UNATTENDED RULES:
- Any prompt asking "Proceed?" or "Continue?" → answer yes.
- Never wait for human input.
- If tests fail and you cannot fix them in 2 attempts, commit what you have and report the failure.
