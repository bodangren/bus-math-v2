---
title: Project Retrospective (Condensed)
type: retrospective
status: active
created: 2025-11-05
updated: 2025-11-13
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
