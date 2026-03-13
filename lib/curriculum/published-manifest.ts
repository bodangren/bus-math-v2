import { resolveActivityComponentKey } from '../activities/component-keys';
import { activityPropsSchemas } from '../db/schema/activities-core';
import type { LessonMetadata, UnitContent } from '../../types/curriculum';
import { AUTHORED_UNIT_1_LESSONS } from './generated/unit1-authored';
import {
  WAVE1_AUTHORED_BLUEPRINTS,
  type Wave1AuthoredLessonBlueprint,
} from './generated/wave1-authored';

export type PublishedLessonType =
  | 'core_instruction'
  | 'project_sprint'
  | 'summative_mastery'
  | 'capstone';

export type PublishedPhaseKey =
  | 'hook'
  | 'instruction'
  | 'guided_practice'
  | 'independent_practice'
  | 'assessment'
  | 'reflection'
  | 'brief'
  | 'workshop'
  | 'checkpoint'
  | 'directions'
  | 'review';

export type PublishedSection = {
  sectionType: 'text' | 'callout' | 'activity' | 'video' | 'image';
  content: Record<string, unknown>;
};

export type PublishedPhase = {
  phaseNumber: number;
  phaseKey: PublishedPhaseKey;
  title: string;
  estimatedMinutes: number;
  sections: PublishedSection[];
};

export type PublishedActivity = {
  key: string;
  componentKey: string;
  displayName: string;
  description?: string;
  props: Record<string, unknown>;
  gradingConfig?: Record<string, unknown>;
};

export type PublishedCurriculumLesson = {
  unitNumber: number;
  unitTitle: string;
  orderIndex: number;
  lessonNumber: number;
  title: string;
  slug: string;
  description: string;
  learningObjectives: string[];
  lessonType: PublishedLessonType;
  source: 'authored' | 'generated';
  standards: Array<{ code: string; isPrimary: boolean }>;
  version: {
    version: number;
    title: string;
    description: string;
    status: 'published';
  };
  metadata: LessonMetadata;
  activities: PublishedActivity[];
  phases: PublishedPhase[];
};

export type PublishedCurriculumManifest = {
  instructionalUnitCount: number;
  capstoneLessonCount: number;
  lessons: PublishedCurriculumLesson[];
};

type UnitPlan = {
  unitNumber: number;
  title: string;
  summary: string;
  drivingQuestion: string;
  context: string;
  scenario: string;
  projectDeliverable: string;
  unitObjectives: string[];
  skillObjectives: string[];
  lessonTitles: string[];
};

