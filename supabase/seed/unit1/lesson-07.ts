/**
 * Unit 1, Lesson 7 — Balance Snapshot with Visual (ACC-1.7)
 *
 * Seeds "Balance Snapshot with Visual" using the versioned content schema.
 * All content follows the unit_01_lesson_matrix.md row for L7:
 *  - Accounting focus: Mini Balance Sheet completeness & clarity
 *  - Excel skill: Chart basics (bar); print layout; page setup
 *  - Formative product: Balance Snapshot v0.9 + bar chart (Assets vs Liabilities)
 *  - Milestone ①: Snapshot v0.9 submitted
 *
 * Usage:
 *   npx tsx supabase/seed/unit1/lesson-07.ts
 */


import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

// ─── Deterministic IDs (d6b57545 namespace, Lesson 7) ────────────────────────

export const IDS = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000007',
  VERSION: 'd6b57545-65f6-4c39-80d5-000700000002',
  PHASES: {
    1: 'd6b57545-65f6-4c39-80d5-000700000100',
    2: 'd6b57545-65f6-4c39-80d5-000700000200',
    3: 'd6b57545-65f6-4c39-80d5-000700000300',
    4: 'd6b57545-65f6-4c39-80d5-000700000400',
    5: 'd6b57545-65f6-4c39-80d5-000700000500',
    6: 'd6b57545-65f6-4c39-80d5-000700000600',
  },
  ACTIVITY_SPREADSHEET: 'd6b57545-65f6-4c39-80d5-000700001001',
  ACTIVITY_EXIT_TICKET: 'd6b57545-65f6-4c39-80d5-000700001002',
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

