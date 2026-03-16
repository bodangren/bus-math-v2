type EnvLike = Record<string, string | undefined>;

interface ResolveConvexAdminAuthOptions {
  cwd?: string;
  env?: EnvLike;
  homeDir?: string;
}

interface ConvexAdminAuth {
  source: 'deploy-key' | 'local-admin-key';
  token: string;
}

function isProductionRuntime(env: EnvLike): boolean {
  return env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production';
}

async function findAdminKeyInConfigRoot(configRoot: string): Promise<string | null> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  let directoryEntries;

  try {
    directoryEntries = await fs.readdir(configRoot, { withFileTypes: true });
  } catch {
    return null;
  }

  const configPaths = directoryEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(configRoot, entry.name, 'config.json'))
    .sort((left, right) => left.localeCompare(right));

  for (const configPath of configPaths) {
    try {
      const rawConfig = await fs.readFile(configPath, 'utf8');
      const parsedConfig = JSON.parse(rawConfig) as { adminKey?: unknown };
      if (typeof parsedConfig.adminKey === 'string' && parsedConfig.adminKey.trim().length > 0) {
        return parsedConfig.adminKey.trim();
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function readLocalConvexAdminKey(
  cwd: string,
  homeDir?: string,
): Promise<string | null> {
  const path = await import('node:path');
  const os = await import('node:os');

  const configRoots = [
    path.join(cwd, '.convex', 'local'),
    path.join(homeDir ?? os.homedir(), '.convex'),
  ];

  for (const configRoot of configRoots) {
    const adminKey = await findAdminKeyInConfigRoot(configRoot);
    if (adminKey) {
      return adminKey;
    }
  }

  return null;
}

export async function resolveConvexAdminAuth(
  options: ResolveConvexAdminAuthOptions = {},
): Promise<ConvexAdminAuth> {
  const env = options.env ?? process.env;
  const deployKey = env.CONVEX_DEPLOY_KEY?.trim();

  if (deployKey) {
    return {
      source: 'deploy-key',
      token: deployKey,
    };
  }

  if (isProductionRuntime(env)) {
    throw new Error(
      'Missing Convex admin auth. Set CONVEX_DEPLOY_KEY for production server-side internal function calls.',
    );
  }

  const localAdminKey = await readLocalConvexAdminKey(
    options.cwd ?? process.cwd(),
    options.homeDir,
  );
  if (localAdminKey) {
    return {
      source: 'local-admin-key',
      token: localAdminKey,
    };
  }

  throw new Error(
    'Missing Convex admin auth. Start `npm run dev:stack` or `npx convex dev --local` locally, or set CONVEX_DEPLOY_KEY for server-side internal function calls.',
  );
}
