---
title: Core Platform Functionality - Tasks
type: tasks
status: draft
epic: 3
created: 2025-11-11
---

# Tasks: Core Platform Functionality

## Phase 0: Schema Updates (Blocker Fixes)

### Task 0: Organizations Schema & FK Relationships
- [ ] Add `organizations` table to `lib/db/schema.ts`
- [ ] Add `organizationId` FK to `profiles` table
- [ ] Create RLS policy for org-scoped teacher access
- [ ] Create migration file for schema changes
- [ ] Run `npx drizzle-kit push` to apply changes
- [ ] Create seed script `supabase/seed/00-demo-org.sql` for demo organization

**Acceptance Criteria**:
- Organizations table created with id, name, slug, settings fields
- Profiles table has organizationId FK constraint
- RLS policy prevents cross-org data access
- Demo organization seeded with known UUID
- Migration applies successfully

**Addresses**: Blocker #1 from PR review

---

## Phase 1: Foundation & Authentication

### Task 1: Supabase Client Infrastructure
- [ ] Create `lib/supabase/client.ts` (browser client with anon key)
- [ ] Create `lib/supabase/server.ts` (server client with cookies via @supabase/ssr)
- [ ] Create `lib/supabase/admin.ts` (admin client with service role key)
- [ ] Add environment variables to `.env.local` and `.env.example`
- [ ] Validate Supabase connection with test query
- [ ] Write unit tests for client utilities

**Acceptance Criteria**:
- All three client patterns implemented following Supabase Next.js 15 guide
- Environment variables documented
- Service role key never exposed to browser
- Test query successfully fetches from database

---

### Task 2: Authentication System
- [ ] Create `components/auth/AuthProvider.tsx` with `useAuth()` hook
- [ ] Implement username-to-email conversion (`username@internal.domain`)
- [ ] Implement `signIn(username, password)` method
- [ ] Implement `signOut()` method
- [ ] Wrap app with `AuthProvider` in root layout
- [ ] Write unit tests for auth utilities

**Acceptance Criteria**:
- `useAuth()` hook returns user, profile, loading state
- Username-based login works (email hidden from users)
- Auth state persists across page reloads
- Sign out clears session and redirects appropriately

---

### Task 3: Middleware for Route Protection
- [ ] Create `middleware.ts` in app root
- [ ] Implement auth check using server client
- [ ] Protect `/student/*` routes (require student or teacher role)
- [ ] Protect `/teacher/*` routes (require teacher role)
- [ ] Redirect unauthorized users to `/login?redirect=...`
- [ ] Allow public routes (/, /preface, /curriculum, /login)
- [ ] Write integration tests for middleware redirects

**Acceptance Criteria**:
- Accessing `/student/*` without auth redirects to login
- Accessing `/teacher/*` as student redirects to `/student`
- Public routes accessible without auth
- Redirect query param preserves intended destination

---

### Task 4: Login Page
- [ ] Create `app/login/page.tsx`
- [ ] Add username and password input fields (WCAG 2.1 AA compliant)
- [ ] Implement sign-in form submission
- [ ] Display demo credentials prominently (demo_student / demo123, demo_teacher / demo123)
- [ ] Handle login errors with user-friendly messages
- [ ] Redirect to appropriate dashboard or `redirect` query param after login
- [ ] Ensure proper ARIA labels and keyboard navigation
- [ ] Write E2E test for login flow

**Acceptance Criteria**:
- Login form validates inputs
- Demo credentials displayed and functional
- Successful login redirects to correct dashboard
- Errors displayed without technical stack traces
- Redirect query param honored after login
- Form meets WCAG 2.1 AA accessibility standards

---

### Task 5: Demo User Seeding (Updated for Blocker Fix #5)
- [ ] Create `supabase/seed/01-demo-users.ts` (TypeScript, not SQL)
- [ ] Use Supabase Auth Admin API to create demo_teacher account
- [ ] Use Supabase Auth Admin API to create demo_student account
- [ ] Create corresponding profile records with organizationId FK
- [ ] Add `tsx` dependency for running TypeScript seed scripts
- [ ] Run seed script and verify accounts
- [ ] Document demo credentials in project README

