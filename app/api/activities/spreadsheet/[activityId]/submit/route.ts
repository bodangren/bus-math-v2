import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestSessionClaims, requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalQuery, fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  validateSpreadsheetData,
  validateSubmission,
  type TargetCell,
} from '@/lib/activities/spreadsheet-validation';
import { buildSpreadsheetEvaluatorSubmission } from '@/lib/activities/spreadsheet-practice';
import { generateAiFeedback } from '@/lib/ai/spreadsheet-feedback';

const targetCellSchema = z.object({
  cell: z.string().regex(/^[A-Z]+[0-9]+$/),
  expectedValue: z.union([z.string(), z.number()]),
  expectedFormula: z.string().optional(),
});

const spreadsheetEvaluatorPropsSchema = z.object({
  templateId: z.string(),
  instructions: z.string(),
  targetCells: z.array(targetCellSchema).min(1),
  initialData: z.array(z.array(z.any())).optional(),
});

const requestSchema = z.object({
  spreadsheetData: z.array(z.array(z.any())),
});

type RequestPayload = z.infer<typeof requestSchema>;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;
    if (!activityId?.trim()) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    const requestedStudentId = new URL(request.url).searchParams.get('studentId');
    if (requestedStudentId !== null && requestedStudentId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requesterId = claims.sub;

    const requesterProfile = await fetchInternalQuery(internal.activities.getProfileByUserId, {
      userId: requesterId as never,
    });

    if (!requesterProfile?.role) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    let targetStudentId = requesterId;
    if (requestedStudentId && requestedStudentId !== requesterId) {
      if (requesterProfile.role !== 'teacher' && requesterProfile.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      const targetProfile = await fetchInternalQuery(internal.activities.getProfileById, {
        profileId: requestedStudentId as never,
      });

      if (
        !targetProfile ||
        targetProfile.role !== 'student' ||
        targetProfile.organizationId !== requesterProfile.organizationId
      ) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      targetStudentId = requestedStudentId;
    }

    const response = await fetchInternalQuery(internal.activities.getSpreadsheetResponse, {
      studentId: targetStudentId as never,
      activityId: activityId as never,
    });

    if (!response) {
      return NextResponse.json(
        { error: 'Spreadsheet response not found' },
        { status: 404 }
      );
    }

    const attempts = await fetchInternalQuery(internal.activities.getSpreadsheetAttempts, {
      studentId: targetStudentId as never,
      activityId: activityId as never,
    }) || [];

    return NextResponse.json({
      readOnly: true,
      activityId,
      studentId: response.studentId,
      spreadsheetData: response.spreadsheetData,
      draftData: response.draftData,
      isCompleted: response.isCompleted,
      attempts: attempts.length,
      attemptHistory: attempts,
      maxAttempts: response.maxAttempts,
      lastValidationResult: response.lastValidationResult,
      submittedAt: response.submittedAt,
      updatedAt: response.updatedAt,
    });
  } catch (error) {
    console.error('Spreadsheet replay retrieval error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to load spreadsheet replay',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;

    if (!activityId?.trim()) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    const claimsOrResponse = await requireStudentRequestClaims(request);
    if (claimsOrResponse instanceof Response) {
      return claimsOrResponse;
    }

    const userId = claimsOrResponse.sub;

    let payload: RequestPayload;
    try {
      const body = await request.json();
      const parsed = requestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: 'Invalid payload',
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      payload = parsed.data;
    } catch (parseError) {
      return NextResponse.json(
        {
          error: parseError instanceof Error ? parseError.message : 'Unable to parse request body',
        },
        { status: 400 }
      );
    }

    const sanitizationResult = validateSpreadsheetData(payload.spreadsheetData);
    if (!sanitizationResult.isValid) {
      return NextResponse.json(
        { error: sanitizationResult.error },
        { status: 400 }
      );
    }

    const activity = await fetchInternalQuery(internal.activities.getActivityForValidation, {
      activityId: activityId as never,
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    if (activity.componentKey !== 'spreadsheet-evaluator') {
      return NextResponse.json(
        { error: 'Activity configuration is not a spreadsheet evaluator' },
        { status: 422 }
      );
    }

    const parsedEvaluatorProps = spreadsheetEvaluatorPropsSchema.safeParse(activity.props);
    if (!parsedEvaluatorProps.success) {
      return NextResponse.json(
        {
          error: 'Activity configuration is invalid',
          details: parsedEvaluatorProps.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const validationResult = validateSubmission(
      payload.spreadsheetData,
      parsedEvaluatorProps.data.targetCells as TargetCell[]
    );

    const { attemptId, attemptNumber } = await fetchInternalMutation(internal.activities.submitSpreadsheet, {
      userId: userId as never,
      activityId: activityId as never,
      spreadsheetData: payload.spreadsheetData,
      isCompleted: validationResult.isComplete,
      validationResult,
    });

    const aiFeedback = await generateAiFeedback({
      spreadsheetData: payload.spreadsheetData,
      validationResult,
      targetCells: parsedEvaluatorProps.data.targetCells as TargetCell[],
      activityName: activity.displayName || 'Business Math Spreadsheet Activity',
    });

    await fetchInternalMutation(internal.activities.updateAttemptWithAiFeedback, {
      attemptId: attemptId as never,
      aiFeedback,
    });

    const submissionData = buildSpreadsheetEvaluatorSubmission({
      activityId,
      templateId: parsedEvaluatorProps.data.templateId,
      instructions: parsedEvaluatorProps.data.instructions,
      targetCells: parsedEvaluatorProps.data.targetCells,
      spreadsheetData: payload.spreadsheetData,
      validationResult,
      attemptNumber,
      mode: 'assessment',
    });

    await fetchInternalMutation(internal.activities.submitAssessment, {
      userId: userId as never,
      activityId: activityId as never,
      submissionData: submissionData as never,
      score: validationResult.correctCells,
      maxScore: validationResult.totalCells,
      feedback: validationResult.feedback
        .map((entry) => entry.message ?? `${entry.cell} needs attention.`)
        .join(' '),
    });

    let masteryUpdate: { newLevel: number } | undefined;

    if (validationResult.isComplete && activity.standardId) {
      const competencyResult = await fetchInternalMutation(internal.activities.updateCompetency, {
        studentId: userId as never,
        standardId: activity.standardId,
        activityId: activityId as never,
        masteryIncrement: 10,
      });
      masteryUpdate = { newLevel: competencyResult.newLevel };
    }

    return NextResponse.json({
      success: true,
      isComplete: validationResult.isComplete,
      feedback: validationResult.feedback,
      attemptNumber,
      attemptId,
      aiFeedback,
      masteryUpdate,
    });
  } catch (error) {
    console.error('Spreadsheet submission error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected error during submission',
      },
      { status: 500 }
    );
  }
}
