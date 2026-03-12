---
title: Math for Business Operations Platform PRD
type: prd
status: draft
created: 2025-11-05
updated: 2025-11-05
---

# Product Requirements Document: Math for Business Operations Platform

## Executive Summary

Transform the static Math for Business Operations v1 curriculum into a Supabase-backed Next.js platform with authentication, progress tracking, and teacher analytics. The system preserves v1's pedagogical excellence (6-phase lesson structure, Sarah Chen narrative, project-based learning) while eliminating content update friction and enabling data-driven teaching. Must operate entirely within free tiers (Supabase, Vercel) to remain sustainable for single-teacher implementations.

**Problem**: v1 requires code changes for content updates (4-8 hours each), provides zero progress visibility, and offers no teacher analytics.

**Solution**: Database-driven content + auth + progress tracking + teacher dashboard, maintaining $0 operational cost.

**Success**: Teacher updates content in <30 minutes via database, identifies struggling students within 2 weeks, and 80% of students complete 80% of curriculum.

## Objectives

### Primary Objectives

1. **Enable Teacher-Friendly Content Management**
   - **Goal**: Eliminate code changes for curriculum updates
   - **Measure**: Time to update lesson content (typo fix, content addition, assessment change)
   - **Target**: Reduce from 4-8 hours to <30 minutes per update
   - **Timeline**: Achieve by MVP launch
   - **Why it matters**: Current friction (4-8 hours) causes 8+ pending updates to be abandoned; teachermaintainer spends 16-32 hours/semester on updates vs desired 2 hours

2. **Provide Actionable Student Progress Data**
   - **Goal**: Enable teacher to identify and intervene with struggling students early
   - **Measure**: Time to identify struggling student; intervention effectiveness
   - **Target**: Identify within 1-2 weeks (vs 8+ weeks in v1); improve pass rates by 15%
   - **Timeline**: Achieve within first 4 weeks of pilot semester
   - **Why it matters**: Early intervention improves outcomes by 18% (EdTech Analytics Report); teacher currently discovers failing students at midterm (too late)

3. **Maintain Free-Tier Sustainability**
   - **Goal**: Operate within Supabase and Vercel free tiers to ensure $0 operational cost
   - **Measure**: Database size, bandwidth usage, function invocations
   - **Target**: Stay under 20% of free tier limits (100MB database, 400MB bandwidth/month)
   - **Timeline**: Continuously throughout project lifetime
   - **Why it matters**: $0 cost is critical for single-teacher adoption vs $4,000+ for enterprise LMS; small schools have <$10,000 total software budget

4. **Preserve Pedagogical Quality from v1**
   - **Goal**: Maintain 100% of v1's curriculum quality, interactivity, and narrative
   - **Measure**: Content fidelity during migration; user testing with students
   - **Target**: Zero regressions in content quality; 80%+ student satisfaction with platform
   - **Timeline**: Achieve by MVP launch through comprehensive migration testing
   - **Why it matters**: v1 curriculum represents 200+ hours of development; losing quality would negate project value

### Secondary Objectives

1. **Enable adoption by other schools**: Design for forkability and customization (open-source)
2. **Reduce teacher time on progress tracking**: Automate what was manual (exporting progress, identifying incomplete work)
3. **Improve student engagement**: Progress visibility may increase completion rates from estimated 70% to 85%

## Success Criteria

### Launch Criteria (Must-Have)

**Functional Completeness**
- [ ] All 8 curriculum units migrated from v1 to database (40 lessons × 6 phases = 240 phase components)
- [ ] Teacher can create student accounts and students can log in, view lessons, and track progress
- [ ] Teachers can view student progress dashboard, export CSV for gradebook
- [ ] Phase completions automatically recorded on student interaction
- [ ] Assessment submissions captured with scoring
- [ ] 100% of critical user workflows tested end-to-end with test accounts

**Quality Standards**
- [ ] Page load time <2 seconds at 95th percentile (match v1 static site performance)
- [ ] Database queries complete in <100ms (Supabase typically 20-50ms)
- [ ] Row Level Security policies prevent cross-account data access (security audit completed)
- [ ] WCAG 2.1 AA accessibility compliance verified (keyboard nav, screen readers, color contrast)
- [ ] All interactive components (spreadsheet simulators, accounting exercises) functional

**Operational Readiness**
- [ ] Free tier usage monitoring configured (database size, bandwidth alerts at 80% threshold)
- [ ] Teacher documentation complete (creating student accounts, providing credentials, content updates, dashboard usage, troubleshooting)
- [ ] Student onboarding guide published (logging in with teacher-provided credentials, navigation, progress tracking, changing password)
- [ ] Database backup strategy implemented (automated weekly backups)
- [ ] Migration rollback plan documented and tested

### Success Metrics (Post-Launch)

**Adoption Metrics** (Measured 30 days post-launch)
- [ ] **Student onboarding**: Teacher creates accounts for all 25 students and 100% successfully log in within first week
  - How measured: Count of user records with role='student' created + count of unique student logins in first 7 days
- [ ] **Teacher dashboard usage**: Teacher logs in 2+ times per week
  - How measured: Teacher user login events per week
- [ ] **First content update via database**: Teacher makes first curriculum update within 4 weeks
  - How measured: First database migration created post-launch

**Engagement Metrics** (Measured 60 days post-launch)
- [ ] **Student activity rate**: 75%+ of students use platform 3+ times per week during semester
  - How measured: Weekly active users / total enrolled students
- [ ] **Lesson completion rate**: 70%+ of students complete 50%+ of assigned lessons by week 6
  - How measured: Average (completed phases / total phases) across students
- [ ] **Assessment submission rate**: 90%+ of students complete phase-5 assessments for all units
  - How measured: (assessment submissions / total assessments assigned) per student

**Outcome Metrics** (Measured full semester, ~4 months)
- [ ] **Student completion rate**: 80%+ of students complete 80%+ of assigned curriculum
  - How measured: (students completing 32+/40 lessons) / total students
- [ ] **Early intervention**: Teacher identifies 3+ struggling students within 2 weeks using dashboard
  - How measured: Teacher interview + dashboard usage logs
- [ ] **Content update frequency**: Teacher makes 3-4 curriculum updates per semester
  - How measured: Count of database migrations or Supabase dashboard edits

**Efficiency Metrics**
- [ ] **Time savings on content updates**: Teacher reports <2 hours total per semester (vs 16-32 hours in v1)
  - How measured: Teacher time tracking + interview
- [ ] **CSV export usage**: Teacher exports gradebook data 3+ times per semester
  - How measured: Count of CSV export button clicks

