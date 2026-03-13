import type { ContentBlock, LessonMetadata, PhaseMetadata } from '@/types/curriculum';
import {
  fallbackPublishedPhaseTitle,
  publishedPhaseMetadata,
  toPublishedContentBlock,
} from '@/lib/curriculum/published-lesson-presentation';

export interface TeacherLessonMonitoringSection {
  id: string;
  sectionType: string;
  content: unknown;
}

export interface TeacherLessonMonitoringPhase {
  id: string;
  phaseNumber: number;
  title: string | null;
  estimatedMinutes: number | null;
  sections: TeacherLessonMonitoringSection[];
}

export interface TeacherLessonMonitoringLesson {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description: string | null;
  learningObjectives: string[] | null;
  orderIndex: number;
  metadata: LessonMetadata | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface TeacherLessonMonitoringUnitLesson {
  id: string;
  title: string;
  orderIndex: number;
}

export interface TeacherLessonMonitoringQueryData {
  unitNumber: number;
  lesson: TeacherLessonMonitoringLesson;
  phases: TeacherLessonMonitoringPhase[];
  unitLessons: TeacherLessonMonitoringUnitLesson[];
}

export interface TeacherLessonMonitoringViewModel {
  lesson: TeacherPublishedLesson;
  phases: TeacherPublishedPhase[];
  lessonNumber: number;
  availableLessons: Array<{ number: number; title: string }>;
  lessonHrefByNumber: Record<number, string>;
  backHref: string;
  previousLessonHref: string | null;
  nextLessonHref: string | null;
  empty: boolean;
}

export interface TeacherPublishedLesson {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description: string | null;
  learningObjectives: string[] | null;
  orderIndex: number;
  metadata: LessonMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherPublishedPhase {
  id: string;
  lessonId: string;
  phaseNumber: number;
  title: string;
  contentBlocks: ContentBlock[];
  estimatedMinutes: number | null;
  metadata: PhaseMetadata;
  createdAt: Date;
  updatedAt: Date;
}

function buildLessonHref(unitNumber: number, lessonId: string) {
  return `/teacher/units/${unitNumber}/lessons/${lessonId}`;
}

export function buildTeacherLessonMonitoringViewModel(
  input: TeacherLessonMonitoringQueryData,
): TeacherLessonMonitoringViewModel {
  const orderedUnitLessons = [...input.unitLessons].sort(
    (left, right) => left.orderIndex - right.orderIndex,
  );
  const selectedLessonIndex = orderedUnitLessons.findIndex(
    (lesson) => lesson.id === input.lesson.id,
  );
  const previousLesson =
    selectedLessonIndex > 0 ? orderedUnitLessons[selectedLessonIndex - 1] : null;
  const nextLesson =
    selectedLessonIndex >= 0 && selectedLessonIndex < orderedUnitLessons.length - 1
      ? orderedUnitLessons[selectedLessonIndex + 1]
      : null;

  const lessonHrefByNumber = Object.fromEntries(
    orderedUnitLessons.map((lesson) => [
      lesson.orderIndex,
      buildLessonHref(input.unitNumber, lesson.id),
    ]),
  );

  return {
    lesson: {
      id: input.lesson.id,
      unitNumber: input.lesson.unitNumber,
      title: input.lesson.title,
      slug: input.lesson.slug,
      description: input.lesson.description,
      learningObjectives: input.lesson.learningObjectives,
      orderIndex: input.lesson.orderIndex,
      metadata: input.lesson.metadata,
      createdAt: new Date(input.lesson.createdAt ?? Date.now()),
      updatedAt: new Date(input.lesson.updatedAt ?? input.lesson.createdAt ?? Date.now()),
    },
    phases: [...input.phases]
      .sort((left, right) => left.phaseNumber - right.phaseNumber)
      .map((phase) => ({
        id: phase.id,
        lessonId: input.lesson.id,
        phaseNumber: phase.phaseNumber,
        title: phase.title?.trim() || fallbackPublishedPhaseTitle(phase.phaseNumber),
        contentBlocks: phase.sections.map((section, index) =>
          toPublishedContentBlock(section, index + 1),
        ),
        estimatedMinutes: phase.estimatedMinutes,
        metadata: publishedPhaseMetadata(phase.phaseNumber),
        createdAt: new Date(input.lesson.createdAt ?? Date.now()),
        updatedAt: new Date(input.lesson.updatedAt ?? input.lesson.createdAt ?? Date.now()),
      })),
    lessonNumber: input.lesson.orderIndex,
    availableLessons: orderedUnitLessons.map((lesson) => ({
      number: lesson.orderIndex,
      title: lesson.title,
    })),
    lessonHrefByNumber,
    backHref: `/teacher/units/${input.unitNumber}`,
    previousLessonHref: previousLesson
      ? buildLessonHref(input.unitNumber, previousLesson.id)
      : null,
    nextLessonHref: nextLesson ? buildLessonHref(input.unitNumber, nextLesson.id) : null,
    empty: input.phases.length === 0,
  };
}

export const __private__ = {
  fallbackPublishedPhaseTitle,
  publishedPhaseMetadata,
  toPublishedContentBlock,
};
