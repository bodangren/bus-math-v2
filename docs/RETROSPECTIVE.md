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

