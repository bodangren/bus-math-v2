export interface StudentDashboardLesson {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description?: string | null;
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
}

export interface StudentDashboardUnit {
  unitNumber: number;
  unitTitle: string;
  lessons: StudentDashboardLesson[];
}

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';
type UnitStatus = LessonStatus;

export interface DashboardLessonAction extends StudentDashboardLesson {
  status: LessonStatus;
  actionLabel: 'Start Lesson' | 'Resume Lesson' | 'Review Lesson';
}

export interface StudentDashboardSummary {
  totalUnits: number;
  completedUnits: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  progressPercentage: number;
}

export interface StudentDashboardUnitView extends StudentDashboardUnit {
  completedLessons: number;
  progressPercentage: number;
  status: UnitStatus;
  nextLesson: DashboardLessonAction | null;
}

export interface StudentDashboardViewModel {
  summary: StudentDashboardSummary;
  nextLesson: DashboardLessonAction | null;
  units: StudentDashboardUnitView[];
}

function clampPercentage(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getLessonStatus(lesson: StudentDashboardLesson): LessonStatus {
  if (lesson.totalPhases > 0 && lesson.completedPhases >= lesson.totalPhases) {
    return 'completed';
  }

  if (lesson.completedPhases > 0 || lesson.progressPercentage > 0) {
    return 'in_progress';
  }

  return 'not_started';
}

function toLessonAction(lesson: StudentDashboardLesson): DashboardLessonAction | null {
  const status = getLessonStatus(lesson);

  return {
    ...lesson,
    status,
    actionLabel: status === 'in_progress' ? 'Resume Lesson' : status === 'completed' ? 'Review Lesson' : 'Start Lesson',
  };
}

function getUnitStatus(
  lessons: StudentDashboardLesson[],
  completedLessons: number,
  nextLesson: DashboardLessonAction | null,
): UnitStatus {
  if (lessons.length > 0 && completedLessons === lessons.length) {
    return 'completed';
  }

  if (nextLesson && nextLesson.status === 'in_progress') {
    return 'in_progress';
  }

  if (completedLessons > 0) {
    return 'in_progress';
  }

  return 'not_started';
}

export function buildStudentDashboardViewModel(
  units: StudentDashboardUnit[],
): StudentDashboardViewModel {
  let completedPhases = 0;
  let totalPhases = 0;
  let completedLessons = 0;
  let inProgressLessons = 0;

  const unitViews = units.map<StudentDashboardUnitView>((unit) => {
    const lessons = [...unit.lessons];

    for (const lesson of lessons) {
      completedPhases += lesson.completedPhases;
      totalPhases += lesson.totalPhases;

      const status = getLessonStatus(lesson);
      if (status === 'completed') completedLessons += 1;
      if (status === 'in_progress') inProgressLessons += 1;
    }

    const nextLesson =
      lessons.map(toLessonAction).find((lesson): lesson is DashboardLessonAction => lesson?.status === 'in_progress') ??
      lessons.map(toLessonAction).find((lesson): lesson is DashboardLessonAction => lesson?.status === 'not_started') ??
      null;

    const unitCompletedLessons = lessons.filter((lesson) => getLessonStatus(lesson) === 'completed').length;
    const unitCompletedPhases = lessons.reduce(
      (sum, lesson) => sum + lesson.completedPhases,
      0,
    );
    const unitTotalPhases = lessons.reduce(
      (sum, lesson) => sum + lesson.totalPhases,
      0,
    );
    const unitProgress =
      unitTotalPhases === 0
        ? 0
        : clampPercentage((unitCompletedPhases / unitTotalPhases) * 100);

    return {
      ...unit,
      lessons,
      completedLessons: unitCompletedLessons,
      progressPercentage: unitProgress,
      status: getUnitStatus(lessons, unitCompletedLessons, nextLesson),
      nextLesson,
    };
  });

  const nextLesson =
    unitViews
      .map((unit) => unit.nextLesson)
      .find((lesson): lesson is DashboardLessonAction => lesson?.status === 'in_progress') ??
    unitViews
      .map((unit) => unit.nextLesson)
      .find((lesson): lesson is DashboardLessonAction => lesson?.status === 'not_started') ??
    null;

  return {
    summary: {
      totalUnits: unitViews.length,
      completedUnits: unitViews.filter((unit) => unit.status === 'completed').length,
      totalLessons: unitViews.reduce((sum, unit) => sum + unit.lessons.length, 0),
      completedLessons,
      inProgressLessons,
      progressPercentage:
        totalPhases === 0 ? 0 : clampPercentage((completedPhases / totalPhases) * 100),
    },
    nextLesson,
    units: unitViews,
  };
}
