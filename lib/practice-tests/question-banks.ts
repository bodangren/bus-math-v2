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

const UNIT2_LESSONS: PracticeTestLesson[] = [
  { id: 'unit2-lesson1', title: 'The Flow of Transactions' },
  { id: 'unit2-lesson2', title: 'Journal Entries' },
  { id: 'unit2-lesson3', title: 'Posting to Ledgers' },
];

const UNIT2_PHASE_CONTENT: PracticeTestPhaseContent = {
  hook: 'Welcome to your Unit 2 Practice Test! Let\'s review how transactions flow through the accounting system.',
  introduction: 'In this practice test, you\'ll review journal entries, posting, and the accounting cycle.',
  guidedPractice: 'Take your time and think through each transaction carefully.',
  independentPractice: 'You\'re ready! Let\'s begin the practice test.',
  closing: 'Great job! Reflect on how transactions move through the accounting system.',
};

const UNIT2_MESSAGING: PracticeTestMessaging = {
  calloutTitle: 'Unit 2 Practice Test',
  calloutDescription: 'Test your knowledge of transaction flow with this practice test.',
  calloutCta: 'Start Practice Test',
};

const UNIT2_QUESTIONS: PracticeTestQuestion[] = [
  {
    id: 'unit2-question-1',
    lessonId: 'unit2-lesson1',
    lessonTitle: 'The Flow of Transactions',
    prompt: 'What is the first step in the accounting cycle?',
    correctAnswer: 'Analyze transactions',
    distractors: [
      'Post to ledgers',
      'Prepare financial statements',
      'Close the books',
    ],
    explanation: 'The accounting cycle starts with analyzing transactions to determine their effects on accounts.',
    objectiveTags: ['accounting-cycle', 'transactions'],
  },
  {
    id: 'unit2-question-2',
    lessonId: 'unit2-lesson2',
    lessonTitle: 'Journal Entries',
    prompt: 'Which side of a T-account is used to record an increase in an asset account?',
    correctAnswer: 'Debit',
    distractors: [
      'Credit',
      'Left or right depending on the account',
      'Both sides',
    ],
    explanation: 'Assets are increased with debits and decreased with credits.',
    objectiveTags: ['journal-entries', 't-accounts', 'debits-credits'],
  },
  {
    id: 'unit2-question-3',
    lessonId: 'unit2-lesson3',
    lessonTitle: 'Posting to Ledgers',
    prompt: 'What is the process of transferring journal entry amounts to ledger accounts called?',
    correctAnswer: 'Posting',
    distractors: [
      'Journalizing',
      'Closing',
      'Adjusting',
    ],
    explanation: 'Posting is the process of transferring journal entry amounts to the appropriate ledger accounts.',
    objectiveTags: ['posting', 'ledgers', 'accounting-cycle'],
  },
];

export const UNIT2_CONFIG: PracticeTestUnitConfig = {
  unitNumber: 2,
  lessons: UNIT2_LESSONS,
  questions: UNIT2_QUESTIONS,
  phaseContent: UNIT2_PHASE_CONTENT,
  messaging: UNIT2_MESSAGING,
};

const UNIT3_LESSONS: PracticeTestLesson[] = [
  { id: 'unit3-lesson1', title: 'Financial Statements' },
  { id: 'unit3-lesson2', title: 'Income Statement' },
  { id: 'unit3-lesson3', title: 'Balance Sheet' },
];

const UNIT3_PHASE_CONTENT: PracticeTestPhaseContent = {
  hook: 'Welcome to your Unit 3 Practice Test! Let\'s review financial statements.',
  introduction: 'In this practice test, you\'ll review income statements, balance sheets, and their relationships.',
  guidedPractice: 'Remember the order of financial statements: income statement first, then balance sheet.',
  independentPractice: 'You\'re ready! Let\'s begin the practice test.',
  closing: 'Great job! Reflect on how financial statements connect.',
};

const UNIT3_MESSAGING: PracticeTestMessaging = {
  calloutTitle: 'Unit 3 Practice Test',
  calloutDescription: 'Test your knowledge of financial statements with this practice test.',
  calloutCta: 'Start Practice Test',
};

