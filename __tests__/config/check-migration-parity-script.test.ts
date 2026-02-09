import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { checkMigrationParity } from '../../scripts/check-migration-parity.mjs';

function writeFixture(tmpRoot: string, { includeGhostDrizzleTable }: { includeGhostDrizzleTable: boolean }) {
  const migrationsDir = path.join(tmpRoot, 'supabase', 'migrations');
  const schemaDir = path.join(tmpRoot, 'lib', 'db', 'schema');

  fs.mkdirSync(migrationsDir, { recursive: true });
  fs.mkdirSync(schemaDir, { recursive: true });

  fs.writeFileSync(
    path.join(migrationsDir, '20260101000000_init.sql'),
    [
      'create table if not exists lessons (id uuid primary key);',
      'create table if not exists activities (id uuid primary key);',
      'create table if not exists activity_completions (id uuid primary key);',
      'create or replace function complete_activity_atomic() returns void as $$ begin return; end; $$ language plpgsql;',
      'alter table activity_completions enable row level security;',
      'create policy "Students can insert own completions" on activity_completions for insert using (true);',
      'create policy "Students can view own completions" on activity_completions for select using (true);',
      'create policy "Teachers can view all completions" on activity_completions for select using (true);',
      'grant execute on function complete_activity_atomic to authenticated;',
    ].join('\n'),
    'utf8',
  );

  const drizzleTables = includeGhostDrizzleTable
    ? "export const ghost = pgTable('ghost_table', {} as never);\n"
    : '';

  fs.writeFileSync(
    path.join(schemaDir, 'tables.ts'),
    [
      "import { pgTable } from 'drizzle-orm/pg-core';",
      "export const lessons = pgTable('lessons', {} as never);",
      "export const activities = pgTable('activities', {} as never);",
      "export const activityCompletions = pgTable('activity_completions', {} as never);",
      drizzleTables,
    ].join('\n'),
    'utf8',
  );
}

describe('scripts/check-migration-parity.mjs', () => {
  it('fails when Drizzle contains table definitions not present in Supabase migrations', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-drift-'));
    writeFixture(tmpRoot, { includeGhostDrizzleTable: true });

    const result = checkMigrationParity({ repoRoot: tmpRoot });

    expect(result.ok).toBe(false);
    expect(result.drizzleMissingInSupabase).toContain('ghost_table');
  });

  it('treats quoted table DDL and dropped legacy tables as parity-safe', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-quoted-ddl-'));
    const migrationsDir = path.join(tmpRoot, 'supabase', 'migrations');
    const schemaDir = path.join(tmpRoot, 'lib', 'db', 'schema');

    fs.mkdirSync(migrationsDir, { recursive: true });
    fs.mkdirSync(schemaDir, { recursive: true });

    fs.writeFileSync(
      path.join(migrationsDir, '20260101000000_init.sql'),
      [
        'create table if not exists lessons (id uuid primary key);',
        'create table if not exists "phases" (id uuid primary key);',
        'create table if not exists "activity_completions" (id uuid primary key);',
        'create table if not exists "lesson_versions" (id uuid primary key);',
        'alter table public.phases rename to phases_deprecated;',
        'drop table if exists phases_deprecated;',
        'create or replace function complete_activity_atomic() returns void as $$ begin return; end; $$ language plpgsql;',
        'alter table activity_completions enable row level security;',
        'create policy "Students can insert own completions" on activity_completions for insert using (true);',
        'create policy "Students can view own completions" on activity_completions for select using (true);',
        'create policy "Teachers can view all completions" on activity_completions for select using (true);',
        'grant execute on function complete_activity_atomic to authenticated;',
      ].join('\n'),
      'utf8',
    );

    fs.writeFileSync(
      path.join(schemaDir, 'tables.ts'),
      [
        "import { pgTable } from 'drizzle-orm/pg-core';",
        "export const lessons = pgTable('lessons', {} as never);",
        "export const lessonVersions = pgTable('lesson_versions', {} as never);",
        "export const activityCompletions = pgTable('activity_completions', {} as never);",
      ].join('\n'),
      'utf8',
    );

    const result = checkMigrationParity({ repoRoot: tmpRoot });

    expect(result.ok).toBe(true);
    expect(result.drizzleMissingInSupabase).toEqual([]);
    expect(result.supabaseMissingInDrizzle).toEqual([]);
  });
});
