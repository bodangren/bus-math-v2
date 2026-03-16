import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

function readJsonIfPresent(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function resolvePinnedConvexVersion(projectRoot) {
  const packageLock = readJsonIfPresent(path.join(projectRoot, 'package-lock.json'));
  const lockedVersion = packageLock?.packages?.['node_modules/convex']?.version;

  if (typeof lockedVersion === 'string' && lockedVersion.length > 0) {
    return lockedVersion;
  }

  const packageJson = readJsonIfPresent(path.join(projectRoot, 'package.json'));
  const declaredVersion =
    packageJson?.dependencies?.convex?.trim() ||
    packageJson?.devDependencies?.convex?.trim();

  if (!declaredVersion) {
    return null;
  }

  const normalizedVersion = declaredVersion.replace(/^[~^]/, '');
  return /^\d+\.\d+\.\d+(?:[-+].+)?$/.test(normalizedVersion)
    ? normalizedVersion
    : null;
}

export function resolveConvexCliPackageSpec(projectRoot = process.cwd()) {
  const pinnedVersion = resolvePinnedConvexVersion(projectRoot);
  return pinnedVersion ? `convex@${pinnedVersion}` : 'convex';
}

export function createProcesses(projectRoot = process.cwd()) {
  return [
    {
      name: 'convex',
      command: 'npx',
      // Force npm to execute the published CLI package rather than a stubbed local SDK install.
      // Let Convex own the Vinext child process so startup stays ordered and shutdown is coordinated.
      args: [
        '--yes',
        '--package',
        resolveConvexCliPackageSpec(projectRoot),
        'convex',
        'dev',
        '--local',
        '--run-sh',
        'npx vinext dev',
      ],
    },
  ];
}

export function runDevStack(processes = createProcesses()) {
  const children = new Set();
  let shuttingDown = false;

  function stopChildren(signal = 'SIGTERM') {
    for (const child of children) {
      if (child.killed) {
        continue;
      }

      if (process.platform !== 'win32' && typeof child.pid === 'number') {
        try {
          process.kill(-child.pid, signal);
          continue;
        } catch {
          // Fall through to direct child termination when the process group no longer exists.
        }
      }

      child.kill(signal);
    }
  }

  function exitWith(code) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    stopChildren('SIGTERM');
    setTimeout(() => stopChildren('SIGKILL'), 3000).unref();
    process.exit(code);
  }

  for (const processConfig of processes) {
    const child = spawn(processConfig.command, processConfig.args, {
      stdio: 'inherit',
      env: process.env,
      detached: process.platform !== 'win32',
    });

    children.add(child);

    child.on('exit', (code, signal) => {
      children.delete(child);

      if (shuttingDown) {
        return;
      }

      if (signal) {
        exitWith(1);
        return;
      }

      exitWith(code ?? 1);
    });

    child.on('error', (error) => {
      console.error(`[dev:stack] Failed to start ${processConfig.name}:`, error);
      exitWith(1);
    });
  }

  process.on('SIGINT', () => exitWith(130));
  process.on('SIGTERM', () => exitWith(143));
}

const isDirectExecution =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  runDevStack();
}
