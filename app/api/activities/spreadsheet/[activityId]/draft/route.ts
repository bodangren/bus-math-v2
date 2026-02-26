import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestSessionClaims } from '@/lib/auth/server';
import { fetchQuery, fetchMutation, api } from '@/lib/convex/server';

const draftSchema = z.object({
  draftData: z.array(z.array(z.any())),
});

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

    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = claims.sub;

    const response = await fetchQuery(api.activities.getSpreadsheetDraft, {
      userId: userId as never,
      activityId: activityId as never,
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

    if (!activityId?.trim()) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = claims.sub;

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
      userId: userId as never,
      activityId: activityId as never,
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
