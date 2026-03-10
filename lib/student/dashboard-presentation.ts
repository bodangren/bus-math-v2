export type DashboardProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface DashboardLessonActionLink {
  unitNumber: number;
  title: string;
  slug: string;
  description?: string | null;
  actionLabel: 'Start Lesson' | 'Resume Lesson';
}

export function dashboardStatusBadgeClassName(status: DashboardProgressStatus) {
  if (status === 'completed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'in_progress') {
    return 'border-sky-200 bg-sky-50 text-sky-700';
  }

  return 'border-amber-200 bg-amber-50 text-amber-700';
}

export function dashboardStatusLabel(status: DashboardProgressStatus) {
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'In Progress';
  return 'Not Started';
}
