import { PracticeTestQuestion, PracticeTestLesson, PracticeTestPhaseContent, PracticeTestMessaging, PracticeTestUnitConfig } from './types';

function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function filterQuestionsByLessonIds(questions: PracticeTestQuestion[], lessonIds: string[]): PracticeTestQuestion[] {
  return questions.filter(q => lessonIds.includes(q.lessonId));
}

export function drawRandomQuestions(questions: PracticeTestQuestion[], count: number): PracticeTestQuestion[] {
  const clampedCount = Math.max(0, Math.min(count, questions.length));
  const shuffled = fisherYatesShuffle(questions);
  return shuffled.slice(0, clampedCount);
}

export function shuffleAnswers(question: PracticeTestQuestion): { answer: string; options: string[] } {
  const allAnswers = [question.correctAnswer, ...question.distractors];
  const shuffled = fisherYatesShuffle(allAnswers);
  return {
    answer: question.correctAnswer,
    options: shuffled,
  };
}

const UNIT1_QUESTIONS: PracticeTestQuestion[] = [
  {
    id: 'unit1-question-1',
    lessonId: 'unit1-lesson1',
    lessonTitle: 'The Accounting Equation',
    prompt: 'What is the fundamental accounting equation?',
    correctAnswer: 'Assets = Liabilities + Equity',
    distractors: [
      'Assets = Liabilities - Equity',
      'Assets + Liabilities = Equity',
      'Assets = Revenue - Expenses',
    ],
    explanation: 'The accounting equation states that a company\'s assets must equal the sum of its liabilities and equity.',
    objectiveTags: ['accounting-equation', 'foundations'],
  },
  {
    id: 'unit1-question-2',
    lessonId: 'unit1-lesson1',
    lessonTitle: 'The Accounting Equation',
    prompt: 'Which of the following is an example of an asset?',
    correctAnswer: 'Cash',
    distractors: [
      'Accounts Payable',
      'Loan Payable',
      'Owner\'s Draw',
    ],
    explanation: 'Cash is a resource owned by the business that has future economic value, making it an asset.',
    objectiveTags: ['assets', 'foundations'],
  },
  {
    id: 'unit1-question-3',
    lessonId: 'unit1-lesson2',
    lessonTitle: 'Transactions and Their Effects',
    prompt: 'If a company receives $10,000 cash from an owner as an investment, how does this affect the accounting equation?',
    correctAnswer: 'Assets increase by $10,000 and Equity increases by $10,000',
    distractors: [
      'Assets increase by $10,000 and Liabilities increase by $10,000',
      'Liabilities increase by $10,000 and Equity increases by $10,000',
      'Assets decrease by $10,000 and Equity decreases by $10,000',
    ],
    explanation: 'Receiving cash increases assets, and the owner\'s investment increases equity.',
    objectiveTags: ['transactions', 'accounting-equation'],
  },
];

const UNIT1_LESSONS: PracticeTestLesson[] = [
  { id: 'unit1-lesson1', title: 'The Accounting Equation' },
  { id: 'unit1-lesson2', title: 'Transactions and Their Effects' },
  { id: 'unit1-lesson3', title: 'The Balance Sheet' },
];

const UNIT1_PHASE_CONTENT: PracticeTestPhaseContent = {
  hook: 'Welcome to your Unit 1 Practice Test! Let\'s see how well you understand the foundations of accounting.',
  introduction: 'In this practice test, you\'ll review the accounting equation, transactions, and financial statements.',
  guidedPractice: 'Take your time and read each question carefully. Remember to apply what you\'ve learned in the lessons.',
  independentPractice: 'You\'re ready! Let\'s begin the practice test.',
  closing: 'Great job! Reflect on what you did well and what you want to improve.',
};

const UNIT1_MESSAGING: PracticeTestMessaging = {
  calloutTitle: 'Unit 1 Practice Test',
  calloutDescription: 'Test your knowledge of accounting foundations with this practice test.',
  calloutCta: 'Start Practice Test',
};

export const UNIT1_CONFIG: PracticeTestUnitConfig = {
  unitNumber: 1,
  lessons: UNIT1_LESSONS,
  questions: UNIT1_QUESTIONS,
  phaseContent: UNIT1_PHASE_CONTENT,
  messaging: UNIT1_MESSAGING,
};

export const getUnitConfig = (unitNumber: number): PracticeTestUnitConfig | undefined => {
  switch (unitNumber) {
    case 1:
      return UNIT1_CONFIG;
    default:
      return undefined;
  }
};
