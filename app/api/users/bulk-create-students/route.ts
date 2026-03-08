import { z } from 'zod';

import { getRequestSessionClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  getTeacherProfileId,
  prepareStudentAccounts,
  requireTeacherClaims,
  toCreatedStudentResponses,
  toStudentMutationPayloads,
} from '@/lib/teacher/student-accounts';

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
    const forbiddenResponse = requireTeacherClaims(
      claims,
      'Only teachers can create students',
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

    const preparedStudents = await prepareStudentAccounts(parsedBody.data.students);

    const result = await fetchInternalMutation(internal.auth.bulkCreateStudentAccounts, {
      teacherProfileId: getTeacherProfileId(claims),
      students: toStudentMutationPayloads(preparedStudents),
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

    const students = toCreatedStudentResponses(result.students, preparedStudents);

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
