/**
 * Unit 1, Lesson 6 — Data Validation and Integrity (ACC-1.6)
 *
 * Seeds "Data Validation and Integrity" using the versioned content schema.
 * All content follows the unit_01_lesson_matrix.md row for L6:
 *  - Accounting focus: Data integrity supporting accurate Balance Sheet
 *  - Excel skill: Data Validation lists for A/L/E; consistent account names
 *  - Formative product: Validation passes; zero blanks/mismatches
 *
 * Usage:
 *   npx tsx supabase/seed/unit1/lesson-06.ts
 */


import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

// ─── Deterministic IDs (d6b57545 namespace, Lesson 6) ────────────────────────

export const IDS = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000006',
  VERSION: 'd6b57545-65f6-4c39-80d5-000600000002',
  PHASES: {
    1: 'd6b57545-65f6-4c39-80d5-000600000100',
    2: 'd6b57545-65f6-4c39-80d5-000600000200',
    3: 'd6b57545-65f6-4c39-80d5-000600000300',
    4: 'd6b57545-65f6-4c39-80d5-000600000400',
    5: 'd6b57545-65f6-4c39-80d5-000600000500',
    6: 'd6b57545-65f6-4c39-80d5-000600000600',
  },
  ACTIVITY_FILL_IN_BLANK: 'd6b57545-65f6-4c39-80d5-000600001001',
  ACTIVITY_EXIT_TICKET: 'd6b57545-65f6-4c39-80d5-000600001002',
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

