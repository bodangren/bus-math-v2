/**
 * Unit 1, Lesson 3 — Apply A/L/E to Business Events (ACC-1.4)
 *
 * Seeds "Apply A/L/E to Business Events" using the versioned content schema.
 * All content follows the unit_01_lesson_matrix.md row for L3:
 *  - Accounting focus: Transaction effects on A/L/E (conceptual, dual-impact idea)
 *  - Excel skill: SUMIF by category; structured references
 *  - Formative product: Equation-check cell passes for 5–7 events
 *
 * Usage:
 *   npx tsx supabase/seed/unit1/lesson-03.ts
 */


import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

// ─── Deterministic IDs (d6b57545 namespace, Lesson 3) ────────────────────────

export const IDS = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000003',
  VERSION: 'd6b57545-65f6-4c39-80d5-000300000002',
  PHASES: {
    1: 'd6b57545-65f6-4c39-80d5-000300000100',
    2: 'd6b57545-65f6-4c39-80d5-000300000200',
    3: 'd6b57545-65f6-4c39-80d5-000300000300',
    4: 'd6b57545-65f6-4c39-80d5-000300000400',
    5: 'd6b57545-65f6-4c39-80d5-000300000500',
    6: 'd6b57545-65f6-4c39-80d5-000300000600',
  },
  ACTIVITY_EXIT_TICKET: 'd6b57545-65f6-4c39-80d5-000300001001',
} as const;

// ─── Section helpers ──────────────────────────────────────────────────────────

function text(markdown: string) {
  return { sectionType: 'text' as const, content: { markdown } };
}

function callout(variant: 'why-this-matters' | 'tip' | 'warning' | 'example', content: string) {
  return { sectionType: 'callout' as const, content: { variant, content } };
}

function activity(activityId: string, required: boolean) {
  return {
    sectionType: 'activity' as const,
    content: { activityId, required },
  };
}

// ─── Exported seed data (used by tests) ──────────────────────────────────────

