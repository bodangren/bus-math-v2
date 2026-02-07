import { z } from 'zod';

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

export const quizActivityPropsSchemas = {
  'comprehension-quiz': z.object({
    title: z.string().default('Comprehension Check'),
    description: z.string().default('Test your understanding of the lesson.'),
    showExplanations: z.boolean().default(true),
    allowRetry: z.boolean().default(true),
    questions: z
      .array(
        z.object({
          id: z.string(),
          text: z.string(),
          type: z.enum(['multiple-choice', 'true-false', 'short-answer']),
          options: z.array(z.string()).optional(),
          correctAnswer: z.union([z.string(), z.array(z.string())]),
          explanation: z.string().optional(),
        }),
      )
      .min(1),
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
