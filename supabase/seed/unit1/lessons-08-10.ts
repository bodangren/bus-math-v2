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
  PHASE_2: 'd6b57545-65f6-4c39-80d5-000800000200',
  PHASE_3: 'd6b57545-65f6-4c39-80d5-000800000300',
  PHASE_4: 'd6b57545-65f6-4c39-80d5-000800000400',
  ACTIVITY_PEER_CRITIQUE: 'd6b57545-65f6-4c39-80d5-000800001001',
} as const;

const IDS_L9 = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000009',
  VERSION: 'd6b57545-65f6-4c39-80d5-000900000002',
  PHASE_1: 'd6b57545-65f6-4c39-80d5-000900000100',
  PHASE_2: 'd6b57545-65f6-4c39-80d5-000900000200',
  PHASE_3: 'd6b57545-65f6-4c39-80d5-000900000300',
  PHASE_4: 'd6b57545-65f6-4c39-80d5-000900000400',
  ACTIVITY_REFLECTION: 'd6b57545-65f6-4c39-80d5-000900001001',
} as const;

const IDS_L10 = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000010',
  VERSION: 'd6b57545-65f6-4c39-80d5-001000000002',
  PHASE_1: 'd6b57545-65f6-4c39-80d5-001000000100',
  PHASE_2: 'd6b57545-65f6-4c39-80d5-001000000200',
  PHASE_3: 'd6b57545-65f6-4c39-80d5-001000000300',
  PHASE_4: 'd6b57545-65f6-4c39-80d5-001000000400',
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
    title: 'Group Build: Six Dataset Challenge',
    unitNumber: 1,
    orderIndex: 8,
    description:
      'Apply the Lesson 7 build process to one of six differentiated datasets and produce a balanced draft workbook before advanced polish begins.',
    learningObjectives: [
      'Apply the Lesson 7 product structure to a new group dataset',
      'Use the foundational-proficiency build guide to complete the draft workbook',
      'Document the remaining support needs before Lesson 9 polish',
    ],
  },
  version: {
    id: IDS_L8.VERSION,
    title: 'Group Build: Six Dataset Challenge',
    description: 'Build the first group workbook draft from one of six differentiated datasets.',
    status: 'published',
  },
  standards: [] as { code: string; isPrimary: boolean }[],
  phases: [
    {
      id: IDS_L8.PHASE_1,
      phaseNumber: 1,
      title: 'Brief: Dataset Assignment + Task Framing',
      estimatedMinutes: 10,
      sections: [
        text(`## Six Dataset Challenge

Lesson 8 is not a generic work day. Each group receives one new dataset and must build the same Balance Snapshot product the class just completed in Lesson 7.

The six differentiated files are:
- \`unit_01_group_dataset_01.csv\`
- \`unit_01_group_dataset_02.csv\`
- \`unit_01_group_dataset_03.csv\`
- \`unit_01_group_dataset_04.csv\`
- \`unit_01_group_dataset_05.csv\`
- \`unit_01_group_dataset_06.csv\`

Today your job is to open the assigned case, confirm roles, and restate the shared deliverable: a balanced workbook draft built from new data, not the common class dataset.`),
      ],
    },
    {
      id: IDS_L8.PHASE_2,
      phaseNumber: 2,
      title: 'Workshop: Foundational-Proficiency Build',
      estimatedMinutes: 15,
      sections: [
        text(`## Foundational-Proficiency Build

Use the **foundational-proficiency build guide** (\`unit_01_foundational_build_guide.pdf\`) to complete the non-negotiable sequence:

1. classify each account correctly
2. verify the accounting equation
3. organize the Balance Sheet sections
4. prepare the chart inputs

Every group must keep the **same product structure as Lesson 7** even though the numbers and business case are different. By the end of this phase, the workbook should be technically correct and ready for checkpoint review.`),
      ],
    },
    {
      id: IDS_L8.PHASE_3,
      phaseNumber: 3,
      title: 'Checkpoint: Draft Workbook Handoff',
      estimatedMinutes: 15,
      sections: [
        text(`## Checkpoint: Draft Workbook Handoff

Exchange your draft workbook with another group. The checkpoint is simple: can another team follow the same product structure as Lesson 7, confirm the workbook balances, and identify the most important next revision before polish? Complete the handoff form below so the next team receives specific feedback.`),
        activity(IDS_L8.ACTIVITY_PEER_CRITIQUE, true),
      ],
    },
    {
      id: IDS_L8.PHASE_4,
      phaseNumber: 4,
      title: 'Reflection: Prepare for Lesson 9 Polish',
      estimatedMinutes: 10,
      sections: [
        text(`## Reflection: What Still Needs Support?

Before class ends, make sure your group has:

- a **balanced workbook draft**
- a revision list based on the checkpoint feedback
- one named priority for **Lesson 9 polish**

Record which part of the workbook still needs the most support tomorrow: account logic, layout, chart clarity, or explanation. Lesson 9 is reserved for investor-ready polish, so foundational fixes must already be visible in this draft.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS_L8.ACTIVITY_PEER_CRITIQUE,
      componentKey: 'peer-critique-form',
      displayName: 'Peer Critique: Draft Workbook Handoff',
      description: "Structured peer feedback on another group's draft Balance Snapshot workbook.",
      props: {
        projectTitle: 'Draft Workbook Handoff',
        peerName: 'Partner group',
        description: "Review the draft workbook you've been assigned. Use this form to give precise feedback on whether the group has met the foundational build expectations before polish.",
        categories: [
          {
            id: 'r1',
            title: 'Workbook Structure',
            description: 'Does the workbook follow the same product structure as Lesson 7?',
            prompt: 'Note any missing product elements the group still needs to add before polish.',
            placeholder: 'Call out missing sections, chart pieces, or workbook evidence.',
            ratingLabel: 'Structure',
          },
          {
            id: 'r2',
            title: 'Balance Check',
            description: 'Does the draft workbook reconcile cleanly?',
            prompt: 'Record whether the workbook balances and what the team should inspect next if it does not.',
            placeholder: 'Note the equation result and the next verification step.',
            ratingLabel: 'Balance check',
          },
          {
            id: 'r3',
            title: 'Foundational Completion',
            description: 'Has the group completed the essential moves from the foundational guide?',
            prompt: 'List any unfinished foundational steps before the class can move to advanced polish.',
            placeholder: 'Identify unfinished build steps or weak evidence.',
            ratingLabel: 'Completeness',
          },
          {
            id: 'r4',
            title: 'Specific Feedback',
            description: 'Provide two specific next steps for the group.',
            prompt: 'Write two actionable next steps the group should take before Lesson 9 polish.',
            placeholder: 'Reference exact workbook moves, chart changes, or explanation gaps.',
            ratingLabel: 'Actionability',
          },
        ],
        overallPrompt: 'List the single highest-leverage change this group should make before Lesson 9 polish.',
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
    title: 'Group Polish: Investor-Ready Snapshot',
    unitNumber: 1,
    orderIndex: 9,
    description:
      'Apply the advanced polish guide to the Lesson 8 workbook so the group product becomes investor-ready and presentation-ready.',
    learningObjectives: [
      'Apply the advanced polish guide to the Lesson 8 workbook',
      'Improve visual clarity, professionalism, and the audience-facing explanation',
      'Draft a 60-second script that explains the business story behind the numbers',
    ],
  },
  version: {
    id: IDS_L9.VERSION,
    title: 'Group Polish: Investor-Ready Snapshot',
    description: 'Polish the group workbook and script using the advanced guidance assets.',
    status: 'published',
  },
  standards: [] as { code: string; isPrimary: boolean }[],
  phases: [
    {
      id: IDS_L9.PHASE_1,
      phaseNumber: 1,
      title: 'Brief: Advanced-Quality Criteria',
      estimatedMinutes: 10,
      sections: [
        text(`## Advanced-Quality Criteria

Lesson 9 is the explicit polish day. Open your **Lesson 8 workbook** and separate what counts as foundational completion from what counts as advanced communication quality.

Today's target is an **investor-ready** workbook:
- layout is readable and deliberate
- the chart supports the story instead of distracting from it
- the explanation is clear enough for a non-accountant

Keep the workbook technically correct first. Then use the polish assets to improve the presentation quality.`),
      ],
    },
    {
      id: IDS_L9.PHASE_2,
      phaseNumber: 2,
      title: 'Workshop: Polish / Advanced How-To',
      estimatedMinutes: 15,
      sections: [
        text(`## Polish / Advanced How-To

Use \`unit_01_polish_guide.pdf\` to model the moves that turn a correct workbook into an **investor-ready** one:

- hierarchy and spacing
- chart labels and readability
- audience note and explanatory caption
- a concise 60-second script tied to the workbook evidence

The polish guide is for advanced quality, not rescue work. If the Lesson 8 workbook still has foundational errors, fix them immediately and then return to the advanced moves.`),
      ],
    },
    {
      id: IDS_L9.PHASE_3,
      phaseNumber: 3,
      title: 'Checkpoint: Script and Workbook Review',
      estimatedMinutes: 15,
      sections: [
        text(`## Checkpoint: Script and Workbook Review

Checkpoint the two artifacts together:

- the polished workbook
- the **60-second script** that explains the numbers

The script should answer one question clearly: *Is this business healthy, and how do we know?* Use the reflection journal below to draft the headline, supporting evidence, and closing signal.`),
        activity(IDS_L9.ACTIVITY_REFLECTION, true),
      ],
    },
    {
      id: IDS_L9.PHASE_4,
      phaseNumber: 4,
      title: 'Reflection: Prepare for Lesson 10 Presentation',
      estimatedMinutes: 10,
      sections: [
        text(`## Reflection: Prepare for Lesson 10 Presentation

Before you leave, identify the one revision that still matters most for the **formal class presentation in Lesson 10**.

Use this quick checklist:
- the workbook is accurate and polished
- the script references the workbook evidence directly
- every speaker knows how to answer an audience follow-up question

Tomorrow is not another work day. It is the public presentation lesson.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS_L9.ACTIVITY_REFLECTION,
      componentKey: 'reflection-journal',
      displayName: 'Investor-Ready Script Check',
      description: "Draft your group's 60-second script for the investor-ready workbook.",
      props: {
        unitTitle: 'Investor-Ready Snapshot',
        description: "Write your group's three-part script. Cover the headline, the supporting evidence from the workbook, and the business-health signal.",
        prompts: [
          {
            id: 'p1',
            category: 'courage',
            prompt: 'Headline: What is the clearest one-sentence claim about this business?',
            placeholder: 'Our workbook shows...',
          },
          {
            id: 'p2',
            category: 'adaptability',
            prompt: 'Evidence: Which workbook details prove that claim?',
            placeholder: 'The strongest evidence is...',
          },
          {
            id: 'p3',
            category: 'persistence',
            prompt: 'Signal: What should the audience conclude from the workbook?',
            placeholder: 'This means the business is...',
          },
        ],
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
    title: 'Class Presentation: Balance by Design',
    unitNumber: 1,
    orderIndex: 10,
    description:
      "Present the finished Balance Snapshot workbook to the class, explain the business story, and respond to questions using the workbook as evidence.",
    learningObjectives: [
      'Present a public-ready Balance Snapshot package to the class',
      'Explain the business story behind the numbers using workbook evidence',
      'Respond to at least one audience or teacher question with specific evidence',
    ],
  },
  version: {
    id: IDS_L10.VERSION,
    title: 'Class Presentation: Balance by Design',
    description: 'Class presentation of the finished Unit 1 workbook with evidence-based explanation.',
    status: 'published',
  },
  standards: [] as { code: string; isPrimary: boolean }[],
  phases: [
    {
      id: IDS_L10.PHASE_1,
      phaseNumber: 1,
      title: 'Brief: Presentation Setup',
      estimatedMinutes: 10,
      sections: [
        text(`## Presentation Setup

Lesson 10 is the **public presentation** lesson. Review the expectations in \`unit_01_presentation_rubric.pdf\` before anyone speaks.

Teams should confirm:
- who will speak first
- who will control the workbook on screen
- how the chart will be used as evidence instead of decoration
- who will handle the first audience question

The goal is not only to show the file. The goal is to explain the business story clearly.`),
      ],
    },
    {
      id: IDS_L10.PHASE_2,
      phaseNumber: 2,
      title: 'Workshop: Final Preparation',
      estimatedMinutes: 15,
      sections: [
        text(`## Final Preparation

Take a short final prep window to open the workbook, review the script, and check that the presentation-ready file is visible and readable.

Before the class presentation begins, make sure:
- the workbook is open to the final Balance Snapshot
- the chart labels can be read from the audience
- the script references specific workbook details
- the team can answer at least one audience or teacher question`),
      ],
    },
    {
      id: IDS_L10.PHASE_3,
      phaseNumber: 3,
      title: 'Checkpoint: Class Presentation',
      estimatedMinutes: 15,
      sections: [
        text(`## Class Presentation

Each group now gives its **public presentation**. Show the finished workbook, explain what the business owns, owes, and retains, and use the chart and totals as evidence.

Every group must answer at least one **audience or teacher question** using the workbook as evidence. Complete the required presentation reflection below immediately after speaking so the team captures what landed and what still needs work.`),
        activity(IDS_L10.ACTIVITY_REFLECTION, true),
      ],
    },
    {
      id: IDS_L10.PHASE_4,
      phaseNumber: 4,
      title: 'Reflection: Audience Feedback + Reflection',
      estimatedMinutes: 10,
      sections: [
        text(`## Audience Feedback + Reflection

After every presentation, the audience records one strength and one question. Presenters then note:

- which evidence was strongest
- which question was hardest to answer
- what they would improve if they presented again

This reflection closes the project sequence and prepares students to articulate the same ideas independently in Lesson 11.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS_L10.ACTIVITY_REFLECTION,
      componentKey: 'reflection-journal',
      displayName: 'Presentation Debrief',
      description: 'Capture audience feedback and the team reflection after the class presentation.',
      props: {
        unitTitle: 'Class Presentation Debrief',
        description: 'Record what the audience understood, what they questioned, and what the team would improve next time.',
        prompts: [
          {
            id: 'p1',
            category: 'courage',
            prompt: 'Which part of the public presentation landed best with the audience?',
            placeholder: 'The clearest part of our presentation was...',
          },
          {
            id: 'p2',
            category: 'adaptability',
            prompt: 'What question or challenge exposed the biggest gap in the presentation?',
            placeholder: 'The toughest audience question was...',
          },
          {
            id: 'p3',
            category: 'persistence',
            prompt: 'What would you change before presenting this workbook again?',
            placeholder: 'Before presenting again, we would...',
          },
        ],
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
