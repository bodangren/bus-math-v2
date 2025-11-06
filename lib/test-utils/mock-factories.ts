import { randomUUID } from 'node:crypto';

import {
  insertActivitySchema,
  insertActivitySubmissionSchema,
  insertClassEnrollmentSchema,
  insertClassSchema,
  insertContentRevisionSchema,
  insertLessonSchema,
  insertLiveResponseSchema,
  insertLiveSessionSchema,
  insertPhaseSchema,
  insertProfileSchema,
  insertResourceSchema,
  insertSessionLeaderboardEntrySchema,
  insertStudentProgressSchema,
  selectActivitySchema,
  selectActivitySubmissionSchema,
  selectClassEnrollmentSchema,
  selectClassSchema,
  selectContentRevisionSchema,
  selectLessonSchema,
  selectLiveResponseSchema,
  selectLiveSessionSchema,
  selectPhaseSchema,
  selectProfileSchema,
  selectResourceSchema,
  selectSessionLeaderboardEntrySchema,
  selectStudentProgressSchema,
  type Activity,
  type ActivitySubmission,
  type Class,
  type ClassEnrollment,
  type ContentRevision,
  type Lesson,
  type LiveResponse,
  type LiveSession,
  type NewActivity,
  type NewActivitySubmission,
  type NewClass,
  type NewClassEnrollment,
  type NewContentRevision,
  type NewLesson,
  type NewLiveResponse,
  type NewLiveSession,
  type NewPhase,
  type NewProfile,
  type NewResource,
  type NewSessionLeaderboardEntry,
  type NewStudentProgress,
  type Phase,
  type Profile,
  type Resource,
  type SessionLeaderboardEntry,
  type StudentProgress
} from '@/lib/db/schema/validators';

const now = () => new Date();

const defaultLessonMetadata = () => ({
  duration: 45,
  difficulty: 'beginner' as const,
  tags: ['foundations']
});

const defaultPhaseContent = () => [
  {
    id: randomUUID(),
    type: 'markdown' as const,
    content: 'Sample content block'
  }
];

export function buildLessonInput(overrides: Partial<NewLesson> = {}): NewLesson {
  const payload = {
    id: overrides.id ?? randomUUID(),
    unitNumber: overrides.unitNumber ?? 1,
    title: overrides.title ?? 'Sample Lesson',
    slug: overrides.slug ?? `lesson-${randomUUID()}`,
    description: overrides.description ?? 'Sample lesson description',
    learningObjectives: overrides.learningObjectives ?? ['Understand revenue vs. expenses'],
    orderIndex: overrides.orderIndex ?? 1,
    metadata: overrides.metadata ?? defaultLessonMetadata(),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };

  insertLessonSchema.parse(payload);
  return payload;
}

