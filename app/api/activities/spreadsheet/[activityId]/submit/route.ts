import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { studentSpreadsheetResponses, studentCompetency, activities } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and } from 'drizzle-orm';
import {
  validateSpreadsheetData,
  validateSubmission,
  type TargetCell,
} from '@/lib/activities/spreadsheet-validation';

// Request validation schema
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;
    if (!uuidRegex.test(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    const requestedStudentId = new URL(request.url).searchParams.get('studentId');
    if (requestedStudentId && !uuidRegex.test(requestedStudentId)) {
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
    const {
      data: requesterProfile,
      error: requesterProfileError,
    } = await supabase
      .from('profiles')
      .select('id, role, organization_id')
      .eq('id', requesterId)
      .maybeSingle();

    if (requesterProfileError || !requesterProfile?.role) {
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

      const {
        data: targetProfile,
        error: targetProfileError,
      } = await supabase
        .from('profiles')
        .select('id, role, organization_id')
        .eq('id', requestedStudentId)
        .maybeSingle();

      if (
        targetProfileError ||
        !targetProfile ||
        targetProfile.role !== 'student' ||
        targetProfile.organization_id !== requesterProfile.organization_id
      ) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      targetStudentId = requestedStudentId;
    }

    const responseRows = await db
      .select({
        studentId: studentSpreadsheetResponses.studentId,
        spreadsheetData: studentSpreadsheetResponses.spreadsheetData,
        draftData: studentSpreadsheetResponses.draftData,
        isCompleted: studentSpreadsheetResponses.isCompleted,
        attempts: studentSpreadsheetResponses.attempts,
        lastValidationResult: studentSpreadsheetResponses.lastValidationResult,
        submittedAt: studentSpreadsheetResponses.submittedAt,
        updatedAt: studentSpreadsheetResponses.updatedAt,
      })
      .from(studentSpreadsheetResponses)
      .where(
        and(
          eq(studentSpreadsheetResponses.studentId, targetStudentId),
          eq(studentSpreadsheetResponses.activityId, activityId)
        )
      )
      .limit(1);

    if (responseRows.length === 0) {
      return NextResponse.json(
        { error: 'Spreadsheet response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      readOnly: true,
      activityId,
      studentId: responseRows[0].studentId,
      spreadsheetData: responseRows[0].spreadsheetData,
      draftData: responseRows[0].draftData,
      isCompleted: responseRows[0].isCompleted,
      attempts: responseRows[0].attempts,
      lastValidationResult: responseRows[0].lastValidationResult,
      submittedAt: responseRows[0].submittedAt,
      updatedAt: responseRows[0].updatedAt,
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
    // Extract activityId from params
    const { activityId } = await params;

    // Validate UUID format
    if (!uuidRegex.test(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    // Authenticate user
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    // Parse and validate request body
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

    // SECURITY: Validate spreadsheet data for dangerous content
    const sanitizationResult = validateSpreadsheetData(payload.spreadsheetData);
    if (!sanitizationResult.isValid) {
      return NextResponse.json(
        { error: sanitizationResult.error },
        { status: 400 }
      );
    }

    const activityRows = await db
      .select({
        componentKey: activities.componentKey,
        props: activities.props,
        standardId: activities.standardId,
      })
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);

    if (activityRows.length === 0) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const activity = activityRows[0];
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

    // SECURITY: Always use server-side target cells, never trust client-provided targets.
    const validationResult = validateSubmission(
      payload.spreadsheetData,
      parsedEvaluatorProps.data.targetCells as TargetCell[]
    );

    // Database transaction: Upsert response and update competency if complete
    await db.transaction(async (tx) => {
      const now = new Date();

      // Upsert spreadsheet response
      const existingResponse = await tx
        .select()
        .from(studentSpreadsheetResponses)
        .where(
          and(
            eq(studentSpreadsheetResponses.studentId, userId),
            eq(studentSpreadsheetResponses.activityId, activityId)
          )
        )
        .limit(1);

      if (existingResponse.length > 0) {
        // Update existing response
        await tx
          .update(studentSpreadsheetResponses)
          .set({
            spreadsheetData: payload.spreadsheetData,
            isCompleted: validationResult.isComplete,
            attempts: existingResponse[0].attempts + 1,
            lastValidationResult: validationResult,
            submittedAt: validationResult.isComplete ? now : existingResponse[0].submittedAt,
            updatedAt: now,
          })
          .where(eq(studentSpreadsheetResponses.id, existingResponse[0].id));
      } else {
        // Insert new response
        await tx.insert(studentSpreadsheetResponses).values({
          studentId: userId,
          activityId,
          spreadsheetData: payload.spreadsheetData,
          isCompleted: validationResult.isComplete,
          attempts: 1,
          lastValidationResult: validationResult,
          submittedAt: validationResult.isComplete ? now : null,
          updatedAt: now,
        });
      }

      // Update competency if activity is complete
      if (validationResult.isComplete) {
        if (activity.standardId) {
          const standardId = activity.standardId;

          // Check if competency record exists
          const existingCompetency = await tx
            .select()
            .from(studentCompetency)
            .where(
              and(
                eq(studentCompetency.studentId, userId),
                eq(studentCompetency.standardId, standardId)
              )
            )
            .limit(1);

          if (existingCompetency.length > 0) {
            // Increment mastery level (max 100)
            const newLevel = Math.min(existingCompetency[0].masteryLevel + 10, 100);
            await tx
              .update(studentCompetency)
              .set({
                masteryLevel: newLevel,
                evidenceActivityId: activityId,
                lastUpdated: now,
                updatedBy: userId,
              })
              .where(eq(studentCompetency.id, existingCompetency[0].id));
          } else {
            // Create new competency record
            await tx.insert(studentCompetency).values({
              studentId: userId,
              standardId,
              masteryLevel: 10,
              evidenceActivityId: activityId,
              lastUpdated: now,
              updatedBy: userId,
            });
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      isComplete: validationResult.isComplete,
      feedback: validationResult.feedback,
      masteryUpdate: validationResult.isComplete ? { newLevel: 10 } : undefined,
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
