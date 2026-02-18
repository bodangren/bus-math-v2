import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const requestSchema = z
  .object({
    studentId: z.string().uuid('studentId must be a valid UUID'),
    displayName: z.string().trim().min(1).max(80).optional(),
    deactivate: z.boolean().optional(),
  })
  .refine((value) => value.displayName !== undefined || value.deactivate !== undefined, {
    message: 'Provide displayName and/or deactivate',
    path: ['displayName'],
  });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
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

    const admin = createAdminClient();

    const { data: teacherProfile, error: teacherError } = await admin
      .from('profiles')
      .select('id, role, organization_id')
      .eq('id', user.id)
      .maybeSingle();

    if (teacherError || !teacherProfile) {
      return Response.json({ error: 'Teacher profile not found' }, { status: 403 });
    }

    if (teacherProfile.role !== 'teacher' && teacherProfile.role !== 'admin') {
      return Response.json({ error: 'Only teachers can manage students' }, { status: 403 });
    }

    const { data: studentProfile, error: studentError } = await admin
      .from('profiles')
      .select('id, role, organization_id, username, display_name, metadata')
      .eq('id', parsedBody.data.studentId)
      .maybeSingle();

    if (
      studentError ||
      !studentProfile ||
      studentProfile.role !== 'student' ||
      studentProfile.organization_id !== teacherProfile.organization_id
    ) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    const nextDisplayName = parsedBody.data.displayName ?? studentProfile.display_name ?? studentProfile.username;
    const existingMetadata = isRecord(studentProfile.metadata) ? studentProfile.metadata : {};
    const nowIso = new Date().toISOString();
    const deactivated =
      parsedBody.data.deactivate !== undefined
        ? parsedBody.data.deactivate
        : Boolean(existingMetadata.isDeactivated);

    if (parsedBody.data.deactivate !== undefined) {
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(studentProfile.id, {
        ban_duration: parsedBody.data.deactivate ? '876000h' : 'none',
      });

      if (authUpdateError) {
        return Response.json({ error: 'Failed to update student auth status' }, { status: 500 });
      }
    }

    const nextMetadata: Record<string, unknown> = {
      ...existingMetadata,
      isDeactivated: deactivated,
      accountStatus: deactivated ? 'deactivated' : 'active',
      lastStudentProfileUpdateAt: nowIso,
      lastStudentProfileUpdateBy: teacherProfile.id,
    };

    if (parsedBody.data.deactivate === true) {
      nextMetadata.deactivatedAt = nowIso;
      nextMetadata.deactivatedBy = teacherProfile.id;
    }

    if (parsedBody.data.deactivate === false) {
      nextMetadata.reactivatedAt = nowIso;
      nextMetadata.reactivatedBy = teacherProfile.id;
    }

    const { error: updateError } = await admin
      .from('profiles')
      .update({
        display_name: nextDisplayName,
        metadata: nextMetadata,
      })
      .eq('id', studentProfile.id);

    if (updateError) {
      return Response.json({ error: 'Failed to update student profile' }, { status: 500 });
    }

    return Response.json({
      studentId: studentProfile.id,
      username: studentProfile.username,
      displayName: nextDisplayName,
      deactivated,
    });
  } catch (error) {
    console.error('Unexpected error in update-student', error);
    return Response.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
