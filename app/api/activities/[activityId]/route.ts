import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery, api } from '@/lib/convex/server';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny = api as any;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await fetchQuery(apiAny.api.getProfile, {
      userId: userId,
    });

    if (!profile?.role) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (profile.role !== 'student' && profile.role !== 'teacher' && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { activityId } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    const activity = await fetchQuery(apiAny.api.getActivity, {
      activityId: activityId,
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const responsePayload =
      profile.role === 'student' ? buildStudentSafeActivity(activity) : activity;

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildStudentSafeActivity(activity: Record<string, unknown>) {
  return {
    ...activity,
    gradingConfig: null,
    props: redactSensitiveFields(activity.props),
  };
}

function redactSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveFields(item));
  }

  if (value && typeof value === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'correctAnswer') {
        continue;
      }
      redacted[key] = redactSensitiveFields(nestedValue);
    }
    return redacted;
  }

  return value;
}