const UNIT3_QUESTIONS: PracticeTestQuestion[] = [
  {
    id: 'unit3-question-1',
    lessonId: 'unit3-lesson1',
    lessonTitle: 'Financial Statements',
    prompt: 'Which financial statement shows a company\'s profitability over a period of time?',
    correctAnswer: 'Income Statement',
    distractors: [
      'Balance Sheet',
      'Cash Flow Statement',
      'Statement of Retained Earnings',
    ],
    explanation: 'The income statement shows revenues and expenses over a period, calculating net income.',
    objectiveTags: ['financial-statements', 'income-statement'],
  },
  {
    id: 'unit3-question-2',
    lessonId: 'unit3-lesson2',
    lessonTitle: 'Income Statement',
    prompt: 'Which of the following is an example of an operating expense?',
    correctAnswer: 'Rent expense',
    distractors: [
      'Interest expense',
      'Loss on sale of equipment',
      'Income tax expense',
    ],
    explanation: 'Rent expense is a normal cost of doing business and classified as an operating expense.',
    objectiveTags: ['income-statement', 'operating-expenses'],
  },
  {
    id: 'unit3-question-3',
    lessonId: 'unit3-lesson3',
    lessonTitle: 'Balance Sheet',
    prompt: 'Which of the following is classified as a current liability?',
    correctAnswer: 'Accounts Payable',
    distractors: [
      'Notes Payable (due in 3 years)',
      'Equipment',
      'Common Stock',
    ],
    explanation: 'Accounts payable are obligations due within one year, making them current liabilities.',
    objectiveTags: ['balance-sheet', 'current-liabilities'],
  },
];

export const UNIT3_CONFIG: PracticeTestUnitConfig = {
  unitNumber: 3,
  lessons: UNIT3_LESSONS,
  questions: UNIT3_QUESTIONS,
  phaseContent: UNIT3_PHASE_CONTENT,
  messaging: UNIT3_MESSAGING,
};

const UNIT4_LESSONS: PracticeTestLesson[] = [
  { id: 'unit4-lesson1', title: 'Payroll Basics' },
  { id: 'unit4-lesson2', title: 'Payroll Taxes' },
  { id: 'unit4-lesson3', title: 'Payroll Journal Entries' },
];

const UNIT4_PHASE_CONTENT: PracticeTestPhaseContent = {
  hook: 'Welcome to your Unit 4 Practice Test! Let\'s review payroll accounting.',
  introduction: 'In this practice test, you\'ll review payroll calculations, taxes, and journal entries.',
  guidedPractice: 'Remember the difference between employee and employer payroll taxes.',
  independentPractice: 'You\'re ready! Let\'s begin the practice test.',
  closing: 'Great job! Reflect on how payroll affects the financial statements.',
};

const UNIT4_MESSAGING: PracticeTestMessaging = {
  calloutTitle: 'Unit 4 Practice Test',
  calloutDescription: 'Test your knowledge of payroll with this practice test.',
  calloutCta: 'Start Practice Test',
};

const UNIT4_QUESTIONS: PracticeTestQuestion[] = [
  {
    id: 'unit4-question-1',
    lessonId: 'unit4-lesson1',
    lessonTitle: 'Payroll Basics',
    prompt: 'Which of the following is deducted from an employee\'s gross pay?',
    correctAnswer: 'Federal income tax',
    distractors: [
      'Employer FICA tax',
      'Federal unemployment tax',
      'State unemployment tax',
    ],
    explanation: 'Federal income tax is a payroll deduction from the employee\'s gross pay.',
    objectiveTags: ['payroll', 'deductions'],
  },
  {
    id: 'unit4-question-2',
    lessonId: 'unit4-lesson2',
    lessonTitle: 'Payroll Taxes',
    prompt: 'Which tax is paid by both the employee and the employer?',
    correctAnswer: 'FICA tax',
    distractors: [
      'Federal income tax',
      'Federal unemployment tax',
      'State unemployment tax',
    ],
    explanation: 'FICA (Social Security and Medicare) taxes are paid by both employees and employers.',
    objectiveTags: ['payroll-taxes', 'fica'],
  },
  {
    id: 'unit4-question-3',
    lessonId: 'unit4-lesson3',
    lessonTitle: 'Payroll Journal Entries',
    prompt: 'When recording payroll, what account is debited for employee gross wages?',
    correctAnswer: 'Wage Expense',
    distractors: [
      'Cash',
      'Wages Payable',
      'Payroll Tax Expense',
    ],
    explanation: 'Gross wages earned by employees are recorded as a debit to Wage Expense.',
    objectiveTags: ['payroll', 'journal-entries'],
  },
];

export const UNIT4_CONFIG: PracticeTestUnitConfig = {
  unitNumber: 4,
  lessons: UNIT4_LESSONS,
  questions: UNIT4_QUESTIONS,
  phaseContent: UNIT4_PHASE_CONTENT,
  messaging: UNIT4_MESSAGING,
};

