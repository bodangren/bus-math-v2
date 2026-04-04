/**
 * Teacher Practice Error Analysis
 *
 * Provides deterministic and AI-assisted error summaries for teacher review
 * of practice submissions. Operates on stored practice.v1 envelopes and
 * misconception tags from the grading layer.
 */

import type { PracticeSubmissionEnvelope, PracticeSubmissionPart } from '../contract';

// ── Types ──────────────────────────────────────────────────────────────────

export interface MisconceptionSummary {
  tag: string;
  count: number;
  affectedParts: string[];
  affectedStudents: string[];
}

export interface PartOutcomeSummary {
  partId: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  accuracyRate: number;
  commonMisconceptions: MisconceptionSummary[];
}

export interface StudentErrorProfile {
  studentId: string;
  submissionId: string;
  activityId: string;
  totalParts: number;
  correctParts: number;
  incorrectParts: number;
  misconceptions: string[];
  submittedAt: string;
}

export interface LessonErrorSummary {
  lessonId: string;
  totalSubmissions: number;
  averageAccuracy: number;
  partOutcomes: PartOutcomeSummary[];
  topMisconceptions: MisconceptionSummary[];
  studentProfiles: StudentErrorProfile[];
}

export interface DeterministicErrorSummary {
  type: 'deterministic';
  lessonId: string;
  generatedAt: number;
  partSummaries: PartOutcomeSummary[];
  topMisconceptions: MisconceptionSummary[];
  studentCount: number;
  averageAccuracy: number;
}

export interface AISummaryInput {
  submission: PracticeSubmissionEnvelope;
  deterministicSummary: DeterministicErrorSummary;
  rawEvidence: {
    answers: Record<string, unknown>;
    artifact?: unknown;
  };
}

export interface AISummaryOutput {
  type: 'ai-assisted';
  likelyMisunderstanding: string;
  evidenceObserved: string;
  suggestedIntervention: string;
  sourceSubmissionId: string;
  sourceEvidence: {
    partIds: string[];
    misconceptionTags: string[];
  };
  generatedAt: number;
}

export interface TeacherErrorView {
  submissionId: string;
  studentId: string;
  activityId: string;
  deterministicSummary: DeterministicErrorSummary;
  aiSummary: AISummaryOutput | null;
  rawParts: PracticeSubmissionPart[];
  rawAnswers: Record<string, unknown>;
  artifact?: unknown;
}

// ── Authorization ──────────────────────────────────────────────────────────

export function canTeacherAccessSubmission(
  teacherOrgId: string,
  submissionOrgId: string,
  teacherId: string,
  submissionTeacherId?: string
): boolean {
  if (teacherOrgId !== submissionOrgId) return false;
  if (submissionTeacherId && submissionTeacherId !== teacherId) return false;
  return true;
}

export function canTeacherAccessLessonSummary(
  teacherOrgId: string,
  lessonOrgId: string,
  teacherId: string,
  lessonTeacherId?: string
): boolean {
  if (teacherOrgId !== lessonOrgId) return false;
  if (lessonTeacherId && lessonTeacherId !== teacherId) return false;
  return true;
}

// ── Deterministic Summary Assembly ─────────────────────────────────────────

export function aggregateMisconceptionTags(
  submissions: PracticeSubmissionEnvelope[],
  studentIdMap?: Map<string, string>
): MisconceptionSummary[] {
  const tagMap = new Map<string, MisconceptionSummary>();

  for (const submission of submissions) {
    const studentId = studentIdMap?.get(submission.activityId) ?? submission.activityId;
    for (const part of submission.parts) {
      for (const tag of part.misconceptionTags ?? []) {
        const existing = tagMap.get(tag);
        if (existing) {
          existing.count++;
          if (!existing.affectedParts.includes(part.partId)) {
            existing.affectedParts.push(part.partId);
          }
          if (!existing.affectedStudents.includes(studentId)) {
            existing.affectedStudents.push(studentId);
          }
        } else {
          tagMap.set(tag, {
            tag,
            count: 1,
            affectedParts: [part.partId],
            affectedStudents: [studentId],
          });
        }
      }
    }
  }

  return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
}

export function summarizePartOutcomes(
  submissions: PracticeSubmissionEnvelope[],
  studentIdMap?: Map<string, string>
): PartOutcomeSummary[] {
  const partMap = new Map<string, PartOutcomeSummary>();

  for (const submission of submissions) {
    const studentId = studentIdMap?.get(submission.activityId) ?? submission.activityId;
    for (const part of submission.parts) {
      const existing = partMap.get(part.partId);
      if (existing) {
        existing.totalAttempts++;
        if (part.isCorrect) {
          existing.correctCount++;
        } else {
          existing.incorrectCount++;
        }
        existing.accuracyRate = existing.correctCount / existing.totalAttempts;

        for (const tag of part.misconceptionTags ?? []) {
          const misExisting = existing.commonMisconceptions.find(m => m.tag === tag);
          if (misExisting) {
            misExisting.count++;
            if (!misExisting.affectedParts.includes(part.partId)) {
              misExisting.affectedParts.push(part.partId);
            }
            if (!misExisting.affectedStudents.includes(studentId)) {
              misExisting.affectedStudents.push(studentId);
            }
          } else {
            existing.commonMisconceptions.push({
              tag,
              count: 1,
              affectedParts: [part.partId],
              affectedStudents: [studentId],
            });
          }
        }
      } else {
        partMap.set(part.partId, {
          partId: part.partId,
          totalAttempts: 1,
          correctCount: part.isCorrect ? 1 : 0,
          incorrectCount: part.isCorrect ? 0 : 1,
          accuracyRate: part.isCorrect ? 1 : 0,
          commonMisconceptions: (part.misconceptionTags ?? []).map(tag => ({
            tag,
            count: 1,
            affectedParts: [part.partId],
            affectedStudents: [studentId],
          })),
        });
      }
    }
  }

  return Array.from(partMap.values());
}

