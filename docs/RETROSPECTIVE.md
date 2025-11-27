---
title: Project Retrospective (Condensed)
type: retrospective
status: active
created: 2025-11-05
updated: 2025-11-14
---

# Project Retrospective

A condensed summary of key learnings from the project.

## High-Level Summary (Epic #2)

- **Data & Schema:** Enforce integrity with Zod guards for JSONB, run validation regressions, and automate schema diffs via `drizzle-kit`. Use cascading deletes to prevent orphaned data.
- **Infra & RLS:** Rely on CLI for Supabase discovery. Enable RLS before applying policies and verify coverage with dedicated client tests.
- **Dev & Test:** Build helpers for common tasks (e.g., sign-up seeding). Use mock factories and normalized Zod errors for robust testing and UI feedback. Monitor query plans for indexed columns.

## Consolidated Lessons Learned by Theme

### Schema & Data Integrity
- Defensively type Supabase results, especially from `postgres-js`.
- Strictly type test factories; strip dynamic values (e.g., dates) to stabilize builds.
- Land schema additions before dependent components and tests.
- Use explicit merge helpers when rehydrating nested state to avoid staleness.

### Component & UI Development
- Prefer lightweight primitives and anchor-buttons over new dependencies or `window.open`.
- Standardize on `next/image` early for resource-heavy components.
- Components must gracefully handle partially populated metadata.
- Use dedicated formatters (`Intl.NumberFormat`) for consistent financial UI.
- Expose clear `onStateChange` and `onSubmit` boundaries for stateful components.
- Provide accessible fallbacks (e.g., keyboard inputs) for complex UI like drag-and-drop.
- Escape apostrophes in copy to prevent lint churn.

### Testing & Tooling
- Mocks for complex libraries (DnD, `ResizeObserver`) must be typed and registered before component imports.
- Use deterministic, injected test fixtures; avoid `Date.now()` in components.
- Expose unique markers from utilities to avoid brittle, string-based assertions.
- Mock factories must default all required fields to prevent build failures.
- Test `useInterval` cleanup hooks to prevent memory leaks.

### Process
- Append retrospective updates as part of the standard change-integration workflow.

## Key Architectural Decisions & Learnings by Integration

