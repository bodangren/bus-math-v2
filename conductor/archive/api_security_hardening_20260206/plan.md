# Tasks: Refactor - API Security Hardening

## Phase 1: Boundary Definition And Failing Security Tests
- [x] Task: Define public vs private API route matrix
    - [x] Task: Classify every `app/api/**` route by required auth/role
    - [x] Task: Document expected access behavior per route
- [x] Task: Write failing tests for unauthorized access paths (Red phase)
    - [x] Task: Add tests for anonymous access to private APIs
    - [x] Task: Add tests proving sensitive activity fields are redacted for students

## Phase 2: Proxy And Route Hardening
- [x] Task: Replace broad `/api` public allowance with explicit allowlist in `proxy.ts`
    - [x] Task: Preserve intended public endpoints (if any)
    - [x] Task: Ensure private APIs redirect/return unauthorized appropriately
- [x] Task: Add auth checks to activity-fetch routes
    - [x] Task: Enforce authenticated user context
    - [x] Task: Apply role-aware permission checks where required
- [x] Task: Implement student-safe activity DTO
    - [x] Task: Strip answer keys/grading internals from student responses
    - [x] Task: Keep teacher/admin visibility rules explicit

## Phase 3: Debug/Test Endpoint Controls
- [x] Task: Audit debug/test routes
    - [x] Task: Identify which routes are removable vs environment-gated
    - [x] Task: Add explicit production guard + optional secret token check
- [x] Task: Add tests validating production lockout behavior (Green phase)
    - [x] Task: Confirm forbidden responses in production mode
    - [x] Task: Confirm expected behavior in non-production mode

## Phase 4: Verification And Documentation
- [x] Task: Run lint + targeted security tests + full route test subsets
- [x] Task: Update security documentation with API access policy
    - [x] Task: Add route-level checklist for auth, redaction, and sensitive data handling
    - [x] Task: Document patterns for future API additions
