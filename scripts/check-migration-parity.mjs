#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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

function readMigrationFiles(migrationsDir) {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  return files.map((file) => {
    const absolutePath = path.join(migrationsDir, file);
    const contents = fs.readFileSync(absolutePath, 'utf8');
    return {
      file,
      contents,
    };
  });
}

function readDrizzleSchemaFiles(drizzleSchemaDir) {
  if (!fs.existsSync(drizzleSchemaDir)) {
    throw new Error(`Drizzle schema directory not found: ${drizzleSchemaDir}`);
  }

  const files = fs
    .readdirSync(drizzleSchemaDir)
    .filter((file) => file.endsWith('.ts'))
    .sort();

  return files.map((file) => {
    const absolutePath = path.join(drizzleSchemaDir, file);
    const contents = fs.readFileSync(absolutePath, 'utf8');
    return {
      file,
      contents,
    };
  });
}

function extractSupabaseTables(migrations) {
  const tables = new Set();

  for (const { contents } of migrations) {
    const pattern = /^\s*create\s+table\s+(?:if\s+(?:not\s+)?exists\s+)?(?:public\.)?("?)([a-z_][a-z0-9_]*)\1\b/gim;
    let match = pattern.exec(contents);
    while (match) {
      const tableName = match[2];
      if (!/^(if|for)$/i.test(tableName)) {
        tables.add(tableName);
      }
      match = pattern.exec(contents);
    }
  }

  return tables;
}

function extractDrizzleTables(drizzleFiles) {
  const tables = new Set();

  for (const { contents } of drizzleFiles) {
    const pattern = /\bpgTable\(\s*['"`]([a-z_][a-z0-9_]*)['"`]/gi;
    let match = pattern.exec(contents);
    while (match) {
      tables.add(match[1]);
      match = pattern.exec(contents);
    }
  }

  return tables;
}

export function checkMigrationParity({ repoRoot = process.cwd() } = {}) {
  const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
  const drizzleSchemaDir = path.join(repoRoot, 'lib', 'db', 'schema');

  const migrations = readMigrationFiles(migrationsDir);
  const drizzleFiles = readDrizzleSchemaFiles(drizzleSchemaDir);

  const missingRequirements = [];

  for (const requirement of REQUIREMENTS) {
    const foundIn = migrations.find(({ contents }) => requirement.pattern.test(contents));
    if (!foundIn) {
      missingRequirements.push(requirement);
    }
  }

  const supabaseTables = extractSupabaseTables(migrations);
  const drizzleTables = extractDrizzleTables(drizzleFiles);

  const drizzleMissingInSupabase = [...drizzleTables].filter((table) => !supabaseTables.has(table)).sort();
  const supabaseMissingInDrizzle = [...supabaseTables].filter((table) => !drizzleTables.has(table)).sort();

  return {
    ok:
      missingRequirements.length === 0 &&
      drizzleMissingInSupabase.length === 0 &&
      supabaseMissingInDrizzle.length === 0,
    missingRequirements,
    drizzleMissingInSupabase,
    supabaseMissingInDrizzle,
    requirementCount: REQUIREMENTS.length,
    supabaseTableCount: supabaseTables.size,
    drizzleTableCount: drizzleTables.size,
  };
}

function runCli() {
  const result = checkMigrationParity();

  if (result.missingRequirements.length > 0) {
    console.error('Migration parity check failed.');
    console.error('Missing required runtime DB objects from supabase/migrations:');
    for (const item of result.missingRequirements) {
      console.error(`- ${item.id}: ${item.description}`);
    }
    process.exit(1);
  }

  if (result.drizzleMissingInSupabase.length > 0 || result.supabaseMissingInDrizzle.length > 0) {
    console.error('Directional migration parity check failed.');
    if (result.drizzleMissingInSupabase.length > 0) {
      console.error('Drizzle tables missing from Supabase migrations:');
      for (const table of result.drizzleMissingInSupabase) {
        console.error(`- ${table}`);
      }
    }
    if (result.supabaseMissingInDrizzle.length > 0) {
      console.error('Supabase migration tables missing from Drizzle schema:');
      for (const table of result.supabaseMissingInDrizzle) {
        console.error(`- ${table}`);
      }
    }
    process.exit(1);
  }

  console.log('Migration parity check passed.');
  console.log(`Validated ${result.requirementCount} runtime DB requirements against supabase migrations.`);
  console.log(
    `Validated directional table parity across ${result.supabaseTableCount} Supabase tables and ${result.drizzleTableCount} Drizzle tables.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
