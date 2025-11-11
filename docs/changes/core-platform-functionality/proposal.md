---
title: Core Platform Functionality
type: proposal
status: draft
epic: 3
created: 2025-11-11
---

# Proposal: Core Platform Functionality

## Problem Statement

The v2 platform currently has all v1 components migrated (89 components) but operates entirely as a static site, identical to v1. The core value proposition of v2 - database-driven content, authentication, progress tracking, and teacher analytics - is not yet implemented. Teachers cannot:

- Create student accounts or manage users
- Track student progress or identify struggling students
- Update curriculum content without code changes
- Access any analytics or reporting

Students cannot:
- Log in with persistent accounts
- Track their own progress across lessons
- Submit assessments that persist

The platform provides no advantage over the static v1 site.

## Proposed Solution

Implement the foundational platform features that transform the static site into a dynamic, data-driven educational platform:

1. **Authentication System**: Supabase-based auth with username/password login, public marketing pages, and protected student/teacher dashboards
2. **Database-Driven Content**: Lessons and phases render from Supabase database instead of static JSX
3. **Progress Tracking**: Capture and persist student phase completions and assessment submissions
4. **Public Pages Refactor**: Home, preface, and curriculum overview pages pull dynamic data from database
5. **Teacher Dashboard MVP**: Basic dashboard for viewing student progress and exporting data
6. **User Management**: Teacher can create student accounts with generated credentials

## Architecture Principles

### Public vs Protected Pages

- **Public (no auth)**: Home, Preface, Curriculum Overview, Login
- **Protected (auth required)**: Student Dashboard, Teacher Dashboard, Lesson pages with progress tracking
- **Redirect behavior**: Accessing protected routes when not authenticated redirects to `/login`

### Demo Credentials

Login page displays demo credentials for easy testing:
- **Student**: `demo_student` / [password visible]
- **Teacher**: `demo_teacher` / [password visible]

### Database as Source of Truth

- All lessons, phases, and activities stored in Supabase
- Content rendered server-side when possible (Next.js RSC)
- Client components for interactivity and progress capture
- RLS policies enforce student can only see own progress, teachers see all students

## Benefits

1. **Achieves PRD Objective #1**: Content updates via database in <30 minutes vs 4-8 hours
2. **Achieves PRD Objective #2**: Teacher can identify struggling students within 1-2 weeks
3. **Enables student engagement**: Progress visibility motivates completion
4. **Foundation for future features**: Analytics, real-time collaboration, adaptive learning
5. **Maintains free-tier operation**: Efficient queries and caching keep within Supabase limits

## Success Criteria

### Functional Completeness
- [ ] Teacher can log in with demo_teacher credentials
- [ ] Teacher can create new student account (username generated, password returned)
- [ ] Student can log in with created credentials
- [ ] Student can navigate to any lesson and view content pulled from database
- [ ] Student can complete phases and progress is persisted to database
- [ ] Teacher can view list of students with progress percentages
- [ ] Teacher can export progress data as CSV
- [ ] Public pages (home, preface, overview) render without authentication
- [ ] Protected pages redirect to login when not authenticated

### Performance
- [ ] Lesson page loads in <2 seconds (server-rendered with database query)
- [ ] Progress updates complete in <500ms (optimistic UI with background persistence)
- [ ] Database queries use indexes and complete in <100ms

### Security
- [ ] RLS policies prevent students from viewing other students' progress
- [ ] Teachers can only view students in their organization
- [ ] Demo credentials are seeded in database with proper role assignments
- [ ] Middleware protects all routes under `/student/*` and `/teacher/*`

### Data Quality
- [ ] At least 3 lessons from v1 seeded in database with full phase content
- [ ] Seeded lessons match v1 content exactly (validation script confirms)
- [ ] All 89 migrated components work with database-driven props

## Timeline

**Estimated Duration**: 2-3 weeks (assuming single developer)

**Sprint Goal**: MVP platform that demonstrates core value proposition - a teacher can create a student account, student can complete lessons with progress tracked, and teacher can view that progress.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Database queries slow down page loads | Use Next.js server components, implement caching with revalidation tags, add database indexes |
| Seeding full curriculum is time-consuming | Start with 3 lessons for MVP, create migration scripts for bulk import later |
| RLS policies complex to implement | Write tests using service-role and anon clients, validate policies before implementation |
| Student accounts require email | Use username-only auth pattern with Supabase Auth, store username in user metadata |

## Out of Scope (Future Epics)

- Bulk student import via CSV
- Student password reset flow
- Teacher can edit curriculum content via UI
- Real-time collaboration features
- Advanced analytics and reporting
- Email notifications
- Mobile app
- Organization management (multi-teacher support)
