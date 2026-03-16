# Specification

## Overview

The textbook runtime is now complete in curriculum scope, but the final launch milestone still has operational gaps between local development, production auth behavior, and the documented Cloudflare deployment path. This track hardens the remaining launch-critical seams so the student/teacher runtime can be operated consistently on the intended Cloudflare + Convex stack.

## Functional Requirements

1. Auth bootstrap APIs required for username/password login must remain publicly reachable through the proxy while all authenticated auth-management routes remain private.
2. Server-side internal Convex access must work in both cloud deployments (`CONVEX_DEPLOY_KEY`) and local development (`.convex/local/*/config.json` or `~/.convex/*/config.json`) without requiring manual runtime patching.
3. The local development stack must start Convex in the supported local mode and keep the Vinext child process tied to the Convex parent lifecycle.
4. Active documentation must include a launch-ready Cloudflare checklist covering required secrets, local validation steps, runtime seeding expectations, and deployment handoff expectations.
5. Deployment-facing guard tests must fail if the launch contract regresses in auth routing, local Convex admin-key discovery, dev-stack wiring, or Cloudflare launch documentation.

## Non-Functional Requirements

- Follow TDD for any new or adjusted runtime contract.
- Keep Convex as the only runtime source of truth.
- Avoid dependency upgrades or new packages.
- Preserve unattended, non-interactive verification and git workflow.

## Acceptance Criteria

1. `proxy.ts` and its tests explicitly protect the public contract for `/api/auth/login` and `/api/auth/session`.
2. `lib/convex/admin.ts`, the dev-stack script, and related tests cover both project-local and home-directory Convex local state.
3. Launch documentation in the active repo surface explains the Cloudflare production checklist and references the exact runtime inputs needed for deployment.
4. `npm run lint`, `npm test`, and `npm run build` all pass after the hardening changes.

## Out of Scope

- Performing a real Cloudflare deployment against production credentials.
- Adding new product roles, admin tooling, or curriculum-authoring interfaces.
- Dependency upgrades needed for the open security-audit debt item.