const UNIT5_LESSONS: PracticeTestLesson[] = [
  { id: 'unit5-lesson1', title: 'Inventory Basics' },
  { id: 'unit5-lesson2', title: 'Inventory Costing' },
  { id: 'unit5-lesson3', title: 'Inventory Valuation' },
];

const UNIT5_PHASE_CONTENT: PracticeTestPhaseContent = {
  hook: 'Welcome to your Unit 5 Practice Test! Let\'s review inventory accounting.',
  introduction: 'In this practice test, you\'ll review inventory costing methods and valuation.',
  guidedPractice: 'Remember the different inventory costing methods: FIFO, LIFO, and weighted average.',
  independentPractice: 'You\'re ready! Let\'s begin the practice test.',
  closing: 'Great job! Reflect on how inventory affects cost of goods sold.',
};

const UNIT5_MESSAGING: PracticeTestMessaging = {
  calloutTitle: 'Unit 5 Practice Test',
  calloutDescription: 'Test your knowledge of inventory with this practice test.',
  calloutCta: 'Start Practice Test',
};

const UNIT5_QUESTIONS: PracticeTestQuestion[] = [
  {
    id: 'unit5-question-1',
    lessonId: 'unit5-lesson1',
    lessonTitle: 'Inventory Basics',
    prompt: 'Which inventory costing method assumes the first items purchased are the first sold?',
    correctAnswer: 'FIFO',
    distractors: [
      'LIFO',
      'Weighted average',
      'Specific identification',
    ],
    explanation: 'FIFO (First-In, First-Out) assumes the first items purchased are the first sold.',
    objectiveTags: ['inventory', 'costing-methods'],
  },
  {
    id: 'unit5-question-2',
    lessonId: 'unit5-lesson2',
    lessonTitle: 'Inventory Costing',
    prompt: 'In a period of rising prices, which inventory method results in the highest cost of goods sold?',
    correctAnswer: 'LIFO',
    distractors: [
      'FIFO',
      'Weighted average',
      'Specific identification',
    ],
    explanation: 'LIFO (Last-In, First-Out) matches the most recent (higher) costs against revenue, resulting in higher COGS when prices are rising.',
    objectiveTags: ['inventory', 'costing-methods', 'cogs'],
  },
  {
    id: 'unit5-question-3',
    lessonId: 'unit5-lesson3',
    lessonTitle: 'Inventory Valuation',
    prompt: 'Which accounting principle requires that inventory be valued at the lower of cost or market?',
    correctAnswer: 'Conservatism',
    distractors: [
      'Consistency',
      'Materiality',
      'Matching',
    ],
    explanation: 'The conservatism principle requires that potential losses be recognized immediately, leading to the lower of cost or market rule for inventory.',
    objectiveTags: ['inventory', 'valuation', 'accounting-principles'],
  },
];

export const UNIT5_CONFIG: PracticeTestUnitConfig = {
  unitNumber: 5,
  lessons: UNIT5_LESSONS,
  questions: UNIT5_QUESTIONS,
  phaseContent: UNIT5_PHASE_CONTENT,
  messaging: UNIT5_MESSAGING,
};

const UNIT6_LESSONS: PracticeTestLesson[] = [
  { id: 'unit6-lesson1', title: 'Markup and Margin' },
  { id: 'unit6-lesson2', title: 'Break-Even Analysis' },
  { id: 'unit6-lesson3', title: 'Inventory Algorithms' },
];

const UNIT6_PHASE_CONTENT: PracticeTestPhaseContent = {
  hook: 'Welcome to your Unit 6 Practice Test! Let\'s review pricing and inventory algorithms.',
  introduction: 'In this practice test, you\'ll review markup, margin, break-even, and inventory management.',
  guidedPractice: 'Remember the difference between markup and margin.',
  independentPractice: 'You\'re ready! Let\'s begin the practice test.',
  closing: 'Great job! Reflect on how pricing decisions affect profitability.',
};

const UNIT6_MESSAGING: PracticeTestMessaging = {
  calloutTitle: 'Unit 6 Practice Test',
  calloutDescription: 'Test your knowledge of pricing and inventory with this practice test.',
  calloutCta: 'Start Practice Test',
};

