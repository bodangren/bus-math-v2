# Plan: Core Platform Functionality

## Phase 0: Schema Updates (Blocker Fixes)

### Task 0: Organizations Schema & FK Relationships
- [ ] Task: Add `organizations` table to `lib/db/schema.ts`
- [ ] Task: Add `organizationId` FK to `profiles` table
- [ ] Task: Create RLS policy for org-scoped teacher access
- [ ] Task: Create migration file for schema changes
- [ ] Task: Run `npx drizzle-kit push` to apply changes
- [ ] Task: Create seed script `supabase/seed/00-demo-org.sql` for demo organization

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
- [ ] Task: Create `lib/supabase/client.ts` (browser client with anon key)
- [ ] Task: Create `lib/supabase/server.ts` (server client with cookies via @supabase/ssr)
- [ ] Task: Create `lib/supabase/admin.ts` (admin client with service role key)
- [ ] Task: Add environment variables to `.env.local` and `.env.example`
- [ ] Task: Validate Supabase connection with test query
- [ ] Task: Write unit tests for client utilities

**Acceptance Criteria**:
- All three client patterns implemented following Supabase Next.js 15 guide
- Environment variables documented
- Service role key never exposed to browser
- Test query successfully fetches from database

---

### Task 2: Authentication System
- [ ] Task: Create `components/auth/AuthProvider.tsx` with `useAuth()` hook
- [ ] Task: Implement username-to-email conversion (`username@internal.domain`)
- [ ] Task: Implement `signIn(username, password)` method
- [ ] Task: Implement `signOut()` method
- [ ] Task: Wrap app with `AuthProvider` in root layout
- [ ] Task: Write unit tests for auth utilities

**Acceptance Criteria**:
- `useAuth()` hook returns user, profile, loading state
- Username-based login works (email hidden from users)
- Auth state persists across page reloads
- Sign out clears session and redirects appropriately

---

### Task 3: Middleware for Route Protection
- [ ] Task: Create `middleware.ts` in app root
- [ ] Task: Implement auth check using server client
- [ ] Task: Protect `/student/*` routes (require student or teacher role)
- [ ] Task: Protect `/teacher/*` routes (require teacher role)
- [ ] Task: Redirect unauthorized users to `/login?redirect=...`
- [ ] Task: Allow public routes (/, /preface, /curriculum, /login)
- [ ] Task: Write integration tests for middleware redirects

**Acceptance Criteria**:
- Accessing `/student/*` without auth redirects to login
- Accessing `/teacher/*` as student redirects to `/student`
- Public routes accessible without auth
- Redirect query param preserves intended destination

---

### Task 4: Login Page
- [ ] Task: Create `app/login/page.tsx`
- [ ] Task: Add username and password input fields (WCAG 2.1 AA compliant)
- [ ] Task: Implement sign-in form submission
- [ ] Task: Display demo credentials prominently (demo_student / demo123, demo_teacher / demo123)
- [ ] Task: Handle login errors with user-friendly messages
- [ ] Task: Redirect to appropriate dashboard or `redirect` query param after login
- [ ] Task: Ensure proper ARIA labels and keyboard navigation
- [ ] Task: Write E2E test for login flow

**Acceptance Criteria**:
- Login form validates inputs
- Demo credentials displayed and functional
- Successful login redirects to correct dashboard
- Errors displayed without technical stack traces
- Redirect query param honored after login
- Form meets WCAG 2.1 AA accessibility standards

---

### Task 5: Demo User Seeding (Updated for Blocker Fix #5)
- [ ] Task: Create `supabase/seed/01-demo-users.ts` (TypeScript, not SQL)
- [ ] Task: Use Supabase Auth Admin API to create demo_teacher account
- [ ] Task: Use Supabase Auth Admin API to create demo_student account
- [ ] Task: Create corresponding profile records with organizationId FK
- [ ] Task: Add `tsx` dependency for running TypeScript seed scripts
- [ ] Task: Run seed script and verify accounts
- [ ] Task: Document demo credentials in project README

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
- [ ] Task: Refactor `app/student/lesson/[lessonSlug]/page.tsx` to server component
- [ ] Task: Fetch lesson from database by slug
- [ ] Task: Fetch associated phases in same query
- [ ] Task: Pass lesson data to LessonRenderer component
- [ ] Task: Handle 404 for non-existent lessons
- [ ] Task: Add loading state
- [ ] Task: Write integration test for lesson fetching

**Acceptance Criteria**:
- Lesson data fetched from Supabase database
- Query includes phases via relation
- 404 page shown for invalid slugs
- Page renders in <2 seconds

---

