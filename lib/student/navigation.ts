export function studentDashboardPath() {
  return '/student/dashboard';
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
