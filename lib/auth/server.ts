import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE_NAME, getAuthJwtSecret } from '@/lib/auth/constants';
import { SessionClaims, verifySessionToken } from '@/lib/auth/session';

/**
 * Reads and verifies the authenticated session claims from the server cookie jar.
 */
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

/**
 * Reads session claims from a request cookie header instead of Next's server cookie store.
 */
export async function getRequestSessionClaims(request: Request): Promise<SessionClaims | null> {
  const token = getCookieValueFromHeader(request.headers.get('cookie'), SESSION_COOKIE_NAME);
  if (!token) return null;

  return verifySessionToken(token, getAuthJwtSecret());
}

function buildLoginRedirect(loginRedirectPath: string): string {
  return `/auth/login?redirect=${loginRedirectPath}`;
}

/**
 * Requires an authenticated server session and redirects to login when none exists.
 */
export async function requireServerSessionClaims(
  loginRedirectPath: string,
): Promise<SessionClaims> {
  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect(buildLoginRedirect(loginRedirectPath));
  }

  return claims;
}

/**
 * Requires the given session claims to match one of the allowed roles.
 */
export function requireServerRoles<T extends SessionClaims>(
  claims: T,
  allowedRoles: ReadonlyArray<SessionClaims['role']>,
  unauthorizedRedirectPath: string,
): T {
  if (!allowedRoles.includes(claims.role)) {
    redirect(unauthorizedRedirectPath);
  }

  return claims;
}

/**
 * Requires a teacher or admin server session for teacher-facing pages.
 */
export async function requireTeacherSessionClaims(
  loginRedirectPath: string,
  unauthorizedRedirectPath = '/student/dashboard',
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);
  return requireServerRoles(claims, ['teacher', 'admin'], unauthorizedRedirectPath);
}

/**
 * Requires an admin server session for admin-facing pages.
 */
export async function requireAdminSessionClaims(
  loginRedirectPath: string,
  unauthorizedRedirectPath = '/student/dashboard',
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);
  return requireServerRoles(claims, ['admin'], unauthorizedRedirectPath);
}
