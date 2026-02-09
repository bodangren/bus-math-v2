import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SUPABASE_MIGRATIONS_DIR = path.join(ROOT, 'supabase', 'migrations');

function getSupabaseMigrationSql(): string {
  const sqlFiles = fs
    .readdirSync(SUPABASE_MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  return sqlFiles
    .map((file) => fs.readFileSync(path.join(SUPABASE_MIGRATIONS_DIR, file), 'utf8'))
    .join('\n');
}

describe('competency RLS scope hardening', () => {
  it('enforces student-role self-read and role-gated teacher/admin scoped reads', () => {
    const migrationsSql = getSupabaseMigrationSql();

    expect(migrationsSql).toMatch(
      /create\s+policy\s+"Students can view their own competency records"[\s\S]*?using\s*\([\s\S]*?student_id\s*=\s*auth\.uid\(\)[\s\S]*?profiles\.role\s*=\s*'student'/i,
    );

    expect(migrationsSql).toMatch(
      /create\s+policy\s+"Teachers and admins can view scoped student competency records"[\s\S]*?using\s*\([\s\S]*?user_can_view_student\(student_id\)[\s\S]*?profiles\.role\s+in\s*\('teacher',\s*'admin'\)/i,
    );
  });

  it('keeps user_can_view_student helper org-scoped and student-targeted', () => {
    const migrationsSql = getSupabaseMigrationSql();

    expect(migrationsSql).toMatch(/create\s+or\s+replace\s+function\s+user_can_view_student\s*\(/i);
    expect(migrationsSql).toMatch(/target_student_role\s*text/i);
    expect(migrationsSql).toMatch(/current_user_org\s+uuid/i);
    expect(migrationsSql).toMatch(/target_student_org\s+uuid/i);
    expect(migrationsSql).toMatch(/target_student_role\s*<>\s*'student'/i);
    expect(migrationsSql).toMatch(/current_user_org\s*<>\s*target_student_org/i);
  });
});
