# ClassificationActivity Schema Fix

## Problem

`ClassificationActivity.tsx` line 9 infers its props type from `activityPropsSchemas['classification']`, but no `'classification'` key exists in the schema. This means:

1. The type resolves to `never`, making the component un-typable.
2. Any curriculum or published manifest referencing `componentKey: 'classification'` fails validation.
3. The activity registry cannot include the component (the `ActivityComponentKey` union lacks `'classification'`).

## Requirements

- Add a `'classification'` entry to `categorizationActivityPropsSchemas` in `lib/db/schema/activities-categorization.ts` matching the shape the component destructures: `title`, `description`, `categories` (array), `accounts` (optional array), `scaffolding` (optional object).
- Register `ClassificationActivity` in `lib/activities/registry.ts`.
- Add test assertions for the new key in `__tests__/lib/db/schema/activities-decomposition.test.ts`.
- All lint, test, and build gates must pass.

## Acceptance Criteria

- [x] `activityPropsSchemas['classification']` is defined and parses valid data
- [ ] `ClassificationActivity` is in `activityRegistry`
- [ ] `npm run lint` passes
- [ ] `npm test` passes (relevant tests)
- [ ] `npm run build` passes