**Quality Metrics**
- [ ] **Error rate**: <1% of page loads result in errors sustained over semester
  - How measured: Error monitoring dashboard (Vercel Analytics or Sentry)
- [ ] **Performance**: 95th percentile page load <2 seconds maintained throughout semester
  - How measured: Vercel Analytics performance metrics

### Stretch Goals

- [ ] **High completion rate**: 90%+ of students complete 90%+ of curriculum (exceeds 80/80 target)
- [ ] **Teacher advocacy**: Teacher recommends platform to 2+ other schools by end of year
- [ ] **Open-source adoption**: 1+ other school forks and deploys their own instance within 6 months post-launch

## Functional Requirements

### FR1: User Authentication & Account Management

**Description**

System shall provide secure username/password authentication where teachers create and manage student accounts, then provide login credentials to students. Teachers authenticate with email/password. This approach ensures teacher control over classroom access while protecting student data per FERPA requirements.

**User Story**

- As a **teacher**, I want to create student accounts with simple usernames and passwords, so that I can quickly onboard my entire class and provide them with login credentials
- As a **student**, I want to log in with credentials my teacher provides, so that I can access lessons and track my progress privately
- As a **student**, I want to change my initial password, so that I can keep my account secure
- As a **teacher**, I want to reset student passwords if they forget them, so that I can get them back into the platform quickly

**Inputs**
- **Teacher account creation** (one-time setup via Supabase dashboard): Email, password, full name, role=teacher
- **Student account creation** (teacher-initiated via dashboard):
  - Student full name (required)
  - Username (required, unique, 3-20 characters, alphanumeric + underscore/hyphen)
  - Initial password (required, teacher-generated or auto-generated, minimum 6 characters)
  - Optional: Student ID number for school records integration
- **Login** (both roles): Username or email, password
- **Password change** (student-initiated): Current password, new password (minimum 6 characters)
- **Password reset** (teacher-initiated for students): Select student, set new temporary password
- **Logout**: User click

**Outputs**
- **Successful student account creation**: Confirmation with username and temporary password to give student
- **Bulk account creation**: CSV upload with student names generates accounts, exports credentials list
- **Successful login**: Session token, redirect to role-appropriate dashboard (student → lesson homepage, teacher → progress dashboard)
- **Failed login**: Clear error message ("Invalid username or password")
- **Password change success**: Confirmation message, session maintained
- **Password reset success**: New temporary password generated, teacher provides to student

**Business Rules**
- **Student accounts**:
  - Usernames must be unique across all students (e.g., "alex.c", "maria.r", "john.s.2")
  - Initial passwords set by teacher (suggested format: FirstnameLast4 like "Alex2025" or auto-generated)
  - Students can change password after first login (encouraged but not required)
  - No email address required for students (many may not have school email)
  - Student cannot self-register or create accounts
- **Teacher accounts**:
  - Created via Supabase dashboard by admin/developer (one per class for MVP)
  - Email address required (used for login and password recovery)
  - Cannot be created by students or other teachers
- **Session management**:
  - Sessions expire after 7 days of inactivity
  - Maximum 5 failed login attempts trigger 15-minute cooldown per username
  - "Remember me" option extends session to 30 days
- **Password security**:
  - Minimum 6 characters for student passwords (teacher may enforce stronger requirements)
  - Minimum 8 characters for teacher passwords with letter + number requirement
  - Passwords hashed with bcrypt before storage
  - No password complexity requirements for students (simplicity for classroom management)

**Acceptance Criteria**
- [ ] Given teacher on account creation page, when teacher enters student name "Alex Chen" and username "alex.c" with password "Alex2025", then student account created successfully
- [ ] Given teacher creates student account, when creation succeeds, then confirmation displays username and password to provide to student
- [ ] Given teacher uploads CSV with 25 student names, when processed, then 25 accounts created and downloadable credentials list generated
- [ ] Given student has username "alex.c" and password "Alex2025", when student logs in, then session created and redirected to lesson homepage
- [ ] Given student logged in, when student navigates to "Change Password" and submits current + new password, then password updated and confirmation displayed
- [ ] Given teacher views class roster, when teacher clicks "Reset Password" for student, then new temporary password generated and displayed to teacher
- [ ] Given incorrect username or password, when user attempts login, then error message "Invalid username or password" displays (no hint about which is wrong)
- [ ] Given 5 failed login attempts for username "alex.c", when 6th login attempted, then account locked for 15 minutes with message "Too many failed attempts. Try again in 15 minutes."
- [ ] Given logged-in student, when they click logout, then session terminated and redirected to login page
- [ ] Given logged-in user inactive for 7 days, when they attempt to access a page, then session expired and redirected to login
- [ ] Given student account, when student attempts to access `/teacher/dashboard` URL, then access denied with 403 error and message "Access restricted to teachers"
- [ ] Given duplicate username entered, when teacher creates account, then error message "Username already exists. Please choose a different username."

**Priority**: Must Have

**Dependencies**: Supabase Auth configuration (username/password auth), teacher admin dashboard for account creation

---

### FR2: Database-Driven Lesson Content

**Description**

All lesson content (units, lessons, phases, sections, text, images, videos) shall be stored in Supabase PostgreSQL database and rendered dynamically, enabling content updates without code changes.

**User Story**

- As a **teacher**, I want to update lesson content via Supabase dashboard or migrations, so that I can fix typos and improve curriculum without editing code
- As a **student**, I want to see up-to-date lesson content, so that I'm learning from the most current curriculum

**Inputs**
- Database tables: `units`, `lessons`, `lesson_phases`, `phase_sections`, `phase_content`
- Content updates via Supabase dashboard or SQL migrations
- Student requests lesson page via URL (e.g., `/student/unit01/lesson01/phase-1`)

**Outputs**
- Rendered lesson page with current content from database
- Properly formatted text, images, videos, interactive components
- Phase navigation (previous/next phase buttons)
- Progress indicators (phase completion checkboxes)

**Business Rules**
- Content schema must support: rich text (markdown or HTML), images, videos, embedded components
- Versioning: migrations tracked in git for rollback capability
- Phase sequence enforced (phases 1-6 in order)
- Lesson URL structure: `/student/unit{XX}/lesson{XX}/phase-{Y}` (e.g., `/student/unit01/lesson01/phase-1`)
- Default to lesson overview page if no phase specified
- 404 error if lesson or phase not found in database

