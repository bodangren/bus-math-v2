import { spawn } from 'node:child_process';

const processes = [
  { name: 'convex', command: 'npx', args: ['convex', 'dev'] },
  { name: 'vinext', command: 'npx', args: ['vinext', 'dev'] },
];

const children = new Set();
let shuttingDown = false;

function stopChildren(signal = 'SIGTERM') {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
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
