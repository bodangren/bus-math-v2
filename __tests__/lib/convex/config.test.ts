import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

async function loadModule() {
  vi.resetModules();
  return import('@/lib/convex/config');
}

async function loadAdminModule() {
  vi.resetModules();
  return import('@/lib/convex/admin');
}

function writeProjectLocalConvexConfig(rootDir: string, adminKey: string) {
  const configDir = path.join(rootDir, '.convex', 'local', 'default');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(
    path.join(configDir, 'config.json'),
    JSON.stringify({
      ports: { cloud: 3210, site: 3211 },
      adminKey,
      deploymentName: 'local-test-deployment',
    }),
    'utf8',
  );
}

function writeHomeLocalConvexConfig(homeDir: string, adminKey: string) {
  const configDir = path.join(homeDir, '.convex', 'anonymous-convex-backend-state');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(
    path.join(configDir, 'config.json'),
    JSON.stringify({
      adminKey,
      deploymentName: 'anonymous-local-deployment',
      ports: { cloud: 3210, site: 3211 },
      uuid: 'local-anonymous-state',
    }),
    'utf8',
  );
}

describe('lib/convex/config', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllEnvs();
  });

  it('uses NEXT_PUBLIC_CONVEX_URL when configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_CONVEX_URL', 'https://demo.convex.cloud');

    const { getConvexUrl } = await loadModule();

    expect(getConvexUrl()).toBe('https://demo.convex.cloud');
  });

  it('falls back to one canonical local default URL', async () => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
    delete process.env.CONVEX_URL;

    const { DEFAULT_LOCAL_CONVEX_URL, getConvexUrl } = await loadModule();

    expect(getConvexUrl()).toBe(DEFAULT_LOCAL_CONVEX_URL);
    expect(DEFAULT_LOCAL_CONVEX_URL).toBe('http://127.0.0.1:3210');
  });

  it('prefers CONVEX_DEPLOY_KEY over local admin-key fallback', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'convex-config-test-'));
    writeProjectLocalConvexConfig(tempDir, 'local-admin-key');
    vi.stubEnv('CONVEX_DEPLOY_KEY', 'deploy-key');
    vi.stubEnv('NODE_ENV', 'development');

    const { resolveConvexAdminAuth } = await loadAdminModule();

    await expect(resolveConvexAdminAuth({ cwd: tempDir })).resolves.toEqual({
      source: 'deploy-key',
      token: 'deploy-key',
    });
  });

  it('uses the project-local .convex admin key when deploy key is absent in development', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'convex-config-test-'));
    writeProjectLocalConvexConfig(tempDir, 'local-admin-key');
    delete process.env.CONVEX_DEPLOY_KEY;
    vi.stubEnv('NODE_ENV', 'development');

    const { resolveConvexAdminAuth } = await loadAdminModule();

    await expect(resolveConvexAdminAuth({ cwd: tempDir })).resolves.toEqual({
      source: 'local-admin-key',
      token: 'local-admin-key',
    });
  });

  it('uses the home-directory Convex state when the project-local path is absent', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'convex-config-test-'));
    const tempHomeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'convex-home-test-'));
    writeHomeLocalConvexConfig(tempHomeDir, 'home-local-admin-key');
    delete process.env.CONVEX_DEPLOY_KEY;
    vi.stubEnv('NODE_ENV', 'development');

    const { resolveConvexAdminAuth } = await loadAdminModule();

    await expect(
      resolveConvexAdminAuth({ cwd: tempDir, homeDir: tempHomeDir }),
    ).resolves.toEqual({
      source: 'local-admin-key',
      token: 'home-local-admin-key',
    });
  });

  it('fails explicitly in production when no admin auth is configured', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'convex-config-test-'));
    delete process.env.CONVEX_DEPLOY_KEY;
    vi.stubEnv('NODE_ENV', 'production');

    const { resolveConvexAdminAuth } = await loadAdminModule();

    await expect(resolveConvexAdminAuth({ cwd: tempDir })).rejects.toThrow(
      'Missing Convex admin auth. Set CONVEX_DEPLOY_KEY for production server-side internal function calls.',
    );
  });
});