**Acceptance Criteria**
- [ ] Given lesson content in database, when student navigates to lesson URL, then content renders correctly with text, images, and videos
- [ ] Given teacher updates lesson text via Supabase dashboard, when student refreshes page, then updated content displays immediately (no deployment required)
- [ ] Given markdown content in database, when page renders, then markdown converted to HTML with proper formatting
- [ ] Given phase has embedded video, when student views phase, then video player displays and is playable
- [ ] Given phase has interactive component reference, when page renders, then React component loads and is functional
- [ ] Given lesson has 6 phases, when student clicks "Next Phase" on phase-5, then phase-6 loads
- [ ] Given student is on phase-6, when they click "Next Phase", then redirected to next lesson's phase-1 (or unit overview if last lesson)
- [ ] Given invalid lesson URL, when student navigates to it, then 404 page displays with navigation back to curriculum home
- [ ] Given database contains 8 units with 40 lessons, when querying content, then all units and lessons retrievable via API

**Priority**: Must Have

**Dependencies**: Supabase database schema, Next.js App Router with dynamic routing

---

### FR3: Student Progress Tracking

**Description**

System shall automatically record student activity including phase completions, assessment scores, lesson access times, and time spent on activities, enabling teacher visibility and student self-monitoring.

**User Story**

- As a **student**, I want to see which lessons I've completed and which are remaining, so that I can plan my study time
- As a **teacher**, I want to see which students have completed which lessons, so that I can identify who needs help

**Inputs**
- Phase view: Student loads a lesson phase page
- Phase completion: Student clicks "Mark as Complete" or completes required activity
- Assessment submission: Student submits phase-5 assessment answers
- Session activity: Time spent on each phase (tracked client-side, synced to database)

**Outputs**
- Progress database records in `student_progress` table
- Student dashboard showing completion status for all lessons
- Teacher dashboard showing class-wide and individual student progress
- Progress indicators on lesson pages (checkmarks, progress bars)

**Business Rules**
- Progress tracked per student per phase (granular level)
- Phase marked complete when: student explicitly marks it OR completes required activity (assessment, interactive exercise)
- Cannot mark future phases complete without completing prior phases in sequence (phases 1→6)
- Lesson marked complete when all 6 phases marked complete
- Unit marked complete when all lessons in unit marked complete
- Progress timestamps: `created_at` (first access), `completed_at` (marked complete), `updated_at` (last access)
- Time-on-task calculated from page load to page unload (capped at 60 minutes per session to avoid inflated times from idle tabs)

**Acceptance Criteria**
- [ ] Given student loads a phase page, when page loads, then progress record created with `created_at` timestamp
- [ ] Given student clicks "Mark as Complete" button, when clicked, then progress record updated with `completed_at` timestamp and status='completed'
- [ ] Given student completes assessment, when assessment submitted, then phase-5 marked complete automatically
- [ ] Given student has completed phases 1-4, when they mark phase-5 complete, then progress reflects 5/6 phases complete for that lesson
- [ ] Given student has completed all 6 phases, when they complete phase-6, then lesson marked complete on student dashboard
- [ ] Given student views dashboard, when dashboard loads, then displays progress summary: X/40 lessons complete, Y/8 units complete
- [ ] Given student has not started a lesson, when viewing lesson list, then lesson shows "Not Started" badge
- [ ] Given student has completed some but not all phases, when viewing lesson list, then lesson shows "In Progress" badge with fraction (e.g., "3/6 phases")
- [ ] Given student has completed all phases, when viewing lesson list, then lesson shows "Complete" badge with checkmark
- [ ] Given student closes tab after 10 minutes on phase, when session ends, then progress record shows 10 minutes time-on-task (not inflated by idle time)
- [ ] Given student attempts to mark phase-5 complete without completing phases 1-4, when clicked, then error message "Complete previous phases first" displays

**Priority**: Must Have

**Dependencies**: FR1 (Authentication), FR2 (Lesson Content), Supabase database `student_progress` table

---

### FR4: Teacher Dashboard (Account Management & Analytics)

**Description**

System shall provide teacher with comprehensive dashboard for managing student accounts (creation, password resets) and monitoring class progress (roster, individual student analytics, completion rates, assessment scores, CSV export for gradebook integration).

**User Story**

- As a **teacher**, I want to create student accounts quickly at the start of semester, so that I can onboard my entire class efficiently
- As a **teacher**, I want to reset student passwords when they forget them, so that students can get back into the platform quickly
- As a **teacher**, I want to see which students are behind or struggling, so that I can provide targeted support
- As a **teacher**, I want to export grades as CSV, so that I can import into school grading system

**Inputs**
- **Account Management**:
  - Teacher creates individual student account: Student name, username, initial password
  - Teacher uploads CSV with student names for bulk account creation
  - Teacher selects student and clicks "Reset Password" to generate new temporary password
- **Analytics & Monitoring**:
  - Teacher logs into dashboard
  - Teacher selects student from roster to view individual details
  - Teacher clicks "Export CSV" button
  - Teacher filters by unit or lesson to see specific progress

**Outputs**
- **Account Management**:
  - Confirmation of student account creation with username and password to provide student
  - Downloadable credentials list after bulk CSV upload (Student Name, Username, Password)
  - New temporary password displayed after reset
- **Analytics & Monitoring**:
  - Class roster with completion percentages for each student
  - Individual student detail view with lesson-by-lesson progress
  - CSV file with columns: Student Name, Username, Unit, Lesson, Completion %, Assessment Score, Last Activity Date
  - Visual indicators for at-risk students (e.g., <50% completion after 4 weeks)
  - Sortable table by completion %, last activity, name

**Business Rules**
- Dashboard accessible only to teacher role (enforced by RLS policies)
- **Account Management**:
  - Teacher can create unlimited student accounts
  - Usernames must be unique (validation before creation)
  - Bulk CSV upload: parses Name column, auto-generates usernames if not provided
  - Password resets generate random 8-character alphanumeric password
- **Analytics**:
  - Progress data aggregated from `student_progress` table
  - "At-risk" defined as: <50% expected completion based on weeks elapsed (e.g., in week 4, expected ~10 lessons complete; <5 is at-risk)
  - CSV export includes only students in teacher's class (single class for MVP)
  - Last activity calculated as most recent `updated_at` timestamp across all progress records
  - Inactive students: >7 days since last activity flagged as "Inactive"

