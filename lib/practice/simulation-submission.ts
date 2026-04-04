/**
 * Simulation Submission Utilities
 * 
 * Helpers for simulations to build practice.v1 compliant submission envelopes.
 * Wraps the core practice.v1 contract with simulation-specific conveniences.
 */

import {
  buildPracticeSubmissionEnvelope,
  type PracticeSubmissionEnvelope,
  type PracticeSubmissionPart,
} from '@/lib/practice/contract';

/**
 * Base simulation submission input
 */
export interface SimulationSubmissionInput {
  activityId: string;
  mode?: 'guided_practice' | 'independent_practice' | 'assessment';
  status?: 'draft' | 'submitted' | 'graded';
  attemptNumber?: number;
  submittedAt?: string | Date;
}

/**
 * Build a practice.v1 submission envelope for simulations
 */
export function buildSimulationSubmissionEnvelope(
  input: SimulationSubmissionInput & {
    answers: Record<string, unknown>;
    parts?: PracticeSubmissionPart[];
    artifact?: Record<string, unknown>;
    interactionHistory?: unknown[];
    analytics?: Record<string, unknown>;
    studentFeedback?: string;
    teacherSummary?: string;
  }
): PracticeSubmissionEnvelope {
  return buildPracticeSubmissionEnvelope({
    activityId: input.activityId,
    mode: input.mode ?? 'independent_practice',
    status: input.status ?? 'submitted',
    attemptNumber: input.attemptNumber ?? 1,
    submittedAt: input.submittedAt,
    answers: input.answers,
    parts: input.parts,
    artifact: input.artifact,
    interactionHistory: input.interactionHistory,
    analytics: input.analytics,
    studentFeedback: input.studentFeedback,
    teacherSummary: input.teacherSummary,
  });
}

/**
 * Create a simulation part with common fields
 */
export function createSimulationPart(
  partId: string,
  rawAnswer: unknown,
  options?: {
    isCorrect?: boolean;
    score?: number;
    maxScore?: number;
    misconceptionTags?: string[];
  }
): PracticeSubmissionPart {
  return {
    partId,
    rawAnswer,
    normalizedAnswer: normalizeSimulationValue(rawAnswer),
    isCorrect: options?.isCorrect,
    score: options?.score,
    maxScore: options?.maxScore,
    misconceptionTags: options?.misconceptionTags,
  };
}

/**
 * Normalize a simulation value for comparison
 */
function normalizeSimulationValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeSimulationValue(entry)).sort().join('|');
  }

  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim().toLowerCase();
  }

  if (value == null) {
    return '';
  }

  return JSON.stringify(value);
}

/**
 * Common simulation artifact types
 */
export interface SimulationArtifactBase {
  type: string;
  summary: {
    successStatus: 'won' | 'lost' | 'in_progress';
    [key: string]: unknown;
  };
}

/**
 * Type guard for simulation artifact
 */
export function isSimulationArtifact(value: unknown): value is SimulationArtifactBase {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as SimulationArtifactBase).type === 'string' &&
    'summary' in value &&
    typeof (value as SimulationArtifactBase).summary === 'object'
  );
}
