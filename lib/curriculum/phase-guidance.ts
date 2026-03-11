import { getLessonTypeFromOrderIndex, type LessonType } from '@/lib/curriculum/types';

export interface PhaseGuidance {
  lessonType: LessonType;
  phaseNumber: number;
  phaseLabel: string;
  goal: string;
  successCriteria: string[];
}

const PHASE_GUIDANCE_BY_TYPE: Record<LessonType, Record<number, Omit<PhaseGuidance, 'lessonType' | 'phaseNumber'>>> = {
  accounting: {
    1: {
      phaseLabel: 'Hook',
      goal: 'Open with a business decision tension in Sarah Chen’s story.',
      successCriteria: [
        'Explain why the accounting decision matters to the business.',
        'Identify the main tension you will solve in this lesson.',
      ],
    },
    2: {
      phaseLabel: 'Concept Intro',
      goal: 'Teach the concept with explicit A/L/E reasoning.',
      successCriteria: [
        'Use assets, liabilities, and equity language accurately.',
        'Name what success looks like in the guided and independent phases.',
      ],
    },
    3: {
      phaseLabel: 'Guided Practice',
      goal: 'Practice the accounting move with teacher-led interactive support.',
      successCriteria: [
        'Complete the interactive practice task, not just the reading.',
        'Explain why each accounting move is correct before moving on.',
      ],
    },
    4: {
      phaseLabel: 'Independent Practice',
      goal: 'Complete a graded accounting task independently.',
      successCriteria: [
        'Submit a fully completed task without teacher intervention.',
        'Meet the passing-score target of at least 60%.',
      ],
    },
    5: {
      phaseLabel: 'Assessment',
      goal: 'Verify mastery of the lesson objective with an exit ticket.',
      successCriteria: [
        'Answer the auto-graded check independently.',
        'Show that the lesson objective can be applied correctly.',
      ],
    },
    6: {
      phaseLabel: 'Reflection',
      goal: 'Connect accounting accuracy to business trust and decision quality.',
      successCriteria: [
        'Describe how accuracy changes business decisions.',
        'Reflect on one habit that improves financial reliability.',
      ],
    },
  },
  excel: {
    1: {
      phaseLabel: 'Hook',
      goal: 'Frame the spreadsheet problem that needs to be solved.',
      successCriteria: [
        'Identify the spreadsheet problem in business terms.',
        'Recognize what a successful workbook should accomplish.',
      ],
    },
    2: {
      phaseLabel: 'Intro',
      goal: 'Demonstrate the Excel workflow and quality criteria.',
      successCriteria: [
        'Name the workflow steps before practice begins.',
        'Describe the quality checks that keep the workbook reliable.',
      ],
    },
    3: {
      phaseLabel: 'Guided Practice',
      goal: 'Build the spreadsheet skill with live teacher facilitation.',
      successCriteria: [
        'Use the interactive practice component while following the workflow.',
        'Explain which formula, formatting, or validation move you just applied.',
      ],
    },
    4: {
      phaseLabel: 'Independent Practice',
      goal: 'Complete real spreadsheet work and prepare a teacher submission.',
      successCriteria: [
        'Produce the required workbook, screenshot, or PDF evidence.',
        'Make sure the deliverable is ready for teacher review.',
      ],
    },
    5: {
      phaseLabel: 'Checkpoint Assessment',
      goal: 'Complete an auto-graded checkpoint on your own.',
      successCriteria: [
        'Submit the checkpoint independently.',
        'Meet the passing-score target of at least 80%.',
      ],
    },
    6: {
      phaseLabel: 'Reflection',
      goal: 'Explain how spreadsheet discipline affects business decisions.',
      successCriteria: [
        'Describe one quality-control habit from the lesson.',
        'Connect spreadsheet accuracy to business impact.',
      ],
    },
  },
  project: {
    1: {
      phaseLabel: 'Project Build',
      goal: 'Advance the project deliverable through scaffolded team work.',
      successCriteria: [
        'Complete the assigned team deliverable for today’s project phase.',
        'Use the project criteria to judge whether the work is presentation-ready.',
      ],
    },
  },
  assessment: {
    1: {
      phaseLabel: 'Instructions',
      goal: 'Review the directions, expectations, and assessment setup.',
      successCriteria: [
        'Understand the assessment rules before starting.',
        'Know how the assessment is divided across the upcoming sections.',
      ],
    },
    2: {
      phaseLabel: 'Knowledge',
      goal: 'Demonstrate foundational knowledge without support.',
      successCriteria: [
        'Answer the knowledge questions independently.',
        'Meet the minimum assessment performance target.',
      ],
    },
    3: {
      phaseLabel: 'Understanding',
      goal: 'Show conceptual understanding of the business math ideas.',
      successCriteria: [
        'Explain or apply the concept correctly in the assessment task.',
        'Meet the minimum assessment performance target.',
      ],
    },
    4: {
      phaseLabel: 'Application',
      goal: 'Apply the concept in a realistic business scenario.',
      successCriteria: [
        'Use the concept accurately in the scenario-based task.',
        'Meet the minimum assessment performance target.',
      ],
    },
  },
};

export function getPhaseGuidance(
  lessonType: LessonType,
  phaseNumber: number,
): PhaseGuidance | null {
  const guidance = PHASE_GUIDANCE_BY_TYPE[lessonType][phaseNumber];
  if (!guidance) {
    return null;
  }

  return {
    lessonType,
    phaseNumber,
    ...guidance,
  };
}

export function getLessonPhaseGuidance(
  orderIndex: number,
  phaseNumber: number,
): PhaseGuidance | null {
  return getPhaseGuidance(getLessonTypeFromOrderIndex(orderIndex), phaseNumber);
}
