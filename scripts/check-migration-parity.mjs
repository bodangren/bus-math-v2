#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const MIGRATIONS_DIR = path.join(REPO_ROOT, 'supabase', 'migrations');

const REQUIREMENTS = [
  {
    id: 'table.activity_completions',
    description: 'activity_completions table',
    pattern: /\bcreate\s+table\b[\s\S]*?\bactivity_completions\b/i,
  },
  {
    id: 'function.complete_activity_atomic',
    description: 'complete_activity_atomic RPC function',
    pattern: /\bcreate\s+or\s+replace\s+function\s+complete_activity_atomic\s*\(/i,
  },
  {
    id: 'rls.activity_completions.enabled',
    description: 'RLS enabled on activity_completions',
    pattern: /\balter\s+table\s+activity_completions\s+enable\s+row\s+level\s+security\b/i,
  },
  {
    id: 'policy.activity_completions.student_insert',
    description: 'Students can insert own completions policy',
    pattern: /\bcreate\s+policy\s+"Students can insert own completions"/i,
  },
  {
    id: 'policy.activity_completions.student_select',
    description: 'Students can view own completions policy',
    pattern: /\bcreate\s+policy\s+"Students can view own completions"/i,
  },
  {
    id: 'policy.activity_completions.teacher_select',
    description: 'Teachers can view all completions policy',
    pattern: /\bcreate\s+policy\s+"Teachers can view all completions"/i,
  },
  {
    id: 'grant.complete_activity_atomic.authenticated',
    description: 'Grant execute on complete_activity_atomic to authenticated',
    pattern: /\bgrant\s+execute\s+on\s+function\s+complete_activity_atomic\s+to\s+authenticated\b/i,
  },
];

function readMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  return files.map((file) => {
    const absolutePath = path.join(MIGRATIONS_DIR, file);
    const contents = fs.readFileSync(absolutePath, 'utf8');
    return {
      file,
      contents,
    };
  });
}

function run() {
  const migrations = readMigrationFiles();
  const missing = [];

  for (const requirement of REQUIREMENTS) {
    const foundIn = migrations.find(({ contents }) => requirement.pattern.test(contents));
    if (!foundIn) {
      missing.push(requirement);
    }
  }

  if (missing.length > 0) {
    console.error('Migration parity check failed.');
    console.error('Missing required runtime DB objects from supabase/migrations:');
    for (const item of missing) {
      console.error(`- ${item.id}: ${item.description}`);
    }
    process.exit(1);
  }

  console.log('Migration parity check passed.');
  console.log(`Validated ${REQUIREMENTS.length} runtime DB requirements against supabase migrations.`);
}

run();