**Acceptance Criteria**
- [ ] Given teacher on "Add Student" page, when teacher enters name "Alex Chen", username "alex.c", password "Alex2025", then account created and confirmation displays credentials
- [ ] Given teacher uploads CSV with 25 rows (Name, Username columns), when processed, then 25 student accounts created and credentials list downloadable
- [ ] Given duplicate username in roster, when teacher creates account with same username, then error message "Username already exists"
- [ ] Given teacher views student list, when teacher clicks "Reset Password" for student "alex.c", then new random password generated and displayed to teacher
- [ ] Given teacher logs in, when dashboard loads, then displays class roster with completion percentages for each student
- [ ] Given class roster displays, when teacher sees student with <50% completion, then student highlighted in yellow as "At Risk"
- [ ] Given class roster displays, when teacher sees student with >7 days inactivity, then student flagged with "Inactive" badge
- [ ] Given teacher clicks student name, when clicked, then detailed view loads showing lesson-by-lesson progress (40 lessons with completion status and timestamps)
- [ ] Given teacher views individual student, when view loads, then displays: username, last login date, total time on platform, lessons completed, assessments submitted
- [ ] Given teacher clicks "Export CSV" button, when clicked, then CSV file downloads with all students' progress data
- [ ] Given CSV file opens, when inspected, then contains columns: Student Name, Username, Unit, Lesson, Completion %, Phase 5 Score, Last Activity
- [ ] Given teacher sorts roster by completion %, when sorted, then students with lowest completion appear first
- [ ] Given teacher filters by Unit 1, when filtered, then roster shows only Unit 1 completion percentages
- [ ] Given non-teacher user attempts to access `/teacher/dashboard`, when accessed, then 403 Forbidden error displays

**Priority**: Must Have

**Dependencies**: FR1 (Authentication), FR3 (Progress tracking), Supabase RLS policies

---

### FR5: Phase Completion Auto-Capture

**Description**

System shall automatically detect and record phase completions based on user interaction (page scroll, time spent, activity completion) without requiring manual "Mark Complete" button clicks, reducing friction and improving data accuracy.

**User Story**

- As a **student**, I want my progress to save automatically as I work, so that I don't have to remember to click "Mark Complete"
- As a **teacher**, I want accurate completion data based on actual engagement, so that metrics reflect true student effort

**Inputs**
- Student page view events (page load, scroll position, time on page)
- Interactive component completions (assessment submitted, spreadsheet exercise completed)
- Idle detection (no mouse/keyboard activity for 2+ minutes)

**Outputs**
- Automatic progress record updates in database
- Visual confirmation to student (subtle checkmark animation, toast notification)
- Progress synced even if student closes browser before manual save

**Business Rules**
- Phase considered "viewed" after: 30 seconds on page OR scroll to 80% of content (whichever comes first)
- Assessment phases (phase-5) marked complete only upon explicit submission (not automatic)
- Closing/Reflection phases (phase-6) marked complete after viewing full content
- Progress synced to database every 30 seconds OR on page unload (whichever comes first)
- If browser closes unexpectedly, last synced progress preserved (no data loss)
- Idle time (>2 minutes no interaction) not counted toward time-on-task

**Acceptance Criteria**
- [ ] Given student views phase for 30 seconds, when time elapses, then phase marked "viewed" and progress synced to database
- [ ] Given student scrolls to 80% of phase content, when scroll position reached, then phase marked "viewed" and progress synced
- [ ] Given student completes assessment, when submitted, then phase-5 marked complete automatically
- [ ] Given student reads phase-6 (closing reflection), when full content viewed, then phase-6 marked complete automatically
- [ ] Given student has progress synced, when student closes browser unexpectedly, then last synced progress preserved (no rollback)
- [ ] Given student idle for 3 minutes, when activity resumes, then idle time excluded from time-on-task calculation
- [ ] Given phase marked complete, when completion occurs, then subtle checkmark animation displays and toast notification shows "Progress saved"
- [ ] Given student returns after browser closed, when they reopen platform, then previously viewed phases still show completion checkmarks

**Priority**: Should Have (differentiator over manual tracking)

**Dependencies**: FR3 (Progress Tracking), client-side JavaScript for activity detection

---

### FR6: Assessment Management & Scoring

**Description**

System shall support phase-5 assessments including multiple-choice questions, short answer, and numerical problems with automatic scoring for objective questions and teacher review for subjective questions.

**User Story**

- As a **student**, I want to submit assessment answers and see my score immediately, so that I know if I've mastered the material
- As a **teacher**, I want to see assessment scores in my dashboard, so that I can identify knowledge gaps

**Inputs**
- Assessment questions stored in database with question type, correct answer, point value
- Student responses (multiple choice selections, text inputs, numerical answers)
- Teacher manual grading (for short answer questions)

**Outputs**
- Immediate score for auto-gradable questions (multiple choice, numerical)
- "Pending review" status for short answer questions requiring teacher grading
- Score displayed as percentage and points (e.g., "8/10 (80%)")
- Correct answers revealed after submission (with explanations if available)
- Assessment history showing all attempts with scores and timestamps

**Business Rules**
- Assessment stored in `assessments` table linked to lesson via `lesson_id`
- Questions stored in `assessment_questions` table with `question_type` enum: multiple_choice, short_answer, numerical
- Multiple choice: exactly one correct answer; auto-graded
- Numerical: correct answer with tolerance (e.g., 42 ± 0.5); auto-graded
- Short answer: requires teacher manual grading via dashboard
- Students can attempt assessment multiple times; highest score recorded
- Passing threshold: 70% (configurable per assessment in database)
- Assessment submissions timestamped; late submissions flagged if past due date (future enhancement)

**Acceptance Criteria**
- [ ] Given student navigates to phase-5, when assessment loads, then all questions display with appropriate input types (radio buttons for multiple choice, text input for short answer)
- [ ] Given student answers all questions, when "Submit Assessment" clicked, then responses saved to database and auto-gradable questions scored immediately
- [ ] Given assessment submitted, when auto-grading completes, then score displays as "8/10 (80%)" with breakdown by question
- [ ] Given short answer question, when submitted, then displays "Pending Review" status and does not affect overall score until teacher grades
- [ ] Given student views results, when results page loads, then correct answers shown with explanations (if available in database)
- [ ] Given student scored below 70%, when results display, then message shows "Below passing threshold. Review material and retake."
- [ ] Given student retakes assessment, when submitted, then new score replaces old score if higher (best attempt recorded)
- [ ] Given teacher views student progress, when assessment submitted, then score visible in dashboard with timestamp
- [ ] Given teacher clicks "Review" on short answer question, when grading interface loads, then displays student response, rubric (if defined), and point entry field

**Priority**: Must Have

**Dependencies**: FR2 (Database content), FR3 (Progress tracking for completion), FR4 (Teacher dashboard for manual grading)

---

### FR7: CSV Export for Gradebook Integration

