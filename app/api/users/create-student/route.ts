import { z } from 'zod';

import { PASSWORD_HASH_ITERATIONS } from '@/lib/auth/constants';
import { getRequestSessionClaims } from '@/lib/auth/server';
import { generatePasswordSalt, generateRandomPassword, hashPassword } from '@/lib/auth/session';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

const requestSchema = z.object({
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  displayName: z.string().trim().max(80).optional(),
  username: z.string().trim().max(50).optional(),
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

    const parsedBody = requestSchema.safeParse(body ?? {});
    if (!parsedBody.success) {
      return Response.json(
        { error: 'Invalid request payload', details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const password = generateRandomPassword(12);
    const passwordSalt = generatePasswordSalt();
    const passwordHash = await hashPassword(password, passwordSalt, PASSWORD_HASH_ITERATIONS);

    const result = await fetchInternalMutation(internal.auth.createStudentAccount, {
      // claims.sub is a Convex profile ID stored as a string in the JWT; cast is safe
      teacherProfileId: claims.sub as Id<'profiles'>,
      student: {
        preferredUsername: parsedBody.data.username,
        firstName: parsedBody.data.firstName,
        lastName: parsedBody.data.lastName,
        displayName: parsedBody.data.displayName,
        passwordHash,
        passwordSalt,
        passwordHashIterations: PASSWORD_HASH_ITERATIONS,
      },
    });

    if (!result.ok) {
      if (result.reason === 'teacher_not_found') {
        return Response.json({ error: 'Teacher profile not found' }, { status: 403 });
      }

      if (result.reason === 'forbidden') {
        return Response.json({ error: 'Only teachers can create students' }, { status: 403 });
      }

      return Response.json({ error: 'Failed to create student' }, { status: 500 });
    }

    return Response.json(
      {
        studentId: result.studentId,
        username: result.username,
        password,
        displayName: result.displayName,
        email: `${result.username}@internal.domain`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Unexpected error in create-student', error);
    return Response.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
