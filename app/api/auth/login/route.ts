import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

import {
  PASSWORD_HASH_ITERATIONS,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  getAuthJwtSecret,
} from '@/lib/auth/constants';
import { signSessionToken, verifyPassword } from '@/lib/auth/session';
import { fetchInternalMutation, fetchInternalQuery, internal } from '@/lib/convex/server';

interface LoginBody {
  username?: string;
  password?: string;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

function hashIpAddress(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const username = body.username?.trim();
  const password = body.password ?? '';

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const clientIp = getClientIp(request);
  const ipHash = hashIpAddress(clientIp);

  try {
    const rateLimitResult = await fetchInternalMutation(
      internal.loginRateLimits.checkAndIncrementLoginRateLimit,
      { ipHash },
    );

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.windowExpiresAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      );
    }
  } catch (error) {
    console.error('[login] Rate limit check failed:', error);
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 503 },
    );
  }

  try {
    const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, { username });
    if (!credential) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, {
      salt: credential.passwordSalt,
      iterations: credential.passwordHashIterations ?? PASSWORD_HASH_ITERATIONS,
      passwordHash: credential.passwordHash,
    });

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    const token = await signSessionToken(
      {
        sub: credential.profileId,
        username: credential.username,
        role: credential.role,
        organizationId: credential.organizationId,
      },
      getAuthJwtSecret(),
      SESSION_TTL_SECONDS,
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Login route failed', error);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 500 });
  }
}