**Description**

System shall generate downloadable CSV files containing student progress and assessment scores formatted for easy import into school grading systems (PowerSchool, Infinite Campus, etc.).

**User Story**

- As a **teacher**, I want to export grades as CSV, so that I can import into my school's grading system without manual re-entry

**Inputs**
- Teacher clicks "Export Grades" button on dashboard
- Optional filters: date range, specific unit, specific lesson
- Export format selection: summary (one row per student) or detailed (one row per student per lesson)

**Outputs**
- CSV file download with filename: `bus-math-grades-YYYY-MM-DD.csv`
- Summary format columns: Student Name, Email, Overall Completion %, Average Assessment Score, Last Activity
- Detailed format columns: Student Name, Email, Unit, Lesson, Completion %, Assessment Score, Time Spent (minutes), Completed Date
- UTF-8 encoding, comma-delimited, quoted strings

**Business Rules**
- Export includes only students in teacher's class (single class scope for MVP)
- Scores calculated as: (total points earned / total points possible) × 100
- Incomplete assessments show as "N/A" or blank cell
- Time spent aggregated across all phases of lesson, displayed in minutes
- Dates formatted as YYYY-MM-DD for universal compatibility

**Acceptance Criteria**
- [ ] Given teacher clicks "Export Grades" button, when clicked, then CSV file downloads immediately
- [ ] Given CSV file opens in Excel, when inspected, then all columns properly separated and readable
- [ ] Given summary export, when opened, then one row per student with overall completion % and average assessment score
- [ ] Given detailed export, when opened, then one row per student per lesson with individual scores
- [ ] Given student has not completed lesson, when exported, then completion shows "0%" and assessment score shows "N/A"
- [ ] Given teacher filters by Unit 1, when exported, then CSV contains only Unit 1 lessons
- [ ] Given teacher exports on May 15, when file downloads, then filename is `bus-math-grades-2025-05-15.csv`
- [ ] Given CSV file contains special characters in student names, when opened, then characters display correctly (UTF-8 encoding)

**Priority**: Should Have (high teacher value, not critical for MVP)

**Dependencies**: FR4 (Teacher dashboard), database query aggregation

---

### FR8: v1 Content Migration

**Description**

All 8 units (40 lessons, ~240 phase components) from static v1 JSX files shall be extracted, validated, and loaded into Supabase database with 100% content fidelity.

**User Story**

- As a **teacher**, I want all existing curriculum content migrated to the new platform, so that I don't lose any lessons or have to recreate content

**Inputs**
- v1 source files: `src/app/student/unit*/lesson*/lesson-data.ts` and phase component TSX files
- Migration scripts to parse JSX/TypeScript, extract text/metadata, insert into database
- Manual QA review of migrated content

**Outputs**
- Populated Supabase tables: `units`, `lessons`, `lesson_phases`, `phase_content`
- Migration report: X lessons migrated, Y phases migrated, Z issues found
- Side-by-side comparison tool for QA: v1 rendered page vs v2 rendered page

**Business Rules**
- Migration must preserve: lesson titles, learning objectives, key concepts, phase descriptions, all text content, image references, video embeds
- Interactive components (spreadsheet simulators, accounting exercises) migrated as component references, not inline code
- Markdown or HTML formatting preserved
- Unit sequence and lesson sequence preserved from v1
- Content validation: no broken images, no missing text, no formatting errors

**Acceptance Criteria**
- [ ] Given migration script runs, when complete, then all 8 units exist in database with correct sequence numbers
- [ ] Given 40 lessons in v1, when migration complete, then 40 lessons exist in database linked to correct units
- [ ] Given ~240 phase components in v1, when migration complete, then all phases exist in database with content
- [ ] Given phase contains text content, when migrated, then text content preserves formatting (bold, italics, lists, links)
- [ ] Given phase contains image, when migrated, then image reference correct and image loads on v2 page
- [ ] Given phase contains video embed, when migrated, then video URL correct and video playable on v2 page
- [ ] Given interactive component in v1, when migrated, then component reference stored in database and component renders on v2 page
- [ ] Given QA side-by-side comparison, when reviewing random 10 lessons, then 100% content match between v1 and v2
- [ ] Given migration issues log, when reviewed, then all issues documented with resolutions or "accepted deviations" noted
- [ ] Given migration complete, when testing navigation, then all lesson URLs functional with correct content displayed

**Priority**: Must Have (cannot launch without content)

**Dependencies**: FR2 (Database schema defined), migration scripts development

---

### FR9: User Roles & Permissions (RLS Policies)

**Description**

System shall enforce role-based access control via Supabase Row Level Security policies, ensuring students can only access their own progress data and teachers can access all students in their class.

**User Story**

- As a **student**, I want my progress data private, so that other students cannot see my scores
- As a **teacher**, I want to see all my students' data, so that I can monitor class progress

**Inputs**
- User role stored in `auth.users` metadata or `profiles` table (role: 'student' | 'teacher' | 'admin')
- RLS policies defined on database tables

**Outputs**
- Query results filtered based on user role and ownership
- 403 Forbidden errors if unauthorized access attempted
- Security audit passing with zero cross-account data leaks

**Business Rules**
- **Student permissions**:
  - Can read/write own progress records (WHERE student_id = auth.uid())
  - Can read all curriculum content (units, lessons, phases - public or authenticated access)
  - Cannot read other students' progress
  - Cannot modify curriculum content
  - Cannot access teacher dashboard routes
- **Teacher permissions**:
  - Can read all students' progress in their class (future: multi-class support)
  - Can read all curriculum content
  - Can write/update curriculum content (via Supabase dashboard or migrations)
  - Can access teacher dashboard routes
  - Cannot impersonate students or modify student progress (except manual grading)
- **Admin permissions** (future enhancement):
  - Full access to all data
  - Can manage teacher and student accounts

**Acceptance Criteria**
- [ ] Given student logged in, when they query progress table, then only their own progress records returned
- [ ] Given student attempts to access another student's progress via direct database query, when query executes, then zero rows returned (RLS blocks access)
- [ ] Given student attempts to access teacher dashboard URL, when accessed, then 403 Forbidden page displays
- [ ] Given teacher logged in, when they query progress table, then all students' progress records returned
- [ ] Given teacher attempts to modify student progress directly, when update attempted, then RLS policy blocks write (except manual grading fields)
- [ ] Given unauthenticated user, when they attempt to access any lesson page, then redirected to login page
- [ ] Given security audit with test accounts, when tested, then zero instances of cross-account data access
- [ ] Given RLS policies enabled, when performance tested, then query times <100ms (RLS overhead minimal)