**Acceptance Criteria**:
- Both demo accounts created via Auth Admin API (not direct SQL)
- Credentials match login page display (demo_student/demo123, demo_teacher/demo123)
- Roles stored in user_metadata
- Profile records linked to auth users with demo org ID
- Seed script runs successfully on Supabase Cloud

**Addresses**: Blocker #5 from PR review

---

## Phase 2: Database-Driven Content

### Task 6: Lesson Page Refactor
- [ ] Refactor `app/student/lesson/[lessonSlug]/page.tsx` to server component
- [ ] Fetch lesson from database by slug
- [ ] Fetch associated phases in same query
- [ ] Pass lesson data to LessonRenderer component
- [ ] Handle 404 for non-existent lessons
- [ ] Add loading state
- [ ] Write integration test for lesson fetching

**Acceptance Criteria**:
- Lesson data fetched from Supabase database
- Query includes phases via relation
- 404 page shown for invalid slugs
- Page renders in <2 seconds

---

### Task 7: Phase Content Renderer
- [ ] Create `components/lesson/PhaseRenderer.tsx`
- [ ] Implement content block iteration over `phase.contentBlocks` JSONB array
- [ ] Render markdown blocks using ReactMarkdown
- [ ] Render video blocks with VideoPlayer component
- [ ] Render image blocks with next/image
- [ ] Render callout blocks with Callout component
- [ ] Render activity blocks (fetch activity, render via registry)
- [ ] Add Zod validation for content blocks
- [ ] Write unit tests for each block type

**Acceptance Criteria**:
- All block types render correctly
- Type narrowing works for discriminated union
- Invalid content blocks fail gracefully with error boundary
- Tests cover all block type variations

---

### Task 8: Activity Registry & Integration
- [ ] Create `lib/activities/registry.ts`
- [ ] Map all 89 component keys to React components
- [ ] Implement dynamic activity fetching by ID
- [ ] Implement dynamic component rendering based on componentKey
- [ ] Pass activity props to rendered component
- [ ] Handle missing/invalid activity IDs gracefully
- [ ] Write integration test for activity rendering

**Acceptance Criteria**:
- Registry maps all 89 migrated components
- Activities fetched from database by ID
- Components render with correct props from database
- Missing activities show helpful error message

---

### Task 9: Sample Lesson Seeding
- [ ] Create `supabase/seed/02-sample-lessons.sql`
- [ ] Seed Unit 1, Lesson 1 with all 6 phases and content blocks
- [ ] Seed Unit 2, Lesson 1 with all 6 phases and content blocks
- [ ] Seed Unit 3, Lesson 1 with all 6 phases and content blocks
- [ ] Create `supabase/seed/03-sample-activities.sql` for referenced activities
- [ ] Run seed scripts and verify data
- [ ] Create validation script to compare v1 vs seeded content

**Acceptance Criteria**:
- 3 lessons seeded with complete phase content
- Content blocks reference valid activity IDs
- Seeded content matches v1 lessons exactly
- Validation script confirms parity

---

## Phase 3: Public Pages

### Task 10: Home Page Refactor
- [ ] Refactor `app/page.tsx` to server component
- [ ] Create Supabase RPC function `get_curriculum_stats()`
- [ ] Fetch curriculum stats (unit count, lesson count, activity count)
- [ ] Display stats in hero section
- [ ] Keep v1 marketing content
- [ ] Add CTA buttons (Login, Explore Curriculum)
- [ ] Write integration test for home page

**Acceptance Criteria**:
- Home page accessible without auth
- Stats pulled from database dynamically
- Marketing content matches v1
- CTAs link to correct pages

---

### Task 11: Curriculum Overview Page
- [ ] Refactor `app/curriculum/page.tsx` to server component
- [ ] Fetch all lessons grouped by unit number
- [ ] Display units with descriptions
- [ ] Display lessons under each unit
- [ ] Link to lesson pages (public preview mode)
- [ ] Keep v1 layout and styling
- [ ] Write integration test for curriculum page

**Acceptance Criteria**:
- Curriculum page accessible without auth
- All lessons displayed grouped by unit
- Lesson links work correctly
- Layout matches v1

---

### Task 12: Preface Page Refactor
- [ ] Review existing `app/preface/page.tsx`
- [ ] Keep static content (Sarah Chen narrative)
- [ ] Optionally pull instructor metadata from settings table
- [ ] Ensure page accessible without auth
- [ ] Verify content matches v1

