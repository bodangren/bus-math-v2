---
title: Math for Business Operations Platform
type: product-brief
status: draft
created: 2025-11-05
updated: 2025-11-05
---

# Product Brief: Math for Business Operations Platform

## Problem Statement

**What problem exists?**

The current Math for Business Operations v1 curriculum is a static Next.js application with hardcoded content, creating significant maintenance and scalability challenges. All lesson content, phase descriptions, interactive components, and assessments are embedded directly in JSX files, requiring code changes for any curriculum updates. There is no progress tracking system for students, no analytics dashboard for teachers, and no ability to identify struggling students or measure lesson effectiveness. The single teacher-maintainer must modify source code to update curriculum content, which is time-consuming, error-prone, and requires technical expertise beyond normal teaching duties.

**Who experiences this problem?**

- **Teachers** (1 primary maintainer): Spend excessive time making curriculum updates by editing code rather than focusing on pedagogy. Cannot see which students are struggling or track class-wide progress patterns.
- **Students** (~25 per year): Have no way to track their own progress through the 8-unit curriculum, see which lessons they've completed, or identify areas where they need more practice.
- **School administrators**: Cannot assess program effectiveness, student engagement, or learning outcomes due to lack of data.
- **Future adopters**: Potential other schools/teachers cannot easily customize the curriculum for their context without technical expertise.

**How often does it occur?**

- Content updates required: 2-4 times per semester (curriculum improvements, bug fixes, assessment updates)
- Teacher workload impact: 4-8 hours per content update (vs desired 30 minutes)
- Student progress visibility: Zero (affects 100% of students, 100% of the time)
- Assessment of learning: Manual and periodic (end of semester only)

**What's the business impact?**

- **Teacher time cost**: 16-32 hours per semester on content updates = $800-$1,600 in opportunity cost (could be spent on teaching, lesson planning, or student support)
- **Student outcomes**: Unknown completion rates and comprehension levels reduce ability to improve curriculum
- **Scalability**: Cannot share curriculum with other schools without extensive technical setup
- **Sustainability**: High maintenance burden risks abandonment of the project
- **Free-tier constraint**: Must operate within Supabase and Vercel free tiers (25 users/year, low concurrency) to remain sustainable

## Target Users

### Primary Users

**Persona 1: Ms. Rodriguez (Math Teacher & Maintainer)**
- **Who they are**: High school business math teacher with 15 years teaching experience, moderate technical skills (comfortable with spreadsheets, learning databases), maintains the curriculum for 25 students per year
- **Key goals**:
  - Update curriculum content easily without touching code
  - Track student progress and identify struggling students early
  - Spend less time on technical maintenance, more on teaching
  - See class-wide analytics to improve lesson effectiveness
- **Pain points**:
  - Must edit JSX files to change lesson content
  - No visibility into which students completed which lessons
  - Cannot identify common struggle points to address in class
  - Weeks away from code makes returning to maintenance difficult
- **Frequency of use**: Daily (during semester) for student progress monitoring, 2-4 times per semester for content updates

**Persona 2: Alex (Grade 12 Student)**
- **Who they are**: 17-year-old student taking Math for Business Operations, comfortable with web applications, planning to pursue business or entrepreneurship after graduation
- **Key goals**:
  - Track progress through 8-unit curriculum
  - Complete all 6 phases of each lesson successfully
  - Prepare for capstone project
  - See which lessons completed vs remaining
  - Access practice tests and review materials
- **Pain points**:
  - No way to see overall progress or completion status
  - Doesn't know if teacher has reviewed work
  - Cannot identify weak areas for targeted practice
  - Loses track of what to work on next
- **Frequency of use**: 3-4 times per week during semester (40-50 sessions total)

### Secondary Users

- **School administrators**: Need data on program effectiveness, student engagement, and learning outcomes to justify continued funding and support for the course
- **Future teacher-adopters**: Other schools interested in implementing this curriculum need easy customization without requiring development expertise
- **Curriculum coordinators**: District-level staff evaluating innovative math curriculum options for business-track students

## Proposed Solution

**Solution Overview**

A Supabase-backed Next.js web application that transforms the static v1 curriculum into a data-driven platform with authentication, progress tracking, and teacher analytics. The system maintains v1's pedagogical excellence (6-phase lesson structure, Sarah Chen narrative, project-based learning) while adding database-driven content management, student progress tracking, and a teacher dashboard for monitoring class performance—all within free-tier hosting limits.

**How it addresses the problem**

By moving lesson content from hardcoded JSX to a Supabase database, teachers can update curriculum through migrations/seeds or the Supabase dashboard without touching application code. Authentication enables individual student accounts with personalized progress tracking. Teacher dashboards provide visibility into student completion rates, assessment scores, and common struggle points. The system remains sustainable by operating within Supabase and Vercel free tiers (sufficient for 25 students/year), eliminating hosting costs while maintaining full functionality.

