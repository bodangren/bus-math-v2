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

const requestSchema = z.object({
  spreadsheetData: z.array(z.array(z.any())),
  targetCells: z.array(targetCellSchema).min(1),
});

type RequestPayload = z.infer<typeof requestSchema>;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    // Extract activityId from params
    const { activityId } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

    // Validate answers using centralized validation utility
    const validationResult = validateSubmission(
      payload.spreadsheetData,
      payload.targetCells as TargetCell[]
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
        // Get activity to find standardId
        const activity = await tx
          .select()
          .from(activities)
          .where(eq(activities.id, activityId))
          .limit(1);

        if (activity.length > 0 && activity[0].standardId) {
          const standardId = activity[0].standardId;

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
