# Test-Driven Development Workflow

This guide defines the GitHub issue–centric, test-driven development (TDD) workflow for Math for Business Operations v2. Follow it end to end for every slice of work so engineering, curriculum, and Supabase changes ship safely.

## Core Principles
- Treat GitHub issues as the single source of truth for scope, acceptance criteria, and owners.
- Keep the worktree clean; branch from `main` only after syncing the latest commits.
- Drive every change with TDD: write or update tests first, implement the minimal code to pass, and refactor with test coverage in place.
- Use Vitest for unit and integration coverage; keep specs alongside the code they exercise.
- Use the chrome-devtools MCP server for browser and UI validation; capture findings in issues and PRs.
- Automate collaboration with the `gh` CLI, and lean on the `~/.claude/local/node_modules/.bin/claude /review` command for fast, consistent PR reviews.
- Update documentation and seeds alongside code whenever behaviour, schema, or workflows change.

## Daily Kickoff
1. `git status` — ensure there are no local edits except the slice you are working on.
2. `git pull origin main --ff-only` — sync with the canonical branch.
3. Review `docs/sprints/` for the current sprint outline and confirm open priorities in `AGENTS.md` or the sprint tracker.
4. Skim the backlog for blockers or dependencies; leave clarifying comments on issues before coding.

## Issue Lifecycle
1. **Create or refine the issue**
   - `gh issue create --title "Epic: Lesson Rendering API" --body-file issue.md --assignee @agent-handle --label epic`
   - Include: motivation, test strategy (unit/integration/chrome-devtools UI/E2E), acceptance criteria, rollback notes, doc updates, Supabase migration needs.
   - Link to the parent epic in `docs/sprints/epics.md` and note cross-team dependencies.
2. **Plan with TDD**
   - Break the issue into testable behaviours. Capture the expected failing tests directly in the issue checklist.
   - Confirm which environments, migrations, or seed scripts must change; flag security or RLS updates early.
3. **Start the slice**
   - `gh issue view 123` to confirm scope.
   - `git switch -c feat/123-lesson-rendering` (pattern `<type>/<issue>-<slug>`).
   - Run `npm install` only if previously approved upgrades exist; otherwise use the current lockfile.

## TDD Working Loop
For each checklist item or subtask:
1. **Red** — add or adjust the Vitest spec so it fails for the right reason (`npx vitest --watch` for tight loops).
2. **Green** — implement the minimal code in `app/`, `components/`, `lib/`, `supabase/`, or `public/` to satisfy the test. Keep schema changes in generated migration files.
3. **Refactor** — clean the implementation while tests stay green. Update Supabase seeds, shared helpers, and docs as needed.
4. **Validate** — run `npm run lint` plus targeted checks:
   - Unit/integration: `npx vitest --run`.
   - Browser/UI: exercise key flows through the chrome-devtools MCP server and record assertions/screenshots.
   - Database: Supabase CLI commands or SQL assertions.
5. **Document** — if the change impacts architecture, workflow, or schema, update the relevant markdown in `docs/` within the same branch.

## Commit Discipline
- Use Conventional Commits and reference the issue: `git commit -am "feat: add lesson phase renderer #123"`.
- Keep commits small and narrative-driven (test commit, implementation commit, refactor commit).
- Ensure `npm run lint` and required tests pass before every commit.

## Publish & Review
1. Push the branch: `git push -u origin feat/123-lesson-rendering`.
2. Create the PR from the CLI:
   ```bash
   gh pr create \
     --title "feat: render lesson phases from Supabase (#123)" \
     --body-file pr.md \
     --base main \
     --head feat/123-lesson-rendering \
     --label "ready-for-review" \
     --reviewer @curriculum-agent @platform-agent
   ```
   - Attach test evidence (`npm run lint`, `npx vitest --run`, chrome-devtools MCP UI runs, E2E suites).
   - Link Supabase migrations, seeds, and doc updates.
3. Run the automated reviewer once the PR is ready:
   ```bash
   ~/.claude/local/node_modules/.bin/claude /review
   ```
   - Paste the generated findings into the PR as a comment or summary.
   - Address any issues it raises before requesting human review.

## Feedback Loop
1. `gh pr view --web` or `gh pr checkout <pr-number>` to process reviewer comments quickly.
2. For changes requested:
   - Update tests first (Red).
   - Implement fixes (Green), refactor, and rerun `npm run lint`, Vitest, and chrome-devtools MCP UI checks plus any other affected suites.
   - Push follow-up commits; keep the branch history clean.
3. Respond to each comment in GitHub. Summarise validation (`npm run lint`, test suite names) after every revision.

## Merge & Follow-Through
1. Once approvals and checks are green:
   - `gh pr merge --squash --delete-branch` (respect any release manager policies).
2. Close the issue with context:
   - `gh issue comment 123 --body "Resolved in #456. Tests: lint ✔, vitest ✔, chrome-devtools UI ✔, e2e ✔."`
   - `gh issue close 123`
3. Update sprint artifacts:
   - Note progress in the sprint doc.
   - If scope changed, open follow-up issues immediately.
4. Verify the Vercel preview or deployment once merged; rollback if Supabase migrations or seeds misbehave.

## Retro & Continuous Improvement
- Capture learnings in sprint retrospectives: what made TDD effective, tooling gaps, doc updates required.
- Automate repetitive steps (issue templates, `gh` aliases, npm scripts) but keep this workflow as the source of truth.
- Revisit this guide when Supabase schema, testing stacks, or agent responsibilities evolve.

Following this loop keeps the codebase releasable, the team aligned on expectations, and the classroom experience dependable.
