# Proposal: V1 Component Migration

## Problem Statement

The v2 platform has a complete database schema and infrastructure (Epic #2 completed), but lacks the interactive UI components needed to render lesson content. The v1 codebase contains 74 custom React components that power the entire educational experience:

- Interactive exercises (drag-and-drop, quizzes, simulations)
- Financial visualization tools (T-accounts, charts, reports)
- Business simulation games
- Layout and navigation components
- Accessibility and multilingual support
- Teacher resource components

These components currently work with static data and hardcoded configurations. To support the v2 database-driven architecture, they need to be migrated and refactored to accept data from Supabase while maintaining their educational effectiveness.

**Current Blockers:**
- Cannot render lesson pages without phase header/footer components
- Cannot display interactive exercises without exercise components
- Cannot provide teacher resources without teacher-specific components
- Cannot support student progress tracking without accessibility components

## Proposed Solution

Migrate all 74 custom components from v1 (`bus-math-nextjs/src/components/`) to v2 in a systematic, testable manner:

### Phase 1: Foundation (Prerequisites)
1. **Generate drizzle-zod schemas** for automatic type inference from database tables
2. **Install and configure Vitest** for component testing with React Testing Library
3. **Establish typing pattern** using drizzle-zod schemas + component-specific UI props

### Phase 2: Component Migration (Categorized)
Import components by category, refactoring each to:
- Accept props shaped by database schema instead of hardcoded data
- Use drizzle-zod types for data props, custom interfaces for UI props
- Include colocated tests that mock database responses
- Install required dependencies on a case-by-case basis

**Categories (in priority order):**
1. Layout & Navigation (5 components) - Needed for page structure
2. Student Lesson Components (6 components) - Core lesson rendering
3. Unit Structure Components (9 components) - Unit page rendering
4. Interactive Exercises - Part 1 (6 components) - Reusable exercise widgets
5. Interactive Exercises - Part 2 (9 components) - Specific drag-drop exercises
6. Accounting Visualizations (6 components) - T-accounts, journals, trial balance
7. Financial Reports (6 components) - Income statements, balance sheets, cash flow
8. Charts & Visualizations (6 components) - recharts wrappers
9. Business Simulations (6 components) - Complex game components
10. Spreadsheet Components (3 components) - Excel-like interfaces
11. Teacher Resources (3 components) - Teacher-specific views
12. Accessibility & Support (3 components) - Accessibility toolbar, multilingual
13. Financial Calculations (3 components) - Calculation builders
14. Miscellaneous (3 components) - Data cleaning, feedback collection

### Phase 3: Integration Verification
- Verify all shadcn/ui dependencies are compatible
- Test component interactions
- Document component usage patterns

## Benefits

1. **Unlocks lesson page development** - Can start building actual educational content
2. **Preserves proven pedagogy** - Components already tested with students
3. **Type-safe integration** - drizzle-zod ensures components receive correct data
4. **Testable architecture** - Each component has tests with mocked DB responses
5. **Incremental delivery** - Can complete categories independently
6. **Future-proof** - Components designed for database-driven content

## Success Criteria

- [ ] All 74 custom components migrated to v2 directory structure
- [ ] drizzle-zod schemas generated for all 13 database tables
- [ ] Vitest configured with React Testing Library
- [ ] Each component has colocated test file with DB mocking
- [ ] All required dependencies installed (drag-and-drop, spreadsheet, charts)
- [ ] Components accept database-shaped props (no hardcoded data)
- [ ] All tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Documentation of typing patterns and component usage

## Non-Goals (Deferred to Later Sprints)

- Reorganizing component directory structure (keep v1 structure for now)
- Implementing actual database queries (components accept props only)
- Creating page routes that use components (separate sprint)
- Seeding database with lesson content (separate sprint)
- E2E testing of full lesson flows (focus on unit tests)

## Risks & Mitigations

**Risk:** External dependencies may conflict with Next.js 15
**Mitigation:** Install dependencies incrementally, test compatibility per category

**Risk:** Context window limitations with large components
**Mitigation:** Split large categories (8+ components) into multiple issues

**Risk:** Components may have undocumented dependencies on v1 patterns
**Mitigation:** Test each component during migration, document any v1-specific patterns

**Risk:** drizzle-zod may not cover all typing needs
**Mitigation:** Hybrid approach allows custom interfaces where needed

## Timeline Estimate

- **Issue #1 (Prerequisites):** 4-6 hours
- **Issues #2-15 (Component Categories):** 3-5 hours each × 14 = 42-70 hours
- **Total:** ~50-75 hours of development time

Given atomic issue approach, this represents 2-3 weeks of sprint work with multiple developers or 4-6 weeks for a single developer.
