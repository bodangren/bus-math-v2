# Specification: Convex Runtime Parity & Auth Resilience

## Overview

SubLink currently has duplicated Convex runtime configuration, inconsistent local URL defaults, and a cloud-only internal auth path that breaks local login and demo provisioning when `CONVEX_DEPLOY_KEY` is not present. This cleanup/refactor track standardizes Convex runtime resolution, restores local development parity, tightens auth error handling, and updates user-facing/docs surfaces to match the current Convex-first architecture.

This track also serves as the first cleanup/refactor track for March 8, 2026 by addressing duplicate code, UX/documentation drift, and a serious auth/runtime reliability issue identified during review.

## Functional Requirements

1. Add one shared Convex runtime configuration module that:
   - resolves a canonical Convex base URL for server and client consumers
   - prefers explicit environment configuration when present
   - uses a single documented local default when configuration is absent
   - resolves admin auth for internal Convex calls from `CONVEX_DEPLOY_KEY` first, then from local Convex CLI state when running locally

2. Refactor server-side Convex helpers to consume the shared configuration module rather than duplicating URL/admin-auth logic inline.

3. Refactor app surfaces that construct `ConvexHttpClient` or `ConvexReactClient` instances so they use the same canonical Convex URL source.

4. Preserve the existing internal-function architecture:
   - login continues to use internal credential lookup
   - demo-account provisioning continues to use internal mutations
   - no internal auth/profile mutation is downgraded to a public Convex function

5. Improve auth/bootstrap failure behavior:
   - local missing-admin-auth scenarios must produce actionable server errors
   - production missing-admin-auth scenarios must fail explicitly and safely
   - login and demo provisioning must continue returning controlled JSON error payloads

6. Update project documentation to reflect the current Convex-first runtime:
   - README setup, environment, scripts, and deployment notes
   - Conductor tech-stack/product docs only where the implementation materially changes or corrects current canonical documentation

## Non-Functional Requirements

1. Follow TDD for the new runtime adapter behavior.
2. Do not add dependencies or change the core tech stack.
3. Keep the implementation compatible with unattended, non-interactive execution.
4. Avoid exposing secrets through public environment variables or client bundles.
5. Maintain existing route and page behavior outside the runtime/auth cleanup scope.

## Acceptance Criteria

1. A dedicated test suite covers:
   - canonical Convex URL resolution
   - deploy-key precedence
   - local `.convex` admin-key fallback
   - explicit failure when admin auth is unavailable in production

2. Auth-related route tests pass for:
   - login success/failure flows
   - controlled failure when internal Convex auth configuration is unavailable
   - demo-account provisioning via internal mutation path

3. Pages/components that use Convex clients no longer hardcode divergent local defaults.

4. `npm run lint`, `CI=true npm test`, and `npm run build` all succeed.

5. README reflects the new runtime/auth behavior and local setup expectations.

## Out of Scope

1. Deploying to production or configuring remote Convex infrastructure.
2. Rewriting unrelated curriculum or teacher/student feature flows.
3. Changing authentication product requirements beyond runtime/config resilience.