const UNIT_PLANS: UnitPlan[] = [
  {
    unitNumber: 1,
    title: 'Balance by Design',
    summary: 'Build accounting equation fluency and create a reliable balance snapshot for TechStart.',
    drivingQuestion: 'How do disciplined classifications and balance checks turn messy transactions into trustworthy decisions?',
    context: 'Students launch the course by organizing TechStart into the accounting equation and building a balanced snapshot.',
    scenario: 'Sarah Chen needs books she can trust before TechStart grows any further.',
    projectDeliverable: 'A polished Balance Snapshot workbook and presentation.',
    unitObjectives: [
      'Classify business accounts and transaction effects accurately.',
      'Explain how the accounting equation keeps every business record in balance.',
      'Use spreadsheet checks to catch and correct ledger errors.',
    ],
    skillObjectives: [
      'Format structured worksheets.',
      'Apply data validation rules.',
      'Present balance-sheet evidence clearly.',
    ],
    lessonTitles: [
      'Launch Unit: A = L + E',
      'Classify Accounts: A, L, and E',
      'Apply A/L/E to Business Events',
      'Build the Balance Sheet',
      'Detect and Fix Ledger Errors',
      'Data Validation and Integrity',
      'Balance Snapshot with Visual',
      'Group Project Day 1: Refine the Ledger',
      'Group Project Day 2: Polish the Visuals',
      'Group Project Day 3: Final Polish and Submit',
      'Individual Assessment: Balance by Design',
    ],
  },
  {
    unitNumber: 2,
    title: 'Flow of Transactions',
    summary: 'Trace transactions from source documents to journals, ledgers, and the trial balance.',
    drivingQuestion: 'How does a raw business event become a trustworthy accounting trail?',
    context: 'Students follow TechStart transactions through the accounting cycle and prepare a clean trial balance.',
    scenario: 'TechStart is handling more customer and vendor activity, so every transaction needs a dependable trail.',
    projectDeliverable: 'A transaction-flow workbook with journal, ledger, and trial-balance outputs.',
    unitObjectives: [
      'Explain the relationship between source documents, journals, ledgers, and the trial balance.',
      'Record transactions with balanced debits and credits.',
      'Diagnose and correct transaction-flow errors before reporting.',
    ],
    skillObjectives: [
      'Structure transaction logs.',
      'Use formulas for running balances.',
      'Audit posting completeness.',
    ],
    lessonTitles: [
      'Launch the Transaction Trail',
      'Read Source Documents with Precision',
      'Journalize Business Events',
      'Post to the General Ledger',
      'Run a Clean Trial Balance',
      'Catch Posting Breaks Fast',
      'Explain the Transaction Story',
      'Project Sprint Day 1: Map the Workflow',
      'Project Sprint Day 2: Build the Workbook',
      'Project Sprint Day 3: Present the Audit Trail',
      'Summative: Transaction Flow Mastery',
    ],
  },
  {
    unitNumber: 3,
    title: 'Statements in Balance',
    summary: 'Translate ledger evidence into coordinated financial statements and business recommendations.',
    drivingQuestion: 'How do financial statements turn accounting data into a story leaders can act on?',
    context: 'Students connect income statement, balance sheet, and cash flow evidence into a coherent reporting package.',
    scenario: 'TechStart needs reports that show both performance and financial position to outside stakeholders.',
    projectDeliverable: 'A three-statement reporting workbook with an executive summary.',
    unitObjectives: [
      'Build and interpret income statement, balance sheet, and cash flow sections.',
      'Explain how financial statements connect to one another.',
      'Support decisions with statement-based evidence.',
    ],
    skillObjectives: [
      'Link worksheets across tabs.',
      'Check statement consistency.',
      'Summarize financial signals clearly.',
    ],
    lessonTitles: [
      'Launch the Reporting Story',
      'Build the Income Statement',
      'Connect Net Income to Equity',
      'Build the Cash Flow View',
      'Cross-Check Statement Links',
      'Repair Statement Drift',
      'Present the Financial Story',
      'Project Sprint Day 1: Frame the Package',
      'Project Sprint Day 2: Build the Statement Deck',
      'Project Sprint Day 3: Present the Findings',
      'Summative: Financial Statements Mastery',
    ],
  },
  {
    unitNumber: 4,
    title: 'Payroll in Motion',
    summary: 'Model payroll operations, deductions, and employer costs with accurate workflows and controls.',
    drivingQuestion: 'How do payroll calculations protect both employees and the business?',
    context: 'Students model gross-to-net pay, employer obligations, and payroll reporting routines.',
    scenario: 'TechStart is hiring staff and needs a payroll process that is accurate, explainable, and auditable.',
    projectDeliverable: 'A payroll operations workbook with controls and reporting notes.',
    unitObjectives: [
      'Calculate gross pay, deductions, and net pay accurately.',
      'Explain employer payroll obligations and timing.',
      'Use payroll evidence to spot process risks.',
    ],
    skillObjectives: [
      'Use spreadsheet formulas for pay calculations.',
      'Apply validation rules for payroll inputs.',
      'Document payroll controls.',
    ],
    lessonTitles: [
      'Launch the Payroll Workflow',
      'Calculate Gross Pay',
      'Model Mandatory Deductions',
      'Calculate Net Pay',
      'Track Employer Payroll Costs',
      'Validate Payroll Accuracy',
      'Explain the Payroll Story',
      'Project Sprint Day 1: Scope the Payroll Run',
      'Project Sprint Day 2: Build the Payroll Workbook',
      'Project Sprint Day 3: Present the Controls',
      'Summative: Payroll Operations Mastery',
    ],
  },
  {
    unitNumber: 5,
    title: 'Assets That Age',
    summary: 'Track long-lived assets, depreciation methods, and replacement decisions with business logic.',
    drivingQuestion: 'How should a business measure the cost of assets that create value over time?',
    context: 'Students compare depreciation methods and evaluate asset decisions using operational evidence.',
    scenario: 'TechStart is replacing equipment and needs an asset plan that matches how the business actually uses it.',
    projectDeliverable: 'An asset lifecycle model with depreciation and replacement recommendations.',
    unitObjectives: [
      'Describe how long-lived assets affect business planning.',
      'Apply multiple depreciation methods accurately.',
      'Recommend asset decisions using quantitative evidence.',
    ],
    skillObjectives: [
      'Build depreciation schedules.',
      'Compare scenarios with formulas.',
      'Explain tradeoffs in plain language.',
    ],
    lessonTitles: [
      'Launch the Asset Lifecycle',
      'Record Asset Acquisitions',
      'Straight-Line Depreciation',
      'Units-of-Production Depreciation',
      'Declining-Balance Comparisons',
      'Validate Asset Schedules',
      'Explain Asset Tradeoffs',
      'Project Sprint Day 1: Scope the Asset Model',
      'Project Sprint Day 2: Build the Lifecycle Workbook',
      'Project Sprint Day 3: Present the Recommendation',
      'Summative: Asset Accounting Mastery',
    ],
  },
  {
    unitNumber: 6,
    title: 'Inventory and Project Costing Intelligence',
    summary: 'Model inventory flows and project costs to support pricing, margin, and planning decisions.',
    drivingQuestion: 'How do cost systems change the way a business prices work and protects margin?',
    context: 'Students use inventory and project-cost data to explain operational performance and profitability.',
    scenario: 'TechStart is mixing product sales with service projects, so cost accuracy now shapes every pricing decision.',
    projectDeliverable: 'A cost intelligence workbook that compares inventory and project-cost outcomes.',
    unitObjectives: [
      'Track inventory and project costs with consistent logic.',
      'Explain how cost flows affect margin and pricing.',
      'Recommend operational actions using cost evidence.',
    ],
    skillObjectives: [
      'Organize cost data cleanly.',
      'Model costing scenarios.',
      'Communicate profitability drivers.',
    ],
    lessonTitles: [
      'Launch Cost Intelligence',
      'Track Inventory Flow',
      'Choose a Costing Method',
      'Assign Project Costs',
      'Analyze Margin Signals',
      'Validate Cost Models',
      'Explain Pricing Implications',
      'Project Sprint Day 1: Scope the Cost Study',
      'Project Sprint Day 2: Build the Cost Workbook',
      'Project Sprint Day 3: Present the Margin Story',
      'Summative: Costing Mastery',
    ],
  },
  {
    unitNumber: 7,
    title: 'Financing the Future',
    summary: 'Compare financing options, risk, and growth scenarios with disciplined modeling.',
    drivingQuestion: 'How should a business choose financing that supports growth without creating avoidable risk?',
    context: 'Students compare borrowing, investment, and capital planning options using realistic business cases.',
    scenario: 'TechStart needs to fund expansion and must justify how each financing path affects risk and control.',
    projectDeliverable: 'A financing scenario deck with recommendation logic and model evidence.',
    unitObjectives: [
      'Compare major financing options using business criteria.',
      'Explain how financing choices affect cost, control, and risk.',
      'Recommend a financing path supported by quantitative evidence.',
    ],
    skillObjectives: [
      'Model financing scenarios.',
      'Summarize risk clearly.',
      'Present investment logic persuasively.',
    ],
    lessonTitles: [
      'Launch the Financing Decision',
      'Compare Debt and Equity',
      'Model Interest and Payment Schedules',
      'Estimate Return Expectations',
      'Analyze Financing Risk',
      'Validate Scenario Assumptions',
      'Explain the Capital Story',
      'Project Sprint Day 1: Scope the Funding Case',
      'Project Sprint Day 2: Build the Financing Model',
      'Project Sprint Day 3: Present the Recommendation',
      'Summative: Financing Mastery',
    ],
  },
  {
    unitNumber: 8,
    title: 'Integrated Model Sprint',
    summary: 'Combine the full course toolkit into one integrated business model and executive narrative.',
    drivingQuestion: 'What does it take to turn accounting, modeling, and decision-making into one integrated business case?',
    context: 'Students synthesize prior units into a full-model sprint that prepares them for the capstone.',
    scenario: 'TechStart is preparing for a major decision and needs one integrated model instead of isolated spreadsheets.',
    projectDeliverable: 'An integrated model sprint workbook and presentation package.',
    unitObjectives: [
      'Integrate accounting, operations, and financing evidence into one model.',
      'Explain the strongest and weakest assumptions in the model.',
      'Prepare a final recommendation that is ready for capstone expansion.',
    ],
    skillObjectives: [
      'Link multi-tab models.',
      'Stress-test assumptions.',
      'Summarize executive decisions.',
    ],
    lessonTitles: [
      'Launch the Integrated Sprint',
      'Review the Full Business Model',
      'Stress-Test Assumptions',
      'Refine Operating Scenarios',
      'Align Statements and Cash',
      'Validate the Full Workbook',
      'Explain the Recommendation',
      'Project Sprint Day 1: Scope the Integrated Build',
      'Project Sprint Day 2: Build the Model Deck',
      'Project Sprint Day 3: Present the Executive Story',
      'Summative: Integrated Model Mastery',
    ],
  },
];

