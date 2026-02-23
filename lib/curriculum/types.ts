export type LessonType = 'accounting' | 'excel' | 'project' | 'assessment';

export type PhaseRequirement = {
  phaseNumber: number;
  titlePattern: RegExp;
  requiresInteractiveActivity?: boolean;
  requiresTeacherSubmission?: boolean;
  requiresAutoGradedActivity?: {
    minPassingScore: number;
  };
  requiresDeliverables?: boolean;
};

export type LessonTypeSpec = {
  lessonType: LessonType;
  phaseRequirements: PhaseRequirement[];
  summary: string;
};

export const CURRICULUM_LESSON_TYPE_SPECS: Record<LessonType, LessonTypeSpec> = {
  accounting: {
    lessonType: 'accounting',
    summary:
      'Six-phase accounting lesson with interactive guided practice and auto-graded independent practice.',
    phaseRequirements: [
      { phaseNumber: 1, titlePattern: /hook|entry/i },
      { phaseNumber: 2, titlePattern: /introduction|intro/i },
      { phaseNumber: 3, titlePattern: /guided/i, requiresInteractiveActivity: true },
      {
        phaseNumber: 4,
        titlePattern: /independent/i,
        requiresAutoGradedActivity: { minPassingScore: 60 },
      },
      { phaseNumber: 5, titlePattern: /assessment|checkpoint/i },
      { phaseNumber: 6, titlePattern: /reflection|closing/i },
    ],
  },
  excel: {
    lessonType: 'excel',
    summary:
      'Six-phase Excel lesson with interactive guided practice, teacher submission independent work, and auto-graded checkpoint.',
    phaseRequirements: [
      { phaseNumber: 1, titlePattern: /hook|entry/i },
      { phaseNumber: 2, titlePattern: /introduction|intro/i },
      { phaseNumber: 3, titlePattern: /guided/i, requiresInteractiveActivity: true },
      {
        phaseNumber: 4,
        titlePattern: /independent/i,
        requiresTeacherSubmission: true,
      },
      {
        phaseNumber: 5,
        titlePattern: /assessment|checkpoint/i,
        requiresAutoGradedActivity: { minPassingScore: 80 },
      },
      { phaseNumber: 6, titlePattern: /reflection|closing/i },
    ],
  },
  project: {
    lessonType: 'project',
    summary:
      'Single-phase project day lesson with deliverables (scaffold/build/present).',
    phaseRequirements: [
      {
        phaseNumber: 1,
        titlePattern: /scaffold|build|present|group work|project/i,
        requiresDeliverables: true,
      },
    ],
  },
  assessment: {
    lessonType: 'assessment',
    summary:
      'Multi-phase summative with instruction plus knowledge/understanding/application tiers.',
    phaseRequirements: [
      { phaseNumber: 1, titlePattern: /instruction/i },
      { phaseNumber: 2, titlePattern: /knowledge/i, requiresAutoGradedActivity: { minPassingScore: 70 } },
      { phaseNumber: 3, titlePattern: /understanding/i, requiresAutoGradedActivity: { minPassingScore: 70 } },
      { phaseNumber: 4, titlePattern: /application/i, requiresAutoGradedActivity: { minPassingScore: 70 } },
    ],
  },
};

export function getLessonTypeFromOrderIndex(orderIndex: number): LessonType {
  if (orderIndex >= 1 && orderIndex <= 4) {
    return 'accounting';
  }

  if (orderIndex >= 5 && orderIndex <= 7) {
    return 'excel';
  }

  if (orderIndex >= 8 && orderIndex <= 10) {
    return 'project';
  }

  return 'assessment';
}
