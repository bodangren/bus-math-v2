import { z } from 'zod';
import { getRequestSessionClaims } from '@/lib/auth/server';
import { createAdminClient } from '@/lib/supabase/admin';

const requestSchema = z.object({
  studentId: z.string().uuid('studentId must be a valid UUID'),
});

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function generateRandomPassword(length = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length]).join('');
}

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

    const admin = createAdminClient();

    const { data: teacherProfile, error: teacherError } = await admin
      .from('profiles')
      .select('id, role, organization_id')
      .eq('id', claims.sub)
      .maybeSingle();

    if (teacherError || !teacherProfile) {
      return Response.json({ error: 'Teacher profile not found' }, { status: 403 });
    }

    if (teacherProfile.role !== 'teacher' && teacherProfile.role !== 'admin') {
      return Response.json({ error: 'Only teachers can reset student passwords' }, { status: 403 });
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

    const nextPassword = generateRandomPassword(12);
    const { error: updateAuthError } = await admin.auth.admin.updateUserById(studentProfile.id, {
      password: nextPassword,
    });

    if (updateAuthError) {
      return Response.json({ error: 'Failed to reset student password' }, { status: 500 });
    }

    const existingMetadata = isRecord(studentProfile.metadata) ? studentProfile.metadata : {};
    const nextMetadata = {
      ...existingMetadata,
      lastPasswordResetAt: new Date().toISOString(),
      lastPasswordResetBy: teacherProfile.id,
    };

    const { error: metadataError } = await admin
      .from('profiles')
      .update({
        metadata: nextMetadata,
      })
      .eq('id', studentProfile.id);

    if (metadataError) {
      return Response.json({ error: 'Password reset succeeded but audit metadata failed to save' }, { status: 500 });
    }

    return Response.json({
      studentId: studentProfile.id,
      username: studentProfile.username,
      displayName: studentProfile.display_name ?? studentProfile.username,
      password: nextPassword,
    });
  } catch (error) {
    console.error('Unexpected error in reset-student-password', error);
    return Response.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
