type EnvLike = Record<string, string | undefined>;

export function isDemoProvisioningEnabled(env: EnvLike = process.env): boolean {
  const vercelEnv = env.VERCEL_ENV?.trim();
  const nodeEnv = env.NODE_ENV?.trim();

  if (vercelEnv === 'preview' || nodeEnv === 'production') {
    return false;
  }

  return nodeEnv === 'development' || nodeEnv === 'test';
}
