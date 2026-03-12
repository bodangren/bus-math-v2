/**
 * Competency Standards Seeding Script
 *
 * Seeds Unit 1 accounting standards from JSON files using idempotent upserts.
 */

import { config } from 'dotenv';
import { sql, type SQL } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

config({ path: '.env.local' });

export interface StandardSeedData {
  code: string;
  description: string;
  studentFriendlyDescription: string;
  category: string;
  isActive: boolean;
}

interface SeedLogger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

interface SeedOptions {
  directUrl?: string;
  standardsPath?: string;
  logger?: SeedLogger;
}

interface DatabaseClient {
  execute: (query: SQL) => Promise<unknown[]>;
}

const CODE_PATTERN = /^[A-Z]{3}-\d+\.\d+$/;

export const COMPETENCY_STANDARD_UPSERT_SQL = `
INSERT INTO competency_standards (
  code,
  description,
  student_friendly_description,
  category,
  is_active,
  created_at
)
VALUES ($1, $2, $3, $4, $5, NOW())
ON CONFLICT (code)
DO UPDATE SET
  description = EXCLUDED.description,
  student_friendly_description = EXCLUDED.student_friendly_description,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active
RETURNING (xmax = 0) AS inserted
`;

export function getUnitOneStandardsPath(cwd: string = process.cwd()): string {
  return join(cwd, 'supabase/seed/standards/unit-1-accounting.json');
}

export function loadStandardsFromFile(filePath: string): StandardSeedData[] {
  const parsed = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected standards array in ${filePath}`);
  }

  return parsed as StandardSeedData[];
}

export function validateStandardSeedData(standards: StandardSeedData[]): void {
  if (standards.length === 0) {
    throw new Error('Standards list cannot be empty');
  }

  const seenCodes = new Set<string>();

  for (const standard of standards) {
    if (!standard.code || !standard.description || !standard.category) {
      throw new Error(`Invalid standard data: ${JSON.stringify(standard)}`);
    }

    if (!CODE_PATTERN.test(standard.code)) {
      throw new Error(`Invalid code format: ${standard.code} (expected format: XXX-N.N)`);
    }

    if (seenCodes.has(standard.code)) {
      throw new Error(`Duplicate standard code detected: ${standard.code}`);
    }

    seenCodes.add(standard.code);
  }
}

async function upsertStandards(
  db: DatabaseClient,
  standards: StandardSeedData[],
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const standard of standards) {
    const result = (await db.execute(sql`
      INSERT INTO competency_standards (
        code,
        description,
        student_friendly_description,
        category,
        is_active,
        created_at
      )
      VALUES (
        ${standard.code},
        ${standard.description},
        ${standard.studentFriendlyDescription},
        ${standard.category},
        ${standard.isActive},
        NOW()
      )
      ON CONFLICT (code)
      DO UPDATE SET
        description = EXCLUDED.description,
        student_friendly_description = EXCLUDED.student_friendly_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active
      RETURNING (xmax = 0) AS inserted
    `)) as Array<{ inserted: boolean }>;

    if (result[0]?.inserted) {
      inserted++;
    } else {
      updated++;
    }
  }

  return { inserted, updated };
}

async function verifyTotals(db: DatabaseClient): Promise<{ total: number; byCategory: Array<{ category: string; count: number }> }> {
  const byCategoryRows = (await db.execute(sql`
    SELECT category, COUNT(*) as count
    FROM competency_standards
    WHERE code LIKE 'ACC-1.%'
    GROUP BY category
    ORDER BY category
  `)) as Array<{ category: string; count: string | number }>;

  const totalRows = (await db.execute(sql`
    SELECT COUNT(*) as total
    FROM competency_standards
    WHERE code LIKE 'ACC-1.%'
  `)) as Array<{ total: string | number }>;

  return {
    total: Number(totalRows[0]?.total ?? 0),
    byCategory: byCategoryRows.map((row) => ({
      category: row.category,
      count: Number(row.count),
    })),
  };
}

export async function seedCompetencyStandards(options: SeedOptions = {}): Promise<void> {
  const logger = options.logger ?? console;
  const directUrl = options.directUrl ?? process.env.DIRECT_URL;
  const standardsPath = options.standardsPath ?? getUnitOneStandardsPath();

  logger.log('Starting competency standards seed...');

  if (!directUrl) {
    throw new Error('DIRECT_URL not found in environment');
  }

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    const standards = loadStandardsFromFile(standardsPath);
    validateStandardSeedData(standards);

    logger.log(`Loaded ${standards.length} standards from ${standardsPath}`);

    const { inserted, updated } = await upsertStandards(db, standards);
    logger.log(`Seed complete: ${inserted} inserted, ${updated} updated`);

    const verification = await verifyTotals(db);
    logger.log('Verification by category:');
    for (const row of verification.byCategory) {
      logger.log(`  ${row.category}: ${row.count} standards`);
    }
    logger.log(`  Total ACC-1.x standards: ${verification.total}`);

    if (verification.total !== standards.length) {
      logger.warn(`Expected ${standards.length} standards, found ${verification.total}`);
    }
  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  } finally {
    await queryClient.end();
  }
}

const isDirectExecution =
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module;

if (isDirectExecution) {
  seedCompetencyStandards()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
