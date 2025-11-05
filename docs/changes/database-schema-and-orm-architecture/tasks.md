# Tasks: Database Schema and ORM Architecture

## Task 1: Set Up Drizzle ORM Infrastructure

**Description**: Install dependencies, configure Drizzle connection, and set up project structure.

**Subtasks:**
- [ ] Install packages: `drizzle-orm`, `postgres`, `zod`, `drizzle-kit`
- [ ] Create `lib/db/drizzle.ts` with Supabase pooler connection
- [ ] Configure `drizzle.config.ts` for migrations
- [ ] Set up environment variables (DATABASE_URL, DIRECT_URL)
- [ ] Create schema directory structure: `lib/db/schema/`
- [ ] Document connection strategy in `lib/db/README.md`

**Acceptance Criteria:**
- Drizzle successfully connects to Supabase via connection pooler
- `drizzle-kit` commands work (generate, push, studio)
- No credentials exposed to client-side code
- Connection tested in Server Component/Action

**Estimated Time**: 2-3 hours

---

## Task 2: Define Core Content Schema

**Description**: Create Drizzle schemas for lessons, phases, activities, and resources.

**Subtasks:**
- [ ] Create `lib/db/schema/lessons.ts` with Drizzle table definition
- [ ] Create `lib/db/schema/phases.ts` with JSONB content blocks
- [ ] Create `lib/db/schema/activities.ts` with component registry
- [ ] Create `lib/db/schema/resources.ts`
- [ ] Define Zod schemas for all JSONB fields
- [ ] Export schemas from `lib/db/schema/index.ts`

**Acceptance Criteria:**
- All tables compile without TypeScript errors
- Zod schemas validate all JSONB structures
- Foreign keys properly reference parent tables
- Timestamps (createdAt, updatedAt) on all tables

**Estimated Time**: 4-5 hours

---

## Task 3: Define User & Progress Schema

**Description**: Create tables for profiles, student progress, and activity submissions.

**Subtasks:**
- [ ] Create `lib/db/schema/profiles.ts` linking to Supabase Auth
- [ ] Create `lib/db/schema/student-progress.ts` with unique constraint
- [ ] Create `lib/db/schema/activity-submissions.ts`
- [ ] Define Zod schemas for submission data
- [ ] Add indexes for frequent queries (user_id, phase_id)

**Acceptance Criteria:**
- Profiles correctly extend `auth.users`
- Unique constraints prevent duplicate progress entries
- Submission data validated by Zod schemas
- Indexes created for performance

**Estimated Time**: 3-4 hours

---

## Task 4: Define Organization Schema

**Description**: Create tables for classes and enrollments (teacher-student relationships).

**Subtasks:**
- [ ] Create `lib/db/schema/classes.ts`
- [ ] Create `lib/db/schema/class-enrollments.ts` with unique constraint
- [ ] Define class metadata Zod schema
- [ ] Add foreign keys to profiles table

**Acceptance Criteria:**
- Teachers can create multiple classes
- Students can enroll in multiple classes
- Unique constraint prevents duplicate enrollments
- Cascade deletes work correctly

**Estimated Time**: 2-3 hours

---

## Task 5: Define Real-Time Schema

**Description**: Create tables for live sessions, responses, and leaderboards.

**Subtasks:**
- [ ] Create `lib/db/schema/live-sessions.ts`
- [ ] Create `lib/db/schema/live-responses.ts`
- [ ] Create `lib/db/schema/session-leaderboard.ts`
- [ ] Define session settings Zod schema
- [ ] Add indexes for real-time queries

**Acceptance Criteria:**
- Session status transitions work (waiting ’ active ’ completed)
- Leaderboard table supports efficient ranking queries
- Timestamps capture response times accurately
- Real-time subscriptions can target these tables

**Estimated Time**: 3-4 hours

---

## Task 6: Define Content Validation Schema

**Description**: Create tables for WYSIWYG editor workflow and validation.

**Subtasks:**
- [ ] Create `lib/db/schema/content-revisions.ts`
- [ ] Define validation error Zod schema
- [ ] Add proposed/reviewed user references
- [ ] Create validation status enum

**Acceptance Criteria:**
- Revisions track who proposed and reviewed changes
- Validation errors stored as structured JSONB
- Status transitions enforced (pending ’ approved/rejected)
- Full audit trail with timestamps

**Estimated Time**: 2-3 hours

---

## Task 7: Generate and Apply Initial Migration

**Description**: Create SQL migrations from Drizzle schema and apply to Supabase.

**Subtasks:**
- [ ] Run `drizzle-kit generate` to create migration files
- [ ] Review generated SQL for correctness
- [ ] Copy migration to `supabase/migrations/` directory
- [ ] Apply migration via `supabase db push` or Supabase CLI
- [ ] Verify all tables exist in Supabase dashboard
- [ ] Document migration process in `docs/migrations.md`

