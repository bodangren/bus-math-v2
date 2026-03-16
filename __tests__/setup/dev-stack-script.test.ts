import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Dev Stack Script', () => {
  it('defines a combined app and Convex dev command', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    expect(pkg.scripts['dev:stack']).toBe('node scripts/dev-stack.mjs');
  });

  it('pins the Convex CLI package and runs Vinext through a local Convex parent process', async () => {
    const packageLockPath = path.resolve(process.cwd(), 'package-lock.json');
    const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
    const lockedConvexVersion = packageLock.packages['node_modules/convex']?.version;

    expect(lockedConvexVersion).toBeTruthy();

    const scriptModulePath = path.resolve(process.cwd(), 'scripts/dev-stack.mjs');
    const { createProcesses, resolveConvexCliPackageSpec } = await import(scriptModulePath);
    const processes = createProcesses(process.cwd());
    const convexProcess = processes.find(
      (processConfig: { name: string }) => processConfig.name === 'convex',
    );

    expect(resolveConvexCliPackageSpec(process.cwd())).toBe(`convex@${lockedConvexVersion}`);
    expect(convexProcess).toEqual({
      name: 'convex',
      command: 'npx',
      args: [
        '--yes',
        '--package',
        `convex@${lockedConvexVersion}`,
        'convex',
        'dev',
        '--local',
        '--run-sh',
        'npx vinext dev',
      ],
    });
    expect(processes).toHaveLength(1);
  });
});
