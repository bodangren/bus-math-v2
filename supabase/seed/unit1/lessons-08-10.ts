/**
 * Unit 1, Lessons 8–10 — Group Project Days 1–3
 *
 * Seeds three project day lessons. Each is a single-phase lesson with
 * group work instructions and a formative activity.
 *
 *  L8: Group Project Day 1 — Refine ledger + peer critique
 *  L9: Group Project Day 2 — Polish visuals + micro-pitch script
 *  L10: Group Project Day 3 — Final polish + submit (Milestone ②)
 *
 * Usage:
 *   npx tsx supabase/seed/unit1/lessons-08-10.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

// ─── Deterministic IDs ────────────────────────────────────────────────────────

const IDS_L8 = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000008',
  VERSION: 'd6b57545-65f6-4c39-80d5-000800000002',
  PHASE_1: 'd6b57545-65f6-4c39-80d5-000800000100',
  ACTIVITY_PEER_CRITIQUE: 'd6b57545-65f6-4c39-80d5-000800001001',
} as const;

const IDS_L9 = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000009',
  VERSION: 'd6b57545-65f6-4c39-80d5-000900000002',
  PHASE_1: 'd6b57545-65f6-4c39-80d5-000900000100',
  ACTIVITY_REFLECTION: 'd6b57545-65f6-4c39-80d5-000900001001',
} as const;

const IDS_L10 = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000010',
  VERSION: 'd6b57545-65f6-4c39-80d5-001000000002',
  PHASE_1: 'd6b57545-65f6-4c39-80d5-001000000100',
  ACTIVITY_REFLECTION: 'd6b57545-65f6-4c39-80d5-001000001001',
} as const;

// ─── Section helpers ──────────────────────────────────────────────────────────

function text(markdown: string) {
  return { sectionType: 'text' as const, content: { markdown } };
}

function activity(activityId: string, required: boolean) {
  return {
    sectionType: 'activity' as const,
    content: { activityId, required },
  };
}

// ─── Lesson 8 Seed Data ───────────────────────────────────────────────────────

export const LESSON_08_SEED_DATA = {
  lesson: {
    id: IDS_L8.LESSON,
    slug: 'unit-1-lesson-8',
    title: 'Group Project Day 1: Refine the Ledger',
    unitNumber: 1,
    orderIndex: 8,
    description:
      'Refine your group ledger for accuracy and completeness, then use a structured peer-critique checklist to give and receive feedback.',
    learningObjectives: [
      'Apply a peer-critique framework to evaluate a group ledger',
      'Give specific, constructive feedback on account classification and data quality',
      'Revise the ledger based on peer feedback before Day 2 polish',
    ],
  },
  version: {
    id: IDS_L8.VERSION,
    title: 'Group Project Day 1: Refine the Ledger',
    description: 'Peer-review your group Balance Sheet for accuracy before the visual polish phase.',
    status: 'published',
  },
  standards: [] as { code: string; isPrimary: boolean }[],
  phases: [
    {
      id: IDS_L8.PHASE_1,
      phaseNumber: 1,
      title: 'Day 1 Scaffolding: Ledger Refinement and Team Planning',
      estimatedMinutes: 50,
      deliverables: [
        'Team roster with assigned accountability roles',
        'Initial account checklist mapped to A/L/E structure',
        'Day 1 revision log from peer critique',
      ],
      sections: [
        text(`## Group Project Day 1: Refine and Review

Today is the first of three Group Project Days. Your team has one goal: make your group ledger as accurate and clean as possible before you move into visual polish tomorrow.

### Your Group Work Agenda

**Part 1 — Ledger Reconciliation (20 minutes)**

Each team member should bring their individual ledger from Lessons 1–7. Compare your ledgers as a group:

1. **Do your account lists match?** Did anyone include accounts that others missed?
2. **Do your balances agree?** If there are differences, trace back to the source transaction.
3. **Does everyone agree on the categories?** Pay special attention to gray zone accounts (Prepaid Insurance, Deferred Revenue, Owner Drawings).
4. **Does your equation check cell show $0?** If not, identify the discrepancy before moving on.

**Part 2 — Data Validation Check (10 minutes)**

Apply the three Conditional Formatting rules from Lesson 5 and the Data Validation rules from Lesson 6 to your group ledger:

- [ ] No blank Category fields
- [ ] All categories are exactly A, L, or E
- [ ] No unexpected negative balances
- [ ] Equation check = $0

**Part 3 — Peer Critique (20 minutes)**

Swap your group's ledger with another group. Complete the peer critique form below — it's your structured feedback for the team you're reviewing.`),
        activity(IDS_L8.ACTIVITY_PEER_CRITIQUE, true),
        text(`## After the Critique: Revision Notes

After receiving feedback from your peer group:

1. **Read through their comments carefully.** Don't dismiss feedback — even if you disagree, write it down and discuss as a team.
2. **Categorize each comment:**
   - Agree and will fix → add to your revision list
   - Disagree but will investigate → mark for discussion tomorrow
   - Don't understand → ask the feedback group to clarify
3. **Make your agreed changes** to the group ledger before end of class
4. **Save your work** — tomorrow's session starts from today's revised ledger

### What Makes Peer Feedback Useful

Good peer feedback is specific. "I think there's an error" is not useful. "Line 7 — Office Supplies is in Category L, but based on our classification test, it should be Category A" is useful.

When you receive a critique form back, prioritize feedback that cites a specific account name, line number, or classification rule.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS_L8.ACTIVITY_PEER_CRITIQUE,
      componentKey: 'peer-critique-form',
      displayName: "Peer Critique: Group Ledger Review",
      description: "Structured peer feedback on another group's Balance Sheet ledger.",
      props: {
        title: "Peer Critique: Group Ledger Review",
        description: "Review the group ledger you've been assigned. Use this form to provide specific, constructive feedback on accuracy, completeness, and data quality.",
        rubric: [
          {
            id: 'r1',
            criterion: 'Account Classification',
            description: 'Are all accounts correctly classified as A, L, or E?',
            maxScore: 3,
            levels: [
              { score: 3, label: 'All correct', description: 'Every account is in the right category.' },
              { score: 2, label: 'Minor errors', description: '1–2 accounts are misclassified.' },
              { score: 1, label: 'Multiple errors', description: '3 or more accounts are misclassified.' },
            ],
          },
          {
            id: 'r2',
            criterion: 'Equation Balance',
            description: 'Does Total Assets = Total Liabilities + Equity?',
            maxScore: 2,
            levels: [
              { score: 2, label: 'Balanced', description: 'Equation check cell shows $0.' },
              { score: 0, label: 'Not balanced', description: 'Equation does not balance — investigate.' },
            ],
          },
          {
            id: 'r3',
            criterion: 'Data Completeness',
            description: 'Are all required fields filled in (Account Name, Balance, Category)?',
            maxScore: 2,
            levels: [
              { score: 2, label: 'Complete', description: 'No blank required fields.' },
              { score: 1, label: 'Minor gaps', description: '1–2 blank fields.' },
              { score: 0, label: 'Significant gaps', description: '3+ blank fields.' },
            ],
          },
          {
            id: 'r4',
            criterion: 'Specific Feedback',
            description: 'Provide at least two specific comments on what to improve.',
            maxScore: 3,
            levels: [
              { score: 3, label: 'Thorough', description: '2+ specific, actionable comments with account references.' },
              { score: 2, label: 'Adequate', description: '1–2 comments, mostly specific.' },
              { score: 1, label: 'Vague', description: 'Feedback is too general to act on.' },
            ],
          },
        ],
        commentsPlaceholder: "List specific accounts that need attention, with the account name, current value, and your suggested change.",
      },
      gradingConfig: {
        autoGrade: false,
        passingScore: 0,
        partialCredit: true,
      },
    },
  ],
} as const;

// ─── Lesson 9 Seed Data ───────────────────────────────────────────────────────

export const LESSON_09_SEED_DATA = {
  lesson: {
    id: IDS_L9.LESSON,
    slug: 'unit-1-lesson-9',
    title: 'Group Project Day 2: Polish the Visuals',
    unitNumber: 1,
    orderIndex: 9,
    description:
      'Apply visual polish to your Balance Snapshot, refine the bar chart, and draft a 60-second micro-pitch script that explains TechStart\'s financial position to a non-accounting audience.',
    learningObjectives: [
      'Apply visual design principles to a financial document',
      'Draft a 60-second micro-pitch script explaining the Balance Snapshot',
      'Incorporate feedback from Day 1 peer critique',
    ],
  },
  version: {
    id: IDS_L9.VERSION,
    title: 'Group Project Day 2: Polish the Visuals',
    description: 'Refine the Balance Snapshot and prepare the presentation narrative.',
    status: 'published',
  },
  standards: [] as { code: string; isPrimary: boolean }[],
  phases: [
    {
      id: IDS_L9.PHASE_1,
      phaseNumber: 1,
      title: 'Day 2 Build: Workbook Construction and Checkpoint',
      estimatedMinutes: 50,
      deliverables: [
        'Completed Excel workbook with validated totals',
        'Equation-check screenshot showing balance',
        'Checkpoint checklist with build milestones',
      ],
      sections: [
        text(`## Group Project Day 2: Make It Presentable

Today your group has two goals: polish the visual presentation of your Balance Snapshot and write the script for your 60-second micro-pitch.

### Part 1 — Apply Day 1 Revisions (10 minutes)

Start by incorporating the agreed changes from your peer critique:

1. Open your group ledger from Day 1
2. Make every revision that was marked "Agree and will fix"
3. Re-run the equation check — verify it still shows $0 after your changes
4. Save the updated file

### Part 2 — Visual Polish Checklist (20 minutes)

Review your Balance Snapshot against this presentation checklist:

**Balance Sheet Formatting:**
- [ ] Header: Company name, "Balance Sheet," and date as of
- [ ] All sections labeled clearly (ASSETS, LIABILITIES, EQUITY)
- [ ] Current and Non-Current subsections for Assets and Liabilities
- [ ] Account names indented under their sections
- [ ] Subtotals bold and right-aligned
- [ ] Grand totals with double underline
- [ ] Accounting number format for all dollar values ($1,234.00)

**Bar Chart:**
- [ ] Descriptive title (not "Chart 1")
- [ ] Data labels on both bars
- [ ] Y-axis starts at $0
- [ ] Equity note below the chart
- [ ] No clutter (no unnecessary gridlines, legends, or default formatting)

**Print Layout:**
- [ ] Landscape orientation
- [ ] Fits on one page
- [ ] Header with group name and date

### Part 3 — Write the Micro-Pitch Script (20 minutes)

A micro-pitch is a 60-second explanation of a financial document to someone who has never seen it. Think: a classroom investor who asks "So, how is TechStart doing?"

**Script structure (three sentences):**

**Sentence 1 — The Headline:** What's the most important thing the Balance Sheet shows?
*Example: "TechStart ended Month 3 with $11,960 in assets and $6,230 in total liabilities — leaving Sarah with $5,730 in equity, which means the business is worth significantly more than it owes."*

**Sentence 2 — The Story:** What happened this month that drove those numbers?
*Example: "The biggest assets are cash from client payments and the equipment Sarah purchased to scale operations, while most of the liabilities are from a three-year bank loan that's being paid down steadily."*

**Sentence 3 — The Signal:** What does this tell us about TechStart's financial health?
*Example: "The fact that equity is growing month over month — from $3,600 in Month 1 to $5,730 in Month 3 — signals that TechStart is profitable and on track for the investor conversation."*

Write your group's three-sentence micro-pitch in the reflection journal below.`),
        activity(IDS_L9.ACTIVITY_REFLECTION, true),
        text(`## Peer Presentation Prep

At the end of class, each group will do a 60-second practice run of their micro-pitch for one other group. The audience's job: listen for one thing they understood and one thing that was confusing.

**Tips for delivery:**
- Look at the chart when referencing the visual comparison
- Use "we" language ("our group found...")
- Don't read from the script — use it as a guide and speak naturally
- Lead with the headline number (equity amount), not the details`),
      ],
    },
  ],
  activities: [
    {
      id: IDS_L9.ACTIVITY_REFLECTION,
      componentKey: 'reflection-journal',
      displayName: 'Micro-Pitch Script: 60-Second Financial Explanation',
      description: "Draft your group's 60-second micro-pitch script explaining TechStart's Balance Snapshot to a non-accounting audience.",
      props: {
        title: "Micro-Pitch Script: TechStart's Financial Position",
        description: "Write your group's three-sentence micro-pitch. Cover: (1) the headline — what does the Balance Sheet show? (2) the story — what drove those numbers? (3) the signal — what does it mean for TechStart's financial health?",
        prompts: [
          {
            id: 'p1',
            question: 'Sentence 1 — The Headline: What does TechStart\'s Balance Sheet show in one sentence?',
            placeholder: "TechStart ended [Month] with $[amount] in assets and $[amount] in liabilities, leaving $[amount] in equity...",
          },
          {
            id: 'p2',
            question: 'Sentence 2 — The Story: What happened this month that drove those numbers?',
            placeholder: "The biggest drivers were...",
          },
          {
            id: 'p3',
            question: 'Sentence 3 — The Signal: What does this tell us about TechStart\'s financial health?',
            placeholder: "This signals that TechStart is...",
          },
        ],
        minWordsPerPrompt: 20,
      },
      gradingConfig: {
        autoGrade: false,
        passingScore: 0,
        partialCredit: false,
      },
    },
  ],
} as const;

// ─── Lesson 10 Seed Data ──────────────────────────────────────────────────────

export const LESSON_10_SEED_DATA = {
  lesson: {
    id: IDS_L10.LESSON,
    slug: 'unit-1-lesson-10',
    title: 'Group Project Day 3: Final Polish and Submit',
    unitNumber: 1,
    orderIndex: 10,
    description:
      "Complete final revisions to TechStart's Balance Sheet package, rehearse the micro-pitch, and submit the group's Mini Balance Sheet for Milestone ② evaluation.",
    learningObjectives: [
      'Complete a final pre-submission quality check',
      'Rehearse and refine the 60-second micro-pitch',
      'Submit the group Mini Balance Sheet package (Milestone ②)',
    ],
  },
  version: {
    id: IDS_L10.VERSION,
    title: 'Group Project Day 3: Final Polish and Submit',
    description: 'Final quality check, rehearsal, and Milestone ② submission.',
    status: 'published',
  },
  standards: [] as { code: string; isPrimary: boolean }[],
  phases: [
    {
      id: IDS_L10.PHASE_1,
      phaseNumber: 1,
      title: 'Day 3 Present: Rehearsal, Delivery, and Feedback',
      estimatedMinutes: 50,
      deliverables: [
        'Final Balance Sheet package',
        'Presentation script or slides for live delivery',
        'Peer feedback evidence from rehearsal/presentation',
      ],
      sections: [
        text(`## Group Project Day 3: Ready to Submit

This is your last chance to refine before the Milestone ② submission deadline. Today has three parts: a final quality check, a rehearsal run, and submission.

### Part 1 — Pre-Submission Checklist (15 minutes)

Work through the full checklist below. Every item must be checked before you submit.

**Ledger:**
- [ ] All accounts classified correctly (A, L, or E)
- [ ] No blank Account Name, Balance, or Category cells
- [ ] Equation check = $0
- [ ] No unexpected negative balances (exception: Accumulated Depreciation)
- [ ] Data Validation rules active on Category column

**Balance Sheet:**
- [ ] Header: Company name, "Balance Sheet," current date
- [ ] Current and Non-Current sections for both Assets and Liabilities
- [ ] Section subtotals calculated correctly
- [ ] Grand totals match: Total Assets = Total Liabilities + Equity
- [ ] Accounting number format on all values
- [ ] Double underline on final totals

**Bar Chart:**
- [ ] Descriptive title
- [ ] Data labels on both bars
- [ ] Equity note present
- [ ] No "Chart 1" or default Excel labels

**Overall:**
- [ ] One-page print layout (landscape, fits on page)
- [ ] Header with group name and date
- [ ] Micro-pitch script finalized

### Part 2 — Rehearsal Run (20 minutes)

One more practice run of your micro-pitch — this time as a complete group. One person presents the full script while another person manages the Balance Snapshot document.

**Presentation format:**
1. Open the Balance Snapshot on the screen
2. Deliver the three-sentence micro-pitch while pointing to the relevant chart elements
3. Be ready for one follow-up question: *"What is TechStart's equity, and what does that number mean?"*

After the practice run, use the reflection journal below to note what went well and what you'd still improve.

### Milestone ② — Submit Now

**Final submission package:**
- Excel file with: validated ledger, formatted Balance Sheet, bar chart — all on one landscape page
- File name format: \`TechStart_BalanceSnapshot_Group[N]_[Date].xlsx\`

Submit through the course portal. The submission confirms that your group has completed Milestone ②.`),
        activity(IDS_L10.ACTIVITY_REFLECTION, true),
        text(`## What's Coming: Individual Assessment

After today's group submission, each student completes Lesson 11 individually.

**Lesson 11 is the summative assessment** for the entire unit. It covers all seven ACC-1.x standards:
- ACC-1.1: The accounting equation (A = L + E)
- ACC-1.2: Classifying accounts into A/L/E
- ACC-1.3: Building the Balance Sheet structure
- ACC-1.4: Transaction effects on A/L/E
- ACC-1.5: Detecting and fixing ledger errors
- ACC-1.6: Data validation and integrity
- ACC-1.7: Balance Snapshot and visual communication

Seven questions. One per standard. Auto-graded. You have up to two attempts.

**Recommendation:** Review your personal notes from all seven lessons tonight. The strongest preparation is being able to explain — without looking — how each standard connects to TechStart's story.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS_L10.ACTIVITY_REFLECTION,
      componentKey: 'reflection-journal',
      displayName: 'Milestone ② Personal Checklist — Final Reflection',
      description: "Complete your personal pre-submission checklist and reflect on the group project experience.",
      props: {
        title: "Milestone ② Personal Reflection",
        description: "Before your group submits, take five minutes to reflect on what you contributed and what you'd do differently.",
        prompts: [
          {
            id: 'p1',
            question: 'What was your most important contribution to the group Balance Sheet project?',
            placeholder: "I contributed most by...",
          },
          {
            id: 'p2',
            question: "What's one thing you'd do differently in the next group project?",
            placeholder: "Next time I would...",
          },
          {
            id: 'p3',
            question: "What's the one ACC-1.x standard you feel least confident about going into the individual assessment? What will you review?",
            placeholder: "I'm least confident about ACC-1.___ because...",
          },
        ],
        minWordsPerPrompt: 15,
        milestoneNote: 'Milestone ② — Mini Balance Sheet package submitted after this reflection.',
      },
      gradingConfig: {
        autoGrade: false,
        passingScore: 0,
        partialCredit: false,
      },
    },
  ],
} as const;

// ─── Type helpers ─────────────────────────────────────────────────────────────

type SeedDataUnion =
  | typeof LESSON_08_SEED_DATA
  | typeof LESSON_09_SEED_DATA
  | typeof LESSON_10_SEED_DATA;
type PhaseSeedData = SeedDataUnion['phases'][number];
type SectionData = PhaseSeedData['sections'][number];

// ─── DB seeding helpers ───────────────────────────────────────────────────────

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

async function seedOneLesson(
  db: ReturnType<typeof drizzle>,
  data: SeedDataUnion,
): Promise<void> {
  const { lesson, version, standards, phases, activities } = data;

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
}

export async function seedLessons0810(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) throw new Error('DIRECT_URL not set in environment');

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    await seedOneLesson(db, LESSON_08_SEED_DATA);
    console.log('✅ Lesson 08 seeded successfully');

    await seedOneLesson(db, LESSON_09_SEED_DATA);
    console.log('✅ Lesson 09 seeded successfully');

    await seedOneLesson(db, LESSON_10_SEED_DATA);
    console.log('✅ Lesson 10 seeded successfully');
  } finally {
    await queryClient.end();
  }
}

if (require.main === module) {
  seedLessons0810()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
