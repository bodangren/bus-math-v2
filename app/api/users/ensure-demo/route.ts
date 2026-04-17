import { NextResponse } from 'next/server';

import { PASSWORD_HASH_ITERATIONS } from '@/lib/auth/constants';
import { isDemoProvisioningEnabled } from '@/lib/auth/demo-provisioning';
import { requireAdminRequestClaims } from '@/lib/auth/server';
import { generatePasswordSalt, hashPassword } from '@/lib/auth/session';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

function getDemoUsers() {
  return [
    { username: 'demo_teacher', role: 'teacher' as const, password: process.env.DEMO_TEACHER_PASSWORD ?? 'demo123' },
    { username: 'demo_student', role: 'student' as const, password: process.env.DEMO_STUDENT_PASSWORD ?? 'demo123' },
    { username: 'demo_admin', role: 'admin' as const, password: process.env.DEMO_ADMIN_PASSWORD ?? 'demo123' },
  ];
}

export async function POST(request: Request) {
  try {
    if (!isDemoProvisioningEnabled()) {
      return NextResponse.json(
        { error: 'Demo provisioning is unavailable in this environment' },
        { status: 403 },
      );
    }

    const claimsOrResponse = await requireAdminRequestClaims(request);
    if (claimsOrResponse instanceof Response) {
      return claimsOrResponse;
    }

    const results = [] as Array<{ username: string; status: string }>;

    for (const user of getDemoUsers()) {
      const profileResult = await fetchInternalMutation(internal.auth.ensureProfileByUsername, {
        username: user.username,
        role: user.role,
      });

      if (!profileResult.ok) {
        results.push({ username: user.username, status: profileResult.reason });
        continue;
      }

      const salt = generatePasswordSalt();
      const passwordHash = await hashPassword(user.password, salt, PASSWORD_HASH_ITERATIONS);

      const result = await fetchInternalMutation(internal.auth.upsertCredentialByUsername, {
        username: user.username,
        role: user.role,
        passwordHash,
        passwordSalt: salt,
        passwordHashIterations: PASSWORD_HASH_ITERATIONS,
        isActive: true,
      });

      results.push({
        username: user.username,
        status: result.ok ? (result.updated ? 'updated' : 'created') : result.reason,
      });
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error('Failed to ensure demo credentials', error);
    return NextResponse.json({ error: 'Failed to ensure demo credentials' }, { status: 500 });
  }
}
