import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');
const phasesSchemaPath = path.join(root, 'lib', 'db', 'schema', 'phases.ts');
const validatorsPath = path.join(root, 'lib', 'db', 'schema', 'validators.ts');

function readAllMigrations(): string {
  const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
  return files.map((file) => fs.readFileSync(path.join(migrationsDir, file), 'utf8')).join('\n');
}

describe('phase 7 final cleanup', () => {
  it('drops the deprecated legacy phases table in migrations', () => {
    const sql = readAllMigrations();

    expect(sql).toMatch(/drop\s+table\s+if\s+exists\s+public\.phases_deprecated\b/i);
  });

  it('removes the deprecated phases drizzle schema mapping', () => {
    expect(fs.existsSync(phasesSchemaPath)).toBe(false);
  });

  it('does not import legacy phases schema in validators', () => {
    const validatorsSource = fs.readFileSync(validatorsPath, 'utf8');

    expect(validatorsSource).not.toMatch(/from\s+['"]\.\/phases['"]/);
    expect(validatorsSource).not.toMatch(/createInsertSchema\(\s*phases\s*,?/);
    expect(validatorsSource).not.toMatch(/createSelectSchema\(\s*phases\s*,?/);
  });
});
