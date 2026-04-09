# Navigation Contract and Breadcrumb Design

## Student Wayfinding Contract

### Surface-to-Surface Paths

| From Surface | To Surface | Path Type | Helper | Status |
|------------|-----------|-----------|--------|--------|
| Shared User Menu (authenticated) | Student Dashboard | Full navigation | `getRoleAwareDashboardPath('student')` | ✅ Implemented |
| Shared User Menu (authenticated) | Teacher Dashboard | Full navigation | `getRoleAwareDashboardPath('teacher')` | ✅ Implemented |
| Shared User Menu (authenticated) | Admin Dashboard | Full navigation | `getRoleAwareDashboardPath('admin')` | ✅ Implemented |
| Lesson Page (error states) | Student Dashboard | Return path | `studentDashboardPath()` | ✅ Uses helper |
| Lesson Page (completed) | Student Dashboard | Return path | `studentDashboardPath()` | ✅ Uses helper |
| Student Dashboard Unit Cards | Lesson | Full navigation | `studentLessonPath(slug)` | ✅ Implemented |
| Student Dashboard Unit Cards | Unit Section | Anchor scroll | `studentUnitAnchor(unitNumber)` | ✅ Already implemented |

### Student Unit-Level Routes

**Status: No dedicated student unit surface exists**

- Current pattern: Units are sections on the student dashboard (`#unit-N` anchors)
- Unit cards on dashboard use `studentUnitAnchor(n)` which returns `/student/dashboard#unit-N`
- This is intentional design: no separate `/student/unit/{n}` pages

### Breadcrumb Contract

**Student Surface Breadcrumbs:**

| Surface | Breadcrumb Items | Implementation |
|---------|-----------------|---------------|
| Student Dashboard | None (top level) | N/A |
| Lesson Page | [Dashboard → Lesson] | ✅ Implemented in LessonRenderer |
| Lesson (Phase View) | [Dashboard → Lesson → Phase N] | ✅ Implemented in LessonRenderer |
| Lesson Page (NoPhaseError) | [Dashboard] | ✅ Implemented in lesson page |
| Lesson Page (AccessCheckError) | [Dashboard] | ✅ Implemented in lesson page |

**Teacher Surface Breadcrumbs:**

| Surface | Breadcrumb Items | Implementation |
|---------|-----------------|---------------|
| Teacher Dashboard | None (top level) | N/A |
| Teacher Student Detail | [Dashboard → Student Details] | ✅ Uses "Back to dashboard" link to `/teacher/dashboard` |
| Teacher Gradebook | [Teacher Dashboard → Gradebook] | ❌ Not audited yet |
| Teacher Unit/Lesson Views | [Teacher Dashboard → Unit → Lesson] | ❌ Not audited yet |

## Action Items - COMPLETED

1. **Replace hardcoded dashboard paths with helper functions:**
    - ✅ Update `app/student/lesson/[lessonSlug]/page.tsx` NoPhaseError and AccessCheckError components to use `studentDashboardPath()` helper
    - ✅ Update `app/teacher/students/[studentId]/page.tsx` "Back to dashboard" link to use `teacherDashboardPath()` helper

2. **Add breadcrumb components:**
    - ✅ Student lesson pages show [Dashboard → Lesson] breadcrumb trail
    - Student lesson phase views show [Dashboard → Lesson] breadcrumb trail (same as lesson)
    - Teacher student detail page shows [Dashboard → Student] breadcrumb trail

3. **Define canonical breadcrumb component:**
    - ✅ Added breadcrumbs to LessonRenderer using navigation helpers for links
    - ✅ Breadcrumbs respect role for dashboard destination

## Notes

- UserMenu role-aware dashboard link: ✅ (Phase 1 Task 1)
- No student unit surface by design: unit anchors scroll to dashboard sections
- Lesson page error states have "Return to Dashboard" links using helpers
- All navigation now uses canonical helpers consistently
