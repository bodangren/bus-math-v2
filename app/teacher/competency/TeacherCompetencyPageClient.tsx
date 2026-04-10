import { redirect } from 'next/navigation';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import type { CompetencyHeatmapResponse } from '@/lib/teacher/competency-heatmap';
import TeacherCompetencyPageClient from './TeacherCompetencyPageClient';

export default async function TeacherCompetencyPage() {
  const claims = await requireTeacherSessionClaims('/teacher/competency');

  const competencyHeatmap = await fetchInternalQuery(
    internal.teacher.getTeacherCompetencyHeatmapData,
    {
      userId: claims.sub as never,
    },
  );

  if (!competencyHeatmap) redirect('/teacher');

  const heatmapData = competencyHeatmap as CompetencyHeatmapResponse;

  return <TeacherCompetencyPageClient heatmapData={heatmapData} />;
}
