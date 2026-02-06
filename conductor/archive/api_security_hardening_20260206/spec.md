# Refactor Spec: API Security Hardening

## Overview
Current API boundaries are broader than necessary. Some routes expose activity payloads without explicit auth checks, and middleware/proxy behavior allows unrestricted `/api` access. Security-sensitive payload shaping is not consistently enforced at the route layer.

This track hardens API access controls and response contracts to align with least-privilege principles and RLS-first expectations.

## Problem Statement
- `proxy.ts` currently treats `/api` as public.
- Activity fetch endpoint can return raw activity config without authentication.
- Raw activity payloads may include grading details that should not be delivered to students.
- Debug/test endpoints are present in runtime surface and need stricter gating.

## Functional Requirements
1. Define explicit public API allowlist; deny-by-default for private APIs.
2. Enforce auth/authorization checks on activity and progress endpoints that require authenticated context.
3. Introduce role-aware response redaction for activity payloads (student-safe DTO).
4. Gate test/debug APIs behind environment and explicit secret guard, or remove them from prod paths.
5. Add automated tests for unauthorized access and payload redaction behavior.

## Non-Functional Requirements
- Maintain existing student/teacher workflows.
- Keep endpoint response contracts explicit and version-safe.
- Avoid introducing client-visible secrets or service-role behavior.

## Acceptance Criteria
1. Private APIs cannot be accessed anonymously.
2. Student-facing activity responses do not include answer keys or sensitive grading internals.
3. Proxy/middleware tests validate deny-by-default behavior for non-public APIs.
4. Debug/test endpoints are unreachable in production configuration.
5. Security-focused tests are added and passing.

## Out Of Scope
- Full API versioning rollout.
- Re-architecture of all API routes to a new framework.
- Broad UI redesigns unrelated to security boundaries.