**Key capabilities**

- **Database-driven content management**: Lessons, phases, sections, and assessments stored in Supabase, editable through migrations or dashboard interface
- **Authentication & authorization**: Email/password auth for students and teachers with role-based access controls and middleware route protection
- **Student progress tracking**: Automatic recording of phase completions, lesson progress, assessment scores, and time spent on activities
- **Teacher analytics dashboard**: Class-wide and individual student progress views, completion rates, assessment performance, and downloadable CSV reports for grading
- **Curriculum preservation**: Maintains v1's 6-phase structure, Sarah Chen/TechStart narrative, project-based learning approach, and all 8 units of content

**What makes this solution different?**

Unlike commercial LMS platforms (Canvas, Schoology) that require paid subscriptions and don't support custom interactive business math components, this solution is purpose-built for the specific curriculum, remains completely free through strategic use of free tiers, and maintains complete control over pedagogy and content. Unlike v1, it provides the data visibility and progress tracking essential for effective teaching while remaining maintainable by a single teacher without ongoing development support.

## Value Proposition

### User Benefits

- **For Students (Time saved & clarity)**:
  - **Progress visibility**: See completion status across 8 units, 40+ lessons, and 240+ phases (vs. zero visibility in v1)
  - **Personalized learning**: Focus study time on incomplete or low-scoring lessons based on tracked performance
  - **Reduced cognitive load**: Platform remembers where they left off; no manual tracking required

- **For Teachers (Time saved & insight)**:
  - **Content updates**: 30 minutes to update content via database (vs. 4-8 hours editing code)
  - **Early intervention**: Identify struggling students within 1-2 weeks (vs. discovering at midterm)
  - **Data-driven improvement**: See which lessons have low completion or poor assessment scores to refine curriculum

- **For School (Cost & sustainability)**:
  - **Zero hosting costs**: Operates entirely on free tiers (Supabase, Vercel)
  - **Low maintenance**: Teacher-maintainable without ongoing development support
  - **Scalability**: Can share with other schools while keeping costs at zero

### Business Benefits

- **Teacher efficiency**: Save 16-32 hours per semester on content updates = $800-$1,600 opportunity cost recovery
- **Student outcomes**: Early identification of struggling students improves intervention effectiveness and pass rates
- **Curriculum improvement**: Data on lesson effectiveness enables continuous curriculum refinement based on actual student performance
- **Sustainability**: Free-tier operation ($0 vs $500+/year for commercial LMS) makes program sustainable long-term
- **Replication potential**: Can be adopted by other schools at zero incremental cost, expanding impact

### Competitive Advantages

- **Purpose-built**: Designed specifically for business math with integrated spreadsheet simulators, accounting exercises, and project-based learning (not generic LMS)
- **Cost advantage**: $0 hosting vs $5-15 per student/year for commercial platforms
- **Content control**: Complete ownership of curriculum content, pedagogy, and assessment strategies
- **Technical simplicity**: Teacher-maintainable with clear documentation and straightforward database structure
- **Open source potential**: Can be shared with educational community under open license

## Success Metrics

### Launch Success Criteria
(Measured in first 30 days with pilot class of 25 students)

- **Content migration**: 100% of 8 units, 40+ lessons migrated from v1 to database (40 lessons × 6 phases = 240+ content items)
- **Authentication reliability**: 100% of students successfully create accounts and log in (25/25 students)
- **Progress tracking accuracy**: Phase completions recorded with 100% accuracy (validated against manual teacher tracking)
- **Teacher dashboard usability**: Teacher successfully identifies 3 struggling students within first week using dashboard data
- **Performance within free tier**: Stay under Supabase limits (500MB database, 2GB bandwidth, 50,000 monthly active users)

### Long-term Success Metrics
(Measured over full semester, ~4 months)

- **Student completion rate**: 80%+ of students complete 80%+ of assigned lessons (baseline: unknown, target: 32/40 lessons per student)
- **Teacher dashboard usage**: Teacher logs into dashboard 2+ times per week to check student progress (vs. zero data visibility in v1)
- **Content update frequency**: Teacher makes 3-4 curriculum updates per semester through database (vs. 0-1 due to high friction in v1)
- **Student engagement**: 75%+ of students use platform 3+ times per week during semester
- **Assessment completion**: 90%+ of students complete phase-5 assessments for all units (up from estimated 70% in v1 with no tracking)
- **Time savings**: Teacher reports spending <2 hours per semester on content updates (down from 16-32 hours)

### Leading Indicators

- **Week 1**: 100% student account creation and first lesson access
- **Week 2**: Teacher identifies first struggling student using progress dashboard
- **Week 4**: First curriculum content update made via database (not code)
- **Week 6**: 70%+ students have completed 50%+ of assigned lessons
- **Month 2**: Teacher exports first CSV report for grading purposes
- **Month 3**: Evidence-based curriculum adjustment made based on lesson completion analytics
