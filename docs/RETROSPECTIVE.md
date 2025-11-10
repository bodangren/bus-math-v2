---
title: Project Retrospective
type: retrospective
status: active
created: 2025-11-05
updated: 2025-11-10
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

## Recent Integration: Teacher Components (#37) - 2025-11-10

### Component Migration Learnings
- **Database-Driven Teacher Resources**: Successfully migrated 3 teacher-specific components to use database-shaped props from drizzle-zod validators
- **Complex Nested Data Structures**: Teacher components handle deeply nested unit content data (objectives, assessments, learning sequences) from `lessons.metadata.unitContent`
- **Optional Props Pattern**: Components gracefully handle missing metadata by providing sensible defaults while maintaining type safety
- **Test Coverage**: Achieved comprehensive test coverage (48 tests) with proper handling of multiple elements in DOM queries

### Technical Implementation Notes
- Teacher components extract pedagogical data from `lessons.metadata.unitContent` structure
- UnitLessonPlan implements full UbD (Understanding by Design) framework with Stage 1-3 sections
- TeacherLessonPlan provides 6-phase lesson structure with phase-specific teacher guidance
- Components accept optional callback props (onNavigate, onLessonChange) for enhanced interactivity

### Database Schema Integration
- Leveraged existing `lessons.metadata.unitContent` schema for unit-level pedagogical data
- Utilized `phases.contentBlocks` for phase-specific content and callouts
- No schema changes required - components adapted to existing database structure

### Testing & Quality Assurance
- Fixed multiple DOM query issues by using `getAllByText` for repeated content
- All 48 tests passing with proper element assertions
- TypeScript compilation successful with no errors
- Zero linting issues after removing unused prop destructuring

## Recent Integration: Accessibility & Support Components (#38) - 2025-11-10

### Component Migration Learnings
- **Schema-First Accessibility Preferences**: Extended profiles schema with typed accessibility preferences before migrating components
- **Minimal, Focused Components**: Successfully migrated 3 small, well-defined components with clear single responsibilities
- **Bilingual Support Architecture**: Established pattern for English/Chinese content with proper lang attributes
- **Test Coverage**: Achieved comprehensive test coverage (34 tests) with focus on ARIA attributes and accessibility

### Technical Implementation Notes
- AccessibilityToolbar provides centralized UI for all user preferences (language, fontSize, highContrast, readingLevel, showVocabulary)
- MultilingualSupport enables simple bilingual text rendering with proper semantic HTML
- ReadingLevelAdjuster adapts content complexity using predefined translations and regex-based simplification
- All components accept preferences via props, delegating persistence to parent components

### Database Schema Integration
- Added `accessibilityPreferencesSchema` to profiles.metadata with Zod validation
- Defined typed preferences: language (en/zh), fontSize (small/medium/large), highContrast (boolean), readingLevel (basic/intermediate/advanced), showVocabulary (boolean)
- Exported schema from lib/db/schema for use in components via AccessibilityPreferences type

### Testing & Quality Assurance
- All 34 tests passing across three components
- Proper ARIA attributes tested (role, aria-label, aria-pressed)
- Language switching and content adaptation verified
- Fixed case-sensitivity issue in reading level simplification regex
- Zero linting errors
## Recent Integration: Financial Calculation & Miscellaneous Components (#39) - 2025-11-10

### Component Migration Learnings
- **Large Component Migration**: Successfully migrated 6 substantial components (5,318 lines) maintaining full functionality and educational context
- **Complex Calculator Components**: Migrated 3 advanced financial calculators (Interest, Depreciation, Break-Even) with multi-tab interfaces, data tables, and Goal Seek functionality
- **Interactive Educational Components**: Preserved educational scaffolding in all components with business context, formulas, and real-world applications
- **Test Coverage**: Achieved comprehensive test coverage (80 tests) for all migrated components with proper mocking strategies

### Technical Implementation Notes
- InterestCalculationBuilder provides 6 business scenarios (payroll loans, equipment financing, invoice factoring) with 4 calculation types and Excel formula integration
- DepreciationMethodBuilder implements 4 depreciation methods (Straight-line, DDB, SYD, Units of Production) with full schedule generation and method comparison
- BreakEvenAnalysisCalculator features advanced CVP analysis with Goal Seek, one/two-variable data tables, and CSV export capability
- DataCleaningExercise integrates SpreadsheetWrapper for interactive before/after data comparison with step-by-step progress tracking
- FeedbackCollector supports 5 stakeholder types (Investor, CPA, Entrepreneur, Consultant, Banker) with 6 evaluation categories
- ErrorCheckingSystem provides 3 validation scenarios with safe formula evaluation and visual error highlighting

### Migration Strategy
- Used Task agent for automated migration of 4 large components to improve efficiency
- Maintained 100% functionality preservation with careful import path updates
- Fixed all linting errors systematically (removed unused imports, fixed HTML entities, improved type safety)
- Created comprehensive test files following project patterns with userEvent for interaction testing

### Quality Assurance
- All 80 new tests passing with proper component rendering and interaction coverage
- Zero linting errors after fixing unused variables, unescaped entities, and type issues
- SpreadsheetWrapper properly mocked in DataCleaningExercise tests to avoid complex rendering
- All components follow v2 patterns (shadcn/ui, TypeScript, proper 'use client' directives)

### Performance Considerations
- Large components load efficiently with proper React state management
- Complex calculations use useMemo and useCallback for optimization
- Data table generation handles multiple scenarios without performance degradation
- Excel formula display toggles reduce initial render complexity

