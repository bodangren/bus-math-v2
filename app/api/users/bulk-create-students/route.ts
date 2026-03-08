import { z } from 'zod';

import { PASSWORD_HASH_ITERATIONS } from '@/lib/auth/constants';
import { getRequestSessionClaims } from '@/lib/auth/server';
import { generatePasswordSalt, generateRandomPassword, hashPassword } from '@/lib/auth/session';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

const studentSchema = z.object({
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  displayName: z.string().trim().max(80).optional(),
  username: z.string().trim().max(50).optional(),
});

const requestSchema = z.object({
  students: z.array(studentSchema).min(1).max(100),
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

    const rawStudents =
      typeof body === 'object' && body !== null && 'students' in body
        ? (body as { students?: unknown }).students
        : undefined;

    if (!Array.isArray(rawStudents) || rawStudents.length === 0) {
      return Response.json({ error: 'Request must include a non-empty students array' }, { status: 400 });
    }

    if (rawStudents.length > 100) {
      return Response.json({ error: 'Maximum batch size is 100 students' }, { status: 400 });
    }

    const parsedBody = requestSchema.safeParse({ students: rawStudents });
    if (!parsedBody.success) {
      return Response.json(
        { error: 'Invalid request payload', details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const preparedStudents = await Promise.all(
      parsedBody.data.students.map(async (student) => {
        const password = generateRandomPassword();
        const passwordSalt = generatePasswordSalt();
        const passwordHash = await hashPassword(password, passwordSalt, PASSWORD_HASH_ITERATIONS);
        return {
          firstName: student.firstName,
          lastName: student.lastName,
          displayName: student.displayName,
          preferredUsername: student.username,
          password,
          passwordHash,
          passwordSalt,
          passwordHashIterations: PASSWORD_HASH_ITERATIONS,
        };
      }),
    );

    const result = await fetchInternalMutation(internal.auth.bulkCreateStudentAccounts, {
      // claims.sub is a Convex profile ID stored as a string in the JWT; cast is safe
      teacherProfileId: claims.sub as Id<'profiles'>,
      students: preparedStudents.map((student) => ({
        firstName: student.firstName,
        lastName: student.lastName,
        displayName: student.displayName,
        preferredUsername: student.preferredUsername,
        passwordHash: student.passwordHash,
        passwordSalt: student.passwordSalt,
        passwordHashIterations: student.passwordHashIterations,
      })),
    });

    if (!result.ok) {
      if (result.reason === 'teacher_not_found') {
        return Response.json({ error: 'Teacher profile not found' }, { status: 403 });
      }

      if (result.reason === 'forbidden') {
        return Response.json({ error: 'Only teachers can create students' }, { status: 403 });
      }

      if (result.reason === 'invalid_batch') {
        return Response.json({ error: 'Maximum batch size is 100 students' }, { status: 400 });
      }

      return Response.json({ error: 'Failed to create students' }, { status: 500 });
    }

    const students = result.students.map((student, index) => ({
      studentId: student.studentId,
      username: student.username,
      // preparedStudents and result.students are always the same length (1:1 per input)
      password: preparedStudents[index]!.password,
      displayName: student.displayName,
      email: student.email,
    }));

    return Response.json(
      {
        totalCreated: result.totalCreated,
        organizationId: result.organizationId,
        students,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Unexpected error in bulk-create-students', error);
    return Response.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
