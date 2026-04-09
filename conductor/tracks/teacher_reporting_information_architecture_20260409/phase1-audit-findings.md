# Teacher Reporting Information Architecture Audit

## Current State (2026-04-09)

### Reporting Pages

1. **Teacher Dashboard** (`/teacher`)
   - Path: `app/teacher/page.tsx`, `components/teacher/TeacherDashboardContent.tsx`
   - Entry points: Landing page for authenticated teachers
   - Navigation: NO explicit link to `/teacher/gradebook`
   - Content: Metrics cards, student intervention queue, CourseOverviewGrid

2. **Course Gradebook** (`/teacher/gradebook`)
   - Path: `app/teacher/gradebook/page.tsx`
   - Entry points: Not discoverable from dashboard; must click cells in CourseOverviewGrid
   - Navigation: Breadcrumb "Teacher Dashboard" (link: `/teacher`)
   - Content: CourseOverviewGrid with unit headers linking to `/teacher/units/[unitNumber]`

3. **Unit Gradebook** (`/teacher/units/[unitNumber]`)
   - Path: `app/teacher/units/[unitNumber]/page.tsx`
   - Entry points: From course gradebook unit headers or cells
   - Navigation: Breadcrumb "Teacher Dashboard" (link: `/teacher`) — SHOULD link to `/teacher/gradebook`
   - Content: Lesson-level gradebook for the unit

4. **Lesson Report** (`/teacher/units/[unitNumber]/lessons/[lessonId]`)
   - Path: `app/teacher/units/[unitNumber]/lessons/[lessonId]/page.tsx`
   - Entry points: From unit gradebook lesson cells
   - Navigation: NO breadcrumb or back link — teacher is stranded
   - Content: Teacher lesson plan page

5. **Student Detail** (`/teacher/students/[studentId]`)
   - Path: `app/teacher/students/[studentId]/page.tsx`
   - Entry points: From student actions in gradebook rows
   - Navigation: "Back to dashboard" button (link: `/teacher`)
   - Content: Student progress, unit summaries, next lesson

## Issues Identified

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | Teacher dashboard has no explicit link to `/teacher/gradebook` | High | Teachers cannot discover course gradebook without clicking table cells |
| 2 | Unit gradebook breadcrumb links to `/teacher` instead of `/teacher/gradebook` | Medium | Inconsistent drill-down path; breaks breadcrumb contract |
| 3 | Lesson report has no breadcrumb or back link | High | Teacher is stranded after navigating to a lesson report |
| 4 | Student detail "Back to dashboard" goes to `/teacher` | Low | Acceptable, but could offer context-aware back navigation |

## Canonical Hierarchy (Proposed)

```
/teacher (Dashboard)
├── /teacher/gradebook (Course Gradebook)
│   ├── /teacher/units/[unitNumber] (Unit Gradebook)
│   │   ├── /teacher/units/[unitNumber]/lessons/[lessonId] (Lesson Report)
│   │   └── /teacher/students/[studentId] (Student Detail)
│   └── /teacher/students/[studentId] (Student Detail — alternate entry)
└── /teacher/students/[studentId] (Student Detail — dashboard entry)
```

## Breadcrumb Contract

| Page | Breadcrumb Chain |
|------|------------------|
| `/teacher` | None (top level) |
| `/teacher/gradebook` | Teacher Dashboard |
| `/teacher/units/[unitNumber]` | Teacher Dashboard → Course Gradebook |
| `/teacher/units/[unitNumber]/lessons/[lessonId]` | Teacher Dashboard → Course Gradebook → Unit Gradebook |
| `/teacher/students/[studentId]` | Teacher Dashboard (or context-aware parent) |