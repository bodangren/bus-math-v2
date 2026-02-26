export const SESSION_COOKIE_NAME = 'bm_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 12;
export const PASSWORD_HASH_ITERATIONS = 120000;

export function getAuthJwtSecret(): string {
  const envSecret = process.env.AUTH_JWT_SECRET;
  if (envSecret && envSecret.trim().length > 0) {
    return envSecret;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'dev-insecure-auth-secret-change-me';
  }

  throw new Error('Missing AUTH_JWT_SECRET');
}
