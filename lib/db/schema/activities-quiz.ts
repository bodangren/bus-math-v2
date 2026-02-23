import { z } from 'zod';

const parameterDefSchema = z
  .object({
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
  })
  .refine((parameter) => parameter.max >= parameter.min, {
    message: 'max must be greater than or equal to min',
  });

const problemTemplateSchema = z.object({
  parameters: z.record(z.string(), parameterDefSchema),
  answerFormula: z.string().min(1),
  questionTemplate: z.string().min(1),
  tolerance: z.number().nonnegative().optional(),
  cellExpectations: z
    .array(
      z.object({
        cellRef: z.string().regex(/^[A-Z]+[0-9]+$/),
        expectedFormula: z.string().min(1),
        tolerance: z.number().nonnegative().optional(),
      }),
    )
    .optional(),
});

const blankSentenceSchema = z.object({
  id: z.string(),
  text: z.string(),
  answer: z.string(),
  hint: z.string().optional(),
  alternativeAnswers: z.array(z.string()).optional(),
  category: z.string().optional(),
});

const journalEntryLineSchema = z
  .object({
    account: z.string(),
    debit: z.number().min(0).default(0),
    credit: z.number().min(0).default(0),
  })
  .refine((entry) => !(entry.debit > 0 && entry.credit > 0), {
    message: 'Debit and credit cannot both be greater than zero',
  });

const journalScenarioSchema = z.object({
  id: z.string(),
  description: z.string(),
  correctEntry: z.array(journalEntryLineSchema).min(2),
  explanation: z.string(),
});

const reflectionPromptSchema = z.object({
  id: z.string(),
  category: z.enum(['courage', 'adaptability', 'persistence']).default('courage'),
  prompt: z.string(),
  placeholder: z.string().optional(),
});

const peerCritiqueCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  prompt: z.string(),
  placeholder: z.string().optional(),
  ratingLabel: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum([
    'multiple-choice',
    'true-false',
    'short-answer',
    'matching',
    'fill-in-the-blank',
    'numeric-entry',
    'categorization',
    'equation-solver',
  ]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.number()),
  ]),
  explanation: z.string().optional(),
  tier: z.enum(['knowledge', 'understanding', 'application']).optional(),
  standardCode: z.string().optional(),
  problemTemplate: problemTemplateSchema.optional(),
});

const applicationProblemSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  standardCode: z.string(),
  problemTemplate: problemTemplateSchema,
  rubricCriteria: z.array(z.string()).optional(),
});

const baseAssessmentSchema = z.object({
  title: z.string().default('Comprehension Check'),
  description: z.string().default('Test your understanding of the lesson.'),
  showExplanations: z.boolean().default(true),
  allowRetry: z.boolean().default(true),
  maxAttempts: z.number().int().positive().optional(),
  problemTemplate: problemTemplateSchema.optional(),
  questions: z.array(questionSchema).min(1),
  applicationProblems: z.array(applicationProblemSchema).optional(),
});

export const quizActivityPropsSchemas = {
  'comprehension-quiz': baseAssessmentSchema,
  'tiered-assessment': baseAssessmentSchema.extend({
    tier: z.enum(['knowledge', 'understanding', 'application']),
  }),
  'fill-in-the-blank': z.object({
    title: z.string(),
    description: z.string(),
    sentences: z.array(blankSentenceSchema).min(1),
    showWordList: z.boolean().default(true),
    randomizeWordOrder: z.boolean().default(true),
    showHints: z.boolean().default(false),
  }),
  'journal-entry-building': z.object({
    title: z.string().default('Journal Entry Builder'),
    description: z.string().default('Practice building balanced journal entries.'),
    availableAccounts: z.array(z.string()).default([]),
    scenarios: z.array(journalScenarioSchema).min(1),
    showInstructionsDefaultOpen: z.boolean().default(false),
  }),
  'reflection-journal': z.object({
    unitTitle: z.string().default('Learning Reflection'),
    description: z.string().optional(),
    prompts: z.array(reflectionPromptSchema).min(1),
  }),
  'peer-critique-form': z.object({
    projectTitle: z.string().default('Project Presentation'),
    peerName: z.string().default('Peer'),
    unitNumber: z.number().int().positive().optional(),
    reviewerNameLabel: z.string().optional(),
    categories: z.array(peerCritiqueCategorySchema).min(1),
    overallPrompt: z.string().optional(),
  }),
} as const;
