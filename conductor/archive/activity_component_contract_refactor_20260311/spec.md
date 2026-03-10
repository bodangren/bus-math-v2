# Specification

## Overview
The current activity component contract is duplicated across the runtime registry, Zod validator unions, tests, and `docs/components.yaml`. Those copies have drifted: some documented component names do not resolve at runtime, and some supported runtime components are missing from the typed validator union. This refactor will centralize the catalog, normalize documented aliases to canonical runtime keys, and make schema coverage derive from the canonical catalog so future curriculum/component authoring stays stable.

## Functional Requirements
- Create one canonical activity catalog that defines runtime component mappings and supported alias keys.
- Support documented component names from `docs/components.yaml` where they currently differ from runtime canonical keys.
- Update runtime component resolution so alias keys render the same component as their canonical counterpart.
- Update activity validation/schema utilities so supported component props are resolved from the centralized catalog instead of hand-maintained duplicate unions.
- Add automated regression coverage that compares the documented component catalog against the runtime catalog.

## Non-Functional Requirements
- Follow TDD: tests must fail before implementation changes.
- Do not add dependencies or change the documented tech stack.
- Keep the refactor within the existing app/runtime and Conductor documentation files.
- Preserve existing seeded canonical keys so current lesson/activity data keeps working unchanged.

## Acceptance Criteria
- `getActivityComponent` resolves canonical runtime keys and documented alias keys for the shared components covered by `docs/components.yaml`.
- Activity prop validation succeeds for supported canonical components that previously depended on the stale manual union.
- Automated tests fail if a documented component key is not mapped to a runtime component or alias.
- Existing activity renderer and seed/curriculum tests continue to pass after the refactor.
- `npm run lint`, automated tests, and the production build pass successfully.

## Out of Scope
- Building new instructional components that do not already exist in the codebase.
- Rewriting seeded lesson content to use new keys where aliases can preserve compatibility.
- Broad curriculum-authoring infrastructure beyond the activity component contract.
