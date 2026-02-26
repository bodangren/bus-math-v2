import { describe, expect, it } from 'vitest';

import {
  hashPassword,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from '@/lib/auth/session';

describe('lib/auth/session', () => {
  it('signs and verifies session JWT claims', async () => {
    const secret = 'test-secret-key';
    const token = await signSessionToken(
      {
        sub: 'profile_123',
        username: 'demo_teacher',
        role: 'teacher',
        organizationId: 'org_123',
      },
      secret,
      60,
    );

    const claims = await verifySessionToken(token, secret);

    expect(claims).not.toBeNull();
    expect(claims?.sub).toBe('profile_123');
    expect(claims?.username).toBe('demo_teacher');
    expect(claims?.role).toBe('teacher');
    expect(claims?.organizationId).toBe('org_123');
  });

  it('rejects JWT with wrong secret', async () => {
    const token = await signSessionToken(
      {
        sub: 'profile_123',
        username: 'demo_student',
        role: 'student',
      },
      'secret-a',
      60,
    );

    const claims = await verifySessionToken(token, 'secret-b');
    expect(claims).toBeNull();
  });

  it('hashes and verifies password with PBKDF2', async () => {
    const password = 'demo123';
    const salt = 'fixed-salt-for-test';
    const iterations = 120000;

    const passwordHash = await hashPassword(password, salt, iterations);

    await expect(
      verifyPassword(password, { salt, iterations, passwordHash }),
    ).resolves.toBe(true);
    await expect(
      verifyPassword('wrong-password', { salt, iterations, passwordHash }),
    ).resolves.toBe(false);
  });
});