**Acceptance Criteria**:
- Preface page accessible without auth
- Content matches v1 exactly
- No authentication required

---

## Phase 4: Progress Tracking

### Task 13: Phase Completion API
- [ ] Create `app/api/progress/phase/route.ts`
- [ ] Implement POST handler with auth check
- [ ] Upsert to `user_progress` table on completion
- [ ] Return success response
- [ ] Write integration test with mock user

**Acceptance Criteria**:
- Endpoint requires authentication
- Progress upserted to database with timestamp
- Returns 401 for unauthenticated requests
- RLS policies enforced (students can only update own progress)

---

### Task 14: Phase Complete Button Component
- [ ] Create `components/lesson/PhaseCompleteButton.tsx`
- [ ] Implement "Mark Complete" button with optimistic UI
- [ ] Call `/api/progress/phase` endpoint on click
- [ ] Show toast notification on success
- [ ] Handle errors gracefully
- [ ] Disable button when already completed
- [ ] Write unit test for button behavior

**Acceptance Criteria**:
- Button calls API correctly
- Optimistic UI updates immediately
- Toast shown on success
- Completed state persists and disables button

---

### Task 15: Assessment Submission API (Updated for Blocker Fix #3)
- [ ] Create `app/api/progress/assessment/route.ts`
- [ ] Implement POST handler with auth check
- [ ] Fetch activity from database to get grading config
- [ ] **SERVER-SIDE SCORING**: Implement `calculateScore()` function
- [ ] Insert to `assessment_submissions` table with server-calculated score
- [ ] Return score and feedback to client
- [ ] Write integration test with mock assessment

**Acceptance Criteria**:
- Endpoint requires authentication
- Score calculated on server (NOT trusted from client)
- Submission inserted with answers and server-calculated score
- Returns 401 for unauthenticated requests
- RLS policies enforced
- Students cannot tamper with scores via DevTools

**Addresses**: Blocker #3 from PR review

---

### Task 16: Assessment Submission Integration (Updated for Blocker Fix #3)
- [ ] Update interactive components to call assessment API on submit
- [ ] Pass `onSubmit` handler to activity components
- [ ] **Send ONLY answers to API** (no score from client)
- [ ] Display score returned from server
- [ ] Show success feedback to student
- [ ] Write integration test for end-to-end submission

**Acceptance Criteria**:
- Activities with assessment call API on submit
- Client sends only answers, server calculates score
- Answers and server-calculated scores persisted correctly
- Student sees score returned from server
- Submission visible in teacher dashboard

**Addresses**: Blocker #3 from PR review

---

## Phase 5: Teacher Dashboard

### Task 17: Teacher Dashboard Layout (Updated for Blocker Fix #4)
- [ ] Create `app/teacher/page.tsx` as protected route
- [ ] Fetch teacher profile and organization
- [ ] Create SQL function `get_student_progress()` for accurate progress calculation
- [ ] Fetch all students in teacher organization
- [ ] **Use RPC to calculate progress** (count only completed=true phases)
- [ ] Display student list table (username, progress %, last active)
- [ ] Add "Create Student" and "Export CSV" buttons
- [ ] Ensure WCAG 2.1 AA compliance for dashboard
- [ ] Write integration test for dashboard

**Acceptance Criteria**:
- Dashboard requires teacher authentication
- Progress calculated accurately (only completed phases counted)
- Student list displays with correct progress percentages
- Last active timestamps shown
- Dashboard loads in <2 seconds
- Dashboard meets accessibility standards

**Addresses**: Blocker #4 from PR review

---

### Task 18: CSV Export Functionality
- [ ] Implement client-side CSV generation
- [ ] Format data: Username, Progress %, Completed Phases, Total Phases, Last Active
- [ ] Trigger browser download with generated CSV
- [ ] Add filename with timestamp
- [ ] Write unit test for CSV formatting

**Acceptance Criteria**:
- CSV downloads correctly in browser
- Data formatted for gradebook import
- Filename includes date/timestamp
- All students included in export

---

