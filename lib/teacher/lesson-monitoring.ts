import type { Lesson, Phase } from '@/lib/db/schema/validators';
import type { ContentBlock } from '@/types/curriculum';

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
  learningObjectives: Lesson['learningObjectives'];
  orderIndex: number;
  metadata: Lesson['metadata'];
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
  lesson: Lesson;
  phases: Phase[];
  lessonNumber: number;
  availableLessons: Array<{ number: number; title: string }>;
  lessonHrefByNumber: Record<number, string>;
  backHref: string;
  previousLessonHref: string | null;
  nextLessonHref: string | null;
  empty: boolean;
}

const PHASE_TYPE_BY_NUMBER = {
  1: 'intro',
  2: 'example',
  3: 'practice',
  4: 'challenge',
  5: 'assessment',
  6: 'reflection',
} as const;

function fallbackPhaseTitle(phaseNumber: number) {
  const labels: Record<number, string> = {
    1: 'Hook',
    2: 'Introduction',
    3: 'Guided Practice',
    4: 'Independent Practice',
    5: 'Assessment',
    6: 'Closing',
  };

  return labels[phaseNumber] ?? `Phase ${phaseNumber}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value as Record<string, unknown>;
}

function contentToText(content: unknown) {
  if (typeof content === 'string') {
    return content;
  }

  const obj = asRecord(content);
  if (!obj) {
    return '';
  }

  const markdown = obj.markdown;
  const text = obj.text;
  const value = typeof markdown === 'string' ? markdown : text;
  return typeof value === 'string' ? value : '';
}

function toContentBlock(
  section: TeacherLessonMonitoringSection,
  fallbackOrder: number,
): ContentBlock {
  const obj = asRecord(section.content);
  const blockId = section.id || `section-${fallbackOrder}`;

  if (section.sectionType === 'callout') {
    const variantRaw = obj?.variant;
    const variant =
      variantRaw === 'why-this-matters' ||
      variantRaw === 'tip' ||
      variantRaw === 'warning' ||
      variantRaw === 'example'
        ? variantRaw
        : 'tip';
    const calloutContent = typeof obj?.content === 'string' ? obj.content : '';

    return {
      id: blockId,
      type: 'callout',
      variant,
      content: calloutContent || 'Callout content',
    };
  }

  if (section.sectionType === 'activity') {
    const activityId = obj?.activityId;
    const required = obj?.required;
    if (typeof activityId === 'string') {
      const linkedStandardId =
        typeof obj?.linkedStandardId === 'string' ? obj.linkedStandardId : undefined;
      return {
        id: blockId,
        type: 'activity',
        activityId,
        required: required === true,
        ...(linkedStandardId ? { linkedStandardId } : {}),
      };
    }
  }

  if (section.sectionType === 'video') {
    const videoUrl = obj?.videoUrl;
    const duration = obj?.duration;
    const transcript = obj?.transcript;
    if (typeof videoUrl === 'string' && typeof duration === 'number' && duration > 0) {
      return {
        id: blockId,
        type: 'video',
        props: {
          videoUrl,
          duration,
          transcript: typeof transcript === 'string' ? transcript : undefined,
        },
      };
    }
  }

  if (section.sectionType === 'image') {
    const imageUrl = obj?.imageUrl;
    const alt = obj?.alt;
    const caption = obj?.caption;
    if (typeof imageUrl === 'string' && typeof alt === 'string') {
      return {
        id: blockId,
        type: 'image',
        props: {
          imageUrl,
          alt,
          caption: typeof caption === 'string' ? caption : undefined,
        },
      };
    }
  }

  return {
    id: blockId,
    type: 'markdown',
    content: contentToText(section.content) || 'Content coming soon.',
  };
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
        title: phase.title?.trim() || fallbackPhaseTitle(phase.phaseNumber),
        contentBlocks: phase.sections.map((section, index) =>
          toContentBlock(section, index + 1),
        ),
        estimatedMinutes: phase.estimatedMinutes,
        metadata: {
          phaseType:
            PHASE_TYPE_BY_NUMBER[phase.phaseNumber as keyof typeof PHASE_TYPE_BY_NUMBER],
        },
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
  asRecord,
  contentToText,
  fallbackPhaseTitle,
  toContentBlock,
};