**Acceptance Criteria:**
- All tables created in Supabase successfully
- Foreign keys and constraints applied
- No errors during migration
- Schema visible in Supabase Table Editor

**Estimated Time**: 2-3 hours

---

## Task 8: Implement Row-Level Security Policies

**Description**: Create RLS policies for all tables based on user roles.

**Subtasks:**
- [ ] Write SQL policies for `profiles` table
- [ ] Write SQL policies for `student_progress` table
- [ ] Write SQL policies for `activity_submissions` table
- [ ] Write SQL policies for `classes` and `class_enrollments`
- [ ] Write SQL policies for `live_sessions` and `live_responses`
- [ ] Write public read policies for `lessons`, `phases`, `activities`
- [ ] Apply policies via Supabase SQL Editor or migration
- [ ] Test policies with different user roles

**Acceptance Criteria:**
- Students can only access their own progress/submissions
- Teachers can manage their own classes
- Students can only view classes they're enrolled in
- Content is readable by all authenticated users
- Admin role bypasses restrictions (if implemented)
- Policies tested with test users

**Estimated Time**: 4-5 hours

---

## Task 9: Create Validation Utilities

**Description**: Build helper functions for validating JSONB content and activity props.

**Subtasks:**
- [ ] Create `lib/db/validation.ts` module
- [ ] Implement `validateContentBlocks()` function
- [ ] Implement `validateActivityProps()` function with component registry
- [ ] Implement `validateSubmissionData()` function
- [ ] Add detailed error reporting
- [ ] Write unit tests for all validation functions

**Acceptance Criteria:**
- All JSONB fields validated before writes
- Clear error messages for invalid data
- Type-safe validation using Zod
- 100% test coverage for validation logic
- Validation errors include field paths

**Estimated Time**: 3-4 hours

---

## Task 10: Create Database Indexes

**Description**: Add indexes for frequently queried columns and JSONB fields.

**Subtasks:**
- [ ] Create indexes on foreign keys (lesson_id, phase_id, user_id, etc.)
- [ ] Create GIN indexes on JSONB columns (content_blocks, props)
- [ ] Create composite indexes for common queries
- [ ] Create indexes for real-time queries (session_id, respondedAt)
- [ ] Apply indexes via migration
- [ ] Document indexing strategy

**Acceptance Criteria:**
- All foreign keys indexed
- JSONB queries performant (<100ms)
- Real-time queries optimized
- No missing indexes on filtered columns
- Index usage verified via EXPLAIN ANALYZE

**Estimated Time**: 2-3 hours

---

## Task 11: Seed Initial Content

**Description**: Transform v1 content into new schema format and seed database.

**Subtasks:**
- [ ] Create seed script: `supabase/seed/01-lessons.sql`
- [ ] Seed all 8 units as lesson records
- [ ] Transform v1 phase content into JSONB content blocks
- [ ] Create initial activities (comprehension quizzes, calculators)
- [ ] Validate all seeded data against Zod schemas
- [ ] Create seed script for test users/classes
- [ ] Run seed script on dev environment

**Acceptance Criteria:**
- All v1 lessons seeded successfully
- Content blocks match v1 structure
- All activities have valid component keys and props
- No validation errors in seed data
- Test users and classes available for development

**Estimated Time**: 6-8 hours

---

## Task 12: Create Component Registry

**Description**: Build type-safe mapping of component keys to React components and Zod schemas.

**Subtasks:**
- [ ] Create `lib/activities/registry.ts`
- [ ] Define all valid `component_key` values
- [ ] Map component keys to React component imports
- [ ] Map component keys to Zod prop schemas
- [ ] Export type-safe registry object
- [ ] Document registry in `lib/activities/README.md`

**Acceptance Criteria:**
- Registry maps all planned activity types
- Type inference works (component key ’ props type)
- Registry is extendable for new activities
- Documentation includes examples
- Registry validates at build time

**Estimated Time**: 2-3 hours

---

## Task 13: Create Database Query Helpers

**Description**: Build reusable Drizzle query functions for common operations.

**Subtasks:**
- [ ] Create `lib/db/queries/lessons.ts` (getLesson, listLessons)
- [ ] Create `lib/db/queries/phases.ts` (getPhase, listPhasesByLesson)
- [ ] Create `lib/db/queries/progress.ts` (getUserProgress, updateProgress)
- [ ] Create `lib/db/queries/activities.ts` (getActivity, submitActivity)
- [ ] Create `lib/db/queries/classes.ts` (getClassStudents, etc.)
- [ ] Add TypeScript types for all return values
- [ ] Write unit tests for query functions