- **Spreadsheet (#36):** Integrated `react-spreadsheet` with Next.js 15 SSR. Extended `activities` schema with a `spreadsheet_data` JSONB field, validated by Zod.
- **Teacher Components (#37):** Components handle deeply nested pedagogical data from `lessons.metadata.unitContent` without requiring schema changes, using optional props for graceful degradation.
- **Accessibility (#38):** Adopted a schema-first approach, adding typed accessibility preferences to the `profiles` schema. Established a bilingual (EN/ZH) support pattern.
- **Financial Calculators (#39):** Migrated large, complex financial calculators, preserving educational context. Integrated `shadcn/ui` Tabs for multi-tab interfaces.
- **Migration Verification (#40):** Documented migration patterns and pitfalls. Established that test failures can be valuable documentation for edge cases.
- **Multi-Tenancy (#85):** Established a core multi-tenant architecture with an `organizations` table and `organizationId` foreign keys with cascade deletes. Implemented comprehensive, organization-scoped RLS policies.
- **Supabase Clients (#86):** Implemented a three-client pattern (browser, server, admin) using `@supabase/ssr`, with a dedicated, isolated admin client for privileged operations.
- **Authentication (#87):** Implemented username-based authentication by using the Supabase Auth email field as a transport layer (`username@internal.domain`). Managed global auth state with a React Context (`useAuth`).
- **Route Protection (#88):** Migrated from `middleware.ts` to `proxy.ts` for Next.js 16. Implemented role-based authorization that fetches user profiles from the database within the proxy.
- **Login Page (#89):** Added demo credential buttons for DX/QA. Used a `Suspense` boundary around the login form because it uses `useSearchParams()`.
- **Demo User Seeding (#90):** Used `tsx` for TypeScript seed scripts. Programmatic user creation requires the Supabase Auth Admin API. Debugged a critical snake_case (DB) vs. camelCase (TS) naming mismatch and a recursive RLS policy.
- **Lesson Page (#91):** Refactored to an async Server Component for data fetching. Used `loading.tsx` for automatic Suspense skeletons and `notFound()` for 404 handling.
- **Content Rendering (#92):** Used a discriminated union pattern with Zod for rendering varied content blocks. Wrapped each block in an Error Boundary for resilience. Created an Activity Registry for dynamic component rendering.
- **Activity Registry Integration (#93):** Implemented database-driven activity fetching via `/api/activities/[activityId]` endpoint with UUID validation. Created ActivityRenderer component with comprehensive test suite. Resolved Next.js 15+ breaking change where route params became Promises, requiring async destructuring in API handlers.
- **Sample Lesson Seeding (#70):** Created seed files for Units 1-3 Lesson 1 (18 phases, 13 activities) using curriculum matrix content from `docs/curriculum/`. Used JSONB content blocks with discriminated union types (markdown, video, callout, activity, image). Applied fixed UUIDs with `ON CONFLICT DO UPDATE` pattern for deterministic seeding. Activities reference component_key values from activity registry (comprehension-quiz, categorization-drag-drop).
- **Home Page Refactor (#71):** Refactored home page to async Server Component with database-driven content. Created RPC function `get_curriculum_stats()` and implemented fallback pattern for PostgREST schema cache refresh delays. Migrated from HSL to oklch color space for Excel-themed professional palette. Key lesson: gradient text (bg-clip-text) severely impacts readability—use solid text colors for headings. Card foreground colors must contrast with card backgrounds (Capstone card was white-on-white). Always verify color accessibility after theme changes.
### #96 - feat/72-task-11-curriculum-overview-page

- **Went well:** Grouping lessons by unit inside a dedicated helper let the new curriculum overview render Supabase data with minimal server-component logic, so the page stayed easy to test.
- **Lesson:** Navigation changes must target the header actually mounted in `app/layout.tsx`; deleting unused components avoided confusion, but we now double-check layout wiring before assuming which shell is live.

### #97 - feat/73-task-12-preface-page-refactor

- **Went well:** The auto-merge workflow completed successfully.
- **Lesson:** N/A

### #98 - feat/74-task-13-phase-completion-api

- **Went well:** Leaning on the shared Supabase server client plus Zod payload parsing made the new `/api/progress/phase` endpoint trivial to test while still respecting RLS, and the capstone overview copy now pulls directly from the curriculum narrative without duplicating data entry.
- **Lesson:** Mocking `@/lib/supabase/server` in Vitest let us exercise API routes without touching the network; we should rinse-and-repeat for the assessment submission work so regressions get caught before deploying server mutations.

### #99 - feat/75-task-14-phase-complete-button-component

- **Went well:** The auto-merge workflow completed successfully.
- **Lesson:** N/A

### #100 - feat/76-task-15-assessment-submission-api

- **Went well:** Consolidating scoring into a shared helper plus the new assessment API meant server-only grading and persistence dropped in cleanly, and Vitest mocks kept Supabase auth flows reliable without hitting the network.
- **Lesson:** Casting PostgREST timestamp strings to `Date` objects before running them through the Drizzle select schemas avoids avoidable validation noise, especially when writing API tests against mocked records.

### #101 - feat/77-task-16-assessment-submission-integration-client-sends-answers-only

- **Went well:** Centralizing the submission handler in `ActivityRenderer` meant every registry component picked up the server-scored flow with one change, and the updated Vitest suite now proves the client only ever ships answer payloads.
- **Lesson:** When activities need new props (like `onSubmit`), pass the full activity object as well—otherwise each component grows its own fetch logic and we lose parity with Supabase content.

### #102 - feat/78-task-17-teacher-dashboard-layout-accurate-progress-calculation

- **Went well:** Moving the dashboard to `app/teacher/page.tsx` plus the new `get_student_progress` RPC gave us trustworthy percentages, so the UI could simply hydrate progress state and lean on accessible shadcn primitives.
- **Lesson:** When redirects depend on auth context (like `LoginForm` waiting for `profile`), test helpers need to simulate the second render that happens once Supabase returns data—otherwise Vitest never sees navigation fire and we chase phantom regressions.

### #109 - feat/83-task-22-security-audit

- **Went well:** Identified a critical security gap where the `profiles` table RLS was permissive/missing, allowing `anon` access. Hardened security by revoking anon access and implementing strict owner-only RLS policies. Added a dedicated security test suite to verify these policies.
### #115 - feat/115-add-user-menu-avatar-with-settings-and-logout

- **Went well:** Replaced the basic authentication button with a full-featured `UserMenu` component using `shadcn/ui` primitives (Dropdown, Avatar), enhancing the user experience.
- **Lesson:** When modifying authentication flows (like removing sign-up), ensure deep cleaning of all related routes and components to prevent dead code and potential security confusion. `next build` is excellent for catching stale imports in type definitions after file deletions.

### #163 - feat/152-seed-accounting-standards

- **Went well:** Structured seed data as external JSON files with idempotent upsert logic allows versioning and iteration without schema recreation. Establishing 7 foundational accounting standards (ACC-1.1 through ACC-1.7) provides a clear competency framework for Unit 1. Documentation in `supabase/seed/README.md` guides future seed script development.
- **Lesson:** Seed scripts should use `ON CONFLICT DO UPDATE` patterns for deterministic, repeatable seeding across environments. Separating data (JSON) from logic (TypeScript) keeps seed files maintainable and allows non-developers to contribute standards content.

### #164 - feat/153-implement-rls-policies-enrollment-schema

- **Went well:** Leveraged existing `class_enrollments` and `classes` schema instead of creating redundant enrollment tables. Codex MCP code review caught a critical security vulnerability where students could modify their own competency records. Implementing 7 granular RLS policies provides defense-in-depth for competency data access.
- **Lesson:** RLS policies that check "can view" are insufficient for write operations—always add explicit role gates (`role IN ('teacher', 'admin')`) to UPDATE/INSERT policies. SECURITY DEFINER functions must set `search_path = public, pg_temp` to prevent object spoofing attacks. Automated code review tools like Codex catch subtle security issues that manual review might miss.

### #165 - feat/154-implement-spreadsheetevaluator--response-storage

- **Went well:** Security-first approach with centralized validation utility (`lib/activities/spreadsheet-validation.ts`) provided comprehensive formula sanitization through function whitelisting (SUM, AVERAGE, etc.) and dangerous pattern blocking (eval, script, CSV/DDE injection, XSS). 81 unit tests covering real-world attack vectors gave high confidence in security posture. Atomic transactions ensured response saving and competency updates happened together or not at all. Auto-save with 30-second debouncing plus draft persistence improved UX without overwhelming the API.
- **Lesson:** `react-spreadsheet`'s `Matrix<T>` type allows undefined cells—always use optional chaining (`cell?.value`) and nullish coalescing (`?? ''`) when mapping cells to avoid TypeScript errors. Formula security requires BOTH whitelisting safe functions AND blocking dangerous patterns (injection attempts use creative prefixes like `@`, `+`, `-`). When implementing auto-save, use refs to track unsaved state—relying on component state can cause stale closure issues in debounced callbacks. Test coverage for security features should include real-world attack vectors, not just happy-path validation.

### #166 - feat/155-update-activityrenderer-atomic-completion

- **Went well:** Codex MCP automated code review caught CRITICAL security vulnerabilities before merge (auth bypass in RPC, missing RLS policies). Implementing `auth.uid()` derivation server-side eliminated trust in client-supplied user IDs. `INSERT ON CONFLICT` pattern elegantly solved both race conditions and idempotency with a single SQL construct. Atomic PL/pgSQL function ensured activity completions, phase progress, and competency updates happen together or roll back entirely.
- **Lesson:** SECURITY DEFINER functions that accept user_id parameters are auth bypass vulnerabilities—ALWAYS derive identity from `auth.uid()` inside the function. RLS must be enabled on ALL user data tables, not just sensitive ones—activity completions are audit trails requiring protection. SELECT-then-INSERT patterns fail under concurrent load—use `INSERT ... ON CONFLICT DO NOTHING` for idempotent operations. Codex MCP provides valuable second-pass security review that catches issues human reviewers miss. Idempotency keys must be immutable—overwriting them on retry breaks the idempotency guarantee.


### #168 - fix/156-critical-lessonstepper-bugs

- **Went well:** LEFT JOIN pattern for progress queries ensured new learners without progress records could still view lessons (previously caused database errors). Fixed lesson authorization checks and made available phases properly clickable, improving the student learning flow. Comprehensive ESLint cleanup (replacing `any` with proper `Mock` types, removing unused imports, changing `@ts-ignore` to `@ts-expect-error`) improved code quality and type safety across test suite.
- **Lesson:** When querying user progress, always use LEFT JOIN instead of INNER JOIN to handle new users gracefully—INNER JOIN silently excludes users without progress records, causing confusing empty states or errors. Type safety in tests matters: using proper `Mock` types from Vitest instead of `any` catches mock configuration errors at compile time. ESLint suppressions (`// eslint-disable-next-line`) are better than disabling rules globally—they document intentional deviations while keeping the linter strict elsewhere.

### #169 - feat/157-refactor-lessonlayout-with-server-side-locking

- **Went well:** Implemented comprehensive server-side phase locking with `can_access_phase` RPC function using SECURITY DEFINER for proper authorization. Codex MCP automated review caught THREE critical issues before merge (infinite redirect loops for zero-phase lessons, RPC error handling creating redirect loops, missing test coverage for edge cases). Refactored LessonRenderer from showing all phases to single-phase navigation with integrated LessonStepper. Teacher/admin bypass implemented cleanly without RPC calls for privileged roles.
- **Lesson:** Error states should fail closed (show error page) rather than redirect—redirects can mask underlying issues and create infinite loops. Always handle edge cases (zero-phase lessons, RPC failures) with explicit error states, not fallback redirects. Test coverage must include all authorization paths (teacher bypass, RPC errors, locked phases) to catch edge cases early. When refactoring navigation, comprehensive tests prevent regressions in complex state flows.

### #170 - feat/158-implement-auto-capture-hook--api

- **Went well:** Codex MCP automated review caught NINE critical security vulnerabilities across two review passes before merge. Implemented production-grade phase completion with usePhaseCompletion hook featuring time tracking, idempotency (crypto.randomUUID), offline queue with retry logic, and keepalive requests for reliability. Server-side validation enforces timestamp ownership (never trust client), user ID binding in localStorage queue prevents cross-account contamination, transient vs permanent error detection prevents infinite retry loops, and database-level unique constraints prevent race conditions. Comprehensive test coverage (14 hook tests + 29 API tests, all passing) validates security behavior and edge cases.
- **Lesson:** Database constraints are the final line of defense—unique index on `(user_id, idempotency_key)` globally prevents key reuse across phases, catching race conditions application-level code might miss. Offline queues must bind to user IDs to prevent cross-account contamination when users change on the same browser. Server must own ALL security-sensitive data (timestamps, user IDs)—client-supplied values are attack vectors. Error classification matters: only retry transient errors (5xx, 408, 429, network); surface permanent errors (4xx validation) to UI immediately. Legacy data migration requires careful thought—when adding required fields (like userId to queue), detect and purge legacy items safely rather than attempting migration without ownership data. Test suite must validate security fixes, not just happy-path behavior—Codex caught test/code mismatches that would have shipped vulnerable behavior. Iterative security review catches issues in layers: first pass finds obvious vulnerabilities, second pass catches subtle race conditions and test gaps.

### #172 - feat/159-author-unit-1-lesson-1-v2

- **Went well:** Successfully created comprehensive 593-line seed file for Unit 1, Lesson 1 using the new versioned schema (lesson_versions, phase_versions, phase_sections, lesson_standards). Codex MCP automated review caught a critical circular reference bug in Phase 5's spreadsheet activity (cell D15 referencing itself in formula `=B15-(C15+D15)`) before it reached production. Added section cleanup logic to ensure true idempotency by deleting stale phase_sections rows when re-running seeds. Fixed UUID system provides deterministic seeding across environments. Successfully integrated TechStart narrative with Sarah Chen storyline across all 6 phases, linking to ACC-1.1 (fundamental accounting equation) and ACC-1.2 (account classification) competency standards.
- **Lesson:** Codex automated review is invaluable for catching subtle bugs in large data files—the circular reference would have caused infinite loops in the spreadsheet component but was caught during PR review. Seed scripts need cleanup logic for true idempotency: upserting rows isn't enough when sections are removed between runs—must actively DELETE stale rows matching the phase_version_id but excluded from current config. Different quality bars apply to seed scripts vs production code: transaction wrappers and strict type safety are lower priority for development utilities, especially when idempotent design allows recovery from partial failures. Document deferred improvements in commit messages rather than creating GitHub issues for utility script optimizations.