**Priority**: Must Have (FERPA compliance requirement)

**Dependencies**: FR1 (Authentication with roles), Supabase RLS policies configuration

---

### FR10: Interactive Component Rendering

**Description**

System shall dynamically load and render interactive React components (spreadsheet simulators, accounting exercises, drag-and-drop activities) referenced in database content, maintaining v1's interactivity.

**User Story**

- As a **student**, I want to use interactive spreadsheet exercises and accounting simulations, so that I can practice skills hands-on

**Inputs**
- Component reference stored in database (e.g., `component_type: 'spreadsheet_simulator'`, `component_props: {template: 'unit01_balance_sheet'}`)
- React component library with all interactive components from v1

**Outputs**
- Rendered interactive component embedded in lesson phase page
- Component state managed client-side (spreadsheet cells, drag-and-drop positions)
- Optional: component interaction data sent to database for analytics (future enhancement)

**Business Rules**
- Component types supported: spreadsheet_simulator, accounting_categorization, t_account_practice, transaction_journal, reflection_journal, comprehension_check
- Component props defined in JSON format in database
- Lazy loading: components loaded on-demand (not all at page load) to optimize performance
- Component errors: if component fails to load, display fallback message "Interactive component unavailable. Contact teacher."

**Acceptance Criteria**
- [ ] Given phase references spreadsheet_simulator component, when page loads, then spreadsheet component renders with correct template (e.g., balance sheet)
- [ ] Given student interacts with spreadsheet (enters values, formulas), when interacting, then calculations work correctly (inherited from v1 behavior)
- [ ] Given phase references accounting_categorization component, when page loads, then drag-and-drop interface renders with transaction cards
- [ ] Given student completes interactive exercise, when completion criteria met (e.g., all transactions categorized correctly), then progress recorded
- [ ] Given component fails to load due to error, when error occurs, then fallback message displays without crashing page
- [ ] Given multiple components on page, when page loads, then only visible component loads initially (lazy loading for performance)
- [ ] Given student scrolls to second component, when component enters viewport, then component loads and renders
- [ ] Given component references v1 spreadsheet templates, when loaded, then templates match v1 functionality (no regressions)

**Priority**: Must Have (core curriculum feature)

**Dependencies**: FR2 (Database content with component references), v1 component library migration to v2 codebase

---

## Non-Functional Requirements

### NFR1: Performance

**Description**

System shall maintain fast page load times and responsive interactions comparable to v1 static site performance, ensuring smooth user experience on school Chromebooks and networks.

**Requirements**
- Page load time: <2 seconds at 95th percentile (from click to full page render)
- Database queries: <100ms response time for typical lesson content queries
- Form submissions: <500ms response time for progress updates, assessment submissions
- Time to Interactive (TTI): <3 seconds on 3G network
- First Contentful Paint (FCP): <1 second

**Measurement**
- Vercel Analytics for page load metrics
- Supabase dashboard for query performance
- Lighthouse performance audits: score >90

**Acceptance Criteria**
- [ ] Given lesson page request, when tested with Lighthouse, then performance score >90
- [ ] Given database query for lesson content, when profiled, then query executes in <50ms
- [ ] Given student submits progress update, when submitted, then confirmation response received in <300ms
- [ ] Given slow 3G network simulation, when lesson page loads, then Time to Interactive <4 seconds (acceptable on slow networks)
- [ ] Given 10 concurrent users accessing different lessons, when load tested, then no performance degradation (all requests <2 seconds)

**Priority**: Must Have (directly impacts user experience)

**Dependencies**: Next.js optimization (image optimization, code splitting), database indexing

---

### NFR2: Security & Privacy (FERPA Compliance)

**Description**

System shall protect student education records per FERPA requirements, implementing authentication, encryption, access controls, and audit logging.

**Requirements**
- Authentication required for all lesson pages (no public access to student data)
- TLS/HTTPS encryption for all data transmission
- Passwords hashed with bcrypt (industry standard)
- Row Level Security policies prevent cross-account data access
- Minimal data collection (only essential: name, email, progress, scores)
- Clear privacy policy disclosed to users
- Data retention: student data retained only while enrolled; purged 1 year after graduation (future enhancement)
- Audit logging: security events logged (failed logins, permission denials)

**Measurement**
- Security audit with penetration testing (manual test accounts attempting cross-access)
- Supabase RLS policy testing with automated scripts
- HTTPS verification: A+ rating on SSL Labs
- Password strength: zxcvbn score 3+ required

**Acceptance Criteria**
- [ ] Given unauthenticated user, when attempting to access lesson page, then redirected to login (no content exposed)
- [ ] Given student logged in, when attempting SQL injection in form fields, then input sanitized and attack blocked
- [ ] Given student A logged in, when attempting to access student B's progress via crafted API request, then RLS policy blocks access with 403
- [ ] Given password submitted, when stored, then hash stored (not plaintext) using bcrypt with salt
- [ ] Given data transmitted, when inspected in browser DevTools, then all requests use HTTPS (TLS 1.2+)
- [ ] Given SSL Labs test, when run, then SSL rating A or A+
- [ ] Given 5 failed login attempts, when security log reviewed, then all attempts logged with timestamp and IP address
- [ ] Given privacy policy page, when reviewed, then clearly states data collection practices, retention, and user rights

**Priority**: Must Have (FERPA legal requirement)

**Dependencies**: Supabase Auth, RLS policies, HTTPS certificate (Vercel provides automatically)

---

### NFR3: Scalability & Free-Tier Sustainability

**Description**

System shall operate efficiently within Supabase and Vercel free tier limits to maintain $0 operational cost while supporting 25 students per year with room for growth.

**Requirements**
- **Supabase limits**:
  - Database size: <500MB (target: <100MB for headroom)
  - Bandwidth: <2GB/month (target: <400MB/month = 20% of limit)
  - Active users: <50,000 MAU (target: 25-30 students)
  - Storage: <5GB (target: <1GB for images/videos)
- **Vercel limits**:
  - Bandwidth: <100GB/month (target: <20GB/month = 20% of limit)
  - Serverless function execution: <100 hours/month (target: <20 hours = 20%)
  - Build minutes: Unlimited on Hobby plan

**Optimization strategies**
- Image optimization: Next.js Image component with WebP format, lazy loading
- Database: Efficient indexes on foreign keys, query result caching
- Video hosting: Use YouTube embeds (not Supabase Storage) to save bandwidth
- Static content: Pre-render public pages at build time (SSG)
- Bandwidth: Compress assets, enable Vercel edge caching

