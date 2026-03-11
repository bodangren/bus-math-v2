import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

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

function buildRequestUnauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function buildRequestForbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Requires an authenticated request session and returns a JSON 401 response when absent.
 */
export async function requireRequestSessionClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
): Promise<SessionClaims | Response> {
  const claims = await getRequestSessionClaims(request);
  if (!claims) {
    return buildRequestUnauthorizedResponse(unauthorizedMessage);
  }

  return claims;
}

/**
 * Requires a student request session for APIs that mutate learner-owned data.
 */
export async function requireStudentRequestClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
  forbiddenMessage = 'Forbidden',
): Promise<SessionClaims | Response> {
  const claimsOrResponse = await requireRequestSessionClaims(request, unauthorizedMessage);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  if (claimsOrResponse.role !== 'student') {
    return buildRequestForbiddenResponse(forbiddenMessage);
  }

  return claimsOrResponse;
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
 * Requires a student server session for student-facing dashboard routes.
 * Teacher/admin sessions are redirected to their own dashboard surfaces.
 */
export async function requireStudentSessionClaims(
  loginRedirectPath: string,
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);

  if (claims.role === 'student') {
    return claims;
  }

  if (claims.role === 'teacher') {
    redirect('/teacher');
  }

  if (claims.role === 'admin') {
    redirect('/admin/dashboard');
  }

  redirect(buildLoginRedirect(loginRedirectPath));
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
