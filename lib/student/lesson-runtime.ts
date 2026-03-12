import type { DashboardLessonActionLink } from '@/lib/student/dashboard-presentation';
import {
  buildStudentDashboardViewModel,
  type StudentDashboardUnit,
} from '@/lib/student/dashboard';

export function resolveLessonLandingPhase({
  totalPhases,
  completedPhaseNumbers,
}: {
  totalPhases: number;
  completedPhaseNumbers: ReadonlySet<number>;
}) {
  if (totalPhases <= 1) {
    return Math.max(totalPhases, 1);
  }

  for (let phaseNumber = 1; phaseNumber <= totalPhases; phaseNumber += 1) {
    if (!completedPhaseNumbers.has(phaseNumber)) {
      return phaseNumber;
    }
  }

  return totalPhases;
}

export function buildLessonContinueState(
  units: StudentDashboardUnit[],
  currentLessonSlug: string,
): { recommendedLesson: DashboardLessonActionLink | null } {
  const dashboard = buildStudentDashboardViewModel(units);
  const nextLesson = dashboard.nextLesson;

  if (!nextLesson || nextLesson.slug === currentLessonSlug) {
    return { recommendedLesson: null };
  }

  return {
    recommendedLesson: {
      unitNumber: nextLesson.unitNumber,
      title: nextLesson.title,
      slug: nextLesson.slug,
      description: nextLesson.description,
      actionLabel: nextLesson.actionLabel,
    },
  };
}
