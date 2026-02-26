type UserRole = 'student' | 'teacher' | 'admin';

export interface SessionClaims {
  sub: string;
  username: string;
  role: UserRole;
  organizationId?: string;
  iat: number;
  exp: number;
}

export interface SessionTokenInput {
  sub: string;
  username: string;
  role: UserRole;
  organizationId?: string;
}

export interface PasswordCredential {
  salt: string;
  iterations: number;
  passwordHash: string;
}

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa === 'function') {
    return btoa(binary);
  }

  return Buffer.from(binary, 'binary').toString('base64');
}

function fromBase64(value: string): Uint8Array {
  const binary =
    typeof atob === 'function'
      ? atob(value)
      : Buffer.from(value, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return fromBase64(padded);
}

function base64UrlEncodeString(value: string): string {
  return base64UrlEncodeBytes(encoder.encode(value));
}

function base64UrlDecodeToString(value: string): string {
  const bytes = base64UrlDecodeToBytes(value);
  return new TextDecoder().decode(bytes);
}

async function hmacSign(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return new Uint8Array(signature);
}

function timingSafeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export async function signSessionToken(
  input: SessionTokenInput,
  secret: string,
  ttlSeconds = 60 * 60 * 12,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claims: SessionClaims = {
    ...input,
    iat: now,
    exp: now + ttlSeconds,
  };

  const header = base64UrlEncodeString(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncodeString(JSON.stringify(claims));
  const signingInput = `${header}.${payload}`;
  const signature = await hmacSign(signingInput, secret);
  return `${signingInput}.${base64UrlEncodeBytes(signature)}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionClaims | null> {
  const segments = token.split('.');
  if (segments.length !== 3) return null;

  const [header, payload, signature] = segments;
  const signingInput = `${header}.${payload}`;
  const expectedSig = await hmacSign(signingInput, secret);
  const actualSig = base64UrlDecodeToBytes(signature);

  if (!timingSafeEquals(expectedSig, actualSig)) {
    return null;
  }

  let claims: SessionClaims;
  try {
    claims = JSON.parse(base64UrlDecodeToString(payload)) as SessionClaims;
  } catch {
    return null;
  }

  if (!claims?.sub || !claims?.username || !claims?.role || !claims?.exp || !claims?.iat) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (claims.exp <= now) {
    return null;
  }

  return claims;
}

export async function hashPassword(password: string, salt: string, iterations: number): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      iterations,
    },
    keyMaterial,
    256,
  );

  return base64UrlEncodeBytes(new Uint8Array(derived));
}

export async function verifyPassword(
  password: string,
  credential: PasswordCredential,
): Promise<boolean> {
  const candidate = await hashPassword(password, credential.salt, credential.iterations);
  const a = encoder.encode(candidate);
  const b = encoder.encode(credential.passwordHash);
  return timingSafeEquals(a, b);
}

export function generatePasswordSalt(bytes = 16): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return base64UrlEncodeBytes(values);
}