const UNIT6_QUESTIONS: PracticeTestQuestion[] = [
  {
    id: 'unit6-question-1',
    lessonId: 'unit6-lesson1',
    lessonTitle: 'Markup and Margin',
    prompt: 'If a product costs $80 and is sold for $100, what is the gross margin percentage?',
    correctAnswer: '20%',
    distractors: [
      '25%',
      '80%',
      '125%',
    ],
    explanation: 'Gross margin = (Selling Price - Cost) / Selling Price = ($100 - $80)/$100 = 20%.',
    objectiveTags: ['markup', 'margin'],
  },
  {
    id: 'unit6-question-2',
    lessonId: 'unit6-lesson2',
    lessonTitle: 'Break-Even Analysis',
    prompt: 'What is the formula for calculating the break-even point in units?',
    correctAnswer: 'Fixed Costs / (Selling Price per Unit - Variable Cost per Unit)',
    distractors: [
      'Variable Costs / (Selling Price per Unit - Fixed Cost per Unit)',
      'Fixed Costs / Variable Cost per Unit',
      '(Selling Price per Unit - Variable Cost per Unit) / Fixed Costs',
    ],
    explanation: 'Break-even point (units) = Fixed Costs / Contribution Margin per Unit, where Contribution Margin per Unit = Selling Price per Unit - Variable Cost per Unit.',
    objectiveTags: ['break-even', 'contribution-margin'],
  },
  {
    id: 'unit6-question-3',
    lessonId: 'unit6-lesson3',
    lessonTitle: 'Inventory Algorithms',
    prompt: 'Which inventory model helps determine the optimal order quantity to minimize total inventory costs?',
    correctAnswer: 'Economic Order Quantity (EOQ)',
    distractors: [
      'Just-in-Time (JIT)',
      'ABC Analysis',
      'Safety Stock',
    ],
    explanation: 'The Economic Order Quantity (EOQ) model calculates the optimal order quantity that minimizes the sum of ordering costs and holding costs.',
    objectiveTags: ['inventory', 'algorithms', 'eoq'],
  },
];

export const UNIT6_CONFIG: PracticeTestUnitConfig = {
  unitNumber: 6,
  lessons: UNIT6_LESSONS,
  questions: UNIT6_QUESTIONS,
  phaseContent: UNIT6_PHASE_CONTENT,
  messaging: UNIT6_MESSAGING,
};

const UNIT7_LESSONS: PracticeTestLesson[] = [
  { id: 'unit7-lesson1', title: 'Capital Budgeting' },
  { id: 'unit7-lesson2', title: 'Time Value of Money' },
  { id: 'unit7-lesson3', title: 'Investment Decisions' },
];

const UNIT7_PHASE_CONTENT: PracticeTestPhaseContent = {
  hook: 'Welcome to your Unit 7 Practice Test! Let\'s review capital budgeting.',
  introduction: 'In this practice test, you\'ll review time value of money and investment decisions.',
  guidedPractice: 'Remember: a dollar today is worth more than a dollar tomorrow.',
  independentPractice: 'You\'re ready! Let\'s begin the practice test.',
  closing: 'Great job! Reflect on how to evaluate investment opportunities.',
};

const UNIT7_MESSAGING: PracticeTestMessaging = {
  calloutTitle: 'Unit 7 Practice Test',
  calloutDescription: 'Test your knowledge of capital budgeting with this practice test.',
  calloutCta: 'Start Practice Test',
};

const UNIT7_QUESTIONS: PracticeTestQuestion[] = [
  {
    id: 'unit7-question-1',
    lessonId: 'unit7-lesson1',
    lessonTitle: 'Capital Budgeting',
    prompt: 'Which capital budgeting method ignores the time value of money?',
    correctAnswer: 'Payback period',
    distractors: [
      'Net present value (NPV)',
      'Internal rate of return (IRR)',
      'Profitability index',
    ],
    explanation: 'The payback period method ignores the time value of money.',
    objectiveTags: ['capital-budgeting', 'time-value-of-money'],
  },
  {
    id: 'unit7-question-2',
    lessonId: 'unit7-lesson2',
    lessonTitle: 'Time Value of Money',
    prompt: 'What is the value today of a future amount of money called?',
    correctAnswer: 'Present value',
    distractors: [
      'Future value',
      'Annuity',
      'Compound interest',
    ],
    explanation: 'Present value is the current value of a future sum of money, given a specific rate of return.',
    objectiveTags: ['time-value-of-money', 'present-value'],
  },
  {
    id: 'unit7-question-3',
    lessonId: 'unit7-lesson3',
    lessonTitle: 'Investment Decisions',
    prompt: 'A positive net present value (NPV) indicates that an investment is expected to:',
    correctAnswer: 'Generate more value than it costs',
    distractors: [
      'Lose money',
      'Break even',
      'Have an internal rate of return lower than the cost of capital',
    ],
    explanation: 'A positive NPV means the investment is expected to create value for the company.',
    objectiveTags: ['investment-decisions', 'npv'],
  },
];

