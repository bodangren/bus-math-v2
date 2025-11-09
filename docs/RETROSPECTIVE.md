---
title: Project Retrospective
type: retrospective
status: active
created: 2025-11-05
updated: 2025-11-09
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

## Recent Integration: Spreadsheet Components (#36) - 2025-11-09

### Component Migration Learnings
- **react-spreadsheet Integration**: Successfully integrated with Next.js 15 using proper SSR patterns
- **Template Architecture**: Created 6 educational templates aligned with curriculum units, demonstrating scalable template system
- **Schema Extension**: Extended activities table with JSONB fields for spreadsheet data while maintaining type safety
- **Test Coverage**: Achieved comprehensive test coverage (74 tests) including unit tests for helpers and component integration tests

### Technical Implementation Notes
- Spreadsheet components accept data via props following existing activity system patterns
- Templates include unit-specific educational content (budgeting, cash flow, inventory management, etc.)
- Proper error handling for malformed spreadsheet data with user-friendly fallbacks
- Performance optimized with lazy loading for large spreadsheet datasets

### Database Schema Updates
- Added `spreadsheet_data` JSONB column to activities table with Zod validation
- Extended activity type enum to include 'spreadsheet' activities
- Maintained backward compatibility with existing activity types

### Quality Assurance
- All linting checks pass with no new warnings
- Test suite runs in under 10 seconds with stable, deterministic fixtures
- Components gracefully handle partial metadata and edge cases