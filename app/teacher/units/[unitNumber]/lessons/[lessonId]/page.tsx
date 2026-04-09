import { notFound, redirect } from 'next/navigation';

import { TeacherLessonPlanPageContent } from '@/components/teacher/TeacherLessonPlanPageContent';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import {
  buildTeacherLessonMonitoringViewModel,
  type TeacherLessonMonitoringQueryData,
} from '@/lib/teacher/lesson-monitoring';

interface TeacherLessonPageProps {
  params: Promise<{
    unitNumber: string;
    lessonId: string;
  }>;
}

type TeacherLessonQueryResult =
  | { status: 'unauthorized' }
  | { status: 'not_found' }
  | ({ status: 'success' } & TeacherLessonMonitoringQueryData);

export default async function TeacherLessonPage({
  params,
}: TeacherLessonPageProps) {
  const { unitNumber: unitNumberParam, lessonId } = await params;
  const unitNumber = Number.parseInt(unitNumberParam, 10);

  if (Number.isNaN(unitNumber) || unitNumber < 1) {
    notFound();
  }

  const claims = await requireTeacherSessionClaims(
    `/teacher/units/${unitNumber}/lessons/${lessonId}`,
  );

  const result = (await fetchInternalQuery(
    internal.teacher.getTeacherLessonMonitoringData,
    {
      userId: claims.sub as never,
      unitNumber,
      lessonId: lessonId as never,
    },
  )) as TeacherLessonQueryResult | null;

  if (!result || result.status === 'unauthorized') {
    redirect('/teacher');
  }

  if (result.status === 'not_found') {
    notFound();
  }

  const viewModel = buildTeacherLessonMonitoringViewModel(result);
  return <TeacherLessonPlanPageContent {...viewModel} unitNumber={unitNumber} />;
}