### Task 7: Phase Content Renderer
- [ ] Task: Create `components/lesson/PhaseRenderer.tsx`
- [ ] Task: Implement content block iteration over `phase.contentBlocks` JSONB array
- [ ] Task: Render markdown blocks using ReactMarkdown
- [ ] Task: Render video blocks with VideoPlayer component
- [ ] Task: Render image blocks with next/image
- [ ] Task: Render callout blocks with Callout component
- [ ] Task: Render activity blocks (fetch activity, render via registry)
- [ ] Task: Add Zod validation for content blocks
- [ ] Task: Write unit tests for each block type

**Acceptance Criteria**:
- All block types render correctly
- Type narrowing works for discriminated union
- Invalid content blocks fail gracefully with error boundary
- Tests cover all block type variations

---

### Task 8: Activity Registry & Integration
- [ ] Task: Create `lib/activities/registry.ts`
- [ ] Task: Map all 89 component keys to React components
- [ ] Task: Implement dynamic activity fetching by ID
- [ ] Task: Implement dynamic component rendering based on componentKey
- [ ] Task: Pass activity props to rendered component
- [ ] Task: Handle missing/invalid activity IDs gracefully
- [ ] Task: Write integration test for activity rendering

**Acceptance Criteria**:
- Registry maps all 89 migrated components
- Activities fetched from database by ID
- Components render with correct props from database
- Missing activities show helpful error message

---

### Task 9: Sample Lesson Seeding
- [ ] Task: Create `supabase/seed/02-sample-lessons.sql`
- [ ] Task: Seed Unit 1, Lesson 1 with all 6 phases and content blocks
- [ ] Task: Seed Unit 2, Lesson 1 with all 6 phases and content blocks
- [ ] Task: Seed Unit 3, Lesson 1 with all 6 phases and content blocks
- [ ] Task: Create `supabase/seed/03-sample-activities.sql` for referenced activities
- [ ] Task: Run seed scripts and verify data
- [ ] Task: Create validation script to compare v1 vs seeded content

**Acceptance Criteria**:
- 3 lessons seeded with complete phase content
- Content blocks reference valid activity IDs
- Seeded content matches v1 lessons exactly
- Validation script confirms parity

---

## Phase 3: Public Pages

### Task 10: Home Page Refactor
- [ ] Task: Refactor `app/page.tsx` to server component
- [ ] Task: Create Supabase RPC function `get_curriculum_stats()`
- [ ] Task: Fetch curriculum stats (unit count, lesson count, activity count)
- [ ] Task: Display stats in hero section
- [ ] Task: Keep v1 marketing content
- [ ] Task: Add CTA buttons (Login, Explore Curriculum)
- [ ] Task: Write integration test for home page

**Acceptance Criteria**:
- Home page accessible without auth
- Stats pulled from database dynamically
- Marketing content matches v1
- CTAs link to correct pages

---

### Task 11: Curriculum Overview Page
- [ ] Task: Refactor `app/curriculum/page.tsx` to server component
- [ ] Task: Fetch all lessons grouped by unit number
- [ ] Task: Display units with descriptions
- [ ] Task: Display lessons under each unit
- [ ] Task: Link to lesson pages (public preview mode)
- [ ] Task: Keep v1 layout and styling
- [ ] Task: Write integration test for curriculum page

**Acceptance Criteria**:
- Curriculum page accessible without auth
- All lessons displayed grouped by unit
- Lesson links work correctly
- Layout matches v1

---

### Task 12: Preface Page Refactor
- [ ] Task: Review existing `app/preface/page.tsx`
- [ ] Task: Keep static content (Sarah Chen narrative)
- [ ] Task: Optionally pull instructor metadata from settings table
- [ ] Task: Ensure page accessible without auth
- [ ] Task: Verify content matches v1

**Acceptance Criteria**:
- Preface page accessible without auth
- Content matches v1 exactly
- No authentication required

---

## Phase 4: Progress Tracking

### Task 13: Phase Completion API
- [ ] Task: Create `app/api/progress/phase/route.ts`
- [ ] Task: Implement POST handler with auth check
- [ ] Task: Upsert to `user_progress` table on completion
- [ ] Task: Return success response
- [ ] Task: Write integration test with mock user

**Acceptance Criteria**:
- Endpoint requires authentication
- Progress upserted to database with timestamp
- Returns 401 for unauthenticated requests
- RLS policies enforced (students can only update own progress)

---

### Task 14: Phase Complete Button Component
- [ ] Task: Create `components/lesson/PhaseCompleteButton.tsx`
- [ ] Task: Implement "Mark Complete" button with optimistic UI
- [ ] Task: Call `/api/progress/phase` endpoint on click
- [ ] Task: Show toast notification on success
- [ ] Task: Handle errors gracefully
- [ ] Task: Disable button when already completed
- [ ] Task: Write unit test for button behavior

**Acceptance Criteria**:
- Button calls API correctly
- Optimistic UI updates immediately
- Toast shown on success
- Completed state persists and disables button

---

