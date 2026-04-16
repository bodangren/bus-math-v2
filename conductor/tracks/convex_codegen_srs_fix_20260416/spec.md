# Specification: Convex Codegen SRS Fix

## Overview

The Convex generated API types (`convex/_generated/api.d.ts`) are missing the `srs` module because `npx convex dev` / `npx convex codegen` have not been run successfully since `convex/srs.ts` was added. The root cause is that two convex files (`convex/study.ts` and `convex/component_approvals.ts`) use `@/` path aliases, which the Convex bundler cannot resolve.

## Functional Requirements

1. Replace `@/` path aliases in `convex/` directory with relative paths so the Convex bundler can bundle the code.
2. Run `npx convex codegen` to regenerate `api.d.ts` with the `srs` module included.
3. Verify that TypeScript compilation succeeds for files importing `api.srs.*`.

## Acceptance Criteria

- `npx convex codegen` completes without bundling errors.
- `convex/_generated/api.d.ts` contains `import type * as srs from "../srs.js";` and the `srs` key in `fullApi`.
- `npm run lint` passes with 0 errors.
- `npm test` passes with all tests green.
- `npm run build` passes cleanly.

## Out of Scope

- Changing any runtime behavior of SRS or study features.
- Adding new tests or features.
