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

    const parsedBody = requestSchema.safeParse(body ?? {});
    if (!parsedBody.success) {
      return Response.json(
        { error: 'Invalid request payload', details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const [preparedStudent] = await prepareStudentAccounts([parsedBody.data]);
    const [studentPayload] = toStudentMutationPayloads([preparedStudent!]);

    const result = await fetchInternalMutation(internal.auth.createStudentAccount, {
      teacherProfileId: getTeacherProfileId(claims),
      student: studentPayload!,
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

    const [createdStudent] = toCreatedStudentResponses(
      [
        {
          studentId: result.studentId,
          username: result.username,
          displayName: result.displayName,
        },
      ],
      [preparedStudent!],
    );

    return Response.json(
      createdStudent,
      { status: 201 },
    );
  } catch (error) {
    console.error('Unexpected error in create-student', error);
    return Response.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
