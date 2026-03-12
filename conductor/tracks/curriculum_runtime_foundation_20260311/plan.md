# Implementation Plan: Curriculum Runtime Foundation

## Phase 1 - Platform Baseline

- [ ] Task: Add failing tests that pin the intended Cloudflare/Vinext + Convex runtime assumptions.
  - [ ] Write tests or assertions that fail if active docs or critical runtime config still claim Supabase/Vercel as the current platform.
  - [ ] Run the targeted tests and confirm they fail first.
- [ ] Task: Implement the Cloudflare deployment baseline for the Vinext app.
  - [ ] Add the minimal Worker configuration and deployment entry points required for the production target.
  - [ ] Document required environment variables and local-vs-production expectations.
  - [ ] Verify the build path with the relevant runtime command.
- [ ] Task: Remove or isolate Vercel-only runtime assumptions from active code paths.
  - [ ] Identify environment helpers that still branch on Vercel-only deployment behavior.
  - [ ] Refactor them to be Cloudflare-compatible without breaking local development.
  - [ ] Add regression tests for the new environment behavior.

## Phase 2 - Legacy Surface Cleanup

- [ ] Task: Write failing guard tests for legacy platform residue that still looks active.
  - [ ] Add source-level or behavior-level tests that expose active Supabase/Drizzle/Vercel runtime confusion.
  - [ ] Confirm the tests fail before cleanup.
- [ ] Task: Remove or quarantine stale Supabase and Drizzle runtime paths that are no longer canonical.
  - [ ] Clean up debug routes, helper modules, and docs that still imply a second active backend.
  - [ ] Update the active documentation surface to match the post-cleanup reality.
  - [ ] Re-run lint and the targeted regression suite.
- [ ] Task: Reconcile dependencies and repo messaging with the actual runtime.
  - [ ] Identify packages and starter files that remain only as migration residue.
  - [ ] Keep or remove them deliberately, and document the rationale where removal is deferred.

## Phase 3 - Curriculum Runtime Contract

- [ ] Task: Add failing tests for the curriculum telemetry and standards contract.
  - [ ] Capture the current `linkedStandardId` mismatch with a failing route or helper test.
  - [ ] Add tests that pin the canonical lesson archetype phase sequences.
- [ ] Task: Implement the canonical lesson and standards contract.
  - [ ] Align route validation, Convex lookups, and curriculum docs on one standards identifier format.
  - [ ] Encode the lesson archetype phase contracts in the relevant runtime helpers or schema-adjacent utilities.
  - [ ] Verify the targeted contract tests now pass.
- [ ] Task: Normalize the publishing model around published lesson versions only.
  - [ ] Confirm student and teacher flows resolve only the latest published lesson versions.
  - [ ] Add coverage where the current tests do not fully pin that behavior.

## Phase 4 - Shared Student and Teacher Foundation

- [ ] Task: Write failing regression tests for shared student/teacher progress behavior where gaps remain.
  - [ ] Target the student resume/start flow and teacher monitoring read models.
  - [ ] Confirm tests fail before any implementation change.
- [ ] Task: Finish shared progress-model cleanup needed for the next content tracks.
  - [ ] Remove any remaining duplicate progress assembly that can drift between student and teacher surfaces.
  - [ ] Ensure teacher monitoring stays read-only and derives from the same published progress helpers.
  - [ ] Re-run the targeted route, helper, and component suites.

## Phase 5 - Exit Criteria

- [ ] Task: Verify the foundation track against local development and build expectations.
  - [ ] Run `npm run lint`.
  - [ ] Run the relevant Vitest suites.
  - [ ] Run the deployment-facing build command for Vinext.
- [ ] Task: Update Conductor memory and queue for the next implementation tracks.
  - [ ] Record the lessons learned from the foundation cleanup.
  - [ ] Update the tech debt registry with any deliberate deferrals.
  - [ ] Confirm the next planned tracks are still ordered correctly after the work lands.
