/**
 * Competency Standards Seeding Script
 *
 * Seeds accounting competency standards from JSON files.
 * Uses upsert (INSERT ON CONFLICT) for idempotency.
 *
 * Prerequisites:
 * - competency_standards table must exist (from migration 0002)
 * - DIRECT_URL must be set in .env.local
 *
 * Usage:
 *   npx tsx supabase/seed/02-competency-standards.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { sql } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

interface StandardSeedData {
  code: string;
  description: string;
  studentFriendlyDescription: string;
  category: string;
  isActive: boolean;
}

async function seedCompetencyStandards() {
  console.log('<1 Starting competency standards seed...');

  // Validate environment
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) {
    throw new Error('DIRECT_URL not found in environment');
  }

  // Create Drizzle client
  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    // Load Unit 1 standards
    const unit1Path = join(process.cwd(), 'supabase/seed/standards/unit-1-accounting.json');
    const unit1Data: StandardSeedData[] = JSON.parse(readFileSync(unit1Path, 'utf-8'));

    console.log(`=� Loaded ${unit1Data.length} standards from unit-1-accounting.json`);

    // Validate data format
    for (const standard of unit1Data) {
      if (!standard.code || !standard.description) {
        const errorMsg = 'Invalid standard data: ' + JSON.stringify(standard);
        throw new Error(errorMsg);
      }
      if (!/^[A-Z]{3}-\d+\.\d+$/.test(standard.code)) {
        throw new Error(`Invalid code format: ${standard.code} (expected format: XXX-N.N)`);
      }
    }

    // Upsert standards (idempotent)
    let insertCount = 0;
    let updateCount = 0;

    for (const standard of unit1Data) {
      const result = await db.execute(sql`
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
      `);

      if (result[0]?.inserted) {
        insertCount++;
      } else {
        updateCount++;
      }
    }

    console.log(` Seed complete: ${insertCount} inserted, ${updateCount} updated`);

    // Verification
    const verification = await db.execute(sql`
      SELECT category, COUNT(*) as count
      FROM competency_standards
      WHERE code LIKE 'ACC-1.%'
      GROUP BY category
      ORDER BY category
    `);

    console.log('\n=� Verification:');
    for (const row of verification) {
      console.log(`  ${row.category}: ${row.count} standards`);
    }

    const total = await db.execute(sql`
      SELECT COUNT(*) as total FROM competency_standards WHERE code LIKE 'ACC-1.%'
    `);
    console.log(`  Total ACC-1.x standards: ${total[0].total}`);

    if (Number(total[0].total) !== unit1Data.length) {
      console.warn(`�  Warning: Expected ${unit1Data.length} standards, found ${total[0].total}`);
    }

  } catch (error) {
    console.error('L Seed failed:', error);
    throw error;
  } finally {
    await queryClient.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedCompetencyStandards()
    .then(() => {
      console.log('( Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { seedCompetencyStandards };
