/**
 * Unit 1, Lesson 1 (v2) Seeding Script
 *
 * Seeds "Introduction to TechStart" using the new Versioned Content Schema.
 * This lesson teaches the fundamental accounting equation and introduces
 * the Sarah Chen / TechStart narrative.
 *
 * Prerequisites:
 * - Versioned schema tables must exist (lesson_versions, phase_versions, phase_sections, lesson_standards)
 * - Competency standards must be seeded (ACC-1.1, ACC-1.2)
 * - DIRECT_URL must be set in .env.local
 *
 * Usage:
 *   npx tsx supabase/seed/03-unit-1-lesson-1-v2.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

// Fixed UUIDs for deterministic seeding
const IDS = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000001',
  VERSION: 'd6b57545-65f6-4c39-80d5-000000000002',
  PHASES: [
    'd6b57545-65f6-4c39-80d5-000000000100', // Phase 1
    'd6b57545-65f6-4c39-80d5-000000000200', // Phase 2
    'd6b57545-65f6-4c39-80d5-000000000300', // Phase 3
    'd6b57545-65f6-4c39-80d5-000000000400', // Phase 4
    'd6b57545-65f6-4c39-80d5-000000000500', // Phase 5
    'd6b57545-65f6-4c39-80d5-000000000600', // Phase 6
  ],
};

async function seedUnitOneLessonOneV2() {
  console.log('🌱 Starting Unit 1, Lesson 1 (v2) seed...');

  // Validate environment
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) {
    throw new Error('DIRECT_URL not found in environment');
  }

  // Create Drizzle client
  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    // Step 1: Ensure base lesson exists
    console.log('\n📚 Step 1: Ensuring base lesson exists...');
    await db.execute(sql`
      INSERT INTO lessons (
        id,
        unit_number,
        title,
        slug,
        description,
        learning_objectives,
        order_index,
        created_at,
        updated_at
      )
      VALUES (
        ${IDS.LESSON}::uuid,
        1,
        'Introduction to TechStart',
        'unit-1-lesson-1',
        'Introduce the fundamental accounting equation and explore why balance matters in business financial systems.',
        '["Understand the three components of the accounting equation", "Recognize why the equation must always balance", "Apply basic accounting concepts to real business scenarios"]'::jsonb,
        1,
        NOW(),
        NOW()
      )
      ON CONFLICT (id)
      DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        learning_objectives = EXCLUDED.learning_objectives,
        order_index = EXCLUDED.order_index,
        updated_at = NOW()
    `);
    console.log('✅ Base lesson ensured');

    // Step 2: Look up standard IDs
    console.log('\n🎯 Step 2: Looking up competency standards...');
    const standards = await db.execute(sql`
      SELECT id, code FROM competency_standards
      WHERE code IN ('ACC-1.1', 'ACC-1.2')
    `);

    if (standards.length !== 2) {
      throw new Error(`Expected 2 standards (ACC-1.1, ACC-1.2), found ${standards.length}`);
    }

    const standardsMap = new Map<string, string>();
    for (const standard of standards) {
      standardsMap.set(standard.code as string, standard.id as string);
    }
    console.log(`✅ Found standards: ${Array.from(standardsMap.keys()).join(', ')}`);

    // Step 3: Create lesson version
    console.log('\n📖 Step 3: Creating lesson version (v2)...');
    await db.execute(sql`
      INSERT INTO lesson_versions (
        id,
        lesson_id,
        version,
        title,
        description,
        status,
        created_at
      )
      VALUES (
        ${IDS.VERSION}::uuid,
        ${IDS.LESSON}::uuid,
        2,
        'Introduction to TechStart',
        'Learn the accounting equation through the story of Sarah Chen and her business journey.',
        'published',
        NOW()
      )
      ON CONFLICT (lesson_id, version)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status
    `);
    console.log('✅ Lesson version created');

    // Step 4: Link standards
    console.log('\n🔗 Step 4: Linking competency standards...');
    const acc11Id = standardsMap.get('ACC-1.1');
    const acc12Id = standardsMap.get('ACC-1.2');

    await db.execute(sql`
      INSERT INTO lesson_standards (
        lesson_version_id,
        standard_id,
        is_primary,
        created_at
      )
      VALUES (
        ${IDS.VERSION}::uuid,
        ${acc11Id}::uuid,
        true,
        NOW()
      )
      ON CONFLICT (lesson_version_id, standard_id)
      DO UPDATE SET is_primary = EXCLUDED.is_primary
    `);

    await db.execute(sql`
      INSERT INTO lesson_standards (
        lesson_version_id,
        standard_id,
        is_primary,
        created_at
      )
      VALUES (
        ${IDS.VERSION}::uuid,
        ${acc12Id}::uuid,
        false,
        NOW()
      )
      ON CONFLICT (lesson_version_id, standard_id)
      DO UPDATE SET is_primary = EXCLUDED.is_primary
    `);
    console.log('✅ Standards linked (ACC-1.1 primary, ACC-1.2 secondary)');

    // Step 5: Create phases and sections
    console.log('\n📝 Step 5: Creating phases and sections...');

    // Phase 1: Read - Intro
    await createPhase(db, {
      id: IDS.PHASES[0],
      versionId: IDS.VERSION,
      phaseNumber: 1,
      title: 'Hook: Meet Sarah Chen',
      estimatedMinutes: 10,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: 'text',
          content: {
            markdown: `# Welcome to TechStart!

Meet **Sarah Chen**, a recent graduate with a passion for technology and a dream of building her own business.

Sarah has just launched **TechStart Solutions**, a consultancy helping small businesses adopt cloud-based tools. She's excited about the possibilities, but quickly realizes that running a business involves more than just great ideas—she needs to understand the **financial side** too.

This is where accounting comes in. Every business transaction Sarah makes—from buying laptops to invoicing clients—affects her company's financial health. And there's one fundamental rule that keeps everything balanced...`,
          },
        },
        {
          sequenceOrder: 2,
          sectionType: 'video',
          content: {
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: 180,
            transcript: 'Welcome to Unit 1! In this video, we introduce Sarah Chen and her business journey...',
            caption: 'Introduction to Sarah Chen and TechStart Solutions',
          },
        },
        {
          sequenceOrder: 3,
          sectionType: 'activity',
          content: {
            activityType: 'comprehension-check',
            instructions: 'Answer these questions to check your understanding of the video.',
            questions: [
              {
                id: 'q1',
                text: 'What is Sarah Chen\'s business called?',
                type: 'multiple-choice',
                options: ['TechStart Solutions', 'Cloud Consulting Inc', 'Sarah\'s Tech Shop', 'Digital Business Partners'],
                correctAnswer: 'TechStart Solutions',
              },
              {
                id: 'q2',
                text: 'Why does Sarah need to learn about accounting?',
                type: 'short-answer',
                correctAnswer: 'To understand the financial side of running her business',
              },
              {
                id: 'q3',
                text: 'Business accounting helps track financial health.',
                type: 'true-false',
                correctAnswer: 'true',
              },
            ],
          },
        },
      ],
    });

    // Phase 2: Read - Concept
    await createPhase(db, {
      id: IDS.PHASES[1],
      versionId: IDS.VERSION,
      phaseNumber: 2,
      title: 'Concept: The Accounting Equation',
      estimatedMinutes: 15,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: 'text',
          content: {
            markdown: `## The Fundamental Accounting Equation

Every business operates on a simple but powerful principle:

**Assets = Liabilities + Equity**

Let's break this down:

- **Assets**: What the business owns (cash, computers, inventory)
- **Liabilities**: What the business owes (loans, unpaid bills)
- **Equity**: The owner's stake in the business

For TechStart, this means every dollar Sarah invests, every client payment received, and every expense paid changes these three components—but the equation **always balances**.`,
          },
        },
        {
          sequenceOrder: 2,
          sectionType: 'callout',
          content: {
            variant: 'why-this-matters',
            title: 'Why This Matters',
            content: `This equation isn't just theory—it's the foundation of **every financial statement** you'll ever see. Whether you're analyzing a startup or a Fortune 500 company, this equation holds true. Master it now, and you'll understand how money flows through any business.`,
          },
        },
        {
          sequenceOrder: 3,
          sectionType: 'text',
          content: {
            markdown: `### Example: Sarah's First Transaction

When Sarah invests $10,000 of her own money to start TechStart:

- **Assets** increase by $10,000 (cash in the bank)
- **Equity** increases by $10,000 (Sarah's investment)
- **Liabilities** stay at $0 (no debts yet)

**Result**: $10,000 (Assets) = $0 (Liabilities) + $10,000 (Equity) ✓

The equation balances!`,
          },
        },
      ],
    });

    // Phase 3: Do - Practice
    await createPhase(db, {
      id: IDS.PHASES[2],
      versionId: IDS.VERSION,
      phaseNumber: 3,
      title: 'Practice: Revenue Tracking',
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: 'activity',
          content: {
            activityType: 'spreadsheet-evaluator',
            templateId: 'revenue-tracker-basic',
            instructions: 'Sarah has provided services to several clients this quarter. Calculate the total revenue for Q1 by summing all the monthly revenues in cell B10.',
            targetCells: [
              {
                cell: 'B10',
                expectedFormula: '=SUM(B4:B9)',
                feedbackSuccess: 'Excellent! You correctly calculated Q1 total revenue using the SUM function.',
                feedbackError: 'Not quite. Try using the SUM function to add up all the revenue values from B4 to B9.',
              },
            ],
            linkedStandardId: acc11Id,
          },
        },
      ],
    });

    // Phase 4: Read - Apply
    await createPhase(db, {
      id: IDS.PHASES[3],
      versionId: IDS.VERSION,
      phaseNumber: 4,
      title: 'Apply: Real-World Context',
      estimatedMinutes: 15,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: 'text',
          content: {
            markdown: `## Applying the Equation in Practice

Now that you've tracked Sarah's revenue, let's see how **real transactions** affect the accounting equation.

### Scenario: TechStart's First Month

**Week 1**: Sarah purchases 3 laptops for $3,000 (using company cash)
- Assets: Cash ↓ $3,000, Equipment ↑ $3,000 (net change: $0)
- Liabilities: No change
- Equity: No change

**Week 2**: Sarah invoices Client A for $5,000 in consulting services
- Assets: Accounts Receivable ↑ $5,000
- Liabilities: No change
- Equity: Retained Earnings ↑ $5,000 (revenue increases equity)

**Week 3**: Sarah pays $1,200 in rent
- Assets: Cash ↓ $1,200
- Liabilities: No change
- Equity: Retained Earnings ↓ $1,200 (expenses decrease equity)

**Notice**: Every transaction affects at least two accounts, and the equation **always stays balanced**.`,
          },
        },
        {
          sequenceOrder: 2,
          sectionType: 'callout',
          content: {
            variant: 'tip',
            title: 'Pro Tip',
            content: 'When analyzing transactions, always ask: "What did we get?" (Assets ↑) and "Where did it come from?" (Liabilities ↑ or Equity ↑). This helps you understand the dual nature of every transaction.',
          },
        },
      ],
    });

    // Phase 5: Do - Challenge
    await createPhase(db, {
      id: IDS.PHASES[4],
      versionId: IDS.VERSION,
      phaseNumber: 5,
      title: 'Challenge: Transaction Analysis',
      estimatedMinutes: 25,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: 'activity',
          content: {
            activityType: 'spreadsheet-evaluator',
            templateId: 'accounting-equation-challenge',
            instructions: 'Sarah has several transactions to record. For each transaction, calculate how it affects Assets, Liabilities, and Equity. Then verify the equation still balances in cell D15.',
            targetCells: [
              {
                cell: 'D15',
                expectedFormula: '=B15-(C15+D15)',
                feedbackSuccess: 'Perfect! You verified that Assets = Liabilities + Equity.',
                feedbackError: 'Check your equation. Remember: Assets = Liabilities + Equity, so the difference should be zero.',
              },
            ],
            linkedStandardId: acc11Id,
          },
        },
      ],
    });

    // Phase 6: Read - Review
    await createPhase(db, {
      id: IDS.PHASES[5],
      versionId: IDS.VERSION,
      phaseNumber: 6,
      title: 'Review: Key Takeaways',
      estimatedMinutes: 10,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: 'text',
          content: {
            markdown: `## Key Takeaways

Congratulations! You've learned the foundation of all accounting:

### The Accounting Equation
**Assets = Liabilities + Equity**

This equation:
- ✅ **Always balances** after every transaction
- ✅ **Tracks** what the business owns, owes, and is worth
- ✅ **Forms the basis** of financial statements

### Sarah's Journey
You helped Sarah:
- Calculate quarterly revenue
- Analyze how transactions affect her business
- Verify that her books stay balanced

### Next Steps
In the next lesson, you'll learn about the **Balance Sheet**—a financial statement built entirely on this equation. You'll see how businesses organize and present their financial position to stakeholders.`,
          },
        },
        {
          sequenceOrder: 2,
          sectionType: 'activity',
          content: {
            activityType: 'reflection-journal',
            instructions: 'Reflect on what you learned. How might understanding the accounting equation help you in your future career?',
            prompt: 'In your own words, explain why the accounting equation must always balance. Give an example from Sarah\'s business.',
          },
        },
      ],
    });

    console.log('✅ All phases and sections created');

    // Step 6: Verification
    console.log('\n🔍 Step 6: Verifying seed data...');

    const phaseCount = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM phase_versions
      WHERE lesson_version_id = ${IDS.VERSION}::uuid
    `);
    console.log(`  Phases created: ${phaseCount[0].count}`);

    const sectionCount = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM phase_sections ps
      JOIN phase_versions pv ON ps.phase_version_id = pv.id
      WHERE pv.lesson_version_id = ${IDS.VERSION}::uuid
    `);
    console.log(`  Sections created: ${sectionCount[0].count}`);

    const standardCount = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM lesson_standards
      WHERE lesson_version_id = ${IDS.VERSION}::uuid
    `);
    console.log(`  Standards linked: ${standardCount[0].count}`);

    // Detailed phase breakdown
    const phaseBreakdown = await db.execute(sql`
      SELECT
        pv.phase_number,
        pv.title,
        COUNT(ps.id) as section_count
      FROM phase_versions pv
      LEFT JOIN phase_sections ps ON ps.phase_version_id = pv.id
      WHERE pv.lesson_version_id = ${IDS.VERSION}::uuid
      GROUP BY pv.phase_number, pv.title
      ORDER BY pv.phase_number
    `);

    console.log('\n📊 Phase Breakdown:');
    for (const phase of phaseBreakdown) {
      console.log(`  Phase ${phase.phase_number}: ${phase.title} (${phase.section_count} sections)`);
    }

    if (Number(phaseCount[0].count) !== 6) {
      console.warn(`⚠️  Warning: Expected 6 phases, found ${phaseCount[0].count}`);
    }

    if (Number(standardCount[0].count) !== 2) {
      console.warn(`⚠️  Warning: Expected 2 standards, found ${standardCount[0].count}`);
    }

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await queryClient.end();
  }
}

/**
 * Helper function to create a phase with its sections
 */