const CAPSTONE_PLAN = {
  unitNumber: 9,
  title: 'Capstone: Investor-Ready Plan',
  summary: 'Turn the course portfolio into an investor-ready plan with linked workbook evidence and a final pitch.',
  drivingQuestion: 'How do you defend one integrated business plan with evidence, clarity, and credibility?',
  context: 'Students combine the strongest artifacts from the course into an investor-ready plan and presentation.',
  scenario: 'TechStart is preparing for a make-or-break investor conversation and needs one coherent business case.',
  projectDeliverable: 'An investor-ready workbook, plan, and presentation.',
  unitObjectives: [
    'Synthesize unit evidence into one investor-ready narrative.',
    'Defend financial and operational assumptions with confidence.',
    'Present a professional recommendation supported by linked workbook evidence.',
  ],
  skillObjectives: [
    'Curate evidence.',
    'Refine executive communication.',
    'Present a final business case under scrutiny.',
  ],
  lessonTitle: 'Capstone: Investor-Ready Plan',
};

const GENERATED_PHASE_SEQUENCES: Record<
  Exclude<PublishedLessonType, never>,
  readonly PublishedPhaseKey[]
> = {
  core_instruction: ['hook', 'instruction', 'guided_practice', 'independent_practice', 'assessment', 'reflection'],
  project_sprint: ['brief', 'workshop', 'checkpoint', 'reflection'],
  summative_mastery: ['directions', 'assessment', 'review'],
  capstone: ['brief', 'workshop', 'checkpoint', 'reflection'],
};

const GENERATED_PHASE_LABELS: Record<PublishedPhaseKey, string> = {
  hook: 'Hook',
  instruction: 'Instruction',
  guided_practice: 'Guided Practice',
  independent_practice: 'Independent Practice',
  assessment: 'Assessment',
  reflection: 'Reflection',
  brief: 'Brief',
  workshop: 'Workshop',
  checkpoint: 'Checkpoint',
  directions: 'Directions',
  review: 'Review',
};

const AUTHORED_WAVE1_UNIT_NUMBERS = new Set([2, 3, 4]);

