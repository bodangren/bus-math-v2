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

/* eslint-disable @typescript-eslint/no-explicit-any */

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
} as const;

// ─── Section helpers ──────────────────────────────────────────────────────────

function text(markdown: string) {
  return { sectionType: 'text' as const, content: { markdown } };
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
        text(`## The Problem with TechStart's Books

Sarah Chen opened her laptop and stared at her screen. TechStart Solutions had just completed its best month ever — three new clients, two hardware orders, and a server upgrade. But her accounting notebook was a mess.

"Laptop purchase: $2,400." "Client deposit: $1,500." "Internet bill: $89." "Owner's investment: $5,000."

Nothing was organized. Was TechStart making money? Did she owe more than she owned? She had no idea.

Sound familiar? Every business — from a lemonade stand to a Fortune 500 company — faces this problem. The solution has existed for over 500 years.`),
        callout(
          'why-this-matters',
          'The accounting equation **A = L + E** is the foundation of every financial statement ever made. Banks use it to decide whether to give loans. Investors use it to decide whether to buy stock. You will use it to run TechStart. Once you understand it, you can read any company\'s financial health at a glance.',
        ),
        text(`## Today's Mission

By the end of this lesson, you will understand the three building blocks of the accounting equation and explain why they must always balance.

Let's fix Sarah's books — starting with the most powerful idea in accounting.`),
      ],
    },
    {
      id: IDS.PHASES[2],
      phaseNumber: 2,
      title: 'Introduction: What Is A = L + E?',
      estimatedMinutes: 15,
      sections: [
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
        text(`## TechStart's First Day

Sarah invests **$5,000** of her own money to start TechStart:

| Change | Amount |
|--------|--------|
| Assets (Cash) | +$5,000 |
| Equity (Sarah's Investment) | +$5,000 |

**Check:** $5,000 (Assets) = $0 (Liabilities) + $5,000 (Equity) ✅

Next, she borrows **$2,000** from the bank to buy equipment:

| Change | Amount |
|--------|--------|
| Assets (Equipment) | +$2,000 |
| Liabilities (Bank Loan) | +$2,000 |

**Check:** $7,000 (Assets) = $2,000 (Liabilities) + $5,000 (Equity) ✅

Notice: the equation balances after *every single transaction*, no matter what.`),
      ],
    },
    {
      id: IDS.PHASES[3],
      phaseNumber: 3,
      title: 'Guided Practice: Sort It Out',
      estimatedMinutes: 20,
      sections: [
        text(`## Card Sort Activity

Below is a list of items from TechStart's records. Work with a partner to sort each item into the correct category: **Asset**, **Liability**, or **Equity**.

Write your answers in the table before revealing the correct category.

| Item | Your Category | Correct Category |
|------|--------------|-----------------|
| Cash in TechStart's bank account | ? | Asset |
| Laptop purchased for client work | ? | Asset |
| $3,000 bank loan | ? | Liability |
| Unpaid electricity bill ($120) | ? | Liability |
| Sarah's $5,000 startup investment | ? | Equity |
| Last month's profit kept in the business | ? | Equity |
| Accounts receivable from Client A | ? | Asset |
| Credit card balance ($450) | ? | Liability |

**Goal:** Get all 8 correct before moving on.`),
        callout('example', `**Walking Through Two Examples**

**Cash ($4,200 in the bank):**
Does TechStart *own* it? Yes. Does it have value? Yes. → **Asset**

**Bank Loan ($3,000):**
Does TechStart *owe* this to someone? Yes (the bank). → **Liability**

Same logic applies to every item. Ask: "Does TechStart own it, owe it, or is it the owner's share?"`),
        text(`## Making It Stick

A simple memory trick for the three categories:

- **Asset** → "A" for **"Aces"** — things that *help* the business win
- **Liability** → "L" for **"Load"** — things that *weigh* the business down
- **Equity** → "E" for **"Earned"** — what the owner has *earned* through investment and profit

When in doubt, ask yourself: "Who has a claim on this item — the business itself (Asset), a creditor (Liability), or the owner (Equity)?"`),
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
        activity(IDS.ACTIVITY_EXIT_TICKET, true, IDS.LESSON),
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
      id: IDS.ACTIVITY_EXIT_TICKET,
      componentKey: 'comprehension-quiz',
      displayName: 'Exit Ticket: Define A, L, and E',
      description: 'Five questions to confirm you understand the three parts of the accounting equation.',
      props: {
        title: 'Exit Ticket: Define A, L, and E',
        description: 'Answer each question on your own. Score 4/5 to unlock Lesson 2.',
        showExplanations: true,
        allowRetry: true,
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
