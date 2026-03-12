# Implementation Plan: Curriculum Runtime Foundation

## Phase 1 - Platform Baseline

- [x] Task: Add failing tests that pin the intended Cloudflare/Vinext + Convex runtime assumptions.
  - [x] Write tests or assertions that fail if active docs or critical runtime config still claim Supabase/Vercel as the current platform.
  - [x] Run the targeted tests and confirm they fail first.
- [x] Task: Implement the Cloudflare deployment baseline for the Vinext app.
  - [x] Add the minimal Worker configuration and deployment entry points required for the production target.
  - [x] Document required environment variables and local-vs-production expectations.
  - [x] Verify the build path with the relevant runtime command.
- [x] Task: Remove or isolate Vercel-only runtime assumptions from active code paths.
  - [x] Identify environment helpers that still branch on Vercel-only deployment behavior.
  - [x] Refactor them to be Cloudflare-compatible without breaking local development.
  - [x] Add regression tests for the new environment behavior.

## Phase 2 - Legacy Surface Cleanup

- [x] Task: Write failing guard tests for legacy platform residue that still looks active.
  - [x] Add source-level or behavior-level tests that expose active Supabase/Drizzle/Vercel runtime confusion.
  - [x] Confirm the tests fail before cleanup.
- [x] Task: Remove or quarantine stale Supabase and Drizzle runtime paths that are no longer canonical.
  - [x] Clean up debug routes, helper modules, and docs that still imply a second active backend.
  - [x] Update the active documentation surface to match the post-cleanup reality.
  - [x] Re-run lint and the targeted regression suite.
- [x] Task: Reconcile dependencies and repo messaging with the actual runtime.
  - [x] Identify packages and starter files that remain only as migration residue.
  - [x] Keep or remove them deliberately, and document the rationale where removal is deferred.

## Phase 3 - Curriculum Runtime Contract

- [x] Task: Add failing tests for the curriculum telemetry and standards contract.
  - [x] Capture the current `linkedStandardId` mismatch with a failing route or helper test.
  - [x] Add tests that pin the canonical lesson archetype phase sequences.
- [x] Task: Implement the canonical lesson and standards contract.
  - [x] Align route validation, Convex lookups, and curriculum docs on one standards identifier format.
  - [x] Encode the lesson archetype phase contracts in the relevant runtime helpers or schema-adjacent utilities.
  - [x] Verify the targeted contract tests now pass.
- [x] Task: Normalize the publishing model around published lesson versions only.
  - [x] Confirm student and teacher flows resolve only the latest published lesson versions.
  - [x] Add coverage where the current tests do not fully pin that behavior.

## Phase 4 - Shared Student and Teacher Foundation

- [x] Task: Write failing regression tests for shared student/teacher progress behavior where gaps remain.
  - [x] Target the student resume/start flow and teacher monitoring read models.
  - [x] Confirm tests fail before any implementation change.
- [x] Task: Finish shared progress-model cleanup needed for the next content tracks.
  - [x] Remove any remaining duplicate progress assembly that can drift between student and teacher surfaces.
  - [x] Ensure teacher monitoring stays read-only and derives from the same published progress helpers.
  - [x] Re-run the targeted route, helper, and component suites.

## Phase 5 - Exit Criteria

- [x] Task: Verify the foundation track against local development and build expectations.
  - [x] Run `npm run lint`.
  - [x] Run the relevant Vitest suites.
  - [x] Run the deployment-facing build command for Vinext.
- [x] Task: Update Conductor memory and queue for the next implementation tracks.
  - [x] Record the lessons learned from the foundation cleanup.
  - [x] Update the tech debt registry with any deliberate deferrals.
  - [x] Confirm the next planned tracks are still ordered correctly after the work lands.
