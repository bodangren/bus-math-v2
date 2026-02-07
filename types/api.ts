export const API_PHASE_STATUSES = [
  'completed',
  'current',
  'available',
  'locked',
] as const;

export type PhaseStatus = (typeof API_PHASE_STATUSES)[number];

export interface PhaseProgressResponse {
  phaseNumber: number;
  phaseId: string;
  status: PhaseStatus;
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number | null;
}

export interface LessonProgressResponse {
  phases: PhaseProgressResponse[];
}

export interface CompletePhaseRequest {
  lessonId: string;
  phaseNumber: number;
  timeSpent: number;
  idempotencyKey: string;
}

export interface CompletePhaseResponse {
  success: boolean;
  nextPhaseUnlocked: boolean;
  message?: string;
  error?: string;
  phaseId?: string;
  completedAt?: string;
}

export interface CompleteActivityRequest {
  activityId: string;
  lessonId: string;
  phaseNumber: number;
  linkedStandardId?: string | null;
  completionData?: Record<string, unknown> | null;
  idempotencyKey: string;
}

export interface CompleteActivityResponse {
  success: boolean;
  nextPhaseUnlocked: boolean;
  message: string;
  completionId?: string;
  completedAt?: string;
  completedPhases?: number;
  totalPhases?: number;
  errorCode?: string;
}