export const LESSON_07_SEED_DATA = {
  lesson: {
    id: IDS.LESSON,
    slug: 'unit-1-lesson-7',
    title: 'Whole-Class Guided Build: Balance Snapshot',
    unitNumber: 1,
    orderIndex: 7,
    description:
      "Use the shared Unit 1 class dataset and scaffolded workbook to complete the whole-class guided Balance Snapshot build before groups receive differentiated project data.",
    learningObjectives: [
      'Compile a clean Balance Sheet from a validated ledger',
      'Build a bar chart in Excel comparing Total Assets to Total Liabilities',
      'Apply print layout and page setup for a presentation-ready document',
    ],
  },
  version: {
    id: IDS.VERSION,
    title: 'Whole-Class Guided Build: Balance Snapshot',
    description: "Complete the shared class workbook build with the common dataset, foundational guide, and polish guide.",
    status: 'published',
  },
  standards: [
    { code: 'ACC-1.7', isPrimary: true },
  ],
  phases: [
    {
      id: IDS.PHASES[1],
      phaseNumber: 1,
      title: "Hook: The Whole-Class Guided Build",
      estimatedMinutes: 10,
      sections: [
        text(`## The Whole-Class Guided Build

Lesson 7 is the **whole-class guided build** for Unit 1. Before groups branch into differentiated project data, everyone uses the same scaffolded workbook, \`unit_01_balance_snapshot_guided.xlsx\`, and the same shared dataset, \`unit_01_class_snapshot_dataset.csv\`.

Sarah is about to show her banker a one-page picture of TechStart's financial position. The class will build that product together first so every student understands the non-negotiable structure before Lesson 8 introduces six different datasets.

### Quick Case: The Visual Question
If you were looking at TechStart's financial position for the first time, what would a bar chart of Assets vs. Liabilities tell you that the numbers alone would hide?

*Discuss with a partner. What does visual proportion communicate that raw rows do not?*`),
        callout(
          'why-this-matters',
          "The whole-class guided build establishes the common quality bar for Unit 1. By using one shared workbook and one shared dataset first, the class can focus on process, audience, and evidence before six differentiated group cases begin.",
        ),
        text(`## What the Shared Build Includes

The class product has two anchor assets:

- \`unit_01_balance_snapshot_guided.xlsx\` for the scaffolded workbook structure
- \`unit_01_class_snapshot_dataset.csv\` for the common TechStart case

The build also uses:

- \`unit_01_foundational_build_guide.pdf\` for the essential completion moves
- \`unit_01_polish_guide.pdf\` for audience-ready quality moves

A Balance Snapshot is a two-part document:

**Part 1 — The Balance Sheet (left column or top section)**
- TechStart's name, "Balance Sheet," and current date as of header
- Three sections: Assets (Current + Non-Current), Liabilities (Current + Non-Current), Equity
- Subtotals at each level
- Grand totals: TOTAL ASSETS and TOTAL LIABILITIES + EQUITY (must match)
- Clean formatting: bold headers, indented accounts, Accounting number format, double underline for final totals

**Part 2 — The Bar Chart (right column or bottom section)**
- Title: "TechStart Financial Position — [Date]"
- Two bars: one for Total Assets, one for Total Liabilities
- Y-axis: dollar amounts
- Data labels on each bar showing the exact total
- A note below the chart: "Equity = $[Total Equity]" — the gap between the two bars

The visual purpose: if the Assets bar is taller than the Liabilities bar, TechStart has positive equity. The larger the gap, the healthier the business.`),
      ],
    },
    {
      id: IDS.PHASES[2],
      phaseNumber: 2,
      title: 'Introduction: Shared Workbook and Quality Bar',
      estimatedMinutes: 15,
      sections: [
        text(`## Introduction: Shared Workbook, Shared Sequence

In this lesson every student completes the same guided workbook so the class can rehearse the full Unit 1 process together. The **foundational build guide** in \`unit_01_foundational_build_guide.pdf\` covers the required steps. The **polish guide** in \`unit_01_polish_guide.pdf\` shows what advanced-quality communication looks like once the workbook is correct.

You'll still build the two-bar chart comparing Total Assets to Total Liabilities, but the bigger point is to internalize the common project sequence before Lesson 8 gives each group a new dataset.`),
        text(`## The Guided Build Walkthrough

### Step 1: Create a Summary Table

Somewhere below your Balance Sheet data, create a small table:

| Label | Value |
|-------|-------|
| Total Assets | =[cell with Total Assets formula] |
| Total Liabilities | =[cell with Total Liabilities formula] |

Use cell references — don't type the numbers. This way the chart updates automatically if your data changes.

### Step 2: Insert the Column Chart

1. Select the two value cells (not the labels)
2. Insert tab → Charts → 2-D Column Chart
3. Excel creates a two-bar chart

### Step 3: Format the Chart

1. Click the chart title → rename to: **TechStart Financial Position — [Date]**
2. Click a bar → right-click → Add Data Labels
3. Click the Legend → Delete (the bars are self-explanatory)
4. Resize the chart to fit neatly next to your Balance Sheet

### Step 4: Foundational Completion

Use \`unit_01_foundational_build_guide.pdf\` to verify the non-negotiables:
- the Balance Sheet sections are complete
- totals reconcile to the accounting equation
- the chart uses linked values rather than typed numbers

### Step 5: Print Layout

1. Page Layout tab → Orientation: **Landscape**
2. Margins: **Narrow**
3. Scale: Fit to **1 page**
4. Add a header: *TechStart Solutions | Balance Snapshot v0.9*
5. File → Print Preview — confirm the layout looks professional

### Step 6: Advanced Polish

Use \`unit_01_polish_guide.pdf\` to add chart labels, layout hierarchy, and audience-facing notes.

Below the chart (or in a text box), add:

> *TechStart Equity: $[amount] — [Date]*

This contextualizes the gap between the bars for anyone who reads the document.`),
      ],
    },
    {
      id: IDS.PHASES[3],
      phaseNumber: 3,
      title: 'Guided Practice: Build the Chart Together',
      estimatedMinutes: 20,
      sections: [
        text(`## Class Build: Chart on TechStart Month 3 Data

Use TechStart's Month 3 validated ledger from Lesson 6. Work through the chart-building steps together.

**TechStart Month 3 Summary (for chart input):**

| Account Section | Total |
|----------------|-------|
| Total Current Assets | $8,660 |
| Total Non-Current Assets | $3,300 (Equipment $3,600 − Depreciation $300) |
| **Total Assets** | **$11,960** |
| Total Current Liabilities | $3,630 |
| Total Non-Current Liabilities | $2,600 |
| **Total Liabilities** | **$6,230** |
| **Total Equity** | **$5,730** |

**Verification check:** $11,960 = $6,230 + $5,730 ✅

Use these totals to build your chart. Your two bars should be:
- Total Assets: **$11,960** (taller bar)
- Total Liabilities: **$6,230** (shorter bar)

The gap of $5,730 is TechStart's equity — the owner's stake.`),
        callout('tip', `**Reading the Chart**

When the Assets bar is taller than the Liabilities bar, TechStart has positive equity. The taller the gap, the more of the business Sarah truly owns versus how much is financed by creditors.

If the bars were equal: Equity = $0. Sarah would own nothing.
If the Liabilities bar were taller: Negative equity. Creditors have a stronger claim on TechStart than Sarah does.

This is why lenders and investors look at the chart before the numbers. Proportions tell the story faster than a table.`),
        text(`## Chart Review Checklist

Before moving to Independent Practice, verify your chart has:

- [ ] Correct title: "TechStart Financial Position — [Date]"
- [ ] Two bars with the right labels and heights
- [ ] Data labels showing dollar amounts on each bar
- [ ] No legend (unnecessary for a two-variable chart)
- [ ] Clean, professional appearance — no default "Chart 1" title
- [ ] Equity note below or beside the chart`),
        activity(IDS.ACTIVITY_SPREADSHEET, true),
      ],
    },
    {
      id: IDS.PHASES[4],
      phaseNumber: 4,
      title: "Independent Practice: Finish the Shared Balance Snapshot",
      estimatedMinutes: 25,
      sections: [
        text(`## Finish the Shared Balance Snapshot

Now complete the class workbook build using \`unit_01_balance_snapshot_guided.xlsx\` and \`unit_01_class_snapshot_dataset.csv\`. Your goal is a clean, print-ready document with a structured Balance Sheet and a bar chart.

**Requirements for Balance Snapshot v0.9:**
- [ ] Balance Sheet header: TechStart Solutions | Balance Sheet | As of [Date]
- [ ] Three sections: Assets (Current + Non-Current), Liabilities (Current + Non-Current), Equity
- [ ] At least 6 accounts from TechStart's Month 3 data
- [ ] Section subtotals and grand totals in proper order
- [ ] Grand total check: Total Assets = Total Liabilities + Equity ($11,960)
- [ ] Bar chart comparing Total Assets ($11,960) vs Total Liabilities ($6,230)
- [ ] Equity note showing $5,730
- [ ] Print-ready layout: fits on one landscape page

**Use these TechStart Month 3 balances:**

| Account | Balance |
|---------|---------|
| Cash | $5,100 |
| Accounts Receivable | $1,800 |
| Office Supplies | $220 |
| Prepaid Rent | $600 |
| Office Equipment | $3,600 |
| Accumulated Depreciation | -$300 |
| Accounts Payable | $380 |
| Accrued Wages | $750 |
| Deferred Revenue | $1,500 |
| Bank Loan | $2,600 |
| Sarah's Capital | $5,000 |
| Retained Earnings | $1,140 |
| Current Net Income | $750 |

Build your Balance Snapshot using the template below. First complete the foundational moves from \`unit_01_foundational_build_guide.pdf\`, then apply at least one improvement from \`unit_01_polish_guide.pdf\` before you submit Milestone ①.`),
        activity(IDS.ACTIVITY_SPREADSHEET, true),
        text(`## Teacher Submission

Submit the Balance Snapshot workbook and one exported PDF page showing chart labels, totals, and the equity note.

### Teacher review criteria

- Spreadsheet totals reconcile to the accounting equation
- The chart communicates assets versus liabilities with readable labels
- The submission includes a one-page, print-ready layout`),
      ],
    },
    {
      id: IDS.PHASES[5],
      phaseNumber: 5,
      title: 'Assessment: Balance Snapshot Quiz',
      estimatedMinutes: 10,
      sections: [
        text(`## Prove You Understand the Balance Snapshot

Five questions about the Balance Snapshot, bar chart interpretation, and presentation principles.

Remember: the Balance Snapshot is more than a spreadsheet — it's a communication tool. Answer accordingly.

Score 4 out of 5 to move on to the Group Project Days.`),
        activity(IDS.ACTIVITY_EXIT_TICKET, true),
      ],
    },
    {
      id: IDS.PHASES[6],
      phaseNumber: 6,
      title: 'Closing: What Story Does Your Snapshot Tell?',
      estimatedMinutes: 5,
      sections: [
        text(`## Milestone ① — Balance Snapshot v0.9 Submitted

You have completed Lesson 7 and submitted your first major deliverable: the **Balance Snapshot v0.9**.

This document captures TechStart's financial position at the end of Month 3 — before Sarah's first investor presentation, before the group project days, and before the final assessment. It's a snapshot of everything you've built in Lessons 1 through 7.

**What your Snapshot demonstrates:**
- You can classify accounts correctly (Lessons 1–2)
- You understand how transactions change the equation (Lesson 3)
- You can organize accounts into a formal Balance Sheet (Lesson 4)
- You can detect and fix ledger errors (Lesson 5)
- You can validate data for consistency (Lesson 6)
- You can communicate financial position visually (Lesson 7)

That's the complete ACC-1 competency chain.`),
        text(`## What's Coming in Lessons 8–10

Lessons 8, 9, and 10 apply the same product structure in a project sequence:

- **Lesson 8:** each group receives one of six differentiated datasets
- **Lesson 9:** groups polish the workbook and script using \`unit_01_polish_guide.pdf\`
- **Lesson 10:** groups present the finished workbook to the class

**Reflection prompt:** Look at the bar chart in your Balance Snapshot. The Assets bar is taller than the Liabilities bar. In two sentences, explain what that gap means for TechStart's financial health — and why an investor would care about its size.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS.ACTIVITY_SPREADSHEET,
      componentKey: 'spreadsheet',
      displayName: "TechStart Balance Snapshot v0.9",
      description: "Build TechStart's Balance Snapshot: a formatted Balance Sheet with section subtotals and a bar chart comparing Total Assets vs Total Liabilities.",
      props: {
        title: "TechStart Solutions — Balance Snapshot v0.9",
        description: "Assemble the Balance Sheet from Month 3 data and insert a bar chart comparing Total Assets to Total Liabilities. Milestone ① submission.",
        template: 'balance-sheet' as const,
        problemTemplate: {
          parameters: {
            assets: { min: 9000, max: 20000, step: 100 },
            liabilities: { min: 2000, max: 12000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'Build the snapshot with assets {{assets}} and liabilities {{liabilities}}.',
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
        autoGrade: true,
        passingScore: 60,
        partialCredit: false,
      },
    },
    {
      id: IDS.ACTIVITY_EXIT_TICKET,
      componentKey: 'comprehension-quiz',
      displayName: 'Exit Ticket: Balance Snapshot and Visual Communication (L7)',
      description: 'Five questions about the Balance Snapshot, chart interpretation, and financial communication.',
      props: {
        title: 'Exit Ticket: Balance Snapshot',
        description: 'Demonstrate your understanding of the Balance Snapshot and visual communication. Score 4/5 to unlock Group Project Days.',
        showExplanations: true,
        allowRetry: true,
        problemTemplate: {
          parameters: {
            assets: { min: 9000, max: 20000, step: 100 },
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
            text: "TechStart's bar chart shows Total Assets = $11,960 and Total Liabilities = $6,230. What does the gap between these two bars represent?",
            type: 'multiple-choice',
            options: [
              "TechStart's revenue for the month",
              "TechStart's equity — the owner's stake in the business",
              "TechStart's cash position",
              "The amount TechStart borrowed this month",
            ],
            correctAnswer: "TechStart's equity — the owner's stake in the business",
            explanation: "Using A = L + E: Equity = Assets - Liabilities = $11,960 - $6,230 = $5,730. The gap between the two bars equals Total Equity — the portion of TechStart that belongs to Sarah after all debts are paid.",
          },
          {
            id: 'q2',
            text: "If the Liabilities bar in TechStart's chart became taller than the Assets bar, what would this indicate?",
            type: 'multiple-choice',
            options: [
              "TechStart is growing rapidly",
              "TechStart has negative equity — creditors have a stronger claim than the owner",
              "TechStart paid off its debts",
              "TechStart's revenue exceeded expenses",
            ],
            correctAnswer: "TechStart has negative equity — creditors have a stronger claim than the owner",
            explanation: "If Liabilities > Assets, then Equity = Assets - Liabilities < 0. This means creditors technically have claims that exceed what the business owns — a signal of financial stress that would concern any investor or lender.",
          },
          {
            id: 'q3',
            text: "Why should the Balance Snapshot use cell references for chart data rather than typed numbers?",
            type: 'multiple-choice',
            options: [
              'Cell references are more aesthetically pleasing',
              'Typed numbers cause Excel formulas to break',
              'Cell references update the chart automatically when the underlying data changes',
              'Excel requires cell references for charts to display correctly',
            ],
            correctAnswer: 'Cell references update the chart automatically when the underlying data changes',
            explanation: "When the chart uses cell references (e.g., =SUM(B2:B8)) instead of hardcoded numbers, any change to the underlying ledger data is reflected in the chart immediately. Typed numbers would need to be manually updated every time the data changes.",
          },
          {
            id: 'q4',
            text: 'Which print setting ensures TechStart\'s Balance Snapshot fits on a single page?',
            type: 'multiple-choice',
            options: [
              "Print Selection — prints only the selected cells",
              "Fit to 1 page wide by 1 page tall — scales the content to fit",
              "Print Gridlines — shows cell borders",
              "Print Row and Column Headers — shows row numbers and column letters",
            ],
            correctAnswer: "Fit to 1 page wide by 1 page tall — scales the content to fit",
            explanation: "The 'Fit to 1 page' scale setting in Page Layout automatically adjusts the print scale so all content fits within one page — landscape or portrait. This is the standard approach for presenting a Balance Sheet.",
          },
          {
            id: 'q5',
            text: "Sarah's Balance Snapshot shows Total Assets = $11,960 and Total Liabilities + Equity = $11,960. What does this confirm?",
            type: 'multiple-choice',
            options: [
              "TechStart made a $11,960 profit this month",
              "The accounting equation balances — the data is internally consistent",
              "TechStart has no debt",
              "TechStart's equity equals its assets",
            ],
            correctAnswer: "The accounting equation balances — the data is internally consistent",
            explanation: "When Total Assets = Total Liabilities + Equity, the fundamental accounting equation holds. This confirms that every transaction was recorded with both sides of the dual-impact entry, and that the Balance Sheet is internally consistent. It does not guarantee the numbers are correct — only that they balance.",
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

type SeedData = typeof LESSON_07_SEED_DATA;
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

export async function seedLesson07(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) throw new Error('DIRECT_URL not set in environment');

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    const { lesson, version, standards, phases, activities } = LESSON_07_SEED_DATA;

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

    console.log('✅ Lesson 07 seeded successfully');
  } finally {
    await queryClient.end();
  }
}

if (require.main === module) {
  seedLesson07()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
