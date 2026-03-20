/**
 * Unit 1, Lesson 4 — Build the Balance Sheet (ACC-1.3)
 *
 * Seeds "Build the Balance Sheet" using the versioned content schema.
 * All content follows the unit_01_lesson_matrix.md row for L4:
 *  - Accounting focus: Balance Sheet sections & subtotals (Assets, Liabilities, Equity)
 *  - Excel skill: Template layout; alignment; labeled sections
 *  - Formative product: Draft mini BS (≥ 6 core accounts)
 *
 * Usage:
 *   npx tsx supabase/seed/unit1/lesson-04.ts
 */


import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

// ─── Deterministic IDs (d6b57545 namespace, Lesson 4) ────────────────────────

export const IDS = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000004',
  VERSION: 'd6b57545-65f6-4c39-80d5-000400000002',
  PHASES: {
    1: 'd6b57545-65f6-4c39-80d5-000400000100',
    2: 'd6b57545-65f6-4c39-80d5-000400000200',
    3: 'd6b57545-65f6-4c39-80d5-000400000300',
    4: 'd6b57545-65f6-4c39-80d5-000400000400',
    5: 'd6b57545-65f6-4c39-80d5-000400000500',
    6: 'd6b57545-65f6-4c39-80d5-000400000600',
  },
  ACTIVITY_SPREADSHEET_GUIDED: 'd6b57545-65f6-4c39-80d5-000400001001',
  ACTIVITY_SPREADSHEET_INDEPENDENT: 'd6b57545-65f6-4c39-80d5-000400001003',
  ACTIVITY_EXIT_TICKET: 'd6b57545-65f6-4c39-80d5-000400001002',
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

