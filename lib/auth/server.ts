import { cookies } from 'next/headers';

import { SESSION_COOKIE_NAME, getAuthJwtSecret } from '@/lib/auth/constants';
import { SessionClaims, verifySessionToken } from '@/lib/auth/session';

export async function getServerSessionClaims(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token, getAuthJwtSecret());
}

function getCookieValueFromHeader(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;

  const entries = cookieHeader.split(';');
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) continue;

    const name = trimmed.slice(0, separatorIndex).trim();
    if (name !== key) continue;

    return decodeURIComponent(trimmed.slice(separatorIndex + 1));
  }

  return null;
}

export async function getRequestSessionClaims(request: Request): Promise<SessionClaims | null> {
  const token = getCookieValueFromHeader(request.headers.get('cookie'), SESSION_COOKIE_NAME);
  if (!token) return null;

  return verifySessionToken(token, getAuthJwtSecret());
}