async function createPhase(
  db: any,
  config: {
    id: string;
    versionId: string;
    phaseNumber: number;
    title: string;
    estimatedMinutes: number;
    sections: Array<{
      sequenceOrder: number;
      sectionType: string;
      content: any;
    }>;
  }
) {
  // Create phase version
  await db.execute(sql`
    INSERT INTO phase_versions (
      id,
      lesson_version_id,
      phase_number,
      title,
      estimated_minutes,
      created_at
    )
    VALUES (
      ${config.id}::uuid,
      ${config.versionId}::uuid,
      ${config.phaseNumber},
      ${config.title},
      ${config.estimatedMinutes},
      NOW()
    )
    ON CONFLICT (lesson_version_id, phase_number)
    DO UPDATE SET
      title = EXCLUDED.title,
      estimated_minutes = EXCLUDED.estimated_minutes
  `);

  // Create sections
  for (const section of config.sections) {
    await db.execute(sql`
      INSERT INTO phase_sections (
        phase_version_id,
        sequence_order,
        section_type,
        content,
        created_at
      )
      VALUES (
        ${config.id}::uuid,
        ${section.sequenceOrder},
        ${section.sectionType},
        ${JSON.stringify(section.content)}::jsonb,
        NOW()
      )
      ON CONFLICT (phase_version_id, sequence_order)
      DO UPDATE SET
        section_type = EXCLUDED.section_type,
        content = EXCLUDED.content
    `);
  }

  console.log(`  ✓ Phase ${config.phaseNumber}: ${config.title} (${config.sections.length} sections)`);
}

// Run if called directly
if (require.main === module) {
  seedUnitOneLessonOneV2()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { seedUnitOneLessonOneV2 };