### Task 19: Create Student Account Feature (Updated for Blocker Fix #2)
- [ ] **Create Supabase Edge Function** `supabase/functions/create-student/index.ts`
- [ ] Implement edge function with service-role client (isolated from Next.js)
- [ ] Verify teacher session in edge function
- [ ] Generate username from first/last name or sequential ID
- [ ] Generate random 8-character password
- [ ] Use Auth Admin API to create user (within edge function)
- [ ] Create profile record with organizationId
- [ ] Create Next.js API route `app/api/users/create-student/route.ts` that forwards to edge function
- [ ] Create UI dialog/modal for student creation (WCAG compliant)
- [ ] Display created credentials prominently
- [ ] Write integration test for account creation

**Acceptance Criteria**:
- Service-role key isolated in edge function (not in Next.js runtime)
- Teacher can create student accounts from dashboard
- Usernames generated correctly
- Passwords are random and secure
- Credentials displayed for teacher to print/share
- New student can immediately log in with generated credentials
- UI dialog meets accessibility standards

**Addresses**: Blocker #2 from PR review

---

## Phase 6: Testing & Polish

### Task 20: End-to-End Testing
- [ ] Write E2E test: Teacher login � Create student � View dashboard
- [ ] Write E2E test: Student login � Complete lesson phase � Verify progress
- [ ] Write E2E test: Public pages accessible without auth
- [ ] Write E2E test: Protected pages redirect to login
- [ ] Document E2E test scenarios and results

**Acceptance Criteria**:
- All E2E scenarios pass
- Demo credentials work correctly
- Progress tracking verified end-to-end
- Teacher can see student progress

---

### Task 21: Performance Optimization
- [ ] Add database indexes for frequently queried columns
- [ ] Implement caching strategy for lesson queries
- [ ] Profile database queries and optimize slow ones
- [ ] Implement optimistic UI for progress updates
- [ ] Add loading states to all async operations
- [ ] Monitor Supabase dashboard for query performance

**Acceptance Criteria**:
- Lesson pages load in <2 seconds
- Progress updates feel instant (<500ms)
- Database queries complete in <100ms
- No N+1 query problems

---

### Task 22: Security Audit
- [ ] Verify RLS policies on all tables
- [ ] Verify service role key not exposed to browser
- [ ] Verify middleware protects all sensitive routes
- [ ] Verify API routes check authentication
- [ ] Test cross-student data access (should fail)
- [ ] Test student accessing teacher routes (should redirect)
- [ ] Document security testing results

**Acceptance Criteria**:
- Students cannot access other students' progress
- Students cannot access teacher dashboard
- All API routes require proper authentication
- RLS policies tested with service-role + anon clients

---

### Task 23: Documentation & Deployment
- [ ] Update project README with setup instructions
- [ ] Document demo credentials
- [ ] Document database seeding process
- [ ] Update deployment guide for Vercel + Supabase
- [ ] Create troubleshooting guide
- [ ] Add environment variable documentation

**Acceptance Criteria**:
- README includes complete setup steps
- Demo credentials documented
- Deployment guide covers Vercel and Supabase configuration
- Troubleshooting guide addresses common issues

---

## Summary

**Total Tasks**: 24 (including Task 0 for schema updates)
**Estimated Timeline**: 2-3 weeks

**Critical Blocker Fixes Addressed**:
1. **Task 0**: Organizations schema and FK relationships (Blocker #1)
2. **Task 5**: Auth seeding via Admin API (Blocker #5)
3. **Tasks 15-16**: Server-side assessment scoring (Blocker #3)
4. **Task 17**: Accurate progress calculation (Blocker #4)
5. **Task 19**: Service-role isolation via Edge Function (Blocker #2)

**Dependencies**:
- Phase 0 must complete before Phase 1 (schema changes required first)
- Phase 2 depends on Phase 1 (auth required for protected content)
- Phase 4 depends on Phase 2 (progress tracking requires lesson rendering)
- Phase 5 depends on Phase 4 (dashboard displays tracked progress)
- Phase 6 can be done incrementally throughout

**Compliance & Accessibility**:
- WCAG 2.1 AA standards enforced in UI tasks
- FERPA/COPPA considerations documented
- Server-side scoring prevents tampering
- RLS policies enforce data isolation

**Sprint Goal**: Launch MVP platform where teachers can create student accounts, students can view database-driven lessons with progress tracking, and teachers can monitor progress via dashboard - all with production-grade security and compliance.