export const LESSON_06_SEED_DATA = {
  lesson: {
    id: IDS.LESSON,
    slug: 'unit-1-lesson-6',
    title: 'Data Validation and Integrity',
    unitNumber: 1,
    orderIndex: 6,
    description:
      "Learn to prevent ledger errors at the source by setting up Excel Data Validation rules that enforce consistent account naming and restrict category entries to valid values.",
    learningObjectives: [
      'Explain why data validation improves financial accuracy',
      'Build a Data Validation dropdown list for the Category column in Excel',
      'Apply zero-blank rules to ensure complete ledger entries',
    ],
  },
  version: {
    id: IDS.VERSION,
    title: 'Data Validation and Integrity',
    description: "Set up TechStart's first layer of error prevention — before errors happen.",
    status: 'published',
  },
  standards: [
    { code: 'ACC-1.6', isPrimary: true },
  ],
  phases: [
    {
      id: IDS.PHASES[1],
      phaseNumber: 1,
      title: "Hook: The Accountant Rejected the File",
      estimatedMinutes: 10,
      sections: [
        text(`## The Rejection Email

Sarah spent two hours cleaning last month's ledger errors. She sent the corrected file to her accountant for review.

The reply came back in 20 minutes:

> *"Sarah — I can't import this into our accounting software. The Category column has five different spellings for 'Asset': 'A', 'Asset', 'asset', 'ASSET', and 'Asst'. Our system only accepts standardized entries. Please resubmit with consistent values."*

Sarah had spent time fixing misclassifications. She hadn't thought about *how* the values were typed.

The issue wasn't the accounting logic. It was the data quality. And data quality problems are preventable.

### Quick Scenario: One Rule That Stops the Problem
If the Category column could only accept "A", "L", or "E" — and nothing else — how would that change what happened?

*Discuss with your partner. What are the advantages and disadvantages of restricting what can be typed into a cell?*`),
        callout(
          'why-this-matters',
          "In real businesses, multiple people enter data into the same spreadsheet — different bookkeepers, different days, different habits. Without rules enforcing consistency, you'll end up with ten ways to spell 'Asset' and no way to automate anything. Data validation is how professionals make a spreadsheet reliable enough to trust with financial decisions.",
        ),
        text(`## What Data Validation Does

**Data Validation** is an Excel feature that controls what can be entered into a cell. You set the rules; Excel enforces them.

Three validation rules TechStart will use this lesson:

1. **Dropdown list for Category:** Only "A", "L", or "E" can be entered — no typos, no variations
2. **No blank allowed:** Any required field (Account Name, Balance, Category) must have a value
3. **Positive number for Balance:** The Balance column can only accept numbers ≥ 0 for standard accounts

These three rules together make TechStart's ledger *machine-readable* — ready for import into accounting software, analysis with formulas, or sharing with a bookkeeper.`),
      ],
    },
    {
      id: IDS.PHASES[2],
      phaseNumber: 2,
      title: 'Introduction: Building Validation Rules in Excel',
      estimatedMinutes: 15,
      sections: [
        text(`## Introduction: Preventing Errors Before They Happen

In Lesson 5 you learned to **detect** errors after the fact. In this lesson you'll **prevent** them at the source using Excel's Data Validation tool.

Data Validation restricts what can be entered into any cell. With a **Stop** error alert, Excel rejects any value that breaks your rule — no saving, no workarounds. Today you'll build three rules on TechStart's ledger: (1) a Category dropdown limited to A, L, or E; (2) no-blank rules for required fields; and (3) a positive-balance constraint. You'll verify each rule by trying to enter invalid data — if Excel stops you, it works.`),
        text(`## Setting Up the Rules: Step by Step

### Rule 1: Category Dropdown List

1. Select the Category column range (e.g., C2:C30)
2. Data tab → Data Validation → Data Validation
3. Under "Allow" → select **List**
4. Under "Source" → type: \`A,L,E\`
5. Check "In-cell dropdown"
6. Click the **Error Alert** tab → set Style to **Stop**, write a message: *"Category must be A, L, or E."*
7. Click OK

**Test it:** Try typing "Asset" into a Category cell. Excel should reject it.

---

### Rule 2: No Blank Account Names

1. Select the Account Name column range (e.g., A2:A30)
2. Data Validation → Allow: **Custom**
3. Formula: \`=NOT(ISBLANK(A2))\`
4. Error Alert → Stop: *"Account Name cannot be blank."*
5. Click OK

**Test it:** Try to leave an Account Name cell empty and move to the next cell.

---

### Rule 3: Non-Negative Balance

1. Select the Balance column range (e.g., B2:B30)
2. Data Validation → Allow: **Decimal** → Data: **greater than or equal to** → Minimum: **0**
3. Error Alert → Stop: *"Balance must be a non-negative number."*
4. Click OK

**Test it:** Try typing -500 into a Balance cell.`),
      ],
    },
    {
      id: IDS.PHASES[3],
      phaseNumber: 3,
      title: 'Guided Practice: Build the Rules on TechStart\'s Ledger',
      estimatedMinutes: 20,
      sections: [
        text(`## Apply Validation to TechStart's Current Ledger

Use TechStart's corrected Month 3 ledger from Lesson 5. Set up all three validation rules on the existing data.

**Before setting up rules — check for existing data issues:**

Review each row in the Category column. Look for any values that aren't exactly "A", "L", or "E". If you find inconsistencies, fix them now before activating the dropdown rule.

| Account | Balance | Category |
|---------|---------|----------|
| Cash | $5,100 | A |
| Accounts Receivable | $1,800 | A |
| Office Supplies | $220 | A |
| Prepaid Rent | $600 | A |
| Office Equipment | $3,600 | A |
| Accumulated Depreciation | -$300 | A |
| Accounts Payable | $380 | L |
| Accrued Wages | $750 | L |
| Deferred Revenue | $1,500 | L |
| Bank Loan | $2,600 | L |
| Sarah's Capital | $5,000 | E |
| Retained Earnings | $1,140 | E |
| Current Net Income | $750 | E |

**Note on Accumulated Depreciation:** This account has a negative balance by design. It's a contra-asset — it reduces the reported value of Office Equipment. For this exercise, you'll need to either exclude it from the non-negative balance rule OR set a separate exception for this row.`),
        callout('tip', `**Handling Accumulated Depreciation in Validation**

The non-negative balance rule will flag Accumulated Depreciation as invalid. Here are two ways to handle it:

**Option A (Simple):** Exclude the Depreciation row from the Balance validation range — apply the non-negative rule to B2:B12, skipping the depreciation row at B6.

**Option B (Advanced):** Use a Custom formula that allows negatives only for contra-asset accounts: \`=OR(AND($C2="A",$A2<>"Accumulated Depreciation"),$B2>=0)\`

For this lesson, Option A is recommended.`),
        activity(IDS.ACTIVITY_FILL_IN_BLANK, true),
        text(`## Discussion: What Did Your Validation Catch?

After completing the activity:

1. **Which rule was most useful?** Dropdown list, no-blank, or non-negative balance?
2. **What would happen if TechStart shared this validated ledger** with a new bookkeeper who'd never used it before?
3. **Can validation prevent all errors?** What types of errors can validation NOT catch?

Write your answer to question 3 in two sentences. It reveals an important limitation of validation that leads directly into Lesson 7.`),
      ],
    },
    {
      id: IDS.PHASES[4],
      phaseNumber: 4,
      title: 'Independent Practice: Clean Dataset, Pass Validation',
      estimatedMinutes: 20,
      sections: [
        text(`## Your Validation Challenge

Sarah received a ledger from her part-time bookkeeper. It has multiple data quality issues — inconsistent category entries, blank fields, and invalid balances. Your job: clean it so it passes all three validation rules.

**Dirty Ledger (from the bookkeeper):**

| Account | Balance | Category |
|---------|---------|----------|
| Cash | $4,200 | Asset |
| Office Equipment | | A |
| Accounts Receivable | $1,500 | a |
| Office Supplies | $300 | A |
| Prepaid Insurance | $400 | asset |
| Bank Loan | $2,500 | Liability |
| Accounts Payable | -$200 | L |
| Deferred Revenue | $800 | L |
| Sarah's Capital | $5,000 | E |
| Current Net Income | $1,100 | EQUITY |

**Instructions:**
1. Copy this data into Excel
2. Identify every data quality issue
3. Fix each issue so the data would pass all three validation rules
4. Set up the validation rules on your cleaned data
5. Verify: no cells are rejected, no blanks remain, all categories are A/L/E

**Track your corrections:**

| Row | Issue Type | What You Changed |
|-----|-----------|-----------------|
| 1 | ? | ? |
| ... | | |`),
        text(`## The Validation Checklist

After cleaning and applying validation rules, run this checklist:

- [ ] **Zero blank Account Names** — every row has an account name
- [ ] **Zero blank Balances** — every row has a dollar value
- [ ] **All Categories are exactly A, L, or E** — no other values accepted
- [ ] **All standard balances ≥ 0** — exception granted for Accumulated Depreciation only
- [ ] **Equation check passes** — Total Assets = Total Liabilities + Equity

If all five items are checked, your ledger is validation-complete. It's ready to share with an accountant, import into software, or use as the foundation for your Balance Snapshot in Lesson 7.

**Share-out:** Present one issue you found and fixed to your partner. Explain what type of problem it was and how your validation rule would prevent it in the future.`),
        {
          sectionType: 'teacher-submission' as const,
          content: {
            submissionType: 'teacher-submission',
            deliverable:
              'Submit your cleaned workbook with active validation rules, screenshot evidence, and a one-paragraph explanation of one prevented error.',
            rubricCriteria: [
              'Validation list enforced for category values A/L/E',
              'Required fields protected against blanks',
              'Submitted reflection explains how rule selection improves data integrity',
            ],
          },
        },
      ],
    },
    {
      id: IDS.PHASES[5],
      phaseNumber: 5,
      title: 'Assessment: Data Validation Quiz',
      estimatedMinutes: 10,
      sections: [
        text(`## Prove You Understand Validation

Five questions on data validation concepts and Excel implementation.

This isn't about memorizing menu paths — it's about understanding *why* validation matters and *what* each rule catches.

Score 4 out of 5 to move on to Lesson 7.`),
        activity(IDS.ACTIVITY_EXIT_TICKET, true),
      ],
    },
    {
      id: IDS.PHASES[6],
      phaseNumber: 6,
      title: 'Closing: How Did Validation Change Your Confidence?',
      estimatedMinutes: 5,
      sections: [
        text(`## The Confidence Question

Before Lesson 6, if someone asked you "Is this ledger accurate?", you'd have to check every row manually.

After Lesson 6, a ledger with validation rules has a built-in answer: if no validation errors are highlighted, the data meets its own quality standards.

That's not a guarantee of accuracy — validation can't catch a correctly entered wrong number. But it *does* eliminate an entire category of errors: the messy, inconsistent human errors that come from typing freely into a shared spreadsheet.

**What validation DOES catch:**
- Typos in the Category column ("Assset", "LIABILITY")
- Missing entries in required fields
- Impossible numeric values in controlled ranges

**What validation CANNOT catch:**
- A correctly formatted wrong amount ($4,200 instead of $2,400)
- An account that's classified correctly but shouldn't exist at all
- Revenue that was never invoiced

**Reflection prompt:** You've now built two layers of error defense: Conditional Formatting (Lesson 5) to catch errors after they occur, and Data Validation (Lesson 6) to prevent errors before they occur. In two sentences, explain how these two tools complement each other.`),
        text(`## What's Coming in Lesson 7

Your ledger is clean and validated. In **Lesson 7**, you'll turn that data into TechStart's most important deliverable so far: the **Balance Snapshot**.

The Balance Snapshot combines a structured Balance Sheet with a simple bar chart comparing Assets to Liabilities. It's the document that Sarah will present to the classroom — and the foundation for your first unit milestone.

**Before Lesson 7:** Make sure your validated ledger from today is saved and accessible. You'll use the account balances directly in your Balance Snapshot.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS.ACTIVITY_FILL_IN_BLANK,
      componentKey: 'fill-in-the-blank',
      displayName: 'Validation Rule Logic — Complete the Statements',
      description: 'Fill in the missing terms to complete statements about data validation rules.',
      props: {
        title: 'Data Validation: Complete the Rules',
        description: 'Fill in each blank with the correct term to complete the validation logic statement.',
        showExplanations: true,
        problemTemplate: {
          parameters: {
            total: { min: 8, max: 20, step: 1 },
            correct: { min: 6, max: 20, step: 1 },
          },
          answerFormula: 'correct / total * 100',
          questionTemplate:
            'If {{correct}} entries out of {{total}} pass validation, compute the success rate.',
          tolerance: 1,
        },
        sentences: [
          {
            id: 'b1',
            text: 'To restrict the Category column to only \"A\", \"L\", or \"E\", use Data Validation with the Allow type set to {blank}.',
            answer: 'List',
            alternativeAnswers: ['list', 'LIST'],
            hint: "You're providing a fixed set of choices the user can pick from.",
            explanation: "The 'List' validation type creates a dropdown menu. The user can only select from the predefined options — they can't type anything else.",
          },
          {
            id: 'b2',
            text: 'A Data Validation rule with the Error Alert set to {blank} prevents invalid data from being saved at all.',
            answer: 'Stop',
            alternativeAnswers: ['stop', 'STOP'],
            hint: "There are three alert levels: Information, Warning, and ___.",
            explanation: "'Stop' is the strictest alert level. It rejects the entry completely and won't let the user move to another cell until they fix it or cancel.",
          },
          {
            id: 'b3',
            text: 'To check that a cell is not blank using a Custom validation formula, you would use =NOT({blank}(A2)).',
            answer: 'ISBLANK',
            alternativeAnswers: ['isblank'],
            hint: "There's an Excel function that returns TRUE if a cell is empty.",
            explanation: "ISBLANK(A2) returns TRUE if cell A2 is empty. NOT(ISBLANK(A2)) returns TRUE only when the cell HAS a value — which is the condition we want to allow.",
          },
          {
            id: 'b4',
            text: 'Data Validation prevents format errors (like typos), but cannot prevent {blank} errors (like entering the wrong amount).',
            answer: 'format / logic',
            alternativeAnswers: ['format/logic', 'formatting / logical', 'formatting/logic', 'logic'],
            hint: "One type of error is about how data is entered; the other is about whether the data is conceptually correct.",
            explanation: "Validation controls the format and range of entries. It can't know whether a number is conceptually right — it only knows if it fits the defined rules.",
          },
          {
            id: 'b5',
            text: 'Before applying validation rules to a spreadsheet with existing data, you should {blank} the existing data first.',
            answer: 'clean',
            alternativeAnswers: ['Clean', 'CLEAN', 'fix', 'Fix', 'correct', 'Correct'],
            hint: "Validation rules apply to new entries only — existing data that violates the rule won't be automatically flagged.",
            explanation: "Validation rules don't retroactively check existing data — they only enforce rules on new entries. If your existing data has inconsistencies, they'll remain even after you set up validation.",
          },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: true,
      },
    },
    {
      id: IDS.ACTIVITY_EXIT_TICKET,
      componentKey: 'comprehension-quiz',
      displayName: 'Exit Ticket: Data Validation and Integrity (L6)',
      description: 'Five questions on data validation concepts and their application to ledger integrity.',
      props: {
        title: 'Exit Ticket: Data Validation',
        description: 'Demonstrate your understanding of validation rules. Score 4/5 to unlock Lesson 7.',
        showExplanations: true,
        allowRetry: true,
        problemTemplate: {
          parameters: {
            assets: { min: 9000, max: 20000, step: 100 },
            liabilities: { min: 2000, max: 10000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'Given assets {{assets}} and liabilities {{liabilities}}, compute equity.',
          tolerance: 1,
        },
        questions: [
          {
            id: 'q1',
            text: "Sarah's bookkeeper types 'asset' (lowercase) into the Category column. A List validation rule with allowed values 'A', 'L', 'E' is active. What happens?",
            type: 'multiple-choice',
            options: [
              "Excel auto-corrects 'asset' to 'A'",
              "Excel accepts 'asset' because it has the same meaning as 'A'",
              "Excel rejects the entry if the Error Alert is set to Stop",
              "Excel accepts the entry but highlights it in red",
            ],
            correctAnswer: 'Excel rejects the entry if the Error Alert is set to Stop',
            explanation: "Data Validation is case-sensitive for List type by default. 'asset' does not match any of the allowed values ('A', 'L', 'E'). With a Stop alert, Excel rejects the entry and displays the error message.",
          },
          {
            id: 'q2',
            text: 'You set up a non-negative balance rule on your Balance column. Then you open a file from last month that has -$350 in one row. What does Excel do?',
            type: 'multiple-choice',
            options: [
              'Excel immediately flags and highlights the -$350 cell',
              'Excel accepts the existing value — validation only applies to new entries',
              'Excel converts -$350 to $350 automatically',
              'Excel deletes the row with the invalid value',
            ],
            correctAnswer: 'Excel accepts the existing value — validation only applies to new entries',
            explanation: "Data Validation rules only affect data entered AFTER the rule is set up. Existing data that violates the rule is not automatically flagged or changed. This is why you should clean existing data before applying validation.",
          },
          {
            id: 'q3',
            text: 'What does the formula =NOT(ISBLANK(A2)) return when cell A2 is empty?',
            type: 'multiple-choice',
            options: ['TRUE — because the formula uses NOT()', 'FALSE — because A2 is blank', '0', 'An error message'],
            correctAnswer: 'FALSE — because A2 is blank',
            explanation: "ISBLANK(A2) returns TRUE when A2 is empty. NOT(TRUE) = FALSE. The validation formula returns FALSE, meaning the condition 'cell has a value' is NOT met — so Excel would reject the empty entry.",
          },
          {
            id: 'q4',
            text: 'Which type of error can Data Validation NOT prevent?',
            type: 'multiple-choice',
            options: [
              "Typing 'Asst' instead of 'A' in the Category column",
              'Leaving the Account Name cell blank',
              "Entering $4,200 for Cash when the correct amount is $2,400",
              'Entering a negative value in the Balance column',
            ],
            correctAnswer: "Entering $4,200 for Cash when the correct amount is $2,400",
            explanation: "Data Validation only checks format, type, and range — it can't verify whether a number is conceptually correct. $4,200 is a valid positive number, so it passes the rule even if the actual balance should be $2,400. This type of error requires reconciliation with source documents.",
          },
          {
            id: 'q5',
            text: 'After setting up validation rules and a new bookkeeper enters data, all cells show no validation errors. What can you confidently conclude?',
            type: 'multiple-choice',
            options: [
              'The ledger is completely accurate and error-free',
              'All entries meet the format and range rules you defined',
              'The Balance Sheet will balance automatically',
              'No entries were made incorrectly',
            ],
            correctAnswer: 'All entries meet the format and range rules you defined',
            explanation: "Passing validation means the data meets your defined format and range constraints. It does NOT guarantee the accounting is correct — a valid but wrong amount, a misunderstood transaction, or missing entries can all exist in a 'validated' spreadsheet.",
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

type SeedData = typeof LESSON_06_SEED_DATA;
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

export async function seedLesson06(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) throw new Error('DIRECT_URL not set in environment');

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    const { lesson, version, standards, phases, activities } = LESSON_06_SEED_DATA;

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

    console.log('✅ Lesson 06 seeded successfully');
  } finally {
    await queryClient.end();
  }
}

if (require.main === module) {
  seedLesson06()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