export function buildStudentProfiles(
  submissions: PracticeSubmissionEnvelope[],
  studentIdMap?: Map<string, string>
): StudentErrorProfile[] {
  return submissions.map(submission => {
    const studentId = studentIdMap?.get(submission.activityId) ?? submission.activityId;
    const correctParts = submission.parts.filter(p => p.isCorrect).length;
    const misconceptions = submission.parts.flatMap(p => p.misconceptionTags ?? []);

    return {
      studentId,
      submissionId: `${submission.activityId}-${submission.attemptNumber}`,
      activityId: submission.activityId,
      totalParts: submission.parts.length,
      correctParts,
      incorrectParts: submission.parts.length - correctParts,
      misconceptions: Array.from(new Set(misconceptions)),
      submittedAt: submission.submittedAt,
    };
  });
}

export function buildDeterministicSummary(
  lessonId: string,
  submissions: PracticeSubmissionEnvelope[],
  studentIdMap?: Map<string, string>
): DeterministicErrorSummary {
  const partSummaries = summarizePartOutcomes(submissions, studentIdMap);
  const topMisconceptions = aggregateMisconceptionTags(submissions, studentIdMap);
  const studentProfiles = buildStudentProfiles(submissions, studentIdMap);

  const totalParts = partSummaries.reduce((sum, p) => sum + p.totalAttempts, 0);
  const totalCorrect = partSummaries.reduce((sum, p) => sum + p.correctCount, 0);

  return {
    type: 'deterministic',
    lessonId,
    generatedAt: Date.now(),
    partSummaries,
    topMisconceptions: topMisconceptions.slice(0, 10),
    studentCount: studentProfiles.length,
    averageAccuracy: totalParts > 0 ? totalCorrect / totalParts : 0,
  };
}

// ── AI-Assisted Interpretation ─────────────────────────────────────────────

export async function generateAISummary(
  input: AISummaryInput,
  aiProvider?: (prompt: string) => Promise<string>
): Promise<AISummaryOutput | null> {
  if (!aiProvider) {
    return null;
  }

  try {
    const prompt = buildAIPrompt(input);
    const response = await aiProvider(prompt);
    return parseAIResponse(response, input);
  } catch {
    return null;
  }
}

function buildAIPrompt(input: AISummaryInput): string {
  const { submission, deterministicSummary, rawEvidence } = input;

  return `
Analyze this student practice submission and provide teacher-facing feedback.

Submission ID: ${submission.activityId}-${submission.attemptNumber}
Activity: ${submission.activityId}
Mode: ${submission.mode}

Student Answers:
${JSON.stringify(rawEvidence.answers, null, 2)}

Part Results:
${submission.parts.map(p => `- ${p.partId}: ${p.isCorrect ? 'Correct' : 'Incorrect'} (Score: ${p.score}/${p.maxScore})`).join('\n')}

Misconception Tags:
${submission.parts.flatMap(p => p.misconceptionTags).join(', ') || 'None'}

Class Average Accuracy: ${(deterministicSummary.averageAccuracy * 100).toFixed(1)}%

Provide:
1. Likely misunderstanding (1-2 sentences)
2. Evidence observed in the submission (reference specific answers)
3. Suggested reteach or intervention direction
`.trim();
}

function parseAIResponse(
  response: string,
  input: AISummaryInput
): AISummaryOutput {
  const lines = response.split('\n').filter(l => l.trim());
  const misconceptionTags = Array.from(new Set(input.submission.parts.flatMap(p => p.misconceptionTags ?? [])));

  return {
    type: 'ai-assisted',
    likelyMisunderstanding: lines[0] || 'Unable to determine misunderstanding',
    evidenceObserved: lines[1] || 'No specific evidence identified',
    suggestedIntervention: lines[2] || 'Review with student individually',
    sourceSubmissionId: `${input.submission.activityId}-${input.submission.attemptNumber}`,
    sourceEvidence: {
      partIds: input.submission.parts.map(p => p.partId),
      misconceptionTags,
    },
    generatedAt: Date.now(),
  };
}

// ── Teacher Error View Builder ─────────────────────────────────────────────

export function buildTeacherErrorView(
  submission: PracticeSubmissionEnvelope,
  deterministicSummary: DeterministicErrorSummary,
  aiSummary: AISummaryOutput | null = null
): TeacherErrorView {
  return {
    submissionId: `${submission.activityId}-${submission.attemptNumber}`,
    studentId: submission.activityId,
    activityId: submission.activityId,
    deterministicSummary,
    aiSummary,
    rawParts: submission.parts,
    rawAnswers: submission.answers,
    artifact: submission.artifact,
  };
}
