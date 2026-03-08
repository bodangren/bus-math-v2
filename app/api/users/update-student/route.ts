import { z } from 'zod';

import { getRequestSessionClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

const requestSchema = z
  .object({
    // Convex IDs are opaque alphanumeric strings, not UUIDs — uuid() validation would reject them
    studentId: z.string().trim().min(1, 'studentId is required'),
    displayName: z.string().trim().min(1).max(80).optional(),
    deactivate: z.boolean().optional(),
  })
  .refine((value) => value.displayName !== undefined || value.deactivate !== undefined, {
    message: 'Provide displayName and/or deactivate',
    path: ['displayName'],
  });

export async function POST(request: Request) {
  try {
    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsedBody = requestSchema.safeParse(body);
    if (!parsedBody.success) {
      return Response.json(
        { error: 'Invalid request payload', details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await fetchInternalMutation(internal.auth.updateStudentAccount, {
      // claims.sub / studentId are Convex profile IDs stored as strings; casts are safe
      teacherProfileId: claims.sub as Id<'profiles'>,
      studentProfileId: parsedBody.data.studentId as Id<'profiles'>,
      displayName: parsedBody.data.displayName,
      deactivate: parsedBody.data.deactivate,
    });

    if (!result.ok) {
      if (result.reason === 'teacher_not_found') {
        return Response.json({ error: 'Teacher profile not found' }, { status: 403 });
      }

      if (result.reason === 'forbidden') {
        return Response.json({ error: 'Only teachers can manage students' }, { status: 403 });
      }

      if (result.reason === 'student_not_found') {
        return Response.json({ error: 'Student not found' }, { status: 404 });
      }

      if (result.reason === 'invalid_input') {
        return Response.json({ error: 'Invalid request payload' }, { status: 400 });
      }

      return Response.json({ error: 'Failed to update student profile' }, { status: 500 });
    }

    return Response.json({
      studentId: result.studentId,
      username: result.username,
      displayName: result.displayName,
      deactivated: result.deactivated,
    });
  } catch (error) {
    console.error('Unexpected error in update-student', error);
    return Response.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