export function createLesson(overrides: Partial<Lesson> = {}): Lesson {
  const payload = {
    ...buildLessonInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectLessonSchema.parse(payload);
}

export function buildPhaseInput(overrides: Partial<NewPhase> = {}): NewPhase {
  const payload = {
    id: overrides.id ?? randomUUID(),
    lessonId: overrides.lessonId ?? randomUUID(),
    phaseNumber: overrides.phaseNumber ?? 1,
    title: overrides.title ?? 'Phase Title',
    contentBlocks: overrides.contentBlocks ?? defaultPhaseContent(),
    estimatedMinutes: overrides.estimatedMinutes ?? 10,
    metadata: overrides.metadata ?? { phaseType: 'intro' },
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  insertPhaseSchema.parse(payload);
  return payload;
}

export function createPhase(overrides: Partial<Phase> = {}): Phase {
  const payload = {
    ...buildPhaseInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectPhaseSchema.parse(payload);
}

export function buildActivityInput(overrides: Partial<NewActivity> = {}): NewActivity {
  const defaultQuestions = [
    {
      id: randomUUID(),
      text: 'What is total profit when revenue is $100 and expenses are $60?',
      type: 'multiple-choice' as const,
      options: ['40', '60', '100', '160'],
      correctAnswer: '40',
      explanation: 'Profit = Revenue - Expenses.'
    }
  ];

  const componentKey = overrides.componentKey ?? 'comprehension-quiz';
  const derivedProps =
    overrides.props ??
    (componentKey === 'budget-worksheet'
      ? {
          categories: ['Rent', 'Utilities'],
          totalBudget: 1000
        }
      : componentKey === 'profit-calculator'
        ? {
            initialRevenue: 100,
            initialExpenses: 60,
            allowNegative: false,
            currency: 'USD'
          }
        : { questions: defaultQuestions });

  const payload = {
    id: overrides.id ?? randomUUID(),
    componentKey,
    displayName: overrides.displayName ?? 'Comprehension Quiz',
    description: overrides.description ?? 'Quick formative assessment',
    props: derivedProps,
    gradingConfig:
      overrides.gradingConfig ??
      {
        autoGrade: true,
        passingScore: 70,
        partialCredit: false
      },
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };

  insertActivitySchema.parse(payload);
  return payload;
}

export function createActivity(overrides: Partial<Activity> = {}): Activity {
  const payload = {
    ...buildActivityInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectActivitySchema.parse(payload);
}

export function buildResourceInput(overrides: Partial<NewResource> = {}): NewResource {
  const payload = {
    id: overrides.id ?? randomUUID(),
    lessonId: overrides.lessonId ?? randomUUID(),
    phaseId: overrides.phaseId,
    title: overrides.title ?? 'Practice Dataset',
    description: overrides.description ?? 'CSV file for classroom activity',
    resourceType: overrides.resourceType ?? 'dataset',
    filePath: overrides.filePath ?? 'resources/datasets/profit.csv',
    externalUrl: overrides.externalUrl ?? null,
    metadata: overrides.metadata ?? { fileSize: 1024, mimeType: 'text/csv' },
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  insertResourceSchema.parse(payload);
  return payload;
}

export function createResource(overrides: Partial<Resource> = {}): Resource {
  const payload = {
    ...buildResourceInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectResourceSchema.parse(payload);
}

export function buildProfileInput(overrides: Partial<NewProfile> = {}): NewProfile {
  return insertProfileSchema.parse({
    id: overrides.id ?? randomUUID(),
    role: overrides.role ?? 'student',
    displayName: overrides.displayName ?? 'Jamie Rivera',
    avatarUrl: overrides.avatarUrl ?? null,
    metadata: overrides.metadata ?? { grade: 10, schoolName: 'TechStart High' },
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  });
}

export function createProfile(overrides: Partial<Profile> = {}): Profile {
  const payload = {
    ...buildProfileInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectProfileSchema.parse(payload);
}

export function buildStudentProgressInput(overrides: Partial<NewStudentProgress> = {}): NewStudentProgress {
  const payload = {
    id: overrides.id ?? randomUUID(),
    userId: overrides.userId ?? randomUUID(),
    phaseId: overrides.phaseId ?? randomUUID(),
    status: overrides.status ?? 'not_started',
    startedAt: overrides.startedAt ?? null,
    completedAt: overrides.completedAt ?? null,
    timeSpentSeconds: overrides.timeSpentSeconds ?? 0,
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  insertStudentProgressSchema.parse(payload);
  return payload;
}

export function createStudentProgress(overrides: Partial<StudentProgress> = {}): StudentProgress {
  const payload = {
    ...buildStudentProgressInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectStudentProgressSchema.parse(payload);
}

export function buildActivitySubmissionInput(
  overrides: Partial<NewActivitySubmission> = {},
): NewActivitySubmission {
  const payload = {
    id: overrides.id ?? randomUUID(),
    userId: overrides.userId ?? randomUUID(),
    activityId: overrides.activityId ?? randomUUID(),
    submissionData:
      overrides.submissionData ??
      {
        answers: {
          q1: '40'
        },
        interactionHistory: []
      },
    score: overrides.score ?? 80,
    maxScore: overrides.maxScore ?? 100,
    feedback: overrides.feedback ?? 'Great job explaining your reasoning!',
    submittedAt: overrides.submittedAt ?? now(),
    gradedAt: overrides.gradedAt ?? null,
    gradedBy: overrides.gradedBy ?? randomUUID(),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  insertActivitySubmissionSchema.parse(payload);
  return payload;
}

export function createActivitySubmission(overrides: Partial<ActivitySubmission> = {}): ActivitySubmission {
  const payload = {
    ...buildActivitySubmissionInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectActivitySubmissionSchema.parse(payload);
}

export function buildClassInput(overrides: Partial<NewClass> = {}): NewClass {
  const payload = {
    id: overrides.id ?? randomUUID(),
    teacherId: overrides.teacherId ?? randomUUID(),
    name: overrides.name ?? 'Period 1 - Foundations',
    description: overrides.description ?? 'Morning cohort focused on fundamentals',
    academicYear: overrides.academicYear ?? '2025-2026',
    archived: overrides.archived ?? false,
    metadata: overrides.metadata ?? { period: '1A' },
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  insertClassSchema.parse(payload);
  return payload;
}

export function createClass(overrides: Partial<Class> = {}): Class {
  const payload = {
    ...buildClassInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectClassSchema.parse(payload);
}

export function buildClassEnrollmentInput(
  overrides: Partial<NewClassEnrollment> = {},
): NewClassEnrollment {
  const payload = {
    id: overrides.id ?? randomUUID(),
    classId: overrides.classId ?? randomUUID(),
    studentId: overrides.studentId ?? randomUUID(),
    enrolledAt: overrides.enrolledAt ?? now(),
    status: overrides.status ?? 'active',
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  insertClassEnrollmentSchema.parse(payload);
  return payload;
}

export function createClassEnrollment(overrides: Partial<ClassEnrollment> = {}): ClassEnrollment {
  const payload = {
    ...buildClassEnrollmentInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectClassEnrollmentSchema.parse(payload);
}

export function buildLiveSessionInput(overrides: Partial<NewLiveSession> = {}): NewLiveSession {
  const payload = {
    id: overrides.id ?? randomUUID(),
    activityId: overrides.activityId ?? randomUUID(),
    classId: overrides.classId ?? randomUUID(),
    hostId: overrides.hostId ?? randomUUID(),
    status: overrides.status ?? 'waiting',
    startedAt: overrides.startedAt ?? null,
    endedAt: overrides.endedAt ?? null,
    settings: overrides.settings ?? { allowLateJoin: true, showLeaderboard: true, questionOrder: 'sequential' },
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  insertLiveSessionSchema.parse(payload);
  return payload;
}

export function createLiveSession(overrides: Partial<LiveSession> = {}): LiveSession {
  const payload = {
    ...buildLiveSessionInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectLiveSessionSchema.parse(payload);
}

export function buildLiveResponseInput(overrides: Partial<NewLiveResponse> = {}): NewLiveResponse {
  const payload = {
    id: overrides.id ?? randomUUID(),
    sessionId: overrides.sessionId ?? randomUUID(),
    userId: overrides.userId ?? randomUUID(),
    questionId: overrides.questionId ?? 'question-1',
    answer: overrides.answer ?? { response: '40' },
    isCorrect: overrides.isCorrect ?? true,
    responseTimeMs: overrides.responseTimeMs ?? 1200,
    respondedAt: overrides.respondedAt ?? now(),
    createdAt: overrides.createdAt ?? now()
  };
  insertLiveResponseSchema.parse(payload);
  return payload;
}

export function createLiveResponse(overrides: Partial<LiveResponse> = {}): LiveResponse {
  const payload = {
    ...buildLiveResponseInput(overrides),
    createdAt: overrides.createdAt ?? now()
  };
  return selectLiveResponseSchema.parse(payload);
}

export function buildSessionLeaderboardEntryInput(
  overrides: Partial<NewSessionLeaderboardEntry> = {},
): NewSessionLeaderboardEntry {
  const payload = {
    id: overrides.id ?? randomUUID(),
    sessionId: overrides.sessionId ?? randomUUID(),
    userId: overrides.userId ?? randomUUID(),
    score: overrides.score ?? 120,
    totalQuestions: overrides.totalQuestions ?? 5,
    avgResponseTimeMs: overrides.avgResponseTimeMs ?? 900,
    rank: overrides.rank ?? 1,
    updatedAt: overrides.updatedAt ?? now()
  };
  insertSessionLeaderboardEntrySchema.parse(payload);
  return payload;
}

export function createSessionLeaderboardEntry(
  overrides: Partial<SessionLeaderboardEntry> = {},
): SessionLeaderboardEntry {
  const payload = {
    ...buildSessionLeaderboardEntryInput(overrides),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectSessionLeaderboardEntrySchema.parse(payload);
}

export function buildContentRevisionInput(
  overrides: Partial<NewContentRevision> = {},
): NewContentRevision {
  const payload = {
    id: overrides.id ?? randomUUID(),
    entityType: overrides.entityType ?? 'lesson',
    entityId: overrides.entityId ?? randomUUID(),
    proposedChanges:
      overrides.proposedChanges ?? {
        title: 'Updated Lesson Title'
      },
    validationStatus: overrides.validationStatus ?? 'pending',
    validationErrors: overrides.validationErrors ?? null,
    proposedBy: overrides.proposedBy ?? randomUUID(),
    reviewedBy: overrides.reviewedBy ?? null,
    reviewedAt: overrides.reviewedAt ?? null,
    comment: overrides.comment ?? 'Needs SME review',
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  insertContentRevisionSchema.parse(payload);
  return payload;
}

export function createContentRevision(overrides: Partial<ContentRevision> = {}): ContentRevision {
  const payload = {
    ...buildContentRevisionInput(overrides),
    createdAt: overrides.createdAt ?? now(),
    updatedAt: overrides.updatedAt ?? now()
  };
  return selectContentRevisionSchema.parse(payload);
}