function textSection(markdown: string): PublishedSection {
  return {
    sectionType: 'text',
    content: { markdown },
  };
}

function cleanAuthoringText(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calloutSection(content: string): PublishedSection {
  return {
    sectionType: 'callout',
    content: {
      variant: 'why-this-matters',
      content,
    },
  };
}

function normalizeSection(
  section: {
    sectionType: string;
    content: Record<string, unknown>;
  },
  activityKeyByLegacyId: Map<string, string>,
): PublishedSection {
  if (!['text', 'callout', 'activity', 'video', 'image'].includes(section.sectionType)) {
    throw new Error(`Unsupported published section type: ${section.sectionType}`);
  }

  const content = {
    ...section.content,
  };

  if (
    section.sectionType === 'activity' &&
    typeof content.activityId === 'string' &&
    activityKeyByLegacyId.has(content.activityId)
  ) {
    content.activityId = activityKeyByLegacyId.get(content.activityId) as string;
  }

  return {
    sectionType: section.sectionType as PublishedSection['sectionType'],
    content,
  };
}

function buildUnitContent(plan: {
  unitNumber: number;
  title: string;
  summary: string;
  drivingQuestion: string;
  context: string;
  scenario: string;
  projectDeliverable: string;
  unitObjectives: string[];
  skillObjectives: string[];
}, nextSectionHref?: string): UnitContent {
  return {
    drivingQuestion: {
      question: plan.drivingQuestion,
      context: plan.context,
      scenario: plan.scenario,
    },
    objectives: {
      content: plan.unitObjectives,
      skills: plan.skillObjectives,
      deliverables: [plan.projectDeliverable],
    },
    assessment: {
      performanceTask: {
        title: plan.projectDeliverable,
        description: plan.summary,
        requirements: [
          'Use evidence from the current unit.',
          'Explain the business rationale behind each recommendation.',
          'Prepare a polished artifact that is ready for teacher review.',
        ],
        context: plan.scenario,
      },
      milestones: [
        {
          id: `unit-${plan.unitNumber}-milestone-1`,
          day: 3,
          title: 'Draft the working model',
          description: 'Build the first complete version of the unit workbook.',
          criteria: ['Core calculations are in place', 'Evidence is organized clearly'],
        },
        {
          id: `unit-${plan.unitNumber}-milestone-2`,
          day: 7,
          title: 'Refine and verify',
          description: 'Check calculations, assumptions, and communication before presentation.',
          criteria: ['Logic is validated', 'Narrative is ready to present'],
        },
      ],
      rubric: [
        {
          name: 'Accuracy',
          weight: '40%',
          exemplary: 'Calculations and reasoning are consistently correct.',
          proficient: 'Minor errors do not change the overall conclusion.',
          developing: 'Errors weaken the credibility of the recommendation.',
        },
        {
          name: 'Communication',
          weight: '30%',
          exemplary: 'Evidence is organized and persuasive for the audience.',
          proficient: 'Reasoning is understandable with small gaps.',
          developing: 'The audience cannot easily follow the recommendation.',
        },
        {
          name: 'Professionalism',
          weight: '30%',
          exemplary: 'Workbook and narrative are polished and presentation-ready.',
          proficient: 'Most artifacts are complete and usable.',
          developing: 'Artifacts need major revision before use.',
        },
      ],
    },
    learningSequence: {
      weeks: [
        {
          weekNumber: 1,
          title: 'Launch and build',
          description: `Introduce ${plan.title} and build the first working model.`,
          days: [
            {
              day: 1,
              focus: 'Launch the unit challenge',
              activities: ['Preview the business scenario', 'Identify the success criteria'],
              resources: ['Unit brief'],
            },
            {
              day: 2,
              focus: 'Build the core model',
              activities: ['Complete guided calculations', 'Check early assumptions'],
              resources: ['Model template'],
            },
          ],
        },
        {
          weekNumber: 2,
          title: 'Refine and present',
          description: 'Verify the model, prepare the recommendation, and present findings.',
          days: [
            {
              day: 3,
              focus: 'Validate and revise',
              activities: ['Review evidence', 'Refine the recommendation'],
              resources: ['Validation checklist'],
              milestone: 'Draft the working model',
            },
            {
              day: 4,
              focus: 'Present the case',
              activities: ['Finalize the workbook', 'Deliver the recommendation'],
              resources: ['Presentation guide'],
              milestone: 'Refine and verify',
            },
          ],
        },
      ],
    },
    prerequisites: {
      knowledge: ['Prior unit vocabulary', 'Foundational spreadsheet fluency'],
      technology: ['Spreadsheet software', 'Reliable browser access'],
      resources: [
        {
          title: `${plan.title} workbook`,
          type: 'download',
        },
      ],
    },
    differentiation: {
      struggling: ['Use the worked example before independent practice.', 'Annotate the model with plain-language notes.'],
      advanced: ['Stress-test one assumption and compare the result.', 'Prepare an alternate recommendation.'],
      ell: ['Preview the key terms before reading.', 'Use sentence frames for the final recommendation.'],
    },
    introduction: {
      unitNumber: `Unit ${plan.unitNumber}`,
      unitTitle: plan.title,
      drivingQuestion: plan.drivingQuestion,
      entryEvent: {
        title: `${plan.title} launch`,
        description: plan.context,
        activities: ['Read the scenario', 'Identify the core business problem'],
        resources: ['Launch brief'],
      },
      projectOverview: {
        scenario: plan.scenario,
        teamStructure: 'Students collaborate in pairs or small teams before completing independent checks.',
        deliverable: plan.projectDeliverable,
        timeline: 'Two instructional weeks',
      },
      learningObjectives: {
        content: plan.unitObjectives,
        skills: plan.skillObjectives,
        deliverables: [plan.projectDeliverable],
      },
      nextSectionHref,
    },
  };
}

function buildMetadata(unitContent: UnitContent, tags: string[] = ['curriculum']): LessonMetadata {
  return {
    duration: 50,
    durationLabel: '1 class period',
    difficulty: 'intermediate',
    tags,
    unitContent,
  };
}

function toGeneratedSections(lesson: {
  unitTitle: string;
  title: string;
  description: string;
  learningObjectives: string[];
  phaseKey: PublishedPhaseKey;
}): PublishedSection[] {
  const objectiveLines = lesson.learningObjectives.map((objective) => `- ${objective}`).join('\n');
  return [
    textSection(
      `## ${lesson.title}\n\n${lesson.description}\n\n### Success criteria\n${objectiveLines}`,
    ),
    calloutSection(
      `${lesson.unitTitle} matters because students need to explain both the calculation and the business decision behind it.`,
    ),
  ];
}

function buildGeneratedLessonType(orderIndex: number): PublishedLessonType {
  if (orderIndex >= 1 && orderIndex <= 7) {
    return 'core_instruction';
  }
  if (orderIndex >= 8 && orderIndex <= 10) {
    return 'project_sprint';
  }
  return 'summative_mastery';
}

function buildGeneratedLesson(plan: UnitPlan, orderIndex: number): PublishedCurriculumLesson {
  const title = plan.lessonTitles[orderIndex - 1] ?? `${plan.title} Lesson ${orderIndex}`;
  const lessonType = buildGeneratedLessonType(orderIndex);
  const unitContent = buildUnitContent(plan, orderIndex < 11 ? `/student/lesson/unit-${plan.unitNumber}-lesson-${orderIndex + 1}` : undefined);
  const description =
    orderIndex <= 7
      ? `${plan.summary} Lesson ${orderIndex} focuses on ${title.toLowerCase()}.`
      : orderIndex <= 10
        ? `${title} turns ${plan.title.toLowerCase()} into a collaborative sprint milestone.`
        : `${title} checks whether students can apply ${plan.title.toLowerCase()} independently.`;
  const learningObjectives = [
    `Apply the core ideas from ${plan.title} in the context of ${title.toLowerCase()}.`,
    `Explain the business reasoning behind each step in ${title.toLowerCase()}.`,
    `Prepare evidence that supports the unit deliverable for ${plan.title}.`,
  ];

  const phases = GENERATED_PHASE_SEQUENCES[lessonType].map((phaseKey, index) => ({
    phaseNumber: index + 1,
    phaseKey,
    title: GENERATED_PHASE_LABELS[phaseKey],
    estimatedMinutes: lessonType === 'project_sprint' ? 12 : lessonType === 'summative_mastery' ? 15 : 8,
    sections: toGeneratedSections({
      unitTitle: plan.title,
      title,
      description,
      learningObjectives,
      phaseKey,
    }),
  }));

  return {
    unitNumber: plan.unitNumber,
    unitTitle: plan.title,
    orderIndex,
    lessonNumber: orderIndex,
    title,
    slug: `unit-${plan.unitNumber}-lesson-${orderIndex}`,
    description,
    learningObjectives,
    lessonType,
    source: 'generated',
    standards: [
      {
        code: `ACC-${plan.unitNumber}.${orderIndex}`,
        isPrimary: true,
      },
    ],
    version: {
      version: 1,
      title,
      description,
      status: 'published',
    },
    metadata: buildMetadata(unitContent),
    activities: [],
    phases,
  };
}

function buildWave1LessonDescription(
  plan: UnitPlan,
  blueprint: Wave1AuthoredLessonBlueprint,
): string {
  const objective = cleanAuthoringText(blueprint.objective);
  const accountingFocus = cleanAuthoringText(blueprint.accountingFocus).toLowerCase();
  const excelSkillFocus = cleanAuthoringText(blueprint.excelSkillFocus).toLowerCase();

  return `${objective}. Students use ${excelSkillFocus} to support ${accountingFocus} in ${plan.title}.`;
}

function buildWave1LearningObjectives(
  blueprint: Wave1AuthoredLessonBlueprint,
): string[] {
  return [
    cleanAuthoringText(blueprint.objective),
    `Use ${cleanAuthoringText(blueprint.excelSkillFocus)} accurately in context.`,
    `Produce ${cleanAuthoringText(blueprint.formativeProduct)} with clear business reasoning.`,
  ];
}

function buildWave1PhaseSections(
  plan: UnitPlan,
  title: string,
  description: string,
  blueprint: Wave1AuthoredLessonBlueprint,
  phaseKey: PublishedPhaseKey,
): PublishedSection[] {
  const objective = cleanAuthoringText(blueprint.objective);
  const accountingFocus = cleanAuthoringText(blueprint.accountingFocus);
  const excelSkillFocus = cleanAuthoringText(blueprint.excelSkillFocus);
  const formativeProduct = cleanAuthoringText(blueprint.formativeProduct);
  const launch = cleanAuthoringText(blueprint.launch);
  const miniLesson = cleanAuthoringText(blueprint.miniLesson);
  const guidedPractice = cleanAuthoringText(blueprint.guidedPractice);
  const independentWork = cleanAuthoringText(blueprint.independentWork);
  const reflection = cleanAuthoringText(blueprint.reflection);
  const checkpoint = cleanAuthoringText(blueprint.checkpoint);

  switch (phaseKey) {
    case 'hook':
      return [
        textSection(
          `## Launch the challenge\n\n${launch || plan.context}\n\n### Lesson objective\n- ${objective}\n\n### TechStart context\n${plan.scenario}`,
        ),
        calloutSection(
          `${plan.title} depends on ${accountingFocus.toLowerCase()}, so students should listen for the business decision hiding underneath the math.`,
        ),
      ];
    case 'instruction':
      return [
        textSection(
          `## Core idea\n\n${miniLesson || objective}\n\n### Accounting focus\n- ${accountingFocus}\n\n### Excel move\n- ${excelSkillFocus}`,
        ),
        textSection(
          `## What strong work looks like\n\nStudents should leave this phase ready to build ${formativeProduct.toLowerCase()} without losing sight of the unit deliverable.`,
        ),
      ];
    case 'guided_practice':
      return [
        textSection(
          `## Guided practice\n\n${guidedPractice || `Model the first round of ${title.toLowerCase()} together.`}\n\n### Current checkpoint\n${checkpoint}`,
        ),
        calloutSection(
          `Narrate the reasoning while students practice so the class sees how ${accountingFocus.toLowerCase()} and ${excelSkillFocus.toLowerCase()} reinforce each other.`,
        ),
      ];
    case 'independent_practice':
      return [
        textSection(
          `## Independent work\n\n${independentWork}\n\n### Deliverable connection\nThis work feeds ${plan.projectDeliverable}.`,
        ),
        textSection(
          `## Success criteria\n\n- ${objective}\n- Use ${excelSkillFocus.toLowerCase()} accurately\n- Keep the evidence anchored to ${accountingFocus.toLowerCase()}`,
        ),
      ];
    case 'assessment':
      return [
        textSection(
          `## Assessment checkpoint\n\n${checkpoint}\n\n### Artifact to submit\n${formativeProduct}`,
        ),
        textSection(
          `## What the teacher is looking for\n\nThe evidence should show accurate ${accountingFocus.toLowerCase()} and clear communication of the business meaning behind the numbers.`,
        ),
      ];
    case 'reflection':
      return [
        textSection(
          `## Reflection and transfer\n\n${reflection}\n\n### Why it matters\n${description}`,
        ),
        calloutSection(
          `Students should connect today's work back to ${plan.projectDeliverable} so the unit narrative keeps building from lesson to lesson.`,
        ),
      ];
    case 'brief':
      return [
        textSection(
          `## Sprint brief\n\n${objective}\n\n### Project milestone\n${checkpoint}\n\n### Team target\n${plan.projectDeliverable}`,
        ),
        calloutSection(
          `${plan.scenario} should remain visible while teams make decisions, revise evidence, and prepare the artifact for review.`,
        ),
      ];
    case 'workshop':
      return [
        textSection(
          `## Workshop time\n\n${independentWork}\n\n### Accounting focus\n- ${accountingFocus}\n\n### Excel focus\n- ${excelSkillFocus}`,
        ),
        textSection(
          `## Expected artifact\n\nTeams should advance ${formativeProduct.toLowerCase()} and document any revision choices before the checkpoint.`,
        ),
      ];
    case 'checkpoint':
      return [
        textSection(
          `## Checkpoint\n\n${checkpoint}\n\n### Evidence to review\n${formativeProduct}`,
        ),
        calloutSection(
          `Use peer and teacher feedback to tighten the logic before the next sprint day; revision quality matters as much as completion.`,
        ),
      ];
    case 'directions':
      return [
        textSection(
          `## Assessment directions\n\n${miniLesson || 'Complete the mastery task independently and show each step clearly.'}\n\n### Mastery target\n${objective}`,
        ),
        calloutSection(
          `Students should rely on the full unit workflow, not isolated memorization, when they complete the mastery check.`,
        ),
      ];
    case 'review':
      return [
        textSection(
          `## Review and next steps\n\n${reflection}\n\n### Artifact recap\n${formativeProduct}`,
        ),
        textSection(
          `## Looking ahead\n\nThis mastery check confirms readiness for the next unit while reinforcing the same published lesson contract used across the course.`,
        ),
      ];
    default:
      return toGeneratedSections({
        unitTitle: plan.title,
        title,
        description,
        learningObjectives: buildWave1LearningObjectives(blueprint),
        phaseKey,
      });
  }
}

function buildWave1AuthoredLesson(
  plan: UnitPlan,
  blueprint: Wave1AuthoredLessonBlueprint,
): PublishedCurriculumLesson {
  const title = plan.lessonTitles[blueprint.lessonNumber - 1] ?? `${plan.title} Lesson ${blueprint.lessonNumber}`;
  const lessonType = buildGeneratedLessonType(blueprint.lessonNumber);
  const description = buildWave1LessonDescription(plan, blueprint);
  const learningObjectives = buildWave1LearningObjectives(blueprint);
  const unitContent = buildUnitContent(
    plan,
    blueprint.lessonNumber < 11
      ? `/student/lesson/unit-${plan.unitNumber}-lesson-${blueprint.lessonNumber + 1}`
      : undefined,
  );

  return {
    unitNumber: plan.unitNumber,
    unitTitle: plan.title,
    orderIndex: blueprint.lessonNumber,
    lessonNumber: blueprint.lessonNumber,
    title,
    slug: `unit-${plan.unitNumber}-lesson-${blueprint.lessonNumber}`,
    description,
    learningObjectives,
    lessonType,
    source: 'authored',
    standards: [
      {
        code: `ACC-${plan.unitNumber}.${blueprint.lessonNumber}`,
        isPrimary: true,
      },
    ],
    version: {
      version: 1,
      title,
      description,
      status: 'published',
    },
    metadata: buildMetadata(unitContent),
    activities: [],
    phases: GENERATED_PHASE_SEQUENCES[lessonType].map((phaseKey, index) => ({
      phaseNumber: index + 1,
      phaseKey,
      title: GENERATED_PHASE_LABELS[phaseKey],
      estimatedMinutes: lessonType === 'project_sprint' ? 12 : lessonType === 'summative_mastery' ? 15 : 8,
      sections: buildWave1PhaseSections(plan, title, description, blueprint, phaseKey),
    })),
  };
}

function buildWave1AuthoredLessons(plan: UnitPlan): PublishedCurriculumLesson[] {
  const blueprints = WAVE1_AUTHORED_BLUEPRINTS[plan.unitNumber as keyof typeof WAVE1_AUTHORED_BLUEPRINTS];
  if (!blueprints || blueprints.length !== 11) {
    throw new Error(`Missing authored Wave 1 lesson blueprints for Unit ${plan.unitNumber}`);
  }

  return blueprints.map((blueprint) => buildWave1AuthoredLesson(plan, blueprint));
}

function buildCapstoneLesson(): PublishedCurriculumLesson {
  const unitContent = buildUnitContent(CAPSTONE_PLAN);
  const title = CAPSTONE_PLAN.lessonTitle;
  const description = CAPSTONE_PLAN.summary;

  return {
    unitNumber: CAPSTONE_PLAN.unitNumber,
    unitTitle: CAPSTONE_PLAN.title,
    orderIndex: 1,
    lessonNumber: 1,
    title,
    slug: 'capstone-investor-ready-plan',
    description,
    learningObjectives: [
      'Synthesize the strongest evidence from the course into one coherent plan.',
      'Defend the investor-ready recommendation with linked workbook proof.',
      'Deliver a final presentation that is clear, professional, and evidence-based.',
    ],
    lessonType: 'capstone',
    source: 'generated',
    standards: [],
    version: {
      version: 1,
      title,
      description,
      status: 'published',
    },
    metadata: buildMetadata(unitContent, ['curriculum', 'capstone']),
    activities: [],
    phases: GENERATED_PHASE_SEQUENCES.capstone.map((phaseKey, index) => ({
      phaseNumber: index + 1,
      phaseKey,
      title: GENERATED_PHASE_LABELS[phaseKey],
      estimatedMinutes: 15,
      sections: toGeneratedSections({
        unitTitle: CAPSTONE_PLAN.title,
        title,
        description,
        learningObjectives: [
          'Curate the strongest course evidence.',
          'Refine the investor narrative.',
          'Prepare the final presentation.',
        ],
        phaseKey,
      }),
    })),
  };
}

function sortLessons<T extends { unitNumber: number; orderIndex: number }>(lessons: T[]): T[] {
  return [...lessons].sort((a, b) => a.unitNumber - b.unitNumber || a.orderIndex - b.orderIndex);
}

function inferAuthoredLessonType(orderIndex: number): PublishedLessonType {
  if (orderIndex >= 1 && orderIndex <= 7) return 'core_instruction';
  if (orderIndex >= 8 && orderIndex <= 10) return 'project_sprint';
  return 'summative_mastery';
}

function inferLegacyPhaseKey(
  lessonType: PublishedLessonType,
  phaseNumber: number,
): PublishedPhaseKey {
  const sequence = GENERATED_PHASE_SEQUENCES[lessonType];
  return sequence[phaseNumber - 1] ?? sequence[sequence.length - 1] ?? 'reflection';
}

function buildAuthoredLessonMap(): Map<number, UnitPlan> {
  return new Map(UNIT_PLANS.map((plan) => [plan.unitNumber, plan]));
}

function normalizeAuthoredLesson(
  rawLesson: (typeof AUTHORED_UNIT_1_LESSONS)[number],
  plan: UnitPlan,
): PublishedCurriculumLesson {
  const lessonType = inferAuthoredLessonType(rawLesson.lesson.orderIndex);
  const activityKeyByLegacyId = new Map<string, string>();
  const unitContent = buildUnitContent(
    plan,
    rawLesson.lesson.orderIndex < 11
      ? `/student/lesson/unit-${plan.unitNumber}-lesson-${rawLesson.lesson.orderIndex + 1}`
      : undefined,
  );

  return {
    unitNumber: rawLesson.lesson.unitNumber,
    unitTitle: plan.title,
    orderIndex: rawLesson.lesson.orderIndex,
    lessonNumber: rawLesson.lesson.orderIndex,
    title: rawLesson.lesson.title,
    slug: rawLesson.lesson.slug,
    description: rawLesson.lesson.description,
    learningObjectives: [...rawLesson.lesson.learningObjectives],
    lessonType,
    source: 'authored',
    standards: rawLesson.standards.map((standard) => ({
      code: standard.code,
      isPrimary: standard.isPrimary,
    })),
    version: {
      version: 1,
      title: rawLesson.version.title,
      description: rawLesson.version.description,
      status: 'published',
    },
    metadata: buildMetadata(unitContent),
    activities: rawLesson.activities.map((activity, index) => {
      const key = `${rawLesson.lesson.slug}-activity-${index + 1}`;
      activityKeyByLegacyId.set(activity.id, key);

      return {
        key,
        componentKey: activity.componentKey,
        displayName: activity.displayName,
        description: activity.description ?? undefined,
        props: activity.props as Record<string, unknown>,
        gradingConfig: (activity.gradingConfig ?? undefined) as Record<string, unknown> | undefined,
      };
    }),
    phases: rawLesson.phases.map((phase) => ({
      phaseNumber: phase.phaseNumber,
      phaseKey: inferLegacyPhaseKey(lessonType, phase.phaseNumber),
      title: phase.title,
      estimatedMinutes: phase.estimatedMinutes,
      sections: phase.sections.map((section) =>
        normalizeSection(
          {
            sectionType: section.sectionType,
            content: section.content as Record<string, unknown>,
          },
          activityKeyByLegacyId,
        ),
      ),
    })),
  };
}

function getAllowedPhaseKeySequences(lesson: PublishedCurriculumLesson): PublishedPhaseKey[][] {
  return [[...GENERATED_PHASE_SEQUENCES[lesson.lessonType]]];
}

function matchesAllowedSequence(
  actual: PublishedPhaseKey[],
  allowed: PublishedPhaseKey[][],
): boolean {
  return allowed.some((sequence) => (
    sequence.length === actual.length &&
    sequence.every((key, index) => key === actual[index])
  ));
}

export function validatePublishedCurriculumLesson(lesson: PublishedCurriculumLesson): PublishedCurriculumLesson {
  const phaseSequence = lesson.phases
    .slice()
    .sort((a, b) => a.phaseNumber - b.phaseNumber)
    .map((phase) => phase.phaseKey);

  if (!matchesAllowedSequence(phaseSequence, getAllowedPhaseKeySequences(lesson))) {
    throw new Error(
      `Invalid phase sequence for ${lesson.slug}: ${phaseSequence.join(', ')}`,
    );
  }

  for (const activity of lesson.activities) {
    const canonicalComponentKey = resolveActivityComponentKey(activity.componentKey);
    if (!canonicalComponentKey) {
      throw new Error(`Unknown activity component: ${activity.componentKey}`);
    }

    const schema = activityPropsSchemas[canonicalComponentKey];
    if (!schema) {
      throw new Error(`Unknown activity component: ${activity.componentKey}`);
    }

    const result = schema.safeParse(activity.props);
    if (!result.success) {
      throw new Error(`Invalid activity props for ${activity.componentKey}`);
    }
  }

  return lesson;
}

export function buildPublishedCurriculumManifest(): PublishedCurriculumManifest {
  const authoredPlanByUnit = buildAuthoredLessonMap();
  const lessons: PublishedCurriculumLesson[] = [];

  for (const rawLesson of AUTHORED_UNIT_1_LESSONS) {
    const plan = authoredPlanByUnit.get(rawLesson.lesson.unitNumber);
    if (!plan) {
      throw new Error(`Missing unit plan for Unit ${rawLesson.lesson.unitNumber}`);
    }
    lessons.push(validatePublishedCurriculumLesson(normalizeAuthoredLesson(rawLesson, plan)));
  }

  for (const plan of UNIT_PLANS.filter((unit) => AUTHORED_WAVE1_UNIT_NUMBERS.has(unit.unitNumber))) {
    lessons.push(
      ...buildWave1AuthoredLessons(plan).map((lesson) => validatePublishedCurriculumLesson(lesson)),
    );
  }

  for (const plan of UNIT_PLANS.filter(
    (unit) => unit.unitNumber !== 1 && !AUTHORED_WAVE1_UNIT_NUMBERS.has(unit.unitNumber),
  )) {
    for (let orderIndex = 1; orderIndex <= 11; orderIndex += 1) {
      lessons.push(validatePublishedCurriculumLesson(buildGeneratedLesson(plan, orderIndex)));
    }
  }

  lessons.push(validatePublishedCurriculumLesson(buildCapstoneLesson()));

  return {
    instructionalUnitCount: UNIT_PLANS.length,
    capstoneLessonCount: 1,
    lessons: sortLessons(lessons),
  };
}

export function buildPublishedCurriculumSeedPlan() {
  return buildPublishedCurriculumManifest();
}
