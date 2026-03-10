import {
  buildStudentDashboardViewModel,
  type StudentDashboardSummary,
  type StudentDashboardUnit,
} from '@/lib/student/dashboard';
import {
  deriveStudentIntervention,
  interventionStatusLabel,
} from '@/lib/teacher/intervention';

export interface TeacherStudentIdentity {
  id: string;
  username: string;
  displayName: string | null;
}

export interface TeacherStudentDetailInput {
  student: TeacherStudentIdentity;
  snapshot: {
    completedPhases: number;
    totalPhases: number;
    progressPercentage: number;
    lastActive: string | null;
  };
  units: StudentDashboardUnit[];
}

export interface TeacherStudentDetailViewModel {
  student: TeacherStudentIdentity;
  studentLabel: string;
  summary: StudentDashboardSummary;
  status: {
    value: 'at_risk' | 'inactive' | 'on_track' | 'completed';
    label: string;
    needsAttention: boolean;
    emphasisClassName: string;
  };
  guidance: string;
  nextLesson: ReturnType<typeof buildStudentDashboardViewModel>['nextLesson'];
  unitSummaries: Array<{
    unitNumber: number;
    unitTitle: string;
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
    status: 'not_started' | 'in_progress' | 'completed';
    nextLesson: ReturnType<typeof buildStudentDashboardViewModel>['nextLesson'];
  }>;
}

function statusClassName(status: TeacherStudentDetailViewModel['status']['value']) {
  switch (status) {
    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'inactive':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'at_risk':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'on_track':
    default:
      return 'border-sky-200 bg-sky-50 text-sky-700';
  }
}

function buildGuidance(
  studentLabel: string,
  summary: StudentDashboardSummary,
  status: TeacherStudentDetailViewModel['status']['value'],
) {
  if (summary.totalLessons === 0) {
    return `${studentLabel} does not have any published lessons assigned yet.`;
  }

  if (status === 'completed') {
    return `${studentLabel} has completed all published lessons and is ready for enrichment or review.`;
  }

  if (summary.completedLessons === 0 && summary.inProgressLessons === 0) {
    return `${studentLabel} has not recorded progress yet. Start with the first published lesson and confirm access.`;
  }

  if (status === 'at_risk') {
    return `${studentLabel} is below the current course pace and likely needs teacher follow-up on the next active lesson.`;
  }

  if (status === 'inactive') {
    return `${studentLabel} has progress on record but no recent activity. A re-engagement check-in is recommended.`;
  }

  return `${studentLabel} is progressing through the published curriculum and has a clear next lesson to continue.`;
}

export function buildTeacherStudentDetailViewModel(
  input: TeacherStudentDetailInput,
): TeacherStudentDetailViewModel {
  const dashboard = buildStudentDashboardViewModel(input.units);
  const studentLabel = input.student.displayName ?? input.student.username;
  const intervention = deriveStudentIntervention({
    id: input.student.id,
    username: input.student.username,
    displayName: input.student.displayName,
    completedPhases: input.snapshot.completedPhases,
    totalPhases: input.snapshot.totalPhases,
    progressPercentage: input.snapshot.progressPercentage,
    lastActive: input.snapshot.lastActive,
  });

  return {
    student: input.student,
    studentLabel,
    summary: dashboard.summary,
    status: {
      value: intervention.status,
      label: interventionStatusLabel(intervention.status),
      needsAttention: intervention.needsAttention,
      emphasisClassName: statusClassName(intervention.status),
    },
    guidance: buildGuidance(studentLabel, dashboard.summary, intervention.status),
    nextLesson: dashboard.nextLesson,
    unitSummaries: dashboard.units.map((unit) => ({
      unitNumber: unit.unitNumber,
      unitTitle: unit.unitTitle,
      completedLessons: unit.completedLessons,
      totalLessons: unit.lessons.length,
      progressPercentage: unit.progressPercentage,
      status: unit.status,
      nextLesson: unit.nextLesson,
    })),
  };
}