**Measurement**
- Weekly monitoring of Supabase dashboard: database size, bandwidth usage
- Monthly review of Vercel analytics: function invocations, bandwidth
- Alerts configured at 80% of free tier limits

**Acceptance Criteria**
- [ ] Given 25 students using platform daily for semester, when monitoring dashboards, then database size stays <100MB
- [ ] Given semester-long usage, when reviewing bandwidth metrics, then Supabase bandwidth <400MB/month
- [ ] Given lesson page images, when inspected, then images served as WebP format <200KB each
- [ ] Given videos embedded, when inspected, then hosted on YouTube (not consuming Supabase Storage)
- [ ] Given weekly monitoring, when alerts configured, then email notification sent if usage exceeds 80% of any limit
- [ ] Given platform used for full semester, when semester ends, then total cost $0 (no unexpected charges)

**Priority**: Must Have (sustainability requirement)

**Dependencies**: Usage monitoring scripts, optimization implementations

---

### NFR4: Maintainability (Teacher-Maintainable)

**Description**

System shall be simple enough for a teacher with moderate technical skills (comfortable with databases, basic SQL) to maintain without ongoing developer support.

**Requirements**
- Clear documentation for common tasks (adding content, updating lessons, troubleshooting)
- Standard technology stack (Next.js, React, Supabase) with extensive community resources
- Simple database schema with clear table relationships and naming
- Migrations versioned in git with clear commit messages and rollback procedures
- Video tutorials for key workflows (updating content, running migrations, exporting data)
- Error messages include troubleshooting hints (not just stack traces)

**Measurement**
- Teacher interview after 6 months: "Do you feel confident maintaining this platform?"
- Documentation completeness: cover 100% of common scenarios
- Time to complete common tasks: <30 minutes for content update, <5 minutes to export CSV

**Acceptance Criteria**
- [ ] Given teacher needs to update lesson text, when following documentation, then completes update in <15 minutes without developer help
- [ ] Given teacher encounters database error, when reading error message, then message includes specific troubleshooting steps (not just "Database error")
- [ ] Given teacher wants to add new lesson, when following tutorial video, then successfully creates lesson and migrates database
- [ ] Given teacher needs to rollback migration, when following rollback procedure, then successfully reverts without data loss
- [ ] Given new teacher takes over project, when onboarding with documentation, then comfortable maintaining platform within 2 weeks
- [ ] Given common task documentation, when reviewed, then covers: content updates, exporting data, adding students, troubleshooting login issues, database backups

**Priority**: Must Have (sustainability requirement)

**Dependencies**: Comprehensive documentation creation, video tutorial creation

---

### NFR5: Accessibility (WCAG 2.1 AA)

**Description**

System shall be accessible to students with disabilities per WCAG 2.1 Level AA standards, supporting screen readers, keyboard navigation, and sufficient color contrast.

**Requirements**
- Keyboard navigation: all interactive elements accessible via Tab key
- Screen reader support: semantic HTML, ARIA labels, alt text for images
- Color contrast: 4.5:1 for normal text, 3:1 for large text/graphics
- Focus indicators: visible outlines on focusable elements
- Skip links: "Skip to main content" link for keyboard users
- Video captions: all videos have captions (or link to YouTube videos with captions)
- Responsive design: usable on mobile, tablet, desktop

**Measurement**
- Automated testing: axe-core or WAVE browser extension
- Manual testing: keyboard-only navigation through critical workflows
- Screen reader testing: NVDA (Windows) or VoiceOver (Mac)
- Color contrast checker: WebAIM contrast checker

**Acceptance Criteria**
- [ ] Given keyboard user, when navigating with Tab key, then can access all interactive elements (buttons, links, form inputs) in logical order
- [ ] Given screen reader user, when navigating lesson page, then screen reader announces all headings, links, and interactive elements correctly
- [ ] Given image in lesson content, when inspected, then alt text present and descriptive
- [ ] Given color contrast analysis, when tested with WebAIM checker, then all text meets 4.5:1 ratio (or 3:1 for large text)
- [ ] Given focus on interactive element, when inspected, then visible focus indicator (outline or highlight)
- [ ] Given video embedded, when viewed, then captions available (either built-in or YouTube captions)
- [ ] Given axe-core automated scan, when run on random 10 pages, then zero critical accessibility violations
- [ ] Given mobile device, when accessing platform, then content readable and interactive elements usable (no horizontal scrolling, touch targets >44x44px)

**Priority**: Must Have (legal requirement for public schools)

**Dependencies**: Semantic HTML implementation, ARIA attributes, axe-core testing integration

---

### NFR6: Reliability & Uptime

**Description**

System shall maintain high availability with minimal downtime, ensuring students can access lessons during class time and teachers can access dashboard anytime.

**Requirements**
- Uptime: 99%+ availability (allows ~7 hours downtime per month, typically for Supabase/Vercel maintenance)
- Error rate: <1% of requests result in 500 errors
- Graceful degradation: if Supabase temporarily unavailable, display cached content with "Some features unavailable" message
- Automated backups: Supabase database backed up weekly, retention 4 weeks
- Rollback capability: database migrations reversible within 24 hours of deployment

**Measurement**
- Vercel Analytics: uptime monitoring, error rate tracking
- Supabase dashboard: database uptime, connection pooling status
- Manual testing: weekly smoke tests of critical workflows (login, view lesson, submit assessment)

**Acceptance Criteria**
- [ ] Given month-long monitoring, when reviewing uptime logs, then uptime ≥99% (≤7 hours downtime)
- [ ] Given 1000 page requests, when reviewing error logs, then <10 requests result in 500 errors (<1% error rate)
- [ ] Given Supabase maintenance window, when database briefly unavailable, then static cached lesson content still accessible with banner "Live features temporarily unavailable"
- [ ] Given database backup schedule, when reviewing backup history, then weekly backups present with 4-week retention
- [ ] Given critical bug deployed, when rollback initiated, then database reverted to previous migration within 15 minutes
- [ ] Given weekly smoke test, when testing critical paths, then login, lesson view, and progress tracking all functional

**Priority**: Should Have (important for user trust but not blocking for MVP)

**Dependencies**: Supabase backup configuration, error monitoring setup (Vercel Analytics or Sentry)

---

## Constraints

**Free-Tier Operational Constraint**

Must operate within Supabase (500MB database, 2GB bandwidth/month) and Vercel (100GB bandwidth/month) free tiers. Exceeding limits requires paid upgrade ($25+/month), violating core value proposition of $0 cost.

