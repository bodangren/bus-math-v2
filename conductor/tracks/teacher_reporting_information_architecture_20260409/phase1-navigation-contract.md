## Minimum Navigation Contract

### Entry Point Gaps (Must Fix)

1. **Teacher Dashboard → Course Gradebook**
   - Issue: No explicit link/button to `/teacher/gradebook`
   - Fix: Add "View Course Gradebook" button in dashboard header or action area
   - Priority: HIGH

### Breadcrumb/Back Link Gaps (Must Fix)

2. **Unit Gradebook**
   - Issue: Breadcrumb "Teacher Dashboard" links to `/teacher` instead of `/teacher/gradebook`
   - Fix: Update breadcrumb link to `/teacher/gradebook`
   - Priority: MEDIUM

3. **Lesson Report**
   - Issue: No breadcrumb or back link; teacher is stranded
   - Fix: Add full breadcrumb chain: Teacher Dashboard → Course Gradebook → Unit Gradebook
   - Priority: HIGH

4. **Student Detail** (Optional Enhancement)
   - Issue: "Back to dashboard" goes to `/teacher` (acceptable but could be context-aware)
   - Fix: Consider context-aware back navigation (but `/teacher` is acceptable)
   - Priority: MEDIUM (deferred)

### Component-Level Changes Needed

| Component | Change Required |
|------------|----------------|
| `TeacherDashboardContent.tsx` | Add "View Course Gradebook" button/action |
| `app/teacher/gradebook/page.tsx` | N/A (breadcrumbs already correct) |
| `app/teacher/units/[unitNumber]/page.tsx` | Fix breadcrumb link from `/teacher` to `/teacher/gradebook` |
| `app/teacher/units/[unitNumber]/lessons/[lessonId]/page.tsx` | Add full breadcrumb chain |
| `components/teacher/TeacherLessonPlanPageContent.tsx` | Accept breadcrumb props and render them |

### Deferred Work (Out of Scope for This Track)

- Competency heatmap views (forthcoming destinations, to be linked in competency track)
- Context-aware student detail back navigation (acceptable as-is)
- Gradebook data model completion for independent practice and assessment (gradebook track)