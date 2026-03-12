import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function fileExists(relativePath: string) {
  return fs.existsSync(path.resolve(process.cwd(), relativePath));
}

function read(relativePath: string) {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
}

describe('curriculum runtime foundation', () => {
  it('quarantines stale Supabase and Drizzle debug surfaces from the active app shell', () => {
    expect(fileExists('app/api/test-db/route.ts')).toBe(false);
    expect(fileExists('app/api/test-supabase/route.ts')).toBe(false);
    expect(fileExists('app/protected/db-test/page.tsx')).toBe(false);

    const proxySource = read('proxy.ts');
    expect(proxySource).not.toContain('/api/test-db');
    expect(proxySource).not.toContain('/api/test-supabase');
  });

  it('does not keep a separate phase-1 admin dashboard surface', () => {
    expect(fileExists('app/admin/dashboard/page.tsx')).toBe(false);

    const readme = read('README.md');
    expect(readme).toContain('students and teachers');
    expect(readme).not.toMatch(/administrators/i);
  });

  it('defines a Cloudflare Worker deployment baseline for the production target', () => {
    expect(fileExists('wrangler.jsonc')).toBe(true);

    const wranglerConfig = read('wrangler.jsonc');
    expect(wranglerConfig).toContain('"compatibility_date"');
    expect(wranglerConfig).toContain('"main"');
    expect(wranglerConfig).toContain('"assets"');
    expect(wranglerConfig).toContain('NEXT_PUBLIC_CONVEX_URL');
    expect(wranglerConfig).toContain('CONVEX_DEPLOY_KEY');
    expect(wranglerConfig).toContain('AUTH_JWT_SECRET');
  });
});
