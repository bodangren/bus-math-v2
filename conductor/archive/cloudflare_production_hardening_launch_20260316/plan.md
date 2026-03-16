# Implementation Plan

## Phase 1: Launch Contract Guards

- [x] Task: Add regression tests for launch-critical auth and local runtime behavior
  - [x] Extend proxy coverage so unauthenticated login and session bootstrap APIs must remain public
  - [x] Extend Convex admin-auth coverage so local development accepts both project-local and home-directory Convex state
  - [x] Extend dev-stack coverage so the pinned Convex CLI and parent-process startup contract are enforced
- [x] Task: Add guard coverage for launch documentation and deployment expectations
  - [x] Add source-level tests that fail if the active Cloudflare launch checklist or runtime docs lose required secret, seeding, or verification guidance
  - [x] Mark the new track active in Conductor and capture implementation status

## Phase 2: Runtime and Documentation Hardening

- [x] Task: Harden auth bootstrap and local Convex runtime wiring
  - [x] Keep the public proxy allowlist aligned with login/session bootstrap requirements
  - [x] Align server-side Convex admin auth and local development docs with the supported `convex dev --local` workflow
- [x] Task: Publish the active Cloudflare launch checklist
  - [x] Add a launch checklist document under the active `conductor/` surface
  - [x] Link README and architecture/runtime docs to the checklist and operational expectations

## Phase 3: Verification and Finalization

- [x] Task: Synchronize Conductor memory for the launch-hardening outcome
  - [x] Update `conductor/tech-debt.md` and `conductor/lessons-learned.md` with any remaining near-term implications
  - [x] Update track metadata/status markers as execution progresses
- [x] Task: Run required verification and finalize the track
  - [x] Run `npm run lint`
  - [x] Run `npm test`
  - [x] Run `npm run build`
