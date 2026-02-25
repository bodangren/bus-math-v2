import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { fetchQuery, fetchMutation, api } from '@/lib/convex/server';
import {
  validateSpreadsheetData,
  validateSubmission,
  type TargetCell,
} from '@/lib/activities/spreadsheet-validation';

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
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidConvexId(id: string): boolean {
  return uuidRegex.test(id);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;
    if (!isValidConvexId(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    const requestedStudentId = new URL(request.url).searchParams.get('studentId');
    if (requestedStudentId && !isValidConvexId(requestedStudentId)) {
      return NextResponse.json(
        { error: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Unauthorized' },
        { status: 401 }
      );
    }

    const requesterId = authData.user.id;

    const requesterProfile = await fetchQuery(api.activities.getProfileByUserId, {
      userId: requesterId as any,
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

      const targetProfile = await fetchQuery(api.activities.getProfileById, {
        profileId: requestedStudentId as any,
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

    const response = await fetchQuery(api.activities.getSpreadsheetResponse, {
      studentId: targetStudentId as any,
      activityId: activityId as any,
    });

    if (!response) {
      return NextResponse.json(
        { error: 'Spreadsheet response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      readOnly: true,
      activityId,
      studentId: response.studentId,
      spreadsheetData: response.spreadsheetData,
      draftData: response.draftData,
      isCompleted: response.isCompleted,
      attempts: response.attempts,
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

    if (!isValidConvexId(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

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

    const activity = await fetchQuery(api.activities.getActivityForValidation, {
      activityId: activityId as any,
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

    await fetchMutation(api.activities.submitSpreadsheet, {
      userId: userId as any,
      activityId: activityId as any,
      spreadsheetData: payload.spreadsheetData,
      isCompleted: validationResult.isComplete,
      validationResult,
    });

    let masteryUpdate: { newLevel: number } | undefined;

    if (validationResult.isComplete && activity.standardId) {
      const competencyResult = await fetchMutation(api.activities.updateCompetency, {
        studentId: userId as any,
        standardId: activity.standardId,
        activityId: activityId as any,
        masteryIncrement: 10,
      });
      masteryUpdate = { newLevel: competencyResult.newLevel };
    }

    return NextResponse.json({
      success: true,
      isComplete: validationResult.isComplete,
      feedback: validationResult.feedback,
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
