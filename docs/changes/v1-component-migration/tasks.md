# Tasks: V1 Component Migration

## Task 1: Prerequisites - drizzle-zod Schemas & Vitest Setup

**Description**: Set up the foundation for component migration by generating drizzle-zod schemas for all database tables and configuring Vitest for testing.

**Subtasks:**
- [ ] Install testing dependencies (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@vitejs/plugin-react`, `jsdom`)
- [ ] Create `vitest.config.ts` with jsdom environment and path aliases
- [ ] Create `vitest.setup.ts` with testing-library setup
- [ ] Add `test` and `test:watch` scripts to `package.json`
- [ ] Create `lib/db/schema/validators.ts` with drizzle-zod generated schemas
- [ ] Generate insert/select schemas for all 13 tables using `createInsertSchema` and `createSelectSchema`
- [ ] Export type aliases from validators (e.g., `type Lesson = z.infer<typeof selectLessonSchema>`)
- [ ] Update `lib/db/schema/index.ts` to export validators
- [ ] Create `lib/test-utils/mock-factories.ts` with mock data factories
- [ ] Write example test using mock factories to verify setup

**Acceptance Criteria:**
- [ ] `npm run test` executes successfully
- [ ] All drizzle-zod schemas generate without errors
- [ ] Mock factories create valid database-shaped objects
- [ ] Example test passes
- [ ] TypeScript compilation passes (`npm run build`)
- [ ] No new TypeScript errors introduced

**Estimated Time**: 4-6 hours

---

## Task 2: Layout & Navigation Components (5 components)

**Description**: Migrate layout and navigation components that provide the application structure and course navigation.

**Components:**
- `header.tsx` - Main site header with navigation menu
- `footer.tsx` - Site footer with links
- `navigation-sidebar.tsx` - Course structure sidebar
- `unit-sidebar.tsx` - Unit lesson sidebar with progress tracking
- `ResourceBasePathFixer.tsx` - Utility for resource path correction

**Subtasks:**
- [ ] Install `@heroicons/react` if needed for icon support
- [ ] Copy `header.tsx` from v1 to v2 `components/`
- [ ] Refactor `header.tsx` to accept units from props (use `Lesson[]` type)
- [ ] Create `header.test.tsx` with tests for rendering units
- [ ] Copy `footer.tsx` from v1 to v2 `components/`
- [ ] Create `footer.test.tsx` with basic rendering test
- [ ] Copy `navigation-sidebar.tsx` from v1 to v2 `components/`
- [ ] Refactor navigation to accept lessons from props
- [ ] Create `navigation-sidebar.test.tsx` with unit tree rendering tests
- [ ] Copy `unit-sidebar.tsx` from v1 to v2 `components/`
- [ ] Integrate with `student_progress` table types for progress tracking
- [ ] Create `unit-sidebar.test.tsx` with progress display tests
- [ ] Copy `ResourceBasePathFixer.tsx` from v1 to v2 `components/`
- [ ] Create `ResourceBasePathFixer.test.tsx`

**Acceptance Criteria:**
- [ ] All 5 components copied and refactored
- [ ] No hardcoded unit/lesson data (accepted via props)
- [ ] Props interfaces use drizzle-zod types where applicable
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass (`npm run test`)

**Estimated Time**: 4-5 hours

---

## Task 3: Student Lesson Components (6 components)

**Description**: Migrate core student-facing lesson rendering components.

**Components:**
- `student/PhaseHeader.tsx` - Phase header with breadcrumbs and progress
- `student/PhaseFooter.tsx` - Phase footer with navigation
- `student/Lesson01Phase1.tsx` - Example phase content implementation
- `student/StudentUnitOverview.tsx` - Student view of unit overview
- `student/StudentLessonOverview.tsx` - Student view of lesson overview
- `student/ResourceBasePathFixer.tsx` - (duplicate, may consolidate)

**Subtasks:**
- [ ] Create `components/student/` directory
- [ ] Copy `PhaseHeader.tsx` from v1
- [ ] Refactor to accept `lesson: Lesson` and `phase: Phase` props
- [ ] Create `PhaseHeader.test.tsx` with breadcrumb and navigation tests
- [ ] Copy `PhaseFooter.tsx` from v1
- [ ] Refactor to accept phase navigation data via props
- [ ] Create `PhaseFooter.test.tsx` with navigation callback tests
- [ ] Copy `Lesson01Phase1.tsx` as example template
- [ ] Refactor to render from `contentBlocks` prop
- [ ] Create `Lesson01Phase1.test.tsx` with content block rendering tests
- [ ] Copy `StudentUnitOverview.tsx` from v1
- [ ] Refactor to use `Lesson` type for unit data
- [ ] Create `StudentUnitOverview.test.tsx`
- [ ] Copy `StudentLessonOverview.tsx` from v1
- [ ] Create `StudentLessonOverview.test.tsx`
- [ ] Handle ResourceBasePathFixer duplication (consolidate or keep both)

**Acceptance Criteria:**
- [ ] All 6 components copied and refactored
- [ ] Phase components accept database-shaped lesson/phase data
- [ ] Content blocks render correctly from JSONB
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 4-5 hours

---

## Task 4: Unit Structure Components (9 components)

**Description**: Migrate unit page structure components that compose unit overview pages.

**Components:**
- `unit/UnitTemplate.tsx` - Main template orchestrator
- `unit/UnitHeader.tsx` - Unit page header
- `unit/UnitOverview.tsx` - Learning objectives display
- `unit/DrivingQuestion.tsx` - PBL driving question display
- `unit/AssessmentOverview.tsx` - Assessment criteria and structure
- `unit/LearningSequence.tsx` - Lesson sequence display
- `unit/StudentChoices.tsx` - Student choice options display
- `unit/Prerequisites.tsx` - Prerequisites and differentiation info
- `unit/UnitIntroduction.tsx` - Unit introduction content

**Subtasks:**
- [ ] Create `components/unit/` directory
- [ ] Copy `UnitTemplate.tsx` from v1
- [ ] Refactor to compose sub-components with database-shaped props
- [ ] Create `UnitTemplate.test.tsx` with composition tests
- [ ] Copy `UnitHeader.tsx` from v1
- [ ] Refactor to use `Lesson` type for unit metadata
- [ ] Create `UnitHeader.test.tsx`
- [ ] Copy and refactor remaining 7 unit components
- [ ] Create test files for all 7 components
- [ ] Ensure all metadata fields come from lesson JSONB
- [ ] Verify component composition works correctly

**Acceptance Criteria:**
- [ ] All 9 components copied and refactored
- [ ] UnitTemplate composes all sub-components correctly
- [ ] All components use database-shaped props (no hardcoded data)
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 5-6 hours

---

## Task 5: Interactive Exercises - Part 1 (6 components)

**Description**: Migrate reusable interactive exercise components that form the foundation of student activities.

**Components:**
- `exercises/DragAndDrop.tsx` - Generic drag-and-drop matching exercise (685 lines, reference implementation)
- `exercises/ComprehensionCheck.tsx` - Multiple choice quiz component
- `exercises/FillInTheBlank.tsx` - Fill-in-the-blank exercises
- `exercises/JournalEntryBuilding.tsx` - Build accounting journal entries
- `exercises/ReflectionJournal.tsx` - Student reflection prompts
- `exercises/PeerCritiqueForm.tsx` - Peer review forms

**Subtasks:**
- [ ] Create `components/exercises/` directory
- [ ] Copy `DragAndDrop.tsx` from v1
- [ ] Refactor to accept `items` via props (remove hardcoded data)
- [ ] Add activity schema for drag-and-drop to `activityPropsSchemas`
- [ ] Create `DragAndDrop.test.tsx` with interaction tests
- [ ] Copy `ComprehensionCheck.tsx` from v1
- [ ] Refactor to use `questions` from activity props
- [ ] Verify `comprehension-quiz` schema exists in activities.ts
- [ ] Create `ComprehensionCheck.test.tsx`
- [ ] Copy and refactor `FillInTheBlank.tsx`
- [ ] Add fill-in-blank schema to `activityPropsSchemas`
- [ ] Create `FillInTheBlank.test.tsx`
- [ ] Copy and refactor remaining 3 components
- [ ] Add activity schemas for each type
- [ ] Create test files for all components
- [ ] Document DragAndDrop as reference implementation

**Acceptance Criteria:**
- [ ] All 6 components copied and refactored
- [ ] Activity schemas added to `activityPropsSchemas` for all exercise types
- [ ] Components accept exercise definitions via activity props
- [ ] Student submissions call `onSubmit` callbacks correctly
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 5-6 hours

---

## Task 6: Interactive Exercises - Part 2A (5 drag-drop exercises)

**Description**: Migrate specific drag-and-drop exercises (first batch to control context window).

**Dependency**: Install `@hello-pangea/dnd` if not already present

**Components:**
- `drag-drop-exercises/AccountCategorization.tsx`
- `drag-drop-exercises/BudgetCategorySort.tsx`
- `drag-drop-exercises/PercentageCalculationSorting.tsx`
- `drag-drop-exercises/InventoryFlowDiagram.tsx`
- `drag-drop-exercises/RatioMatching.tsx`

**Subtasks:**
- [ ] Verify/install `@hello-pangea/dnd` dependency
- [ ] Create `components/drag-drop-exercises/` directory
- [ ] Copy `AccountCategorization.tsx` from v1
- [ ] Refactor to use activity props for categorization data
- [ ] Add schema to `activityPropsSchemas`
- [ ] Create `AccountCategorization.test.tsx`
- [ ] Repeat for remaining 4 components
- [ ] Add schemas for each exercise type
- [ ] Create test files for all 5 components
- [ ] Verify drag-drop library compatibility with Next.js 15

**Acceptance Criteria:**
- [ ] All 5 components copied and refactored
- [ ] `@hello-pangea/dnd` installed and working
- [ ] Activity schemas added for all 5 exercise types
- [ ] All test files created with passing tests
- [ ] Drag-drop interactions work correctly
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 4-5 hours

---

## Task 7: Interactive Exercises - Part 2B (4 drag-drop exercises)

**Description**: Migrate remaining specific drag-and-drop exercises (second batch).

**Components:**
- `drag-drop-exercises/BreakEvenComponents.tsx`
- `drag-drop-exercises/CashFlowTimeline.tsx`
- `drag-drop-exercises/FinancialStatementMatching.tsx`
- `drag-drop-exercises/TrialBalanceSorting.tsx`

**Subtasks:**
- [ ] Copy `BreakEvenComponents.tsx` from v1
- [ ] Refactor to use activity props
- [ ] Add schema to `activityPropsSchemas`
- [ ] Create `BreakEvenComponents.test.tsx`
- [ ] Repeat for remaining 3 components
- [ ] Add schemas for each exercise type
- [ ] Create test files for all 4 components

**Acceptance Criteria:**
- [ ] All 4 components copied and refactored
- [ ] Activity schemas added for all 4 exercise types
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 3-4 hours

---

## Task 8: Accounting Visualizations (6 components)

**Description**: Migrate accounting visualization components (T-accounts, journals, trial balance).

**Components:**
- `accounting/TAccountSimple.tsx` - Basic T-account display
- `accounting/TAccountDetailed.tsx` - Detailed T-account with extended features
- `accounting/TAccountsVisualization.tsx` - Multiple T-accounts visualization
- `accounting/JournalEntry.tsx` - Single journal entry display
- `accounting/TransactionJournal.tsx` - Full transaction journal
- `accounting/TrialBalance.tsx` - Trial balance sheet display

**Subtasks:**
- [ ] Create `components/accounting/` directory
- [ ] Copy `TAccountSimple.tsx` from v1
- [ ] Refactor to accept transactions via props
- [ ] Create `TAccountSimple.test.tsx` with balance calculation tests
- [ ] Copy and refactor `TAccountDetailed.tsx`
- [ ] Create `TAccountDetailed.test.tsx`
- [ ] Copy and refactor `TAccountsVisualization.tsx`
- [ ] Create `TAccountsVisualization.test.tsx`
- [ ] Copy and refactor remaining 3 components
- [ ] Create test files for all components
- [ ] Verify account type colors and formatting work correctly

**Acceptance Criteria:**
- [ ] All 6 components copied and refactored
- [ ] Transaction data accepted via props (from content blocks or activities)
- [ ] Balance calculations correct in tests
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 4-5 hours

---

## Task 9: Financial Reports (6 components)

**Description**: Migrate financial statement report components.

**Components:**
- `financial-reports/IncomeStatementSimple.tsx`
- `financial-reports/IncomeStatementDetailed.tsx`
- `financial-reports/BalanceSheetSimple.tsx`
- `financial-reports/BalanceSheetDetailed.tsx`
- `financial-reports/CashFlowStatementSimple.tsx`
- `financial-reports/CashFlowStatementDetailed.tsx`

**Subtasks:**
- [ ] Create `components/financial-reports/` directory
- [ ] Copy `IncomeStatementSimple.tsx` from v1
- [ ] Refactor to accept financial data via props
- [ ] Create `IncomeStatementSimple.test.tsx` with calculation tests
- [ ] Copy and refactor `IncomeStatementDetailed.tsx`
- [ ] Create `IncomeStatementDetailed.test.tsx`
- [ ] Copy and refactor remaining 4 components
- [ ] Create test files for all components
- [ ] Verify financial calculations (totals, subtotals) in tests

**Acceptance Criteria:**
- [ ] All 6 components copied and refactored
- [ ] Financial data accepted via props
- [ ] Calculations accurate in tests
- [ ] Formatting matches accounting standards
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 4-5 hours

---

## Task 10: Charts & Visualizations (6 components)

**Description**: Migrate chart components using recharts library.

**Dependency**: Verify `recharts` is installed (should be from v1)

**Components:**
- `charts/LineChart.tsx` - Generic line chart wrapper
- `charts/BarChart.tsx` - Generic bar chart wrapper
- `charts/PieChart.tsx` - Pie chart visualization
- `charts/DoughnutChart.tsx` - Doughnut chart visualization
- `charts/BreakEvenChart.tsx` - Break-even analysis chart
- `charts/FinancialDashboard.tsx` - Comprehensive financial dashboard

**Subtasks:**
- [ ] Verify `recharts` dependency installed
- [ ] Create `components/charts/` directory
- [ ] Copy `LineChart.tsx` from v1
- [ ] Refactor to accept chart data via props
- [ ] Create `LineChart.test.tsx`
- [ ] Copy and refactor remaining 5 components
- [ ] Create test files for all components
- [ ] Verify chart configuration props work correctly
- [ ] Test accessibility attributes on charts

**Acceptance Criteria:**
- [ ] All 6 components copied and refactored
- [ ] `recharts` installed and compatible
- [ ] Chart data accepted via props
- [ ] All test files created with passing tests
- [ ] Accessibility attributes present
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 4-5 hours

---

## Task 11: Business Simulations - Part A (3 components)

**Description**: Migrate first batch of business simulation games (context window control).

**Components:**
- `business-simulations/LemonadeStand.tsx` - Lemonade stand simulation (811 lines, complex)
- `business-simulations/StartupJourney.tsx` - Startup business journey simulation
- `business-simulations/BudgetBalancer.tsx` - Budget balancing simulation

**Subtasks:**
- [ ] Create `components/business-simulations/` directory
- [ ] Copy `LemonadeStand.tsx` from v1
- [ ] Refactor game configuration constants to activity props
- [ ] Add schema to `activityPropsSchemas`
- [ ] Plan game state persistence via `activity_submissions`
- [ ] Create `LemonadeStand.test.tsx` with game state tests
- [ ] Repeat for `StartupJourney.tsx`
- [ ] Repeat for `BudgetBalancer.tsx`

**Acceptance Criteria:**
- [ ] All 3 components copied and refactored
- [ ] Game configurations from activity props
- [ ] Activity schemas added for all 3 simulation types
- [ ] Game state can be saved/restored via callbacks
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 5-6 hours

---

## Task 12: Business Simulations - Part B (3 components)

**Description**: Migrate remaining business simulation games.

**Components:**
- `business-simulations/CashFlowChallenge.tsx` - Cash flow management game
- `business-simulations/InventoryManager.tsx` - Inventory management simulation
- `business-simulations/PitchPresentationBuilder.tsx` - Pitch presentation builder

**Subtasks:**
- [ ] Copy `CashFlowChallenge.tsx` from v1
- [ ] Refactor to use activity props for game config
- [ ] Add schema to `activityPropsSchemas`
- [ ] Create `CashFlowChallenge.test.tsx`
- [ ] Repeat for `InventoryManager.tsx`
- [ ] Repeat for `PitchPresentationBuilder.tsx`

**Acceptance Criteria:**
- [ ] All 3 components copied and refactored
- [ ] Game configurations from activity props
- [ ] Activity schemas added for all 3 simulation types
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 4-5 hours

---

## Task 13: Spreadsheet Components (3 components)

**Description**: Migrate Excel-like spreadsheet components.

**Dependency**: Install `react-spreadsheet`

**Components:**
- `spreadsheet/SpreadsheetWrapper.tsx` - Wrapper for react-spreadsheet library
- `spreadsheet/SpreadsheetTemplates.tsx` - Predefined spreadsheet templates
- `spreadsheet/SpreadsheetHelpers.ts` - Helper utility functions

**Subtasks:**
- [ ] Install `react-spreadsheet` dependency
- [ ] Create `components/spreadsheet/` directory
- [ ] Copy `SpreadsheetWrapper.tsx` from v1
- [ ] Refactor to accept initial data via props
- [ ] Create `SpreadsheetWrapper.test.tsx`
- [ ] Copy `SpreadsheetTemplates.tsx` from v1
- [ ] Refactor templates to come from activity props
- [ ] Create `SpreadsheetTemplates.test.tsx`
- [ ] Copy `SpreadsheetHelpers.ts` from v1
- [ ] Create `SpreadsheetHelpers.test.ts` with utility tests
- [ ] Verify react-spreadsheet compatibility with Next.js 15

**Acceptance Criteria:**
- [ ] All 3 components copied and refactored
- [ ] `react-spreadsheet` installed and working
- [ ] Spreadsheet data accepted via props
- [ ] Templates load correctly
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 3-4 hours

---

## Task 14: Teacher Resources (3 components)

**Description**: Migrate teacher-specific resource components.

**Components:**
- `teacher/UnitOverview.tsx` - Teacher view of unit with pedagogical guidance
- `teacher/UnitLessonPlan.tsx` - Unit-level lesson planning
- `teacher/TeacherLessonPlan.tsx` - Individual lesson plans for teachers

**Subtasks:**
- [ ] Create `components/teacher/` directory
- [ ] Copy `UnitOverview.tsx` from v1
- [ ] Refactor to use `Lesson` type for unit data
- [ ] Create `UnitOverview.test.tsx`
- [ ] Copy `UnitLessonPlan.tsx` from v1
- [ ] Refactor to accept lesson plan data via props
- [ ] Create `UnitLessonPlan.test.tsx`
- [ ] Copy `TeacherLessonPlan.tsx` from v1
- [ ] Create `TeacherLessonPlan.test.tsx`

**Acceptance Criteria:**
- [ ] All 3 components copied and refactored
- [ ] Lesson plan data from database-shaped props
- [ ] Pedagogical content displays correctly
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 3-4 hours

---

## Task 15: Accessibility & Support Components (3 components)

**Description**: Migrate accessibility and multilingual support components.

**Components:**
- `student/AccessibilityToolbar.tsx` - Toolbar for accessibility settings
- `student/MultilingualSupport.tsx` - Language switching support
- `student/ReadingLevelAdjuster.tsx` - Content reading level adjustment

**Subtasks:**
- [ ] Copy `AccessibilityToolbar.tsx` from v1 to `components/student/`
- [ ] Refactor to accept user preferences via props
- [ ] Create `AccessibilityToolbar.test.tsx` with interaction tests
- [ ] Copy `MultilingualSupport.tsx` from v1
- [ ] Refactor to use user language preference from props
- [ ] Create `MultilingualSupport.test.tsx`
- [ ] Copy `ReadingLevelAdjuster.tsx` from v1
- [ ] Create `ReadingLevelAdjuster.test.tsx`

**Acceptance Criteria:**
- [ ] All 3 components copied and refactored
- [ ] User preferences accepted via props (DB persistence handled by parent)
- [ ] Setting changes call callbacks correctly
- [ ] Accessibility attributes correct (ARIA labels, etc.)
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 3-4 hours

---

## Task 16: Financial Calculations & Miscellaneous (6 components)

**Description**: Migrate remaining financial calculation components and miscellaneous components.

**Components:**
- `financial-calculations/InterestCalculationBuilder.tsx`
- `financial-calculations/DepreciationMethodBuilder.tsx`
- `financial-calculations/BreakEvenAnalysisCalculator.tsx`
- `data-cleaning/DataCleaningExercise.tsx`
- `exercises/FeedbackCollector.tsx`
- `business-simulations/ErrorCheckingSystem.tsx`

**Subtasks:**
- [ ] Create `components/financial-calculations/` directory
- [ ] Copy `InterestCalculationBuilder.tsx` from v1
- [ ] Refactor to accept calculation parameters via props
- [ ] Create `InterestCalculationBuilder.test.tsx` with calculation tests
- [ ] Repeat for `DepreciationMethodBuilder.tsx`
- [ ] Repeat for `BreakEvenAnalysisCalculator.tsx`
- [ ] Create `components/data-cleaning/` directory
- [ ] Copy `DataCleaningExercise.tsx` from v1
- [ ] Create `DataCleaningExercise.test.tsx`
- [ ] Copy `FeedbackCollector.tsx` to `components/exercises/`
- [ ] Create `FeedbackCollector.test.tsx`
- [ ] Copy `ErrorCheckingSystem.tsx` to `components/business-simulations/`
- [ ] Create `ErrorCheckingSystem.test.tsx`

**Acceptance Criteria:**
- [ ] All 6 components copied and refactored
- [ ] Calculation components compute correctly
- [ ] All test files created with passing tests
- [ ] TypeScript compilation passes
- [ ] All tests pass

**Estimated Time**: 4-5 hours

---

## Task 17: Documentation & Final Verification

**Description**: Document component patterns and verify complete migration.

**Subtasks:**
- [ ] Create `docs/development/component-patterns.md`
- [ ] Document how to use drizzle-zod types in components
- [ ] Document props interface pattern (data + UI separation)
- [ ] Document testing pattern with mock factories
- [ ] Document activity schema registration process
- [ ] Document common migration gotchas
- [ ] Run full test suite (`npm run test`)
- [ ] Run TypeScript compilation (`npm run build`)
- [ ] Verify all 74 components migrated
- [ ] Verify all external dependencies installed
- [ ] Create migration completion checklist

**Acceptance Criteria:**
- [ ] Documentation complete and comprehensive
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] All 74 components accounted for
- [ ] All dependencies installed
- [ ] Migration checklist confirms completion

**Estimated Time**: 3-4 hours

---

## Total Estimated Time: ~65-80 hours

**Sprint Planning Notes:**
- Issues are designed to be atomic and independently completable
- Dependencies noted where specific packages must be installed
- Large categories split to manage context window
- Each issue includes clear acceptance criteria and testing requirements
- Can be parallelized across multiple developers
