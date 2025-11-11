---
title: Core Platform Functionality - Tasks
type: tasks
status: draft
epic: 3
created: 2025-11-11
---

# Tasks: Core Platform Functionality

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
- [ ] Add username and password input fields
- [ ] Implement sign-in form submission
- [ ] Display demo credentials prominently (demo_student / demo123, demo_teacher / demo123)
- [ ] Handle login errors with user-friendly messages
- [ ] Redirect to appropriate dashboard or `redirect` query param after login
- [ ] Write E2E test for login flow

**Acceptance Criteria**:
- Login form validates inputs
- Demo credentials displayed and functional
- Successful login redirects to correct dashboard
- Errors displayed without technical stack traces
- Redirect query param honored after login

---

### Task 5: Demo User Seeding
- [ ] Create `supabase/seed/01-demo-users.sql`
- [ ] Insert demo_teacher account in auth.users with role='teacher'
- [ ] Insert demo_student account in auth.users with role='student'
- [ ] Create corresponding profile records
- [ ] Run seed script and verify accounts
- [ ] Document demo credentials in project README

**Acceptance Criteria**:
- Both demo accounts created successfully
- Credentials match login page display (demo_student/demo123, demo_teacher/demo123)
- Roles stored in user_metadata
- Profile records linked to auth users

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

### Task 15: Assessment Submission API
- [ ] Create `app/api/progress/assessment/route.ts`
- [ ] Implement POST handler with auth check
- [ ] Insert to `assessment_submissions` table
- [ ] Store answers JSONB and calculated score
- [ ] Return success response
- [ ] Write integration test with mock assessment

**Acceptance Criteria**:
- Endpoint requires authentication
- Submission inserted with answers and score
- Returns 401 for unauthenticated requests
- RLS policies enforced

---

### Task 16: Assessment Submission Integration
- [ ] Update interactive components to call assessment API on submit
- [ ] Pass `onSubmit` handler to activity components
- [ ] Implement score calculation in client component
- [ ] Send answers + score to API endpoint
- [ ] Show success feedback to student
- [ ] Write integration test for end-to-end submission

**Acceptance Criteria**:
- Activities with assessment call API on submit
- Answers and scores persisted correctly
- Student sees confirmation message
- Submission visible in teacher dashboard

---

## Phase 5: Teacher Dashboard

### Task 17: Teacher Dashboard Layout
- [ ] Create `app/teacher/page.tsx` as protected route
- [ ] Fetch teacher profile and organization
- [ ] Fetch all students in teacher organization
- [ ] Calculate progress percentage for each student
- [ ] Display student list table (username, progress %, last active)
- [ ] Add "Create Student" and "Export CSV" buttons
- [ ] Write integration test for dashboard

**Acceptance Criteria**:
- Dashboard requires teacher authentication
- Student list displays with correct progress percentages
- Last active timestamps shown
- Dashboard loads in <2 seconds

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

### Task 19: Create Student Account Feature
- [ ] Create `app/api/users/create-student/route.ts` with admin client
- [ ] Implement teacher-only POST handler
- [ ] Generate username from first/last name or sequential ID
- [ ] Generate random 8-character password
- [ ] Create auth user and profile record
- [ ] Return username + password to teacher
- [ ] Create UI dialog/modal for student creation
- [ ] Display created credentials prominently
- [ ] Write integration test for account creation

**Acceptance Criteria**:
- Teacher can create student accounts from dashboard
- Usernames generated correctly
- Passwords are random and secure
- Credentials displayed for teacher to print/share
- New student can immediately log in with generated credentials

---

## Phase 6: Testing & Polish

### Task 20: End-to-End Testing
- [ ] Write E2E test: Teacher login ’ Create student ’ View dashboard
- [ ] Write E2E test: Student login ’ Complete lesson phase ’ Verify progress
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

**Total Tasks**: 23
**Estimated Timeline**: 2-3 weeks

**Dependencies**:
- Phase 2 depends on Phase 1 (auth required for protected content)
- Phase 4 depends on Phase 2 (progress tracking requires lesson rendering)
- Phase 5 depends on Phase 4 (dashboard displays tracked progress)
- Phase 6 can be done incrementally throughout

**Sprint Goal**: Launch MVP platform where teachers can create student accounts, students can view database-driven lessons with progress tracking, and teachers can monitor progress via dashboard.