export const UNIT7_CONFIG: PracticeTestUnitConfig = {
  unitNumber: 7,
  lessons: UNIT7_LESSONS,
  questions: UNIT7_QUESTIONS,
  phaseContent: UNIT7_PHASE_CONTENT,
  messaging: UNIT7_MESSAGING,
};

const UNIT8_LESSONS: PracticeTestLesson[] = [
  { id: 'unit8-lesson1', title: 'Financial Analysis' },
  { id: 'unit8-lesson2', title: 'Ratio Analysis' },
  { id: 'unit8-lesson3', title: 'Business Valuation' },
];

const UNIT8_PHASE_CONTENT: PracticeTestPhaseContent = {
  hook: 'Welcome to your Unit 8 Practice Test! Let\'s review financial analysis.',
  introduction: 'In this practice test, you\'ll review financial ratios and business valuation.',
  guidedPractice: 'Remember what each ratio measures: liquidity, profitability, solvency.',
  independentPractice: 'You\'re ready! Let\'s begin the practice test.',
  closing: 'Great job! Reflect on how to analyze a company\'s financial health.',
};

const UNIT8_MESSAGING: PracticeTestMessaging = {
  calloutTitle: 'Unit 8 Practice Test',
  calloutDescription: 'Test your knowledge of financial analysis with this practice test.',
  calloutCta: 'Start Practice Test',
};

const UNIT8_QUESTIONS: PracticeTestQuestion[] = [
  {
    id: 'unit8-question-1',
    lessonId: 'unit8-lesson1',
    lessonTitle: 'Financial Analysis',
    prompt: 'Which ratio measures a company\'s ability to pay short-term obligations?',
    correctAnswer: 'Current ratio',
    distractors: [
      'Debt-to-equity ratio',
      'Gross margin ratio',
      'Return on equity',
    ],
    explanation: 'The current ratio (current assets / current liabilities) measures short-term liquidity.',
    objectiveTags: ['financial-analysis', 'ratios'],
  },
  {
    id: 'unit8-question-2',
    lessonId: 'unit8-lesson2',
    lessonTitle: 'Ratio Analysis',
    prompt: 'Which ratio measures a company\'s profitability relative to its shareholders\' equity?',
    correctAnswer: 'Return on equity (ROE)',
    distractors: [
      'Return on assets (ROA)',
      'Gross margin ratio',
      'Asset turnover ratio',
    ],
    explanation: 'Return on equity (ROE) = Net Income / Average Shareholders\' Equity, measuring profitability relative to equity investment.',
    objectiveTags: ['ratio-analysis', 'profitability'],
  },
  {
    id: 'unit8-question-3',
    lessonId: 'unit8-lesson3',
    lessonTitle: 'Business Valuation',
    prompt: 'Which valuation method estimates a company\'s value based on its future cash flows?',
    correctAnswer: 'Discounted Cash Flow (DCF)',
    distractors: [
      'Price-to-Earnings (P/E) ratio',
      'Book value',
      'Liquidation value',
    ],
    explanation: 'Discounted Cash Flow (DCF) estimates value by discounting projected future cash flows to their present value.',
    objectiveTags: ['business-valuation', 'dcf'],
  },
];

export const UNIT8_CONFIG: PracticeTestUnitConfig = {
  unitNumber: 8,
  lessons: UNIT8_LESSONS,
  questions: UNIT8_QUESTIONS,
  phaseContent: UNIT8_PHASE_CONTENT,
  messaging: UNIT8_MESSAGING,
};

export const getUnitConfig = (unitNumber: number): PracticeTestUnitConfig | undefined => {
  switch (unitNumber) {
    case 1:
      return UNIT1_CONFIG;
    case 2:
      return UNIT2_CONFIG;
    case 3:
      return UNIT3_CONFIG;
    case 4:
      return UNIT4_CONFIG;
    case 5:
      return UNIT5_CONFIG;
    case 6:
      return UNIT6_CONFIG;
    case 7:
      return UNIT7_CONFIG;
    case 8:
      return UNIT8_CONFIG;
    default:
      return undefined;
  }
};