export const LESSON_04_SEED_DATA = {
  lesson: {
    id: IDS.LESSON,
    slug: 'unit-1-lesson-4',
    title: 'Build the Balance Sheet',
    unitNumber: 1,
    orderIndex: 4,
    description:
      "Assemble TechStart's first formal Balance Sheet by mapping classified accounts into labeled sections with subtotals — turning raw data into a document investors can actually read.",
    learningObjectives: [
      'Identify the three main sections of a Balance Sheet',
      'Organize accounts into Current and Non-Current subsections',
      'Calculate section subtotals and verify the Balance Sheet equation',
    ],
  },
  version: {
    id: IDS.VERSION,
    title: 'Build the Balance Sheet',
    description: "Map TechStart's accounts into a structured Balance Sheet and verify it balances.",
    status: 'published',
  },
  standards: [
    { code: 'ACC-1.3', isPrimary: true },
  ],
  phases: [
    {
      id: IDS.PHASES[1],
      phaseNumber: 1,
      title: "Hook: The Document That Opens Doors",
      estimatedMinutes: 10,
      sections: [
        text(`## Sarah's First Investor Meeting

Three months after launching TechStart, Sarah received an email that made her hands shake a little:

> *"Hi Sarah — loved your pitch last week. Before we discuss terms, can you send over TechStart's current Balance Sheet?"*

It was from a potential angel investor. A real one.

Sarah had the data — three weeks of careful account tracking, all classified, all balanced. But she had never organized it into an actual Balance Sheet. She had numbers. She didn't have a *document*.

This lesson is about turning numbers into a document. A Balance Sheet is not just a list of accounts — it's a structured statement with labeled sections, subtotals, and a clear story: here's what TechStart owns, here's what it owes, and here's what belongs to Sarah.

By the end of today, you'll build TechStart's first real Balance Sheet from the accounts you've been tracking.`),
        text(`### Quick Case: The Snapshot
Take a look at a professional Balance Sheet. **What's the first thing you notice?** How is it **different from the transaction list** we've been using in Excel?

*Discuss with your partner. Why do investors prefer this layout?*`),
        callout(
          'why-this-matters',
          'A Balance Sheet is one of three financial statements every lender, investor, and regulator asks for. It shows the financial position of a business at a specific point in time. Knowing how to read one — and build one — is a skill that applies to every business, every industry, and every career that touches money. This is not a classroom exercise. This is a real skill.',
        ),
        text(`## What a Balance Sheet Looks Like

Here's TechStart's Balance Sheet skeleton — before the numbers go in:

\`\`\`
TechStart Solutions
Balance Sheet
As of [Date]

ASSETS
  Current Assets
    Cash                        $___
    Accounts Receivable         $___
    Office Supplies             $___
    Prepaid Insurance           $___
    Total Current Assets        $___

  Non-Current Assets
    Office Equipment            $___
    Total Non-Current Assets    $___

  TOTAL ASSETS                  $===

LIABILITIES
  Current Liabilities
    Accounts Payable            $___
    Accrued Wages               $___
    Deferred Revenue            $___
    Total Current Liabilities   $___

  Non-Current Liabilities
    Bank Loan                   $___
    Total Non-Current Liab.     $___

  TOTAL LIABILITIES             $===

EQUITY
  Sarah's Capital               $___
  Retained Earnings             $___
  Current Net Income            $___
  TOTAL EQUITY                  $===

TOTAL LIABILITIES + EQUITY      $===
\`\`\`

Notice: Total Assets = Total Liabilities + Equity. The equation that's been governing everything now appears as the final check on a formal document.`),
      ],
    },
    {
      id: IDS.PHASES[2],
      phaseNumber: 2,
      title: 'Introduction: Sections, Subtotals, and Structure',
      estimatedMinutes: 15,
      sections: [
        text(`## The Three Sections of a Balance Sheet

Every Balance Sheet has the same three sections, always in this order:

### Section 1: Assets (What TechStart Owns)

Assets are split into two subsections based on how quickly they convert to cash:

**Current Assets** — Convert to cash within one year (or one business cycle)
- Cash ← most liquid; always listed first
- Accounts Receivable ← expected to be collected within 30–90 days
- Office Supplies ← will be used up this year
- Prepaid Insurance ← the unused coverage will expire this year

**Non-Current Assets** — Long-lived resources, not expected to convert to cash within a year
- Office Equipment ← TechStart expects to use these laptops for 3–5 years

*Rule of thumb: List Current Assets from most liquid to least liquid.*

---

### Section 2: Liabilities (What TechStart Owes)

Like Assets, Liabilities split into Current and Non-Current:

**Current Liabilities** — Due within one year
- Accounts Payable ← typically due within 30 days
- Accrued Wages ← due on next payday
- Deferred Revenue ← service owed to client within the contract period

**Non-Current Liabilities** — Due beyond one year
- Bank Loan ← repaid over 3 years

---

### Section 3: Equity (Sarah's Stake)

Equity doesn't split into "current" and "non-current." It shows:
- Owner's original contributions (Sarah's Capital)
- Accumulated profits left in the business (Retained Earnings)
- Current period profit (Net Income) — before closing to Retained Earnings`),
        text(`## Reading a Balance Sheet Like a Story

A Balance Sheet tells a story in three sentences:

1. **"Here's what we have."** (Total Assets = the resources available to run the business)
2. **"Here's what we owe."** (Total Liabilities = the obligations that must be honored)
3. **"Here's what's ours."** (Total Equity = what remains after all debts are paid)

A healthy Balance Sheet has **Equity > 0** — meaning the business owns more than it owes. A Balance Sheet where Liabilities > Assets signals financial stress: creditors technically have a claim on more than TechStart owns.

**TechStart's story right now:**
After Lesson 3's seven events, TechStart has approximately $13,260 in Assets and $7,850 in Liabilities. That means Sarah's equity is about $5,410 — the business owns more than it owes. A good sign for any investor.`),
      ],
    },
    {
      id: IDS.PHASES[3],
      phaseNumber: 3,
      title: 'Guided Practice: Map Accounts to Sections',
      estimatedMinutes: 20,
      sections: [
        text(`## Mapping Exercise

Take TechStart's account list from Lesson 2 (all classified as A, L, or E) and map each account to the correct Balance Sheet section.

**Fill in the mapping table below:**

| Account | Balance | A/L/E | BS Section |
|---------|---------|-------|------------|
| Cash | $6,000 | A | Current Assets |
| Accounts Receivable | $2,000 | A | ? |
| Office Supplies | $310 | A | ? |
| Prepaid Insurance | $350 | A | ? |
| Office Equipment | $3,600 | A | ? |
| Accounts Payable | $450 | L | ? |
| Accrued Wages | $0 | L | ? |
| Deferred Revenue | $3,000 | L | ? |
| Bank Loan | $2,800 | L | ? |
| Sarah's Capital | $5,000 | E | Equity |
| Retained Earnings | $960 | E | ? |
| Current Net Income | $540 | E | ? |

**After mapping, calculate section subtotals:**
- Total Current Assets = ?
- Total Non-Current Assets = ?
- Total Assets = ?
- Total Current Liabilities = ?
- Total Non-Current Liabilities = ?
- Total Liabilities = ?
- Total Equity = ?
- Total Liabilities + Equity = ?`),
        callout('example', `**Mapping Walkthrough: Two Accounts**

**Accounts Receivable ($2,000):**
Category: Asset. Expected to be collected within 30–60 days. → **Current Assets**

**Bank Loan ($2,800):**
Category: Liability. Repaid over 3 years, so less than $2,800 may be due this year. For simplicity in this lesson, classify the entire balance as **Non-Current Liabilities**.

In a real Balance Sheet, you'd split the loan into the portion due within one year (Current) and the rest (Non-Current). That's an Accounting 2 concept — for now, put it all in Non-Current.`),
        text(`## Building the Excel Template

Once you've completed the mapping table:

1. Open a new Excel sheet
2. In cell A1, type: **TechStart Solutions**
3. In A2: **Balance Sheet**
4. In A3: **As of [today's date]**
5. Leave row 4 blank, then start building the sections:
   - Row 5: **ASSETS** (bold, no indent)
   - Row 6: *Current Assets* (italic, indent 1 level)
   - Rows 7–10: Individual accounts (indent 2 levels, right-align values)
   - Row 11: **Total Current Assets** (bold, right-align total)
6. Repeat the structure for Non-Current Assets, Liabilities, and Equity
7. Add **TOTAL ASSETS** and **TOTAL LIABILITIES + EQUITY** as the final check rows

**Formatting tips:**
- Use **Accounting** number format for all dollar values
- Use **bold** for section headers and totals
- Use **double underline** for grand totals (Format → Cells → Border)`),
        activity(IDS.ACTIVITY_SPREADSHEET_GUIDED, true),
      ],
    },
    {
      id: IDS.PHASES[4],
      phaseNumber: 4,
      title: 'Independent Practice: Draft TechStart\'s Balance Sheet',
      estimatedMinutes: 25,
      sections: [
        text(`## Build It From Scratch

Time to build TechStart's complete Balance Sheet independently. Use the spreadsheet tool below to organize at least **6 accounts** from TechStart's records into the proper Balance Sheet structure.

**Requirements for your draft:**
- [ ] At least 3 Asset accounts (include both Current and Non-Current)
- [ ] At least 2 Liability accounts
- [ ] At least 2 Equity accounts
- [ ] Subtotals for each section
- [ ] Grand total check: Total Assets = Total Liabilities + Equity

**Use TechStart's post-Lesson-3 balances:**

| Account | Balance |
|---------|---------|
| Cash | $6,000 |
| Accounts Receivable | $2,000 |
| Office Supplies | $310 |
| Prepaid Insurance | $350 |
| Office Equipment | $3,600 |
| Accounts Payable | $450 |
| Deferred Revenue | $3,000 |
| Bank Loan | $2,800 |
| Sarah's Capital | $5,000 |
| Retained Earnings | $960 |
| Current Net Income | $540 |

Use the spreadsheet to draft your Balance Sheet. Your goal: Total Assets should equal Total Liabilities + Equity (both should be **$12,260**).`),
        activity(IDS.ACTIVITY_SPREADSHEET_INDEPENDENT, true),
      ],
    },
    {
      id: IDS.PHASES[5],
      phaseNumber: 5,
      title: 'Assessment: Balance Sheet Structure Quiz',
      estimatedMinutes: 10,
      sections: [
        text(`## Prove You Know the Structure

Five questions about Balance Sheet organization and interpretation.

You should be able to answer these without looking at your notes — the structure you built today should be clear in your memory.

Score 4 out of 5 to move on to Lesson 5.`),
        activity(IDS.ACTIVITY_EXIT_TICKET, true),
      ],
    },
    {
      id: IDS.PHASES[6],
      phaseNumber: 6,
      title: 'Closing: What Makes a Balance Sheet Readable?',
      estimatedMinutes: 5,
      sections: [
        text(`## Design Matters as Much as Data

You could list all 11 accounts in a single column with no labels or subtotals. Technically, the data would be there. But nobody would trust it.

A readable Balance Sheet has three qualities:

**1. Clear section labels and hierarchy**
Investors skim before they read. Bold headers and indented accounts tell them where to look without making them search.

**2. Subtotals at every level**
"Total Current Assets" is not just a number — it's a signal. A high Current Assets total relative to Current Liabilities means the business can pay its bills. Subtotals let you make that comparison instantly.

**3. The equation visible at a glance**
Putting TOTAL ASSETS and TOTAL LIABILITIES + EQUITY on adjacent lines (with a double underline) makes the verification check obvious. If they match, the reader knows the data is complete.

**Reflection prompt:** Look at the Balance Sheet you built today. In two sentences, describe one thing that makes it easy to read and one thing you'd improve if you were presenting it to an investor.`),
        text(`## What's Coming in Lesson 5

Your Balance Sheet is built. But what happens when the data going into it is wrong?

In **Lesson 5**, you'll learn to:
- Detect common ledger errors (misclassification, missing entries, negative assets)
- Use Excel's Conditional Formatting to flag problems automatically
- Fix errors before they reach the Balance Sheet

**Before Lesson 5:** Keep your Balance Sheet from today. You'll use it as the "before" document — and compare it to a corrected version after finding and fixing the errors.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS.ACTIVITY_SPREADSHEET_GUIDED,
      componentKey: 'spreadsheet',
      displayName: "TechStart Mini Balance Sheet Guided Build",
      description: "Walk through TechStart's Balance Sheet using the shared guided scaffold and class prompts.",
      props: {
        title: "TechStart Solutions — Balance Sheet Guided Build",
        description: "Organize TechStart's accounts into a structured Balance Sheet with the shared model. Use the template to add sections, subtotals, and verify Total Assets = Total Liabilities + Equity.",
        template: 'balance-sheet' as const,
        problemTemplate: {
          parameters: {
            assets: { min: 9000, max: 18000, step: 100 },
            liabilities: { min: 3000, max: 9000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'Build a balance sheet where assets are {{assets}} and liabilities are {{liabilities}}.',
          cellExpectations: [
            { cellRef: 'B15', expectedFormula: 'assets', tolerance: 1 },
            { cellRef: 'C15', expectedFormula: 'liabilities', tolerance: 1 },
            { cellRef: 'D15', expectedFormula: 'assets - liabilities', tolerance: 1 },
          ],
          tolerance: 1,
        },
        allowFormulaEntry: true,
        showColumnLabels: true,
        showRowLabels: true,
        readOnly: false,
        validateFormulas: true,
      },
      gradingConfig: {
        autoGrade: false,
        passingScore: 60,
        partialCredit: false,
      },
    },
    {
      id: IDS.ACTIVITY_SPREADSHEET_INDEPENDENT,
      componentKey: 'spreadsheet',
      displayName: "TechStart Mini Balance Sheet Independent Draft",
      description: "Build a fresh Balance Sheet draft independently from the guided scaffold.",
      props: {
        title: "TechStart Solutions — Balance Sheet Independent Draft",
        description: "Organize TechStart's accounts into a structured Balance Sheet on your own. Use the template to add sections, subtotals, and verify Total Assets = Total Liabilities + Equity.",
        template: 'balance-sheet' as const,
        problemTemplate: {
          parameters: {
            assets: { min: 10000, max: 22000, step: 100 },
            liabilities: { min: 2000, max: 12000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'Given assets {{assets}} and liabilities {{liabilities}}, compute equity.',
          tolerance: 1,
        },
        allowFormulaEntry: true,
        showColumnLabels: true,
        showRowLabels: true,
        readOnly: false,
        validateFormulas: true,
      },
      gradingConfig: {
        autoGrade: false,
        passingScore: 60,
        partialCredit: false,
      },
    },
    {
      id: IDS.ACTIVITY_EXIT_TICKET,
      componentKey: 'comprehension-quiz',
      displayName: 'Exit Ticket: Balance Sheet Structure (L4)',
      description: 'Five questions about Balance Sheet organization, sections, and interpretation.',
      props: {
        title: 'Exit Ticket: Balance Sheet Structure',
        description: 'Answer each question about the Balance Sheet structure. Score 4/5 to unlock Lesson 5.',
        showExplanations: true,
        allowRetry: true,
        problemTemplate: {
          parameters: {
            assets: { min: 10000, max: 22000, step: 100 },
            liabilities: { min: 2000, max: 12000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'Given assets {{assets}} and liabilities {{liabilities}}, compute equity.',
          tolerance: 1,
        },
        questions: [
          {
            id: 'q1',
            text: 'On a Balance Sheet, assets are listed in order from:',
            type: 'multiple-choice',
            options: [
              'Largest to smallest dollar amount',
              'Most liquid to least liquid',
              'Oldest to newest acquisition',
              'Alphabetical order',
            ],
            correctAnswer: 'Most liquid to least liquid',
            explanation: 'Assets are listed from most liquid (Cash — available immediately) to least liquid (long-term equipment). This ordering helps readers quickly assess the business\'s short-term financial health.',
          },
          {
            id: 'q2',
            text: 'Deferred Revenue (a client paid for future services) appears under:',
            type: 'multiple-choice',
            options: [
              'Current Assets',
              'Non-Current Assets',
              'Current Liabilities',
              'Equity',
            ],
            correctAnswer: 'Current Liabilities',
            explanation: 'Deferred Revenue is a Liability — TechStart owes the client future services. It\'s Current because the obligation will typically be fulfilled within a year.',
          },
          {
            id: 'q3',
            text: 'TechStart\'s Balance Sheet shows Total Assets of $12,260 and Total Liabilities of $6,250. What is Total Equity?',
            type: 'multiple-choice',
            options: ['$18,510', '$6,010', '$6,250', '$12,260'],
            correctAnswer: '$6,010',
            explanation: 'Using A = L + E: $12,260 = $6,250 + E, so E = $12,260 - $6,250 = $6,010. Equity is always the residual — what\'s left after subtracting Liabilities from Assets.',
          },
          {
            id: 'q4',
            text: 'A 3-year bank loan appears under:',
            type: 'multiple-choice',
            options: [
              'Current Liabilities — it\'s a liability',
              'Non-Current Liabilities — it\'s not due within one year',
              'Current Assets — TechStart received cash from it',
              'Equity — the bank is a partner in the business',
            ],
            correctAnswer: 'Non-Current Liabilities — it\'s not due within one year',
            explanation: 'Long-term debt (due more than one year from now) is Non-Current. The portion due within the next year would be Current, but the remainder stays in Non-Current Liabilities.',
          },
          {
            id: 'q5',
            text: 'The "double underline" used for grand totals on a Balance Sheet means:',
            type: 'multiple-choice',
            options: [
              'The number is approximate',
              'This is a final, verified total — no more additions below it',
              'The number is negative',
              'This row should be ignored in calculations',
            ],
            correctAnswer: 'This is a final, verified total — no more additions below it',
            explanation: 'In accounting, a single underline means "subtotal" and a double underline means "final total" — nothing else will be added below. It\'s a formatting convention that signals the calculation is complete.',
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

type SeedData = typeof LESSON_04_SEED_DATA;
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

export async function seedLesson04(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) throw new Error('DIRECT_URL not set in environment');

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    const { lesson, version, standards, phases, activities } = LESSON_04_SEED_DATA;

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

    console.log('✅ Lesson 04 seeded successfully');
  } finally {
    await queryClient.end();
  }
}

if (require.main === module) {
  seedLesson04()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
