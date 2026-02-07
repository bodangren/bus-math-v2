import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SCHEMA_DIR = path.join(ROOT, 'lib', 'db', 'schema');
const SUPABASE_MIGRATIONS_DIR = path.join(ROOT, 'supabase', 'migrations');

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPgTableNames(): string[] {
  const files = fs.readdirSync(SCHEMA_DIR).filter((file) => file.endsWith('.ts'));
  const tableNames = new Set<string>();

  for (const file of files) {
    const content = fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8');
    const matches = content.matchAll(/pgTable\(\s*['\"]([^'\"]+)['\"]/g);

    for (const match of matches) {
      tableNames.add(match[1]);
    }
  }

  return [...tableNames].sort();
}

function getSupabaseMigrationSql(): string {
  const sqlFiles = fs
    .readdirSync(SUPABASE_MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  return sqlFiles
    .map((file) => fs.readFileSync(path.join(SUPABASE_MIGRATIONS_DIR, file), 'utf8'))
    .join('\n');
}

describe('drizzle schema to supabase SQL parity', () => {
  it('keeps every Drizzle pgTable represented in Supabase migrations', () => {
    const tableNames = getPgTableNames();
    const migrationsSql = getSupabaseMigrationSql();

    const missing = tableNames.filter((tableName) => {
      const pattern = new RegExp(`\\b${escapeRegExp(tableName)}\\b`, 'i');
      return !pattern.test(migrationsSql);
    });

    expect(missing).toEqual([]);
  });
});