export const LESSON_03_SEED_DATA = {
  lesson: {
    id: IDS.LESSON,
    slug: 'unit-1-lesson-3',
    title: 'Apply A/L/E to Business Events',
    unitNumber: 1,
    orderIndex: 3,
    description:
      "Trace how each of TechStart's business events shifts Assets, Liabilities, and Equity — without touching debits or credits yet.",
    learningObjectives: [
      'Describe how a business event affects the accounting equation',
      'Identify which two parts of A = L + E change in each transaction',
      'Verify that the equation remains balanced after a series of events',
    ],
  },
  version: {
    id: IDS.VERSION,
    title: 'Apply A/L/E to Business Events',
    description: "Follow TechStart's Month 2 transactions and watch the equation stay balanced.",
    status: 'published',
  },
  standards: [
    { code: 'ACC-1.4', isPrimary: true },
  ],
  phases: [
    {
      id: IDS.PHASES[1],
      phaseNumber: 1,
      title: "Hook: TechStart's Busiest Week",
      estimatedMinutes: 10,
      sections: [
        text(`## Five Events. One Equation.

It's Week 2 of TechStart's second month. Sarah Chen has had a busy seven days:

1. A new client paid **$3,000** upfront for a consulting retainer
2. Sarah bought **$1,200** in new office equipment — paid with TechStart's cash
3. TechStart received a **$500** electricity bill (not yet paid)
4. A long-time client paid off their **$1,500** accounts receivable balance
5. Sarah made a **$200** payment toward the bank loan principal

At the end of the week, Sarah's bookkeeper asks: "Did the accounting equation stay balanced after all five of these?"

Sarah thinks for a moment. "I have no idea," she admits.

### Quick Case: The Coffee Bean Swap
If Sarah spends **$100** of her cash to buy **$100** worth of coffee beans, did her total Assets go **up**, **down**, or **stay the same**?

*Discuss with your partner. Does the "Equation Check" still pass?*

That's what this lesson fixes. By the end of today, you'll be able to trace exactly how each of these five events moves money between Assets, Liabilities, and Equity — and verify that the equation never breaks.`),
        callout(
          'why-this-matters',
          'Most business owners track income and expenses. Fewer understand how every transaction shifts the balance between what they own, what they owe, and what\'s theirs. This skill — called **transaction analysis** — is what separates someone who reads a financial report from someone who truly understands their business. You don\'t need debits and credits to do it. You just need the equation.',
        ),
        text(`## The Key Insight

Every business event touches **at least two places** in the accounting equation. This is called the **dual-impact** of transactions.

- Pay cash for equipment → Assets rearrange (Cash ↓, Equipment ↑) — no net change
- Borrow money from a bank → Assets ↑ AND Liabilities ↑
- Earn revenue in cash → Assets ↑ AND Equity ↑
- Pay an expense → Assets ↓ AND Equity ↓

The equation stays balanced because every change on one side is matched by a change somewhere else. Let's trace Sarah's five events.`),
      ],
    },
    {
      id: IDS.PHASES[2],
      phaseNumber: 2,
      title: 'Introduction: The Dual-Impact Concept',
      estimatedMinutes: 15,
      sections: [
        text(`## Introduction: The Dual-Impact Principle

Every business transaction changes at least two accounts in the accounting equation — this is the dual-impact principle, and it's why **A = L + E** always stays balanced.

Four patterns cover nearly every transaction you'll see: (1) one asset trades for another (rearranges A), (2) both A and L grow together (borrowing), (3) both A and L shrink together (paying off debt), (4) A and E grow together (earning revenue). The trickiest pattern: receiving an unpaid bill — L increases and E decreases, but A is unchanged. This is the **accrual principle**: expenses are recognized when incurred, not when cash is paid.

Today you'll trace five of TechStart's Week-2 transactions and verify that the equation stays balanced after every single one.`),
        text(`## How Events Move the Equation

When analyzing any business event, ask two questions:
1. **What did TechStart get or give up?** (This tells you which account changes)
2. **Where did it come from or go to?** (This tells you the other account)

Every answer maps to A, L, or E. And when you're done, both sides of **A = L + E** must still be equal.

---

### Event Analysis: TechStart's Five Week-2 Transactions

| # | Event | What Changes | Direction | Equation Check |
|---|-------|-------------|-----------|----------------|
| 1 | Client pays $3,000 retainer upfront | Cash (Asset) ↑, Deferred Revenue (Liability) ↑ | +3,000 / +3,000 | ✅ Both sides ↑ equally |
| 2 | Buy $1,200 equipment with cash | Equipment (Asset) ↑, Cash (Asset) ↓ | +1,200 / -1,200 | ✅ Assets rearrange, no net change |
| 3 | Receive $500 electricity bill (unpaid) | Electricity Expense → reduces Equity ↓, Accounts Payable (Liability) ↑ | -500 / +500 | ✅ E ↓ balanced by L ↑ |
| 4 | Client pays $1,500 AR balance | Cash (Asset) ↑, Accounts Receivable (Asset) ↓ | +1,500 / -1,500 | ✅ Assets rearrange |
| 5 | Pay $200 on bank loan principal | Cash (Asset) ↓, Bank Loan (Liability) ↓ | -200 / -200 | ✅ Both sides ↓ equally |

**Key observation:** The equation balanced after every single event — even though each event moved money in completely different ways.`),
        text(`## Why Expenses Reduce Equity

Event 3 is the trickiest. When TechStart gets the electricity bill, no cash leaves yet. But the equation still changes:

- Accounts Payable ↑ $500 (Liability — TechStart now owes the utility company)
- Equity ↓ $500 (Expenses reduce the owner's stake — the cost came out of TechStart's "worth")

This is confusing at first because nothing seems to happen visibly. But the obligation to pay is real, and it reduces what belongs to Sarah. This is why recognizing expenses when they're *incurred* (not when they're *paid*) is a core accounting principle.

**Accrual concept in plain language:** If TechStart used the electricity this month, the cost belongs to this month — even if the bill arrives next week.`),
      ],
    },
    {
      id: IDS.PHASES[3],
      phaseNumber: 3,
      title: 'Guided Practice: Trace the Five Events',
      estimatedMinutes: 20,
      sections: [
        text(`## Event Tracing Exercise

**Setup in Excel:**
1. Open your account table from Lesson 2 (or create a fresh one)
2. Add two new columns: **Event** and **Change ($)**
3. For each event below, add rows showing which accounts changed

Work through each event. For each one, identify:
- Which accounts change (name and category: A, L, or E)
- The direction and dollar amount (+/-)
- Whether the equation still balances after that event

| Event | Starting Point |
|---|---|
| **Event 1**: Client pays $3,000 retainer | Cash: $4,200; Deferred Revenue: $0 |
| **Event 2**: Buy $1,200 equipment | Cash reflects Event 1; Equipment: $2,400 |
| **Event 3**: Receive $500 electricity bill | AP: $450; Equity (Net Income): $340 |
| **Event 4**: Client pays $1,500 AR | AR: $1,500; Cash reflects Events 1+2 |
| **Event 5**: Pay $200 bank loan principal | Bank Loan: $3,000; Cash reflects all prior events |

**After all five events, verify:**
Use SUMIF to total Assets, Liabilities, and Equity. Both sides of the equation should match.`),
        callout('tip', `**SUMIF Formula Reminder**

To sum all Assets: \`=SUMIF(CategoryColumn,"A",BalanceColumn)\`
To sum all Liabilities: \`=SUMIF(CategoryColumn,"L",BalanceColumn)\`
To sum all Equity: \`=SUMIF(CategoryColumn,"E",BalanceColumn)\`

Then create an equation-check cell: \`=B_Assets - (B_Liabilities + B_Equity)\`

If this cell shows **0**, your equation balances. If it shows anything else, there's a misclassification or missing entry.`),
        text(`## Discussion Questions

After you've traced all five events:

1. **Which event surprised you most?** Why?
2. **Event 4 (client pays AR):** Why doesn't this event change Equity, even though TechStart receives cash?
3. **Event 5 (pay loan):** Why do *both* Assets and Liabilities decrease? Who "loses" in this transaction?

Write your answers in two to three sentences each. You'll use these in the reflection at the end of the lesson.`),
      ],
    },
    {
      id: IDS.PHASES[4],
      phaseNumber: 4,
      title: 'Independent Practice: Two More Events',
      estimatedMinutes: 20,
      sections: [
        text(`## Apply It Yourself

TechStart had two more events this month. Work individually to trace each one.

**Event 6:** Sarah invoices a new client **$2,000** for a completed project. The client hasn't paid yet.

- What account goes up? (Hint: TechStart is owed money — what kind of account is that?)
- What else changes? (Hint: TechStart earned revenue — which category does earned revenue affect?)
- Does the equation stay balanced?

**Event 7:** TechStart pays **$600** in accrued wages that were recorded last week.

- What account goes down? (Cash is leaving — which category?)
- What else changes? (The obligation is paid off — which category tracked that obligation?)
- Does the equation stay balanced?

| Event | Accounts Affected | Change ($) | Equation Check |
|---|---|---|---|
| 6: Invoice client $2,000 | ? | ? | ✅ or ❌ |
| 7: Pay $600 wages | ? | ? | ✅ or ❌ |`),
        text(`## Verify with SUMIF

After adding Events 6 and 7 to your Excel Table:

1. Recalculate your SUMIF totals for A, L, and E
2. Check that the equation-check cell still shows **0**
3. Compare your results with a partner

**Expected running totals after all 7 events (from opening balances in the lesson):**

Starting Assets: $8,760 (from Lesson 2 close)
Net change from Events 1–7: +$3,000 - $1,200 + $1,500 - $200 + $2,000 - $600 = **+$4,500**
Expected Assets: ~$13,260

Starting Liabilities: $5,150
Net change: +$3,000 (retainer) + $500 (elec.) - $200 (loan) - $600 (wages paid) = **+$2,700**
Expected Liabilities: ~$7,850

Starting Equity: $3,610
Net change: - $500 (expense) + $2,000 (revenue) = **+$1,500**
Expected Equity: ~$5,110 (note: drawings and retained earnings adjustments may vary by setup)

If your equation check shows 0, you've correctly traced all seven events.`),
      ],
    },
    {
      id: IDS.PHASES[5],
      phaseNumber: 5,
      title: 'Assessment: Exit Ticket',
      estimatedMinutes: 10,
      sections: [
        text(`## Show What You Know

Five questions about how business events affect the accounting equation.

Think through the dual-impact of each event before answering. You're not guessing — you're tracing.

Score 4 out of 5 to move on to Lesson 4.`),
        activity(IDS.ACTIVITY_EXIT_TICKET, true),
      ],
    },
    {
      id: IDS.PHASES[6],
      phaseNumber: 6,
      title: 'Closing: What Surprised You?',
      estimatedMinutes: 5,
      sections: [
        text(`## Debrief: The Surprising Parts

Every class has the same two "aha moments" in this lesson:

**Surprise 1: Assets rearranging (Events 2 and 4)**
Many students expect that receiving cash or buying something must change the equation totals. But when you swap one asset for another (cash for equipment, AR for cash), the total Assets stays the same. The equation doesn't change — it just rearranges.

**Surprise 2: Expenses hitting Equity before cash moves**
Getting a bill doesn't feel like losing money. But the obligation is real, and it reduces TechStart's net worth immediately — even before the cash leaves. This is the *accrual* principle, and it's one of the most important ideas in accounting.

**Reflection prompt:** Pick one of the seven events from today. In three sentences, explain:
1. What happened in the event
2. Which two accounts changed
3. Why the equation stayed balanced`),
        text(`## Looking Ahead: Lesson 4

You've now classified accounts *and* traced how events affect them. In **Lesson 4**, you'll organize all this information into the most important financial statement: the **Balance Sheet**.

You'll learn:
- How to structure Assets into Current and Non-Current sections
- How to write labeled subtotals
- How to build TechStart's first real Balance Sheet from the data you've been tracking

**Before Lesson 4:** Review the account list from Lesson 2. You'll be mapping every account to a specific section of the Balance Sheet.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS.ACTIVITY_EXIT_TICKET,
      componentKey: 'comprehension-quiz',
      displayName: 'Exit Ticket: Event Effects on A/L/E (L3)',
      description: 'Five questions tracing how business events affect Assets, Liabilities, and Equity.',
      props: {
        title: 'Exit Ticket: How Events Change A = L + E',
        description: 'Trace the dual-impact of each event. Score 4/5 to unlock Lesson 4.',
        showExplanations: true,
        allowRetry: true,
        questions: [
          {
            id: 'q1',
            text: 'TechStart receives $3,000 cash from a client for work to be done next month. Which accounts change?',
            type: 'multiple-choice',
            options: [
              'Cash (Asset) ↑ and Revenue (Equity) ↑',
              'Cash (Asset) ↑ and Deferred Revenue (Liability) ↑',
              'Accounts Receivable (Asset) ↑ and Revenue (Equity) ↑',
              'Cash (Asset) ↑ and Equity ↑ directly',
            ],
            correctAnswer: 'Cash (Asset) ↑ and Deferred Revenue (Liability) ↑',
            explanation: "Cash increases because TechStart received money. But the work isn't done yet, so it's not earned revenue — it's a Liability (Deferred Revenue). TechStart owes the client the service.",
          },
          {
            id: 'q2',
            text: 'TechStart pays $1,200 cash for new office equipment. How does this affect the equation?',
            type: 'multiple-choice',
            options: [
              'Total Assets decrease by $1,200',
              'Assets rearrange: Cash ↓ $1,200, Equipment ↑ $1,200 — no net change',
              'Equity decreases by $1,200 (it\'s an expense)',
              'Liabilities increase by $1,200 (TechStart used credit)',
            ],
            correctAnswer: 'Assets rearrange: Cash ↓ $1,200, Equipment ↑ $1,200 — no net change',
            explanation: 'Paying cash for equipment swaps one Asset for another. Cash goes down; Equipment goes up. Total Assets stay the same, and the equation stays balanced.',
          },
          {
            id: 'q3',
            text: 'TechStart receives a $500 electricity bill but hasn\'t paid it yet. What happens?',
            type: 'multiple-choice',
            options: [
              'Nothing changes until TechStart actually pays',
              'Cash (Asset) decreases by $500',
              'Accounts Payable (Liability) ↑ $500 and Equity ↓ $500 (expense incurred)',
              'Equity increases by $500 (TechStart saved cash)',
            ],
            correctAnswer: 'Accounts Payable (Liability) ↑ $500 and Equity ↓ $500 (expense incurred)',
            explanation: 'Under accrual accounting, expenses are recorded when incurred — not when paid. The bill creates an obligation (Liability ↑) and reduces TechStart\'s net worth (Equity ↓ via expense).',
          },
          {
            id: 'q4',
            text: 'A client pays off their $1,500 Accounts Receivable balance. How does this affect Equity?',
            type: 'multiple-choice',
            options: [
              'Equity increases by $1,500 (TechStart received cash)',
              'Equity decreases by $1,500 (AR is removed)',
              'Equity is unchanged — this just swaps two Assets',
              'Equity increases by $3,000 (double-entry effect)',
            ],
            correctAnswer: 'Equity is unchanged — this just swaps two Assets',
            explanation: 'Collecting on an AR balance swaps Accounts Receivable (Asset ↓) for Cash (Asset ↑). The revenue was already recognized when the work was done. This collection event only affects Assets.',
          },
          {
            id: 'q5',
            text: 'TechStart invoices a client $2,000 for completed work (client will pay next week). The accounting equation effect is:',
            type: 'multiple-choice',
            options: [
              'No effect — TechStart hasn\'t received cash yet',
              'Accounts Receivable (Asset) ↑ $2,000 and Revenue (Equity) ↑ $2,000',
              'Cash (Asset) ↑ $2,000 and Revenue (Equity) ↑ $2,000',
              'Accounts Receivable (Asset) ↑ $2,000 and Liability ↑ $2,000',
            ],
            correctAnswer: 'Accounts Receivable (Asset) ↑ $2,000 and Revenue (Equity) ↑ $2,000',
            explanation: 'Under accrual accounting, revenue is earned when work is completed — not when cash is received. TechStart has a right to collect (AR = Asset ↑) and has earned the revenue (Equity ↑).',
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

type SeedData = typeof LESSON_03_SEED_DATA;
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

export async function seedLesson03(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) throw new Error('DIRECT_URL not set in environment');

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    const { lesson, version, standards, phases, activities } = LESSON_03_SEED_DATA;

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

    console.log('✅ Lesson 03 seeded successfully');
  } finally {
    await queryClient.end();
  }
}

if (require.main === module) {
  seedLesson03()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
