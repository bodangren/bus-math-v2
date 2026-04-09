/**
 * Unit 1, Lesson 1 — Launch Unit: A=L+E (ACC-1.1)
 *
 * Seeds "Launch Unit: A=L+E" using the versioned content schema.
 * All content follows the unit_01_lesson_matrix.md row for L1:
 *  - Accounting focus: Accounting equation; A, L, E definitions
 *  - Excel skill: Orientation; file hygiene; basic formatting
 *  - Formative product: Exit ticket — define A/L/E in your own words
 *
 * Usage:
 *   npx tsx supabase/seed/unit1/lesson-01.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

// ─── Deterministic IDs (d6b57545 namespace, Lesson 1) ────────────────────────

export const IDS = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000001',
  VERSION: 'd6b57545-65f6-4c39-80d5-000100000002',
  PHASES: {
    1: 'd6b57545-65f6-4c39-80d5-000100000100',
    2: 'd6b57545-65f6-4c39-80d5-000100000200',
    3: 'd6b57545-65f6-4c39-80d5-000100000300',
    4: 'd6b57545-65f6-4c39-80d5-000100000400',
    5: 'd6b57545-65f6-4c39-80d5-000100000500',
    6: 'd6b57545-65f6-4c39-80d5-000100000600',
  },
  ACTIVITY_EXIT_TICKET: 'd6b57545-65f6-4c39-80d5-000100001001',
  ACTIVITY_NOTEBOOK_SIM: 'd6b57545-65f6-4c39-80d5-000100001002',
  ACTIVITY_NOTEBOOK_SIM_INDEPENDENT: 'd6b57545-65f6-4c39-80d5-000100001003',
} as const;

// ─── Section helpers ──────────────────────────────────────────────────────────

function text(markdown: string) {
  return { sectionType: 'text' as const, content: { markdown } };
}

function video(videoUrl: string, duration: number, transcript: string) {
  return { sectionType: 'video' as const, content: { videoUrl, duration, transcript } };
}

function callout(variant: 'why-this-matters' | 'tip' | 'warning' | 'example', content: string) {
  return { sectionType: 'callout' as const, content: { variant, content } };
}

function activity(activityId: string, required: boolean, linkedStandardId?: string) {
  return {
    sectionType: 'activity' as const,
    content: { activityId, required, ...(linkedStandardId ? { linkedStandardId } : {}) },
  };
}

// ─── Exported seed data (used by tests) ──────────────────────────────────────

export const LESSON_01_SEED_DATA = {
  lesson: {
    id: IDS.LESSON,
    slug: 'unit-1-lesson-1',
    title: 'Launch Unit: A = L + E',
    unitNumber: 1,
    orderIndex: 1,
    description:
      'Introduce the fundamental accounting equation and explore why financial balance is the cornerstone of every business.',
    learningObjectives: [
      'Define Assets, Liabilities, and Equity in plain language',
      'Explain why the accounting equation must always balance',
      'Identify how a simple business event affects the equation',
    ],
  },
  version: {
    id: IDS.VERSION,
    title: 'Launch Unit: A = L + E',
    description: "Discover the accounting equation through Sarah Chen's TechStart story.",
    status: 'published',
  },
  standards: [
    { code: 'ACC-1.1', isPrimary: true },
  ],
  phases: [
    {
      id: IDS.PHASES[1],
      phaseNumber: 1,
      title: "Hook: Sarah's Messy Notebook",
      estimatedMinutes: 10,
      sections: [
        text(`## The Messy Notebook Challenge

Sarah Chen opened her laptop and stared at her screen. TechStart Solutions had just completed its best month ever — three new clients, two hardware orders, and a server upgrade. But her accounting notebook was a mess.

"Laptop purchase: $2,400." "Client deposit: $1,500." "Internet bill: $89." "Owner's investment: $5,000."

Nothing was organized. Every business — from a lemonade stand to a Fortune 500 company — faces this problem. The solution has existed for over 500 years.`),
        text(`### Turn-and-Talk
If you were Sarah, how would you figure out if you're actually **"ahead"** or **"behind"** right now? Share your idea with a partner.`),
        callout(
          'why-this-matters',
          'The accounting equation **A = L + E** is the foundation of every financial statement ever made. Banks use it to decide whether to give loans. Investors use it to decide whether to buy stock. You will use it to run TechStart. Once you understand it, you can read any company\'s financial health at a glance.',
        ),
      ],
    },
    {
      id: IDS.PHASES[2],
      phaseNumber: 2,
      title: 'Introduction: What Is A = L + E?',
      estimatedMinutes: 15,
      sections: [
        video(
          'https://www.youtube.com/watch?v=IN4MBaOdLRY',
          5,
          `Welcome to Unit 1 of Math for Business Operations. I'm excited to introduce you to the most important idea in all of accounting: the accounting equation.

Every business — no matter how big or small — keeps track of three things. First: everything it owns. Second: everything it owes. Third: everything that belongs to the owner. These three buckets have names. Assets, Liabilities, and Equity.

Here's the rule that connects them, and it never breaks: Assets equal Liabilities plus Equity.

Let's think about TechStart Solutions, the company we'll follow all year. When Sarah Chen started TechStart, she put in five thousand dollars of her own money. That five thousand is an Asset because TechStart now has cash. It's also Equity because it's Sarah's own investment. Assets equal Equity. The equation balances.

Then Sarah borrowed three thousand dollars from a bank to buy equipment. Now TechStart has eight thousand dollars in Assets. But three thousand of that came from the bank — that's a Liability. And five thousand still belongs to Sarah — that's Equity. Eight thousand equals three thousand plus five thousand. The equation still balances.

Every single transaction in TechStart's history follows this pattern. Something changes on the left side, something changes on the right side, and the equation always stays balanced.

In this unit, you'll learn to classify every account as an Asset, a Liability, or Equity. You'll trace how business events move money between these categories. And you'll build TechStart's first real Balance Sheet.

The accounting equation isn't just a formula to memorize. It's a lens for understanding every financial decision a business makes. Let's get started.`,
        ),
        text(`## The Three Building Blocks

Every dollar in a business belongs to one of three categories:

**Assets (A)** — Things the business *owns* or controls that have value.
- TechStart examples: Cash in the bank, laptops, accounts receivable (money clients owe you)

**Liabilities (L)** — Things the business *owes* to others.
- TechStart examples: Bank loan, unpaid internet bill, credit card balance

**Equity (E)** — The owner's stake in the business. What's left over after paying all debts.
- TechStart examples: Sarah's original investment, profits kept in the business

**The rule that never breaks:**

> **Assets = Liabilities + Equity**
> (What you own) = (What you owe) + (Owner's share)

Think of it this way: everything TechStart owns was paid for either by borrowing money (Liabilities) or by Sarah's own contributions (Equity). There is no third option. This is why the equation *always* balances.`),
      ],
    },
    {
      id: IDS.PHASES[3],
      phaseNumber: 3,
      title: 'Guided Practice: Sort It Out',
      estimatedMinutes: 20,
      sections: [
        text(`## The Notebook Organizer

Sarah has dozens of scraps of paper representing different parts of TechStart. Before we can build a proper spreadsheet, we need to sort these "buckets."

Open the simulation below and help Sarah categorize her records into **Assets**, **Liabilities**, and **Equity**.`),
        activity(IDS.ACTIVITY_NOTEBOOK_SIM, true),
        text(`## Why did it stay balanced?
As you sorted the items, did you notice how every "Asset" Sarah had was either something she bought with a loan (Liability) or something she provided herself (Equity)? 

If Sarah buys a new laptop using $2,000 from her bank account, her total Assets stay the same (Cash goes down, Equipment goes up). If she buys it on credit, her Assets go up and her Liabilities go up. **The equation always stays in balance.**`),
      ],
    },
    {
      id: IDS.PHASES[4],
      phaseNumber: 4,
      title: 'Independent Practice: Pair Sort & Share',
      estimatedMinutes: 20,
      sections: [
        text(`## Your Turn: Sort TechStart's Full Account List

Sarah has compiled her complete account list for Month 1. Work individually to classify each account, then compare your answers with a partner.

| Account Name | Balance | Category (A / L / E) |
|---|---|---|
| Cash | $4,200 | ? |
| Office Supplies | $310 | ? |
| Accounts Receivable | $1,500 | ? |
| Laptops (2) | $2,400 | ? |
| Bank Loan | $3,000 | ? |
| Accounts Payable | $450 | ? |
| Sarah's Capital | $5,000 | ? |
| Retained Earnings | $960 | ? |

**Step 1:** Classify each account individually (2 minutes).
**Step 2:** Compare with your partner. Discuss any differences.
**Step 3:** Calculate the total for each category. Does A = L + E?`),
        activity(IDS.ACTIVITY_NOTEBOOK_SIM_INDEPENDENT, true),
        text(`## Share-Out Preparation

After you finish the sort, prepare to share one insight with the class:

1. **Which account was the hardest to classify?** Why did it confuse you?
2. **Did your totals balance?** If not, which side was larger — and what does that tell you?
3. **In your own words:** Why must Assets always equal Liabilities plus Equity?

Write two to three sentences for question 3. You will use this explanation in your exit ticket.`),
      ],
    },
    {
      id: IDS.PHASES[5],
      phaseNumber: 5,
      title: 'Assessment: Exit Ticket',
      estimatedMinutes: 10,
      sections: [
        text(`## Prove Your Understanding

Time to show what you know. This exit ticket has five questions covering today's lesson.

Answer each question on your own — no notes, no partners. Your goal is to score at least 4 out of 5 before moving on to Lesson 2.

You can retry once if you don't hit the target. Each retry randomizes the answer order, so read carefully.`),
        activity(IDS.ACTIVITY_EXIT_TICKET, true),
      ],
    },
    {
      id: IDS.PHASES[6],
      phaseNumber: 6,
      title: 'Closing: Why Balance Builds Trust',
      estimatedMinutes: 5,
      sections: [
        text(`## Reflect: Why Does This Matter?

You just learned the most fundamental rule in all of accounting. Take a moment to think about why it matters beyond the classroom.

**The accounting equation builds trust:**

When a bank considers giving TechStart a loan, they look at the Balance Sheet — which is built entirely on A = L + E. If Sarah's books balance, it signals discipline and reliability. If they don't balance, it signals an error or worse.

Financial balance isn't just math. It's a promise: "We know where every dollar came from, and every dollar is accounted for."

**Reflection prompt:** Think of a business you use regularly (a coffee shop, an app, a store). Write one sentence explaining how the accounting equation applies to that business.`),
        text(`## What's Coming Next

In **Lesson 2**, you will go deeper into account classification. You'll learn:
- Why some accounts are harder to classify than others ("gray zone" accounts)
- How to build an Excel Table from a CSV file and tag each account type
- The normal balance for each account category

**Before Lesson 2:** Make sure you can define Asset, Liability, and Equity without looking at your notes. That foundation will make everything that follows much easier.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS.ACTIVITY_NOTEBOOK_SIM,
      componentKey: 'notebook-organizer',
      displayName: 'The Notebook Organizer',
      description: "Help Sarah sort her messy desk into 'What she has' vs 'What she owes'.",
      props: {
        title: 'The Notebook Organizer',
        description: "Sort Sarah's scraps of paper into the correct accounting buckets.",
        problemTemplate: {
          parameters: {
            assets: { min: 3000, max: 9000, step: 100 },
            liabilities: { min: 1000, max: 5000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'Given assets {{assets}} and liabilities {{liabilities}}, compute equity.',
          tolerance: 1,
        },
        initialMessage: "Sarah's desk is a mess! Help her sort these items so she can see if her business is in balance.",
        successMessage: "Great job! Sarah's records are now organized. Now we can see the A = L + E equation in action.",
        items: [
          { id: 'item1', label: 'Cash in Bank', amount: 4200, category: 'asset', description: 'Money available for business use.', icon: 'cash' },
          { id: 'item2', label: 'New Laptop', amount: 1200, category: 'asset', description: 'Computer used for client server work.', icon: 'equipment' },
          { id: 'item3', label: 'Bank Loan', amount: 1450, category: 'liability', description: 'Money borrowed to buy equipment.', icon: 'bill' },
          { id: 'item4', label: 'Sarah\'s Investment', amount: 5000, category: 'equity', description: 'Personal savings put into the business.', icon: 'owner' },
          { id: 'item5', label: 'Client Unpaid Invoice', amount: 1500, category: 'asset', description: 'Money a client owes TechStart.', icon: 'receivable' },
          { id: 'item6', label: 'Credit Card Bill', amount: 450, category: 'liability', description: 'Unpaid balance for office supplies.', icon: 'bill' },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 83,
        partialCredit: false,
      },
    },
    {
      id: IDS.ACTIVITY_NOTEBOOK_SIM_INDEPENDENT,
      componentKey: 'notebook-organizer',
      displayName: 'Independent Notebook Sort',
      description: 'Sort a larger set of accounts into A, L, and E categories without hints.',
      props: {
        title: 'Independent Notebook Sort',
        description: "Classify each account into the correct accounting bucket — no hints this time.",
        problemTemplate: {
          parameters: {
            assets: { min: 3000, max: 9000, step: 100 },
            liabilities: { min: 1000, max: 5000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'Given assets {{assets}} and liabilities {{liabilities}}, compute equity.',
          tolerance: 1,
        },
        successMessage: "Nice work! You classified every account correctly on your own.",
        items: [
          { id: 'item1', label: 'Cash in Bank', amount: 4200, category: 'asset', description: 'Money available for business use.', icon: 'cash' },
          { id: 'item2', label: 'New Laptop', amount: 1200, category: 'asset', description: 'Computer used for client server work.', icon: 'equipment' },
          { id: 'item3', label: 'Bank Loan', amount: 3000, category: 'liability', description: 'Money borrowed to buy equipment.', icon: 'bill' },
          { id: 'item4', label: 'Sarah\'s Investment', amount: 2500, category: 'equity', description: 'Personal savings put into the business.', icon: 'owner' },
          { id: 'item5', label: 'Client Unpaid Invoice', amount: 1500, category: 'asset', description: 'Money a client owes TechStart.', icon: 'receivable' },
          { id: 'item6', label: 'Credit Card Bill', amount: 450, category: 'liability', description: 'Unpaid balance for office supplies.', icon: 'bill' },
          { id: 'item7', label: 'Prepaid Insurance', amount: 600, category: 'asset', description: 'Insurance paid in advance for 6 months.', icon: 'receivable' },
          { id: 'item8', label: 'Unearned Revenue', amount: 800, category: 'liability', description: 'Client deposit for services not yet performed.', icon: 'bill' },
          { id: 'item9', label: 'Retained Earnings', amount: 750, category: 'equity', description: 'Profits kept in the business from prior months.', icon: 'owner' },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 83,
        partialCredit: false,
      },
    },
    {
      id: IDS.ACTIVITY_EXIT_TICKET,
      componentKey: 'comprehension-quiz',
      displayName: 'Exit Ticket: Define A, L, and E',
      description: 'Five questions to confirm you understand the three parts of the accounting equation.',
      props: {
        title: 'Exit Ticket: Define A, L, and E',
        description: 'Answer each question on your own. Score 4/5 to unlock Lesson 2.',
        showExplanations: true,
        allowRetry: true,
        problemTemplate: {
          parameters: {
            assets: { min: 4000, max: 12000, step: 100 },
            liabilities: { min: 1000, max: 6000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'TechStart has assets {{assets}} and liabilities {{liabilities}}. Find equity.',
          tolerance: 1,
        },
        questions: [
          {
            id: 'q1',
            text: 'Which of the following BEST describes an Asset?',
            type: 'multiple-choice',
            options: [
              'Something the business owes to another party',
              'Something the business owns or controls that has economic value',
              'The owner\'s share of the business',
              'Money received from selling goods or services',
            ],
            correctAnswer: 'Something the business owns or controls that has economic value',
            explanation: 'Assets are things the business owns (cash, equipment, receivables). They appear on the left side of the equation: A = L + E.',
          },
          {
            id: 'q2',
            text: 'TechStart borrowed $3,000 from the bank. How does this affect the accounting equation?',
            type: 'multiple-choice',
            options: [
              'Assets +$3,000; Equity +$3,000',
              'Assets +$3,000; Liabilities +$3,000',
              'Liabilities +$3,000; Equity −$3,000',
              'Assets −$3,000; Liabilities −$3,000',
            ],
            correctAnswer: 'Assets +$3,000; Liabilities +$3,000',
            explanation: 'The loan gives TechStart cash (Asset ↑) but creates an obligation to repay the bank (Liability ↑). Both sides of the equation increase by the same amount, so it stays balanced.',
          },
          {
            id: 'q3',
            text: 'Sarah invested $5,000 of her own money into TechStart. What category does this belong to?',
            type: 'multiple-choice',
            options: ['Asset', 'Liability', 'Equity', 'Revenue'],
            correctAnswer: 'Equity',
            explanation: 'When an owner puts money into a business, it increases Equity (the owner\'s stake). The cash received is an Asset, and the owner\'s claim to that cash is Equity.',
          },
          {
            id: 'q4',
            text: 'The accounting equation must always balance.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'Every transaction affects at least two accounts in a way that keeps A = L + E balanced. This is called the dual-entry principle and is why the equation always holds.',
          },
          {
            id: 'q5',
            text: 'Which account below is a Liability for TechStart?',
            type: 'multiple-choice',
            options: [
              'Cash in the bank',
              'Laptop computer',
              'Unpaid electricity bill',
              'Sarah\'s original investment',
            ],
            correctAnswer: 'Unpaid electricity bill',
            explanation: 'An unpaid bill is money TechStart owes to the utility company — that\'s a Liability. Cash and equipment are Assets; Sarah\'s investment is Equity.',
          },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: false,
      },
    },
  ],
} as const;

// ─── Type helpers ─────────────────────────────────────────────────────────────

type SeedData = typeof LESSON_01_SEED_DATA;
type PhaseSeedData = SeedData['phases'][number];
type SectionData = PhaseSeedData['sections'][number];

// ─── DB seeding ───────────────────────────────────────────────────────────────

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

  // Delete stale sections beyond the current count
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

export async function seedLesson01(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) throw new Error('DIRECT_URL not set in environment');

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    const { lesson, version, standards, phases, activities } = LESSON_01_SEED_DATA;

    // 1. Upsert base lesson
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

    // 2. Upsert lesson version
    await db.execute(sql`
      INSERT INTO lesson_versions (id, lesson_id, version, title, description, status, created_at)
      VALUES (${version.id}::uuid, ${lesson.id}::uuid, 1, ${version.title}, ${version.description}, ${version.status}, NOW())
      ON CONFLICT (lesson_id, version) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status
    `);

    // 3. Link standards (look up by code to get UUID)
    for (const std of standards) {
      await db.execute(sql`
        INSERT INTO lesson_standards (lesson_version_id, standard_id, is_primary, created_at)
        SELECT ${version.id}::uuid, id, ${std.isPrimary}, NOW()
        FROM competency_standards WHERE code = ${std.code}
        ON CONFLICT (lesson_version_id, standard_id) DO UPDATE SET is_primary = EXCLUDED.is_primary
      `);
    }

    // 4. Upsert activities
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

    // 5. Upsert all phases and their sections
    for (const phase of phases) {
      await createPhase(db, phase, version.id);
    }

    // 6. Point lesson.current_version_id at this version
    await db.execute(sql`
      UPDATE lessons SET current_version_id = ${version.id}::uuid WHERE id = ${lesson.id}::uuid
    `);

    console.log('✅ Lesson 01 seeded successfully');
  } finally {
    await queryClient.end();
  }
}

if (require.main === module) {
  seedLesson01()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
