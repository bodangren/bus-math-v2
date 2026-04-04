import { LESSON_01_SEED_DATA } from '../../supabase/seed/unit1/lesson-01';
import { LESSON_02_SEED_DATA } from '../../supabase/seed/unit1/lesson-02';
import { LESSON_03_SEED_DATA } from '../../supabase/seed/unit1/lesson-03';
import { LESSON_04_SEED_DATA } from '../../supabase/seed/unit1/lesson-04';
import { LESSON_05_SEED_DATA } from '../../supabase/seed/unit1/lesson-05';
import { LESSON_06_SEED_DATA } from '../../supabase/seed/unit1/lesson-06';
import { LESSON_07_SEED_DATA } from '../../supabase/seed/unit1/lesson-07';
import { LESSON_08_SEED_DATA, LESSON_09_SEED_DATA, LESSON_10_SEED_DATA } from '../../supabase/seed/unit1/lessons-08-10';
import { LESSON_11_SEED_DATA } from '../../supabase/seed/unit1/lesson-11';

export type Section = {
  sectionType: string;
  content: Record<string, unknown>;
};

export type Phase = {
  phaseNumber: number;
  title: string;
  sections: Section[];
  deliverables?: string[];
};

export type Activity = {
  id: string;
  componentKey: string;
  props: Record<string, unknown>;
  gradingConfig?: {
    autoGrade?: boolean;
    passingScore?: number;
  };
};

export type LessonSeed = {
  lesson: {
    id: string;
    slug: string;
    orderIndex: number;
    unitNumber: number;
  };
  standards: Array<{ code: string; isPrimary: boolean }>;
  phases: Phase[];
  activities: Activity[];
};

export const UNIT_1_LESSON_SEEDS: LessonSeed[] = [
  LESSON_01_SEED_DATA,
  LESSON_02_SEED_DATA,
  LESSON_03_SEED_DATA,
  LESSON_04_SEED_DATA,
  LESSON_05_SEED_DATA,
  LESSON_06_SEED_DATA,
  LESSON_07_SEED_DATA,
  LESSON_08_SEED_DATA,
  LESSON_09_SEED_DATA,
  LESSON_10_SEED_DATA,
  LESSON_11_SEED_DATA,
] as unknown as LessonSeed[];

export const ACCOUNTING_LESSONS = UNIT_1_LESSON_SEEDS.filter(
  (lesson) => lesson.lesson.orderIndex >= 1 && lesson.lesson.orderIndex <= 4,
);

export const EXCEL_LESSONS = UNIT_1_LESSON_SEEDS.filter(
  (lesson) => lesson.lesson.orderIndex >= 5 && lesson.lesson.orderIndex <= 7,
);

export const PROJECT_LESSONS = UNIT_1_LESSON_SEEDS.filter(
  (lesson) => lesson.lesson.orderIndex >= 8 && lesson.lesson.orderIndex <= 10,
);

export const SUMMATIVE_LESSONS = UNIT_1_LESSON_SEEDS.filter(
  (lesson) => lesson.lesson.orderIndex === 11,
);

export function getPhase(lesson: LessonSeed, phaseNumber: number): Phase | undefined {
  return lesson.phases.find((phase) => phase.phaseNumber === phaseNumber);
}

export function getActivityIdFromSection(section: Section): string | null {
  const activityId = section.content.activityId;
  return typeof activityId === 'string' ? activityId : null;
}

export function getActivityById(lesson: LessonSeed, id: string | null): Activity | undefined {
  if (!id) {
    return undefined;
  }

  return lesson.activities.find((activity) => activity.id === id);
}

export function getActivitySections(phase: Phase | undefined): Section[] {
  if (!phase) {
    return [];
  }

  return phase.sections.filter((section) => section.sectionType === 'activity');
}

export function getAutoGradedActivities(lesson: LessonSeed): Activity[] {
  return lesson.activities.filter((activity) => Boolean(activity.gradingConfig?.autoGrade));
}

export function isInteractiveComponent(componentKey: string): boolean {
  return [
    'comprehension-quiz',
    'fill-in-the-blank',
    'spreadsheet',
    'spreadsheet-evaluator',
    'peer-critique-form',
    'reflection-journal',
    'tiered-assessment',
    'notebook-organizer',
    'cash-flow-challenge',
    'startup-journey',
    'budget-balancer',
    'lemonade-stand',
    'asset-time-machine',
    'business-stress-test',
    'inventory-manager',
    'pitch-presentation-builder',
    'cafe-supply-chaos',
    'growth-puzzle',
    'capital-negotiation',
    'pay-structure-lab',
  ].includes(componentKey);
}

export function getQuestionBank(activity: Activity): Array<Record<string, unknown>> {
  const questions = activity.props.questions;
  return Array.isArray(questions) ? (questions as Array<Record<string, unknown>>) : [];
}

export function getApplicationProblems(activity: Activity): Array<Record<string, unknown>> {
  const applicationProblems = activity.props.applicationProblems;
  return Array.isArray(applicationProblems)
    ? (applicationProblems as Array<Record<string, unknown>>)
    : [];
}
