type EnvLike = Record<string, string | undefined>;

export function isDemoProvisioningEnabled(env: EnvLike = process.env): boolean {
  const vercelEnv = env.VERCEL_ENV?.trim();
  if (vercelEnv === 'preview') {
    return true;
  }

  return env.NODE_ENV !== 'production';
}
