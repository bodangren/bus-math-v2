import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { activities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/activities/[activityId]
 * Fetch a single activity by ID from the database
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;

    // Validate activityId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    // Fetch activity from database
    const result = await db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const activity = result[0];

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
