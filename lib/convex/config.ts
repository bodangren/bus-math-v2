const DEFAULT_LOCAL_CONVEX_HOST = '127.0.0.1';
const DEFAULT_LOCAL_CONVEX_PORT = '3210';

export const DEFAULT_LOCAL_CONVEX_URL = `http://${DEFAULT_LOCAL_CONVEX_HOST}:${DEFAULT_LOCAL_CONVEX_PORT}`;
type EnvLike = Record<string, string | undefined>;

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function getConfiguredConvexUrl(env: EnvLike): string | null {
  const configuredUrl = env.CONVEX_URL?.trim() || env.NEXT_PUBLIC_CONVEX_URL?.trim();
  return configuredUrl ? normalizeUrl(configuredUrl) : null;
}

export function getConvexUrl(env: EnvLike = process.env): string {
  return getConfiguredConvexUrl(env) ?? DEFAULT_LOCAL_CONVEX_URL;
}