**Single Teacher-Maintainer Constraint**

Only one teacher with moderate technical skills available for ongoing maintenance. Cannot rely on dedicated developer support or DevOps team. System must be simple, well-documented, and use standard tools.

**Time-to-Launch Constraint**

Must launch before next semester starts (4-6 month timeline). Prioritize MVP features; defer nice-to-haves to post-launch iterations.

**Content Fidelity Constraint**

Cannot compromise v1 curriculum quality during migration. Pedagogy, narrative integrity (Sarah Chen/TechStart), and interactivity must be preserved 100%.

**Browser Compatibility Constraint**

Must work on school-issued Chromebooks (Chrome browser) and any modern browser (last 2 versions of Chrome, Firefox, Safari, Edge). No support for IE11.

**No New Dependencies Constraint**

Cannot add new paid SaaS dependencies (email service, analytics beyond Vercel free tier, CDN, etc.) without explicit approval. Free tier services only (Supabase, Vercel, YouTube for video hosting).

## Assumptions

**Student Technical Proficiency**

Students are comfortable with web applications and can create accounts, navigate sites, and complete online forms without extensive training.

**School Network Reliability**

School internet connection is stable enough for web application usage (3G minimum). Platform does not need offline mode.

**Teacher SQL Comfort**

Teacher is comfortable writing basic SQL queries or using Supabase dashboard GUI for content updates. Complex migrations may require future developer assistance.

**Class Size Stability**

Class size remains ~25 students per year. If scaling to multiple classes (50+ students), may need architecture review for multi-class support and potential free-tier limit concerns.

**Supabase/Vercel Stability**

Supabase and Vercel maintain free tier offerings and service reliability. Platform is not portable to other hosting providers without significant refactoring.

**Video Hosting Externally**

All instructional videos remain hosted on YouTube (as in v1). Platform does not host large video files in Supabase Storage.

**Teacher-Managed Student Accounts**

Teacher manually creates all student accounts via dashboard (individual or bulk CSV upload) and provides usernames and passwords to students. No self-service student registration or invite links. Teacher maintains full control over classroom access.

**Assessment Auto-Grading Limited**

Only objective questions (multiple choice, numerical) auto-graded. Short answer and essay questions require teacher manual grading (acceptable for 25 students).

**Browser JavaScript Enabled**

All users have JavaScript enabled (React application requires JS). No graceful degradation for JS-disabled browsers.

## Out of Scope (For This Phase)

**Phase 1 MVP - Out of Scope**

- Multi-class support (teacher managing 2+ separate classes with independent rosters)
- Spaced repetition system (automatically re-surfacing review questions from previous units)
- Google OAuth / SSO integration (email/password sufficient for MVP)
- Parent portal (parents viewing student progress)
- Gamification (badges, leaderboards, streaks)
- Native mobile apps (web-responsive sufficient)
- Discussion forums or peer messaging
- Live collaboration (multiple students working together real-time)
- Advanced analytics (learning analytics, time-on-task heatmaps, predictive modeling)
- Custom assessment question authoring UI (teacher uses database/migrations)
- Integration with school SIS (PowerSchool, Infinite Campus) beyond manual CSV export
- Multi-language support (English only for MVP)
- Dark mode / theme customization
- Export to PDF (progress reports, certificates)
- Email notifications (assignment due, grades posted)

**Explicitly Deferred to Future Phases**

- Phase 2: Google OAuth, spaced repetition, parent portal
- Phase 3: Multi-class support, advanced analytics, SIS integration
- Phase 4 (if demand): Mobile apps, discussion forums, gamification

## Risks & Mitigation

**Risk 1: v1 Content Migration Complexity (Likelihood: High, Impact: High)**

~240 phase components in complex JSX with embedded logic may be difficult to extract and migrate accurately. 

**Mitigation**: Pilot migration with Unit 1 first (5 lessons, ~30 phases). Validate accuracy via side-by-side QA. Iterate migration scripts before processing remaining 7 units. Keep v1 running in parallel during migration for reference.

**Risk 2: Free Tier Limits Exceeded (Likelihood: Low, Impact: Medium)**

Database or bandwidth usage exceeds Supabase/Vercel free tiers, requiring paid upgrade.

**Mitigation**: Weekly monitoring of usage dashboards with alerts at 80% threshold. Optimize aggressively: image compression, YouTube video embedding, query caching. If exceeded, migrate to cheaper self-hosted Postgres ($10/month) or optimize further before paying Supabase Pro ($25/month).

**Risk 3: Student Data Privacy Breach (Likelihood: Low, Impact: Very High)**

RLS policy misconfiguration exposes student progress data across accounts, violating FERPA.

**Mitigation**: Comprehensive RLS policy testing with automated scripts and manual penetration testing using test accounts. Security audit before launch. Follow principle of least privilege. Document all RLS policies with rationale.

**Risk 4: Teacher Maintenance Knowledge Loss (Likelihood: Medium, Impact: High)**

If primary teacher-maintainer leaves, next teacher cannot maintain platform without developer expertise.

**Mitigation**: Comprehensive documentation covering 100% of common scenarios. Video tutorials for key workflows (updating content, exporting data, troubleshooting). Choose widely-adopted tech stack (Next.js, Supabase) with extensive community resources. Consider open-sourcing to attract potential contributors from OER community.

**Risk 5: Low Student Adoption (Likelihood: Low, Impact: Medium)**

Students resist new platform, preferring v1 or paper-based work.

**Mitigation**: Teacher-led rollout with in-class introduction emphasizing benefits (progress tracking, immediate assessment feedback). Gather feedback early (Week 2) and iterate quickly. Maintain v1 as fallback during pilot semester if adoption fails.

**Risk 6: Interactive Component Regressions (Likelihood: Medium, Impact: Medium)**

Spreadsheet simulators, accounting exercises, or other interactive components break during migration or lose functionality.

**Mitigation**: Dedicated testing phase for each interactive component. Validate against v1 behavior. Maintain v1 codebase for reference. Budget time for component debugging before launch.

## Appendix: References

- **Product Brief**: `docs/prds/math-for-business-operations-platform/product-brief.md`
- **Research Document**: `docs/prds/math-for-business-operations-platform/research.md`
- **v1 Codebase**: Symlinked at `bus-math-nextjs/` (reference implementation)
- **Curriculum Design**: `docs/curriculum/accounting_excel_curriculum.md`
- **CLAUDE.md**: Project workflow and agent guidelines
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **FERPA Overview**: https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-11-05 | AI Agent (prd-authoring skill) | Initial PRD draft with objectives, requirements, constraints |

