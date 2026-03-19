import { z } from 'zod';

import {
  PRACTICE_CONTRACT_VERSION,
  buildPracticeSubmissionEnvelope,
  practiceModeSchema,
  type PracticeSubmissionEnvelope,
} from '@/lib/practice/contract';

export type PracticeMode = z.infer<typeof practiceModeSchema>;

export type ProblemPartKind =
  | 'numeric'
  | 'selection'
  | 'journal-entry'
  | 'statement-row'
  | 'categorization'
  | 'explanation';

export interface ProblemPartDefinition {
  id: string;
  kind: ProblemPartKind | string;
  prompt: string;
  expectedAnswerShape: string;
  canonicalAnswer?: unknown;
  rubric?: unknown;
  explanation?: string;
  misconceptionTags?: string[];
  hintIds?: string[];
  standardCode?: string;
  artifactTarget?: string;
}

export interface ProblemDefinition {
  contractVersion: typeof PRACTICE_CONTRACT_VERSION;
  familyKey: string;
  mode: PracticeMode;
  activityId: string;
  prompt: {
    title: string;
    stem: string;
  };
  parts: ProblemPartDefinition[];
  scaffolding?: Record<string, unknown>;
  workedExample?: Record<string, unknown>;
  grading: {
    strategy: 'exact' | 'numeric' | 'rubric';
    partialCredit?: boolean;
    rubric?: unknown;
  };
  analyticsConfig?: Record<string, unknown>;
}

export interface GradeResultPart {
  partId: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  misconceptionTags: string[];
  rawAnswer?: unknown;
  normalizedAnswer?: string;
}

export interface GradeResult {
  score: number;
  maxScore: number;
  parts: GradeResultPart[];
  feedback?: string;
}

export interface ProblemFamily<TDefinition, TResponse, TConfig = unknown> {
  generate(seed: number, config: TConfig): TDefinition;
  solve(definition: TDefinition): TResponse;
  grade(definition: TDefinition, studentResponse: TResponse): GradeResult;
  toEnvelope(definition: TDefinition, studentResponse: TResponse, gradeResult: GradeResult): PracticeSubmissionEnvelope;
}

export function buildPracticeSubmissionEnvelopeFromGrade(
  definition: Pick<ProblemDefinition, 'activityId' | 'mode'>,
  studentResponse: Record<string, unknown>,
  gradeResult: GradeResult,
  submittedAt: Date | string = new Date(),
): PracticeSubmissionEnvelope {
  return buildPracticeSubmissionEnvelope({
    activityId: definition.activityId,
    mode: definition.mode,
    submittedAt,
    answers: studentResponse,
    parts: gradeResult.parts.map((part) => ({
      partId: part.partId,
      rawAnswer: part.rawAnswer ?? studentResponse[part.partId],
      normalizedAnswer: part.normalizedAnswer,
      isCorrect: part.isCorrect,
      score: part.score,
      maxScore: part.maxScore,
      misconceptionTags: part.misconceptionTags,
    })),
    analytics: {
      score: gradeResult.score,
      maxScore: gradeResult.maxScore,
    },
  });
}
