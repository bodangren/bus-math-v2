export function studentDashboardPath() {
  return '/student/dashboard';
}

export function teacherDashboardPath() {
  return '/teacher/dashboard';
}

export function getRoleAwareDashboardPath(role: 'student' | 'teacher' | 'admin' | undefined) {
  if (role === 'student') {
    return studentDashboardPath();
  }
  // Teachers and admins both go to teacher dashboard
  return teacherDashboardPath();
}

export function studentUnitAnchor(unitNumber: number) {
  return `${studentDashboardPath()}#unit-${unitNumber}`;
}

export function studentLessonPath(slug: string) {
  return `/student/lesson/${slug}`;
}

export function studentLessonPhasePath(slug: string, phaseNumber: number) {
  return `${studentLessonPath(slug)}?phase=${phaseNumber}`;
}
