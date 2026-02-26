import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { api } from '@/convex/_generated/api';
import { SESSION_COOKIE_NAME, getAuthJwtSecret } from '@/lib/auth/constants';
import { verifySessionToken } from '@/lib/auth/session';
import { fetchQuery } from '@/lib/convex/server';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const claims = await verifySessionToken(token, getAuthJwtSecret());
  if (!claims) {
    cookieStore.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
    return NextResponse.json({ authenticated: false });
  }

  const profile = await fetchQuery(api.activities.getProfileById, {
    profileId: claims.sub,
  });

  if (!profile) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: claims.sub,
      username: claims.username,
      role: claims.role,
    },
    profile: {
      id: profile.id,
      organization_id: profile.organizationId,
      username: profile.username,
      role: profile.role,
      display_name: profile.displayName ?? null,
      avatar_url: null,
      metadata: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
}
