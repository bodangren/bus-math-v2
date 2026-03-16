import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function read(relativePath: string) {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
}

describe('Cloudflare launch hardening', () => {
  it('keeps the Worker entry delegated to the built Vinext server with an assets fallback', () => {
    const workerSource = read('cloudflare/worker.ts');

    expect(workerSource).toContain("import('../dist/server/index.js')");
    expect(workerSource).toContain('env.ASSETS.fetch(request)');
    expect(workerSource).not.toContain('Baseline Worker shell until');
  });

  it('documents the required launch secrets, seeding, deployment, and verification steps', () => {
    const checklistSource = read('conductor/docs/architecture/cloudflare-launch-checklist.md');

    expect(checklistSource).toContain('NEXT_PUBLIC_CONVEX_URL');
    expect(checklistSource).toContain('CONVEX_DEPLOY_KEY');
    expect(checklistSource).toContain('AUTH_JWT_SECRET');
    expect(checklistSource).toContain('npx convex run seed:seedDemoAccounts');
    expect(checklistSource).toContain('npx convex run seed:seedPublishedCurriculum');
    expect(checklistSource).toContain('npx --yes wrangler deploy --config wrangler.jsonc');
    expect(checklistSource).toContain('npm run lint');
    expect(checklistSource).toContain('npm test');
    expect(checklistSource).toContain('npm run build');
  });

  it('links the launch checklist from the active deployment docs', () => {
    const readme = read('README.md');
    const runtimeDoc = read('conductor/docs/architecture/runtime.md');

    expect(readme).toContain('cloudflare-launch-checklist');
    expect(runtimeDoc).toContain('cloudflare-launch-checklist');
  });
});
