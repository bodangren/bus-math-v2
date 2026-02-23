/**
 * Unit 1, Lesson 5 — Detect and Fix Ledger Errors (ACC-1.5)
 *
 * Seeds "Detect and Fix Ledger Errors" using the versioned content schema.
 * All content follows the unit_01_lesson_matrix.md row for L5:
 *  - Accounting focus: Error patterns: misclassification, missing entries
 *  - Excel skill: Conditional Formatting red flags (missing type, negative asset)
 *  - Formative product: Red-flag report: all issues resolved
 *
 * Usage:
 *   npx tsx supabase/seed/unit1/lesson-05.ts
 */


import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

// ─── Deterministic IDs (d6b57545 namespace, Lesson 5) ────────────────────────

export const IDS = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000005',
  VERSION: 'd6b57545-65f6-4c39-80d5-000500000002',
  PHASES: {
    1: 'd6b57545-65f6-4c39-80d5-000500000100',
    2: 'd6b57545-65f6-4c39-80d5-000500000200',
    3: 'd6b57545-65f6-4c39-80d5-000500000300',
    4: 'd6b57545-65f6-4c39-80d5-000500000400',
    5: 'd6b57545-65f6-4c39-80d5-000500000500',
    6: 'd6b57545-65f6-4c39-80d5-000500000600',
  },
  ACTIVITY_ERROR_QUIZ: 'd6b57545-65f6-4c39-80d5-000500001001',
  ACTIVITY_EXIT_TICKET: 'd6b57545-65f6-4c39-80d5-000500001002',
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