**Acceptance Criteria:**
- All queries return properly typed data
- Queries handle errors gracefully
- No N+1 query problems
- Queries tested with mock data
- Functions documented with JSDoc comments

**Estimated Time**: 5-6 hours

---

## Task 14: Create Materialized Views for Analytics

**Description**: Build PostgreSQL views for teacher dashboard aggregations.

**Subtasks:**
- [ ] Create `class_progress_summary` materialized view
- [ ] Create `student_activity_summary` view
- [ ] Create `lesson_completion_stats` view
- [ ] Add indexes to materialized views
- [ ] Create refresh strategy (manual, scheduled, or trigger-based)
- [ ] Apply views via migration

**Acceptance Criteria:**
- Views aggregate data efficiently (<1s query time)
- Views include all needed metrics for dashboards
- Refresh strategy documented
- Views indexed for fast lookups
- Views tested with realistic data volumes

**Estimated Time**: 3-4 hours

---

## Task 15: Set Up Real-Time Subscriptions

**Description**: Configure Supabase Realtime for live sessions and leaderboards.

**Subtasks:**
- [ ] Enable Realtime on relevant tables in Supabase dashboard
- [ ] Create client-side subscription hooks: `useSessionResponses()`, `useLeaderboard()`
- [ ] Handle connection state (connecting, connected, error)
- [ ] Implement reconnection logic
- [ ] Test real-time updates with multiple clients
- [ ] Document subscription patterns

**Acceptance Criteria:**
- Subscriptions connect successfully from browser
- Updates propagate within 100ms
- No memory leaks (subscriptions cleaned up)
- Reconnection works after network interruption
- RLS policies enforced on subscriptions
- Multiple clients can subscribe simultaneously

**Estimated Time**: 4-5 hours

---

## Task 16: Write Integration Tests

**Description**: Test end-to-end database operations with RLS enforcement.

**Subtasks:**
- [ ] Set up test database or use Supabase local dev
- [ ] Create test fixtures (users, classes, content)
- [ ] Test student progress CRUD operations
- [ ] Test activity submission workflow
- [ ] Test teacher class management
- [ ] Test RLS policies with different user roles
- [ ] Test real-time subscriptions
- [ ] Automate tests in CI/CD

**Acceptance Criteria:**
- All CRUD operations tested
- RLS policies verified for all roles
- Tests run in isolated environment
- Tests clean up after themselves
- 80%+ coverage of database layer
- Tests pass in CI

**Estimated Time**: 6-8 hours

---

## Task 17: Create Database Documentation

**Description**: Generate comprehensive documentation for schema, policies, and usage.

**Subtasks:**
- [ ] Generate ER diagram from Drizzle schema (use dbdiagram.io or similar)
- [ ] Document all tables with descriptions
- [ ] Document RLS policy logic
- [ ] Create content block type reference
- [ ] Create activity component reference
- [ ] Document query helper API
- [ ] Create migration runbook
- [ ] Add troubleshooting guide

**Acceptance Criteria:**
- ER diagram accurately reflects schema
- All tables and columns documented
- RLS policies explained with examples
- Component registry fully documented
- Migration process step-by-step
- Documentation in `docs/database/` directory

**Estimated Time**: 4-5 hours

---

## Task 18: Performance Testing and Optimization

**Description**: Benchmark critical queries and optimize as needed.

**Subtasks:**
- [ ] Benchmark phase load times (target: <500ms)
- [ ] Benchmark real-time updates (target: <100ms)
- [ ] Benchmark teacher dashboard queries
- [ ] Benchmark content block JSONB queries
- [ ] Use EXPLAIN ANALYZE to identify slow queries
- [ ] Add missing indexes if found
- [ ] Consider denormalization for hot paths
- [ ] Document performance characteristics

**Acceptance Criteria:**
- Phase loads meet <500ms target
- Real-time updates meet <100ms target
- No queries >1s without explicit reason
- All slow queries optimized or documented
- Performance benchmarks documented
- Optimization recommendations for future

**Estimated Time**: 4-5 hours

---

## Summary

**Total Estimated Time**: 60-75 hours

**Critical Path**:
1. Task 1 (Infrastructure) ’ Task 2-6 (Schema) ’ Task 7 (Migration) ’ Task 8 (RLS)
2. Task 9 (Validation) ’ Task 11 (Seed Data)
3. Task 12 (Registry) ’ Task 13 (Queries)
4. Task 15 (Real-Time) + Task 16 (Tests)
5. Task 17 (Documentation) + Task 18 (Performance)

**Parallel Work Opportunities**:
- Tasks 2-6 (schema definitions) can be done concurrently
- Tasks 9, 12, 13 can be developed in parallel after migration
- Tasks 17-18 can start after core functionality is complete
