/**
 * Unit 1, Lesson 11 — Individual Assessment (ACC-1.1 through ACC-1.7)
 *
 * Summative mastery assessment with:
 * - Phase 1: Directions
 * - Phase 2: Assessment tiers (knowledge, understanding, application)
 * - Phase 3: Review and readiness check
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

export const IDS = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000011',
  VERSION: 'd6b57545-65f6-4c39-80d5-001100000002',
  PHASES: {
    1: 'd6b57545-65f6-4c39-80d5-001100000100',
    2: 'd6b57545-65f6-4c39-80d5-001100000200',
    3: 'd6b57545-65f6-4c39-80d5-001100000300',
    4: 'd6b57545-65f6-4c39-80d5-001100000400',
  },
  ACTIVITY_KNOWLEDGE: 'd6b57545-65f6-4c39-80d5-001100001001',
  ACTIVITY_UNDERSTANDING: 'd6b57545-65f6-4c39-80d5-001100001002',
  ACTIVITY_APPLICATION: 'd6b57545-65f6-4c39-80d5-001100001003',
} as const;

function text(markdown: string) {
  return { sectionType: 'text' as const, content: { markdown } };
}

function activity(activityId: string, required: boolean) {
  return {
    sectionType: 'activity' as const,
    content: { activityId, required },
  };
}

const BASE_PROBLEM_TEMPLATE = {
  parameters: {
    assets: { min: 9000, max: 18000, step: 100 },
    liabilities: { min: 2000, max: 11000, step: 100 },
  },
  answerFormula: 'assets - liabilities',
  questionTemplate: 'Given assets {{assets}} and liabilities {{liabilities}}, determine equity.',
  tolerance: 1,
} as const;

export const LESSON_11_SEED_DATA = {
  lesson: {
    id: IDS.LESSON,
    slug: 'unit-1-lesson-11',
    title: 'Unit 1 Mastery Check',
    unitNumber: 1,
    orderIndex: 11,
    description:
      'Demonstrate Unit 1 mastery through explicit knowledge, understanding, and application assessment tiers.',
    learningObjectives: [
      'Demonstrate knowledge of Unit 1 standards ACC-1.1 through ACC-1.7',
      'Apply concepts in scenario-based understanding questions',
      'Solve procedural application problems using algorithmic data',
    ],
  },
  version: {
    id: IDS.VERSION,
    title: 'Unit 1 Mastery Check',
    description: 'Three-tier summative assessment with knowledge, understanding, and application tasks.',
    status: 'published',
  },
  standards: [
    { code: 'ACC-1.1', isPrimary: true },
    { code: 'ACC-1.2', isPrimary: false },
    { code: 'ACC-1.3', isPrimary: false },
    { code: 'ACC-1.4', isPrimary: false },
    { code: 'ACC-1.5', isPrimary: false },
    { code: 'ACC-1.6', isPrimary: false },
    { code: 'ACC-1.7', isPrimary: false },
  ],
  phases: [
    {
      id: IDS.PHASES[1],
      phaseNumber: 1,
      title: 'Instructions: Unit 1 Summative Assessment',
      estimatedMinutes: 10,
      sections: [
        text(`## Unit 1 Summative Instructions

This assessment has three tiers:

1. **Knowledge** (7 questions)
2. **Understanding** (7 questions)
3. **Application** (7 questions + 7 problems)

You have up to **2 attempts**. The system regenerates numbers using algorithmic templates so each attempt is meaningful practice.

Passing target: **70%**.`),
        text(`## Standard Coverage Map

- ACC-1.1: Accounting equation
- ACC-1.2: Account classification
- ACC-1.3: Balance Sheet structure
- ACC-1.4: Transaction effects
- ACC-1.5: Error detection
- ACC-1.6: Data validation
- ACC-1.7: Visual communication

Complete all tiers in order and submit each tier when finished.`),
      ],
    },
    {
      id: IDS.PHASES[2],
      phaseNumber: 2,
      title: 'Assessment: Knowledge, Understanding, and Application',
      estimatedMinutes: 35,
      sections: [
        text(`## Assessment Sequence

Work through the three tiers in order. Each activity builds on the previous one, so do not skip ahead.

### Tier 1 — Knowledge

One recall-focused question per standard. Use precise accounting language.`),
        activity(IDS.ACTIVITY_KNOWLEDGE, true),
        text(`## Tier 2 — Understanding

One conceptual scenario question per standard. Show that you understand why the rule works, not just the answer.`),
        activity(IDS.ACTIVITY_UNDERSTANDING, true),
        text(`## Tier 3 — Application

Solve procedural questions and complete one applied problem per standard. This is the part of the assessment that proves you can use the Unit 1 toolkit independently.`),
        activity(IDS.ACTIVITY_APPLICATION, true),
      ],
    },
    {
      id: IDS.PHASES[3],
      phaseNumber: 3,
      title: 'Review: Reflect on Unit 1 Readiness',
      estimatedMinutes: 5,
      sections: [
        text(`## Review Your Readiness

Before you leave the assessment, double-check these ideas:

- Can you explain why **Assets = Liabilities + Equity** always has to stay in balance?
- Can you classify common TechStart accounts without hesitation?
- Can you explain how ledger quality, validation, and presentation all support a trustworthy Balance Snapshot?

If you still feel shaky on one standard, note it now and use it to guide your review before Unit 2. Unit 1 is complete when you can explain both the math and the business meaning behind the numbers.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS.ACTIVITY_KNOWLEDGE,
      componentKey: 'tiered-assessment',
      displayName: 'Knowledge Check (ACC-1.1 to ACC-1.7)',
      description: 'Recall-focused questions, one per Unit 1 standard.',
      props: {
        tier: 'knowledge',
        title: 'Knowledge Check',
        description: 'Answer 7 recall questions. Passing threshold: 70%.',
        showExplanations: true,
        allowRetry: true,
        maxAttempts: 2,
        problemTemplate: BASE_PROBLEM_TEMPLATE,
        questions: [
          { id: 'k-acc-1-1', standardCode: 'ACC-1.1', type: 'true-false', text: 'The accounting equation is Assets = Liabilities + Equity.', options: ['True', 'False'], correctAnswer: 'True' },
          { id: 'k-acc-1-2', standardCode: 'ACC-1.2', type: 'matching', text: 'Classify Accounts Payable as A/L/E using one letter.', correctAnswer: 'L' },
          { id: 'k-acc-1-3', standardCode: 'ACC-1.3', type: 'fill-in-the-blank', text: 'Balance Sheet major sections include Assets, Liabilities, and ___.', correctAnswer: 'Equity' },
          { id: 'k-acc-1-4', standardCode: 'ACC-1.4', type: 'true-false', text: 'Every transaction must affect at least two accounts to keep the equation balanced.', options: ['True', 'False'], correctAnswer: 'True' },
          { id: 'k-acc-1-5', standardCode: 'ACC-1.5', type: 'matching', text: 'A missing opposite-side entry is typically what type of issue?', correctAnswer: 'missing entry' },
          { id: 'k-acc-1-6', standardCode: 'ACC-1.6', type: 'true-false', text: 'A Stop alert in Data Validation rejects invalid entries.', options: ['True', 'False'], correctAnswer: 'True' },
          { id: 'k-acc-1-7', standardCode: 'ACC-1.7', type: 'fill-in-the-blank', text: 'In a bar chart comparing Assets and Liabilities, the difference represents ___.', correctAnswer: 'Equity' },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 70,
        partialCredit: false,
      },
    },
    {
      id: IDS.ACTIVITY_UNDERSTANDING,
      componentKey: 'tiered-assessment',
      displayName: 'Understanding Check (ACC-1.1 to ACC-1.7)',
      description: 'Scenario-based conceptual questions, one per Unit 1 standard.',
      props: {
        tier: 'understanding',
        title: 'Understanding Check',
        description: 'Answer 7 scenario questions. Passing threshold: 70%.',
        showExplanations: true,
        allowRetry: true,
        maxAttempts: 2,
        problemTemplate: BASE_PROBLEM_TEMPLATE,
        questions: [
          { id: 'u-acc-1-1', standardCode: 'ACC-1.1', type: 'numeric-entry', text: 'Assets are $12,400 and liabilities are $7,100. Compute equity.', correctAnswer: 5300 },
          { id: 'u-acc-1-2', standardCode: 'ACC-1.2', type: 'categorization', text: 'Classify deferred revenue with one letter (A/L/E).', correctAnswer: 'L' },
          { id: 'u-acc-1-3', standardCode: 'ACC-1.3', type: 'categorization', text: 'Place Bank Loan due in 3 years in Current or Non-Current Liabilities.', correctAnswer: 'Non-Current Liabilities' },
          { id: 'u-acc-1-4', standardCode: 'ACC-1.4', type: 'numeric-entry', text: 'Cash decreases by $500 and liabilities decrease by $500. New equation-check amount?', correctAnswer: 0 },
          { id: 'u-acc-1-5', standardCode: 'ACC-1.5', type: 'fill-in-the-blank', text: 'If equation-check cell is not zero, start by reviewing for a missing ___ entry.', correctAnswer: 'offsetting' },
          { id: 'u-acc-1-6', standardCode: 'ACC-1.6', type: 'fill-in-the-blank', text: 'Validation list should allow only ___ for category values.', correctAnswer: 'A, L, E' },
          { id: 'u-acc-1-7', standardCode: 'ACC-1.7', type: 'numeric-entry', text: 'Assets bar is 14,800 and liabilities bar is 8,300. Equity equals?', correctAnswer: 6500 },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 70,
        partialCredit: false,
      },
    },
    {
      id: IDS.ACTIVITY_APPLICATION,
      componentKey: 'tiered-assessment',
      displayName: 'Application Check (ACC-1.1 to ACC-1.7)',
      description: 'Procedural and applied problems with algorithmic generation.',
      props: {
        tier: 'application',
        title: 'Application Check',
        description: 'Answer 7 procedural questions and 7 application problems. Passing threshold: 70%.',
        showExplanations: true,
        allowRetry: true,
        maxAttempts: 2,
        problemTemplate: BASE_PROBLEM_TEMPLATE,
        questions: [
          { id: 'a-acc-1-1', standardCode: 'ACC-1.1', type: 'numeric-entry', text: 'Assets are $15,200 and equity is $6,900. Find liabilities.', correctAnswer: 8300 },
          { id: 'a-acc-1-2', standardCode: 'ACC-1.2', type: 'categorization', text: 'Classify prepaid insurance (A/L/E).', correctAnswer: 'A' },
          { id: 'a-acc-1-3', standardCode: 'ACC-1.3', type: 'numeric-entry', text: 'Current Assets are 7,200 and Non-Current Assets are 4,100. Total Assets?', correctAnswer: 11300 },
          { id: 'a-acc-1-4', standardCode: 'ACC-1.4', type: 'equation-solver', text: 'A transaction increases liabilities by 1,200 and decreases equity by 1,200. Net change to assets?', correctAnswer: 0 },
          { id: 'a-acc-1-5', standardCode: 'ACC-1.5', type: 'numeric-entry', text: 'Equation-check is +450. After adding missing liability 450, new equation-check?', correctAnswer: 0 },
          { id: 'a-acc-1-6', standardCode: 'ACC-1.6', type: 'categorization', text: 'Entry typed "asset" while list allows A/L/E. Valid or Invalid?', correctAnswer: 'Invalid' },
          { id: 'a-acc-1-7', standardCode: 'ACC-1.7', type: 'numeric-entry', text: 'Assets 16,000, liabilities 9,400. Compute equity from chart values.', correctAnswer: 6600 },
        ],
        applicationProblems: [
          {
            id: 'ap-acc-1-1',
            standardCode: 'ACC-1.1',
            prompt: 'Solve for the missing equation component using generated values.',
            problemTemplate: {
              parameters: {
                assets: { min: 10000, max: 20000, step: 100 },
                liabilities: { min: 3000, max: 12000, step: 100 },
              },
              answerFormula: 'assets - liabilities',
              questionTemplate: 'Assets are {{assets}} and liabilities are {{liabilities}}. What is equity?',
              tolerance: 1,
            },
          },
          {
            id: 'ap-acc-1-2',
            standardCode: 'ACC-1.2',
            prompt: 'Categorize generated account balances into A/L/E classes.',
            problemTemplate: {
              parameters: { cash: { min: 1000, max: 5000, step: 100 }, payable: { min: 500, max: 4000, step: 100 } },
              answerFormula: 'cash - payable',
              questionTemplate: 'Cash {{cash}}, payable {{payable}}. Determine resulting equity and classify each account.',
              tolerance: 1,
            },
          },
          {
            id: 'ap-acc-1-3',
            standardCode: 'ACC-1.3',
            prompt: 'Compute section subtotals and verify Balance Sheet equation using cell checks.',
            problemTemplate: {
              parameters: { assets: { min: 11000, max: 22000, step: 100 }, liabilities: { min: 4000, max: 12000, step: 100 } },
              answerFormula: 'assets - liabilities',
              questionTemplate: 'Build subtotals with assets {{assets}} and liabilities {{liabilities}}.',
              cellExpectations: [
                { cellRef: 'B2', expectedFormula: 'assets', tolerance: 1 },
                { cellRef: 'B3', expectedFormula: 'liabilities', tolerance: 1 },
                { cellRef: 'B4', expectedFormula: 'assets - liabilities', tolerance: 1 },
              ],
              tolerance: 1,
            },
          },
          {
            id: 'ap-acc-1-4',
            standardCode: 'ACC-1.4',
            prompt: 'Trace multi-event transactions and compute final equation state.',
            problemTemplate: {
              parameters: { startAssets: { min: 9000, max: 17000, step: 100 }, change: { min: 200, max: 1200, step: 100 } },
              answerFormula: 'startAssets + change - change',
              questionTemplate: 'Start assets {{startAssets}}; apply +{{change}} and -{{change}} effects. Final assets?',
              tolerance: 1,
            },
          },
          {
            id: 'ap-acc-1-5',
            standardCode: 'ACC-1.5',
            prompt: 'Identify and correct generated ledger errors then recompute totals.',
            problemTemplate: {
              parameters: { assets: { min: 12000, max: 20000, step: 100 }, liabilities: { min: 3000, max: 12000, step: 100 } },
              answerFormula: 'assets - liabilities',
              questionTemplate: 'After correcting errors, recompute equity from assets {{assets}} and liabilities {{liabilities}}.',
              tolerance: 1,
            },
          },
          {
            id: 'ap-acc-1-6',
            standardCode: 'ACC-1.6',
            prompt: 'Evaluate whether generated entries pass configured validation rules.',
            problemTemplate: {
              parameters: { total: { min: 10, max: 30, step: 1 }, invalid: { min: 0, max: 5, step: 1 } },
              answerFormula: 'total - invalid',
              questionTemplate: '{{invalid}} entries fail validation out of {{total}} total. How many pass?',
              tolerance: 1,
            },
          },
          {
            id: 'ap-acc-1-7',
            standardCode: 'ACC-1.7',
            prompt: 'Interpret generated chart totals and compute equity for decision summary.',
            problemTemplate: {
              parameters: { assets: { min: 10000, max: 21000, step: 100 }, liabilities: { min: 3000, max: 12000, step: 100 } },
              answerFormula: 'assets - liabilities',
              questionTemplate: 'Chart shows assets {{assets}} and liabilities {{liabilities}}. Compute equity.',
              tolerance: 1,
            },
          },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 70,
        partialCredit: false,
      },
    },
  ],
} as const;

type SeedData = typeof LESSON_11_SEED_DATA;
type PhaseSeedData = SeedData['phases'][number];
type SectionData = PhaseSeedData['sections'][number];

async function createPhase(
  db: ReturnType<typeof drizzle>,
  phaseData: PhaseSeedData,
  versionId: string,
) {
  await db.execute(sql`
    INSERT INTO phase_versions (id, lesson_version_id, phase_number, title, estimated_minutes, created_at)
    VALUES (
      ${phaseData.id}::uuid,
      ${versionId}::uuid,
      ${phaseData.phaseNumber},
      ${phaseData.title},
      ${phaseData.estimatedMinutes},
      NOW()
    )
    ON CONFLICT (lesson_version_id, phase_number)
    DO UPDATE SET title = EXCLUDED.title, estimated_minutes = EXCLUDED.estimated_minutes
  `);

  await db.execute(sql`
    DELETE FROM phase_sections
    WHERE phase_version_id = ${phaseData.id}::uuid
      AND sequence_order > ${phaseData.sections.length}
  `);

  for (let i = 0; i < phaseData.sections.length; i++) {
    const section = phaseData.sections[i] as SectionData;
    await db.execute(sql`
      INSERT INTO phase_sections (phase_version_id, sequence_order, section_type, content, created_at)
      VALUES (
        ${phaseData.id}::uuid,
        ${i + 1},
        ${section.sectionType},
        ${JSON.stringify(section.content)}::jsonb,
        NOW()
      )
      ON CONFLICT (phase_version_id, sequence_order)
      DO UPDATE SET section_type = EXCLUDED.section_type, content = EXCLUDED.content
    `);
  }
}

export async function seedLesson11(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) throw new Error('DIRECT_URL not set in environment');

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    const { lesson, version, standards, phases, activities } = LESSON_11_SEED_DATA;

    await db.execute(sql`
      INSERT INTO lessons (id, unit_number, title, slug, description, learning_objectives, order_index, created_at, updated_at)
      VALUES (
        ${lesson.id}::uuid, ${lesson.unitNumber}, ${lesson.title}, ${lesson.slug},
        ${lesson.description}, ${JSON.stringify(lesson.learningObjectives)}::jsonb,
        ${lesson.orderIndex}, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, slug = EXCLUDED.slug,
        description = EXCLUDED.description, learning_objectives = EXCLUDED.learning_objectives,
        order_index = EXCLUDED.order_index, updated_at = NOW()
    `);

    await db.execute(sql`
      INSERT INTO lesson_versions (id, lesson_id, version, title, description, status, created_at)
      VALUES (${version.id}::uuid, ${lesson.id}::uuid, 1, ${version.title}, ${version.description}, ${version.status}, NOW())
      ON CONFLICT (lesson_id, version) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status
    `);

    for (const std of standards) {
      await db.execute(sql`
        INSERT INTO lesson_standards (lesson_version_id, standard_id, is_primary, created_at)
        SELECT ${version.id}::uuid, id, ${std.isPrimary}, NOW()
        FROM competency_standards WHERE code = ${std.code}
        ON CONFLICT (lesson_version_id, standard_id) DO UPDATE SET is_primary = EXCLUDED.is_primary
      `);
    }

    for (const act of activities) {
      await db.execute(sql`
        INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
        VALUES (
          ${act.id}::uuid, ${act.componentKey}, ${act.displayName}, ${act.description},
          ${JSON.stringify(act.props)}::jsonb, ${JSON.stringify(act.gradingConfig)}::jsonb,
          NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          component_key = EXCLUDED.component_key, display_name = EXCLUDED.display_name,
          description = EXCLUDED.description, props = EXCLUDED.props,
          grading_config = EXCLUDED.grading_config, updated_at = NOW()
      `);
    }

    for (const phase of phases) {
      await createPhase(db, phase, version.id);
    }

    await db.execute(sql`
      UPDATE lessons SET current_version_id = ${version.id}::uuid WHERE id = ${lesson.id}::uuid
    `);

    console.log('✅ Lesson 11 seeded successfully');
  } finally {
    await queryClient.end();
  }
}

if (require.main === module) {
  seedLesson11()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