### Task 15: Assessment Submission API (Updated for Blocker Fix #3)
- [ ] Task: Create `app/api/progress/assessment/route.ts`
- [ ] Task: Implement POST handler with auth check
- [ ] Task: Fetch activity from database to get grading config
- [ ] Task: **SERVER-SIDE SCORING**: Implement `calculateScore()` function
- [ ] Task: Insert to `assessment_submissions` table with server-calculated score
- [ ] Task: Return score and feedback to client
- [ ] Task: Write integration test with mock assessment

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
- [ ] Task: Update interactive components to call assessment API on submit
- [ ] Task: Pass `onSubmit` handler to activity components
- [ ] Task: **Send ONLY answers to API** (no score from client)
- [ ] Task: Display score returned from server
- [ ] Task: Show success feedback to student
- [ ] Task: Write integration test for end-to-end submission

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
- [ ] Task: Create `app/teacher/page.tsx` as protected route
- [ ] Task: Fetch teacher profile and organization
- [ ] Task: Create SQL function `get_student_progress()` for accurate progress calculation
- [ ] Task: Fetch all students in teacher organization
- [ ] Task: **Use RPC to calculate progress** (count only completed=true phases)
- [ ] Task: Display student list table (username, progress %, last active)
- [ ] Task: Add "Create Student" and "Export CSV" buttons
- [ ] Task: Ensure WCAG 2.1 AA compliance for dashboard
- [ ] Task: Write integration test for dashboard

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
- [ ] Task: Implement client-side CSV generation
- [ ] Task: Format data: Username, Progress %, Completed Phases, Total Phases, Last Active
- [ ] Task: Trigger browser download with generated CSV
- [ ] Task: Add filename with timestamp
- [ ] Task: Write unit test for CSV formatting

**Acceptance Criteria**:
- CSV downloads correctly in browser
- Data formatted for gradebook import
- Filename includes date/timestamp
- All students included in export

---

### Task 19: Create Student Account Feature (Updated for Blocker Fix #2)
- [ ] Task: **Create Supabase Edge Function** `supabase/functions/create-student/index.ts`
- [ ] Task: Implement edge function with service-role client (isolated from Next.js)
- [ ] Task: Verify teacher session in edge function
- [ ] Task: Generate username from first/last name or sequential ID
- [ ] Task: Generate random 8-character password
- [ ] Task: Use Auth Admin API to create user (within edge function)
- [ ] Task: Create profile record with organizationId
- [ ] Task: Create Next.js API route `app/api/users/create-student/route.ts` that forwards to edge function
- [ ] Task: Create UI dialog/modal for student creation (WCAG compliant)
- [ ] Task: Display created credentials prominently
- [ ] Task: Write integration test for account creation

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
- [ ] Task: Write E2E test: Teacher login → Create student → View dashboard
- [ ] Task: Write E2E test: Student login → Complete lesson phase → Verify progress
- [ ] Task: Write E2E test: Public pages accessible without auth
- [ ] Task: Write E2E test: Protected pages redirect to login
- [ ] Task: Document E2E test scenarios and results

**Acceptance Criteria**:
- All E2E scenarios pass
- Demo credentials work correctly
- Progress tracking verified end-to-end
- Teacher can see student progress

---

### Task 21: Performance Optimization
- [ ] Task: Add database indexes for frequently queried columns
- [ ] Task: Implement caching strategy for lesson queries
- [ ] Task: Profile database queries and optimize slow ones
- [ ] Task: Implement optimistic UI for progress updates
- [ ] Task: Add loading states to all async operations
- [ ] Task: Monitor Supabase dashboard for query performance

**Acceptance Criteria**:
- Lesson pages load in <2 seconds
- Progress updates feel instant (<500ms)
- Database queries complete in <100ms
- No N+1 query problems

---

### Task 22: Security Audit
- [ ] Task: Verify RLS policies on all tables
- [ ] Task: Verify service role key not exposed to browser
- [ ] Task: Verify middleware protects all sensitive routes
- [ ] Task: Verify API routes check authentication
- [ ] Task: Test cross-student data access (should fail)
- [ ] Task: Test student accessing teacher routes (should redirect)
- [ ] Task: Document security testing results

**Acceptance Criteria**:
- Students cannot access other students' progress
- Students cannot access teacher dashboard
- All API routes require proper authentication
- RLS policies tested with service-role + anon clients

---

### Task 23: Documentation & Deployment
- [ ] Task: Update project README with setup instructions
- [ ] Task: Document demo credentials
- [ ] Task: Document database seeding process
- [ ] Task: Update deployment guide for Vercel + Supabase
- [ ] Task: Create troubleshooting guide
- [ ] Task: Add environment variable documentation

**Acceptance Criteria**:
- README includes complete setup steps
- Demo credentials documented
- Deployment guide covers Vercel and Supabase configuration
- Troubleshooting guide addresses common issues
