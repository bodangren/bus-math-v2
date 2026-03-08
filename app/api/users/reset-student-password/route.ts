import { z } from 'zod';

import { PASSWORD_HASH_ITERATIONS } from '@/lib/auth/constants';
import { getRequestSessionClaims } from '@/lib/auth/server';
import { generatePasswordSalt, generateRandomPassword, hashPassword } from '@/lib/auth/session';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import { getTeacherProfileId, requireTeacherClaims } from '@/lib/teacher/student-accounts';
import type { Id } from '@/convex/_generated/dataModel';

const requestSchema = z.object({
  // Convex IDs are opaque alphanumeric strings, not UUIDs — uuid() validation would reject them
  studentId: z.string().trim().min(1, 'studentId is required'),
});

export async function POST(request: Request) {
  try {
    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const forbiddenResponse = requireTeacherClaims(
      claims,
      'Only teachers can reset student passwords',
    );
    if (forbiddenResponse) {
      return forbiddenResponse;
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

    const password = generateRandomPassword(12);
    const passwordSalt = generatePasswordSalt();
    const passwordHash = await hashPassword(password, passwordSalt, PASSWORD_HASH_ITERATIONS);

    const result = await fetchInternalMutation(internal.auth.resetStudentPassword, {
      teacherProfileId: getTeacherProfileId(claims),
      studentProfileId: parsedBody.data.studentId as Id<'profiles'>,
      passwordHash,
      passwordSalt,
      passwordHashIterations: PASSWORD_HASH_ITERATIONS,
    });

    if (!result.ok) {
      if (result.reason === 'teacher_not_found') {
        return Response.json({ error: 'Teacher profile not found' }, { status: 403 });
      }

      if (result.reason === 'forbidden') {
        return Response.json({ error: 'Only teachers can reset student passwords' }, { status: 403 });
      }

      if (result.reason === 'student_not_found') {
        return Response.json({ error: 'Student not found' }, { status: 404 });
      }

      return Response.json({ error: 'Failed to reset student password' }, { status: 500 });
    }

    return Response.json({
      studentId: result.studentId,
      username: result.username,
      displayName: result.displayName,
      password,
    });
  } catch (error) {
    console.error('Unexpected error in reset-student-password', error);
    return Response.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
