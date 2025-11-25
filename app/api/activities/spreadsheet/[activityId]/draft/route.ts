import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { studentSpreadsheetResponses } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and } from 'drizzle-orm';

const draftSchema = z.object({
  draftData: z.array(z.array(z.any())),
});

// GET: Retrieve draft data
export async function GET(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
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

    // Fetch draft data
    const response = await db
      .select({
        draftData: studentSpreadsheetResponses.draftData,
        updatedAt: studentSpreadsheetResponses.updatedAt,
      })
      .from(studentSpreadsheetResponses)
      .where(
        and(
          eq(studentSpreadsheetResponses.studentId, userId),
          eq(studentSpreadsheetResponses.activityId, activityId)
        )
      )
      .limit(1);

    if (response.length === 0 || !response[0].draftData) {
      return NextResponse.json({ draftData: null });
    }

    return NextResponse.json({
      draftData: response[0].draftData,
      updatedAt: response[0].updatedAt,
    });
  } catch (error) {
    console.error('Draft retrieval error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve draft',
      },
      { status: 500 }
    );
  }
}

// POST: Save draft data
export async function POST(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
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
    let payload: z.infer<typeof draftSchema>;
    try {
      const body = await request.json();
      const parsed = draftSchema.safeParse(body);
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

    const now = new Date();

    // Check if response already exists
    const existingResponse = await db
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
      // Update existing response with draft data
      await db
        .update(studentSpreadsheetResponses)
        .set({
          draftData: payload.draftData,
          updatedAt: now,
        })
        .where(eq(studentSpreadsheetResponses.id, existingResponse[0].id));
    } else {
      // Create new response with draft data
      await db.insert(studentSpreadsheetResponses).values({
        studentId: userId,
        activityId,
        spreadsheetData: payload.draftData, // Also save to main data field
        draftData: payload.draftData,
        isCompleted: false,
        attempts: 0,
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Draft save error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to save draft',
      },
      { status: 500 }
    );
  }
}
