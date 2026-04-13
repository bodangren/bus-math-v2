# Dev Component Review Auth Guard

## Overview

Add proper authentication and authorization guard to the `/dev/component-review` page and its sub-routes. Currently gated only by client-side `NODE_ENV !== 'development'` check which can be bypassed in misconfigured builds.

## Problem

The dev component review page at `app/dev/component-review/page.tsx` uses a client-side check:
```tsx
if (process.env.NODE_ENV !== 'development') {
  notFound();
}
```

This is insufficient because:
1. Client-side checks can be bypassed
2. Preview builds or misconfigured deployments could expose this dev-only page
3. No role verification - any authenticated user could access it

## Solution

1. Create `middleware.ts` to gate `/dev/component-review/**` routes
2. Require admin role for access to dev component review routes
3. Use server-side session validation via `requireActiveRequestSessionClaims`
4. Redirect to appropriate error page if unauthorized

## Scope

- `app/dev/component-review/page.tsx` (main queue page)
- `app/dev/component-review/harness/activity/[componentId]/page.tsx`
- `app/dev/component-review/harness/practice/[componentId]/page.tsx`
- `app/dev/component-review/harness/example/[componentId]/page.tsx`
- `middleware.ts` (new file)

## Out of Scope

- Other dev routes (`/dev/practice-preview`)
- Changes to the Convex component approval schema

## Acceptance Criteria

1. `/dev/component-review` returns 401/403 to non-admin authenticated users
2. `/dev/component-review` returns redirect to non-authenticated users
3. Admin users can access the page in any environment
4. All sub-routes (harness pages) inherit the same guard
5. Page works correctly in local development (admin user)

## Severity

Medium - Dev-only page but could expose internal tooling to production users in misconfigured deployments