import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { fetchQuery, fetchMutation, api } from '@/lib/convex/server';

const draftSchema = z.object({
  draftData: z.array(z.array(z.any())),
});

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

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    const response = await fetchQuery(api.activities.getSpreadsheetDraft, {
      userId: userId as any,
      activityId: activityId as any,
    });

    if (!response?.draftData) {
      return NextResponse.json({ draftData: null });
    }

    return NextResponse.json({
      draftData: response.draftData,
      updatedAt: response.updatedAt,
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

    const result = await fetchMutation(api.activities.saveSpreadsheetDraft, {
      userId: userId as any,
      activityId: activityId as any,
      draftData: payload.draftData,
    });

    return NextResponse.json({
      success: true,
      updatedAt: result.updatedAt,
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
