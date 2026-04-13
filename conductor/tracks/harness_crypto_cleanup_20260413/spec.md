# Harness Crypto Cleanup

## Overview

Extract client-safe version hash computation to Convex backend so dev harness pages don't import Node.js `crypto` module.

## Problem

The three dev harness pages (`activity`, `practice`, `example`) are `'use client'` components that import `computeActivityVersionHash` and `computePracticeVersionHash` from `@/lib/component-approval/version-hashes`. This file uses `import crypto from 'crypto'` (Node.js built-in), which is not available in browser bundles.

Build passes but browser runtime would fail if these pages were ever accessed in a non-NODE_ENV context.

## Solution

1. Move hash computation functions to a Convex query that runs server-side (Node.js crypto available)
2. Update the three harness pages to call the Convex query for hash computation instead of importing the function directly
3. Keep `version-hashes.ts` for server-side use only (Convex functions, API routes)

## Scope

- `convex/component_approvals.ts`: Add `getComponentVersionHash` query
- `app/dev/component-review/harness/activity/[componentId]/page.tsx`: Use Convex query
- `app/dev/component-review/harness/practice/[componentId]/page.tsx`: Use Convex query
- `app/dev/component-review/harness/example/[componentId]/page.tsx`: Use Convex query

## Out of Scope

- Modifying `version-hashes.ts` — it remains server-only
- Creating client-safe Web Crypto implementations
- Changes to the review queue page

## Acceptance Criteria

1. Harness pages load without crypto import errors in browser console
2. Hash computation still works via Convex query
3. `npm run build` passes
4. `npm test` passes