export const LESSON_05_SEED_DATA = {
  lesson: {
    id: IDS.LESSON,
    slug: 'unit-1-lesson-5',
    title: 'Detect and Fix Ledger Errors',
    unitNumber: 1,
    orderIndex: 5,
    description:
      "Learn to spot the three most common ledger errors — misclassification, missing entries, and negative asset balances — and use Excel's Conditional Formatting to flag them automatically.",
    learningObjectives: [
      'Identify misclassified accounts in a ledger',
      'Recognize the impact of missing entries on the accounting equation',
      'Apply Conditional Formatting rules to surface errors automatically',
    ],
  },
  version: {
    id: IDS.VERSION,
    title: 'Detect and Fix Ledger Errors',
    description: "Find the mistakes that broke Sarah's Balance Sheet and fix them before they reach the investor.",
    status: 'published',
  },
  standards: [
    { code: 'ACC-1.5', isPrimary: true },
  ],
  phases: [
    {
      id: IDS.PHASES[1],
      phaseNumber: 1,
      title: "Hook: The Investor Found Three Errors",
      estimatedMinutes: 10,
      sections: [
        text(`## The Email Sarah Didn't Want to Receive

Three days after sending her Balance Sheet to the angel investor, Sarah got a reply:

> *"Hi Sarah — I reviewed TechStart's Balance Sheet. I found three issues before I even reached the totals. Can you send a corrected version?"*

Sarah's stomach dropped. She had checked the math. Everything balanced. How were there three errors?

She opened her ledger and started looking. The investor had highlighted:

1. **Office Supplies ($310) listed under Liabilities** — it should be a Current Asset
2. **Accrued Wages ($600) missing entirely** — the payroll obligation wasn't recorded
3. **Retained Earnings showing -$180** — a negative equity balance that looked like the business was insolvent

Three different kinds of errors. Three different causes. All of them invisible until someone looked closely.

### Quick Case: Before You Fix It
Which of these three errors would make the Balance Sheet look *worst* to an investor — and why?

*Discuss with your partner. What does each error signal about TechStart's financial health?*`),
        callout(
          'why-this-matters',
          "A Balance Sheet with errors isn't just incorrect — it's untrustworthy. Banks use it to set loan terms. Investors use it to value the business. Even a single misclassified account can make a healthy business look like a struggling one, or hide a real problem. Learning to find and fix errors before they leave your desk is one of the highest-value skills in accounting.",
        ),
        text(`## The Three Categories of Ledger Errors

Before you can fix errors, you need to know what kind you're dealing with:

**Type 1 — Misclassification:** An account is put in the wrong category (e.g., Supplies under Liabilities instead of Assets). The balance is correct, but it's in the wrong bucket, so the equation still "balances" but tells the wrong story.

**Type 2 — Missing Entry:** A transaction happened but was never recorded. The ledger doesn't balance, or an obligation is invisible. Often caused by an invoice not being logged or a payroll entry being skipped.

**Type 3 — Negative Balance Error:** A balance shows a negative value in a category where it shouldn't be possible (e.g., Cash = -$200 or Retained Earnings = -$180 when the business has been profitable). Usually signals a missing entry or the wrong sign on a transaction.`),
      ],
    },
    {
      id: IDS.PHASES[2],
      phaseNumber: 2,
      title: 'Introduction: How to Spot and Flag Errors',
      estimatedMinutes: 15,
      sections: [
        text(`## Introduction: Three Types of Ledger Errors

Ledger errors fall into three categories, each with a clear signature:

- **Misclassification errors** — the account exists and the balance is right, but it's in the wrong category (e.g., Office Supplies filed under Liabilities). The equation may still balance while telling the wrong story.
- **Missing entry errors** — a real transaction was never recorded, so the equation breaks. Identify it when A ≠ L + E.
- **Negative balance errors** — almost always signal a sign error in a prior entry (a debit where a credit belongs, or vice versa).

Excel's **Conditional Formatting** lets you build automatic red-flag rules that highlight these problems instantly. Today you'll build three rules on TechStart's ledger and use them to find and fix every error in the dataset.`),
        text(`## Building Red-Flag Rules in Excel

**Conditional Formatting** highlights cells automatically based on rules you set. Here's how to create the three most useful error-detection rules for a ledger:

### Rule 1: Blank Category = Error
**Trigger:** Any row in the Category column that's empty
**Action:** Fill cell with red

1. Select the Category column range (e.g., C2:C20)
2. Home → Conditional Formatting → New Rule
3. "Format only cells that contain" → "Blanks"
4. Format → Fill → Red → OK

**What it catches:** Accounts that were added to the ledger but never classified.

---

### Rule 2: Negative Asset Balance = Warning
**Trigger:** Row has Category = "A" AND balance < 0
**Action:** Fill cell with orange

1. Select the Balance column range (e.g., B2:B20)
2. New Rule → "Use a formula"
3. Formula: \`=AND($C2="A",$B2<0)\`
4. Format → Fill → Orange → OK

**What it catches:** Asset accounts with impossible negative values (e.g., Cash = -$200).

---

### Rule 3: Liability with Suspiciously High Balance
**Trigger:** Row has Category = "L" AND balance > a threshold (e.g., $10,000)
**Action:** Fill cell with yellow

1. Select Balance column range
2. New Rule → "Use a formula"
3. Formula: \`=AND($C2="L",$B2>10000)\`
4. Format → Fill → Yellow → OK

**What it catches:** Liabilities that seem disproportionately large relative to TechStart's scale.`),
      ],
    },
    {
      id: IDS.PHASES[3],
      phaseNumber: 3,
      title: 'Guided Practice: Build the Rules Together',
      estimatedMinutes: 20,
      sections: [
        text(`## Apply the Rules to TechStart's Buggy Ledger

Sarah's ledger below contains errors. Your job:
1. Set up the three Conditional Formatting rules from the Introduction
2. Run the rules against this dataset — some cells should turn red or orange
3. Identify each error and write the correction

**TechStart's Error-Filled Ledger:**

| Account | Balance | Category | Flag? |
|---------|---------|----------|-------|
| Cash | $3,800 | A | |
| Accounts Receivable | $2,000 | A | |
| Office Supplies | $310 | **L** | ← Error? |
| Prepaid Insurance | $350 | A | |
| Office Equipment | $3,600 | A | |
| Accounts Payable | $450 | L | |
| Accrued Wages | *(missing)* | *(missing)* | ← Error? |
| Deferred Revenue | $3,000 | L | |
| Bank Loan | $2,800 | L | |
| Sarah's Capital | $5,000 | E | |
| Retained Earnings | **-$180** | E | ← Error? |
| Current Net Income | $540 | E | |

**Step 1:** Set up the three Conditional Formatting rules on a copy of this data.
**Step 2:** Note which cells your rules flagged.
**Step 3:** Identify the error type for each flagged item (Misclassification / Missing Entry / Negative Balance).
**Step 4:** Write the corrected version of each row.`),
        callout('example', `**Error Analysis Walkthrough: Two Errors**

**Office Supplies ($310) in Category "L":**
Error type: **Misclassification**
Office Supplies is something TechStart owns and uses — it has future value, so it's an Asset.
Fix: Change Category from "L" to "A".

**Retained Earnings = -$180:**
Error type: **Negative Balance / Missing Entry**
Retained Earnings should reflect accumulated profits. A negative balance would mean TechStart lost more than it ever earned — but that contradicts the Current Net Income of $540 and prior period activity.
Diagnosis: A prior-period expense was likely recorded twice, or a revenue entry was entered with the wrong sign.
Fix: Investigate the prior entries. Correct the sign error. Retained Earnings should be positive (~$960 from Lesson 2 close).`),
        activity(IDS.ACTIVITY_ERROR_QUIZ, true),
        text(`## Discussion: What's the Cost of Each Error?

After fixing all three errors, discuss with your partner:

1. **Which error was hardest to find without Conditional Formatting?** Why?
2. **What would have happened if Sarah sent the original ledger to the investor?** Which error would have looked worst?
3. **The missing Accrued Wages entry:** Before it was added, did TechStart's equation "balance"? Why does a missing entry sometimes still produce a balanced equation?

Write your answer to question 3 in two sentences. It reveals something important about how accounting errors can hide.`),
      ],
    },
    {
      id: IDS.PHASES[4],
      phaseNumber: 4,
      title: 'Independent Practice: Fix the Full Dataset',
      estimatedMinutes: 20,
      sections: [
        text(`## Your Turn: Find Every Error

TechStart's Month 3 ledger has been submitted for your review. It contains multiple errors of different types. Work independently to find and fix all of them.

**Month 3 Ledger (contains errors — find them all):**

| Account | Balance | Category |
|---------|---------|----------|
| Cash | $5,100 | A |
| Accounts Receivable | $1,800 | A |
| Office Supplies | $220 | *(blank)* |
| Prepaid Rent | $600 | L |
| Office Equipment | $3,600 | A |
| Accumulated Depreciation | -$300 | A |
| Accounts Payable | $380 | L |
| Accrued Wages | $750 | L |
| Deferred Revenue | $1,500 | L |
| Bank Loan | $2,600 | L |
| Sarah's Capital | $5,000 | E |
| Retained Earnings | $1,140 | E |
| Current Net Income | $750 | E |

**Instructions:**
1. Copy this data into Excel
2. Apply all three Conditional Formatting rules
3. Identify every error (there are at least three)
4. Write the corrected row for each error
5. Verify: after corrections, do Total Assets = Total Liabilities + Equity?

**Hint about Accumulated Depreciation:** This is a real accounting account. It has a negative balance by design — it represents the portion of Office Equipment that has been "used up" over time. However, it should be listed under Assets (as a negative contra-asset), not as a standalone asset with a positive balance. Think about whether this entry is correct or needs correction.`),
        {
          sectionType: 'teacher-submission' as const,
          content: {
            submissionType: 'teacher-submission',
            deliverable:
              'Submit corrected Month 3 ledger workbook with conditional formatting rules visible and equation-check cell showing 0.',
            rubricCriteria: [
              'All classification errors corrected with rationale in notes column',
              'Conditional formatting rules configured and demonstrably flagging invalid rows',
              'Balance sheet equation check equals 0 after corrections',
            ],
          },
        },
        text(`## Partner Check: Swap and Compare

After completing your corrections independently:

1. **Swap your corrected ledger** with a partner
2. **Verify their equation:** Does their Total Assets = Total Liabilities + Equity?
3. **Compare your lists of errors.** Did you catch the same ones? Did one of you find something the other missed?
4. **Resolve any differences.** If you disagree on whether something is an error, walk through the three-question classification test together.

For each corrected ledger, the equation-check total should be exactly **$0**.

Expected totals after corrections:
- Total Assets: ~$13,060
- Total Liabilities: ~$6,230
- Total Equity: ~$6,890`),
      ],
    },
    {
      id: IDS.PHASES[5],
      phaseNumber: 5,
      title: 'Assessment: Error Detection Quiz',
      estimatedMinutes: 10,
      sections: [
        text(`## Prove You Can Find Errors

Five questions on ledger error detection and correction.

For each question, apply the classification test or error type framework — don't guess. Read carefully.

Score 4 out of 5 to move on to Lesson 6.`),
        activity(IDS.ACTIVITY_EXIT_TICKET, true),
      ],
    },
    {
      id: IDS.PHASES[6],
      phaseNumber: 6,
      title: 'Closing: What Errors Did You Catch Today?',
      estimatedMinutes: 5,
      sections: [
        text(`## The Most Common Student Errors

Every class has the same three errors they miss most often:

**Missed Error 1: Prepaid accounts in Liabilities**
Students see "prepaid" and think "I haven't used it yet, so I still owe something." But TechStart paid *first* — the coverage is coming TO TechStart, not FROM it. Future benefit = Asset.

**Missed Error 2: Negative balances assumed to be correct**
"The formula produced -$180 so it must be right." Negative Asset and sometimes negative Equity balances are almost always a sign of a sign error somewhere upstream. When you see a negative where it shouldn't be, hunt for the cause instead of accepting it.

**Missed Error 3: Missing entries that still "balance"**
If Accrued Wages is missing but both an expense and a liability were accidentally omitted equally, the equation can still balance. Conditional Formatting won't catch this because the equation checks out. The only way to find this class of error is to reconcile transactions against source documents.

**Reflection prompt:** Think about the errors in today's dataset. In two sentences, describe the process you'd follow if you received a ledger from a business partner and needed to verify it was error-free. What would you check first?`),
        text(`## What's Coming in Lesson 6

Your error-detection skills are sharp. In **Lesson 6**, you'll add a layer of defense: *data validation*.

Instead of finding errors after they happen, you'll prevent them from being entered in the first place. Excel's Data Validation tool can force the Category column to only accept "A", "L", or "E" — blocking misclassifications before they occur.

**Before Lesson 6:** Keep your corrected Month 3 ledger. You'll use it as the starting dataset for building validation rules.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS.ACTIVITY_ERROR_QUIZ,
      componentKey: 'comprehension-quiz',
      displayName: 'Error Identification: TechStart Ledger Errors',
      description: 'Identify the error type and correct classification for each flagged account.',
      props: {
        title: 'Identify and Fix the Errors',
        description: "For each error Sarah's investor flagged, identify the error type and the correct fix.",
        showExplanations: true,
        allowRetry: true,
        problemTemplate: {
          parameters: {
            assets: { min: 9000, max: 18000, step: 100 },
            liabilities: { min: 3000, max: 10000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'Given assets {{assets}} and liabilities {{liabilities}}, determine equity before error correction.',
          tolerance: 1,
        },
        questions: [
          {
            id: 'q1',
            text: "Office Supplies ($310) is listed under Category 'L' (Liabilities). What is the error type and correct fix?",
            type: 'multiple-choice',
            options: [
              'Missing Entry — add the Office Supplies row to Assets',
              'Negative Balance — flip the sign to make it positive',
              'Misclassification — move Office Supplies to Category A (Assets)',
              'No error — Office Supplies can be a Liability if purchased on credit',
            ],
            correctAnswer: 'Misclassification — move Office Supplies to Category A (Assets)',
            explanation: "Office Supplies is something TechStart owns and uses — future economic benefit. That makes it an Asset. The dollar amount is correct; only the category is wrong. This is a classic misclassification error.",
          },
          {
            id: 'q2',
            text: "Retained Earnings shows -$180. What is the most likely cause of this error?",
            type: 'multiple-choice',
            options: [
              'TechStart lost money this period, so -$180 is correct',
              'A prior-period transaction was recorded with the wrong sign or recorded twice',
              'Retained Earnings is always negative for new businesses',
              'The bank loan payment reduced Equity',
            ],
            correctAnswer: 'A prior-period transaction was recorded with the wrong sign or recorded twice',
            explanation: "Retained Earnings represents accumulated profits. For a business generating $540 in current net income, a -$180 Retained Earnings balance signals that a prior transaction was entered incorrectly — either with a wrong sign or duplicated. This is a negative balance error requiring investigation.",
          },
          {
            id: 'q3',
            text: "Accrued Wages ($600) is missing from the ledger entirely. Which accounts need to be added to fix this?",
            type: 'multiple-choice',
            options: [
              'Only Accrued Wages (Liability) +$600',
              'Accrued Wages (Liability) +$600 AND a Wage Expense that reduces Equity -$600',
              'Cash (Asset) -$600 AND Accrued Wages (Liability) +$600',
              'Retained Earnings (Equity) +$600 AND Accrued Wages (Liability) +$600',
            ],
            correctAnswer: 'Accrued Wages (Liability) +$600 AND a Wage Expense that reduces Equity -$600',
            explanation: "The dual-impact principle requires two changes. Adding Accrued Wages creates a Liability (+$600). But TechStart also incurred the expense of employing those workers, which reduces Equity (-$600 through Wage Expense). Both sides of the equation must be updated.",
          },
          {
            id: 'q4',
            text: 'After fixing all three errors, what should the equation-check cell show?',
            type: 'multiple-choice',
            options: ['$0', '$1,450', '-$180', '$600'],
            correctAnswer: '$0',
            explanation: "After correcting all misclassifications, adding missing entries, and fixing negative balances, the equation-check cell (Total Assets - (Total Liabilities + Equity)) must equal $0. Any other value indicates there's still an error to find.",
          },
          {
            id: 'q5',
            text: 'Which Excel tool is most efficient for automatically flagging blank Category cells in a large ledger?',
            type: 'multiple-choice',
            options: [
              'VLOOKUP — looks up each cell value in a reference table',
              'Conditional Formatting — highlights cells based on rules automatically',
              'AutoFilter — filters rows by criteria',
              'SUMIF — sums values that meet a condition',
            ],
            correctAnswer: 'Conditional Formatting — highlights cells based on rules automatically',
            explanation: "Conditional Formatting applies visual rules (color fills, borders) automatically whenever the condition is true. Once set up, it catches new errors as they're entered — making it the most efficient tool for ongoing ledger quality control.",
          },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: false,
      },
    },
    {
      id: IDS.ACTIVITY_EXIT_TICKET,
      componentKey: 'comprehension-quiz',
      displayName: 'Exit Ticket: Error Detection and Correction (L5)',
      description: 'Five questions on identifying error types and applying corrections to a ledger.',
      props: {
        title: 'Exit Ticket: Detect and Fix Ledger Errors',
        description: 'Identify error types and corrections. Score 4/5 to unlock Lesson 6.',
        showExplanations: true,
        allowRetry: true,
        problemTemplate: {
          parameters: {
            assets: { min: 9000, max: 18000, step: 100 },
            liabilities: { min: 3000, max: 10000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'TechStart assets are {{assets}} and liabilities are {{liabilities}}. Compute equity.',
          tolerance: 1,
        },
        questions: [
          {
            id: 'q1',
            text: "A student's ledger shows Prepaid Rent ($1,200) under Liabilities. What type of error is this?",
            type: 'multiple-choice',
            options: ['Missing Entry', 'Negative Balance Error', 'Misclassification', 'Rounding Error'],
            correctAnswer: 'Misclassification',
            explanation: "Prepaid Rent is an Asset — TechStart paid cash for future use of a space. The benefit hasn't been consumed yet, making it a current asset. Placing it under Liabilities is a misclassification: the balance is correct, but the category is wrong.",
          },
          {
            id: 'q2',
            text: 'TechStart\'s Cash balance shows -$350. What should you do first?',
            type: 'multiple-choice',
            options: [
              'Accept it — negative cash means TechStart is overdrawn',
              'Delete the row — negative assets should not exist',
              'Investigate upstream entries for a sign error or missing offsetting transaction',
              'Add $350 to Cash manually to restore the positive balance',
            ],
            correctAnswer: 'Investigate upstream entries for a sign error or missing offsetting transaction',
            explanation: "A negative Cash balance is almost always an entry error — a payment that was recorded twice, a deposit entered as a debit instead of a credit, or a missing receipt entry. Investigate before changing numbers.",
          },
          {
            id: 'q3',
            text: "An investor reviews TechStart's Balance Sheet and finds Total Assets = $12,500 but Total Liabilities + Equity = $11,900. What does this $600 difference most likely indicate?",
            type: 'multiple-choice',
            options: [
              'TechStart has $600 of hidden profit',
              'A missing entry — one side of a dual-impact transaction was not recorded',
              'An Asset account was misclassified as Equity',
              'The investor made an arithmetic error',
            ],
            correctAnswer: 'A missing entry — one side of a dual-impact transaction was not recorded',
            explanation: "When the equation doesn't balance, the most common cause is a missing entry — only one side of a dual-impact transaction was recorded. The $600 gap suggests a $600 transaction where only the Asset side was entered, with the Liability or Equity side missing.",
          },
          {
            id: 'q4',
            text: 'Which Conditional Formatting formula correctly flags negative Asset balances?',
            type: 'multiple-choice',
            options: [
              '=B2<0',
              '=AND($C2="A",$B2<0)',
              '=IF($C2="A",TRUE,FALSE)',
              '=SUMIF($C2,"A",$B2)<0',
            ],
            correctAnswer: '=AND($C2="A",$B2<0)',
            explanation: "The AND() formula checks two conditions simultaneously: the Category column must equal 'A' (Asset) AND the Balance must be negative. This avoids false positives — a negative Accumulated Depreciation (also in Assets) might be intentional, but in a Unit 1 ledger, all basic assets should be positive.",
          },
          {
            id: 'q5',
            text: 'After setting up Conditional Formatting rules, a cell turns red. What does this tell you?',
            type: 'multiple-choice',
            options: [
              'The formula in that cell has a syntax error',
              'The cell value meets the condition defined in the Conditional Formatting rule',
              'Excel cannot read the data in that cell',
              'The cell was manually formatted to red by another user',
            ],
            correctAnswer: 'The cell value meets the condition defined in the Conditional Formatting rule',
            explanation: "Conditional Formatting applies a format (like a red fill) automatically when the cell's value satisfies the rule you defined. A red cell means 'this condition is true here' — which in our context means 'this looks like an error worth investigating.'",
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

type SeedData = typeof LESSON_05_SEED_DATA;
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

export async function seedLesson05(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) throw new Error('DIRECT_URL not set in environment');

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    const { lesson, version, standards, phases, activities } = LESSON_05_SEED_DATA;

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

    console.log('✅ Lesson 05 seeded successfully');
  } finally {
    await queryClient.end();
  }
}

if (require.main === module) {
  seedLesson05()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
