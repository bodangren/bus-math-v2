import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

const matchingItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  matchId: z.string(),
  category: z.string().optional(),
  hint: z.string().optional(),
  description: z.string().optional()
});

const accountCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  whyItMatters: z.string().optional()
});

const accountItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  categoryId: z.string(),
  realWorldExample: z.string().optional(),
  hint: z.string().optional()
});

const impactLevelSchema = z.enum(['low', 'medium', 'high']);

const budgetCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  profitImpact: z.string().optional(),
  strategyNote: z.string().optional()
});

const budgetExpenseSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  categoryId: z.string(),
  cafeContext: z.string().optional(),
  amount: z.number().nonnegative(),
  impact: impactLevelSchema.default('medium')
});

const percentageCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  formula: z.string(),
  applications: z.array(z.string()).optional()
});

const percentageScenarioSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  description: z.string(),
  calculationTypeId: z.string(),
  dataPoints: z.string(),
  businessContext: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  formula: z.string().optional()
});

const inventoryLotSchema = z.object({
  id: z.string(),
  label: z.string(),
  purchaseDate: z.string(),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
  notes: z.string().optional()
});

const inventoryFlowModeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  targetOrder: z.array(z.string()).min(1)
});

const inventoryScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  context: z.string().optional(),
  salesQuantity: z.number().int().positive(),
  lots: z.array(inventoryLotSchema).min(1),
  flowModes: z.array(inventoryFlowModeSchema).min(1)
});

const ratioDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  businessMeaning: z.string().optional(),
  goodRange: z.string().optional(),
  whyItMatters: z.string().optional(),
  formulaSummary: z.string()
});

const ratioFormulaZoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  formula: z.string(),
  category: z.string(),
  emoji: z.string().optional(),
  expectedRatioId: z.string()
});

const blankSentenceSchema = z.object({
  id: z.string(),
  text: z.string(),
  answer: z.string(),
  hint: z.string().optional(),
  alternativeAnswers: z.array(z.string()).optional(),
  category: z.string().optional()
});

const journalEntryLineSchema = z.object({
  account: z.string(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0)
}).refine((entry) => !(entry.debit > 0 && entry.credit > 0), {
  message: 'Debit and credit cannot both be greater than zero'
});

const journalScenarioSchema = z.object({
  id: z.string(),
  description: z.string(),
  correctEntry: z.array(journalEntryLineSchema).min(2),
  explanation: z.string()
});

const reflectionPromptSchema = z.object({
  id: z.string(),
  category: z.enum(['courage', 'adaptability', 'persistence']).default('courage'),
  prompt: z.string(),
  placeholder: z.string().optional()
});

const peerCritiqueCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  prompt: z.string(),
  placeholder: z.string().optional(),
  ratingLabel: z.string().optional()
});

const breakEvenCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  behavior: z.enum(['fixed', 'variable']),
  whyItMatters: z.string().optional()
});

const breakEvenCostItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number().nonnegative(),
  unit: z.string().default('per unit'),
  categoryId: z.string(),
  description: z.string().optional(),
  realWorldExample: z.string().optional()
});

const salesAssumptionSchema = z.object({
  pricePerUnit: z.number().positive(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  step: z.number().positive().optional(),
  unitLabel: z.string().default('units'),
  targetUnits: z.number().int().positive().optional()
});

const cashFlowPeriodSchema = z.object({
  id: z.string(),
  label: z.string(),
  order: z.number().int(),
  description: z.string().optional(),
  highlightThreshold: z.number().optional()
});

const cashFlowItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  direction: z.enum(['inflow', 'outflow']),
  periodId: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  hint: z.string().optional()
});

const lemonadeInventorySchema = z.object({
  lemons: z.number().int().nonnegative(),
  sugar: z.number().int().nonnegative(),
  cups: z.number().int().nonnegative()
});

const lemonadeRecipeSchema = z.object({
  lemons: z.number().int().positive(),
  sugar: z.number().int().nonnegative(),
  price: z.number().positive()
});

const lemonadeDailySalesSchema = z.object({
  cupsSold: z.number().int().nonnegative(),
  dailyRevenue: z.number().nonnegative(),
  dailyExpenses: z.number().nonnegative()
});

const lemonadeSupplyOptionSchema = z.object({
  id: z.enum(['lemons', 'sugar', 'cups']),
  label: z.string(),
  quantity: z.number().int().positive(),
  cost: z.number().positive(),
  unit: z.string()
});

const lemonadeWeatherSchema = z.object({
  id: z.string(),
  emoji: z.string(),
  description: z.string(),
  multiplier: z.number().positive()
});

const lemonadeDemandSchema = z.object({
  baseCustomers: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive()
  }),
  priceSensitivity: z.object({
    highPriceThreshold: z.number().positive(),
    highPriceMultiplier: z.number().positive(),
    lowPriceThreshold: z.number().positive(),
    lowPriceMultiplier: z.number().positive()
  }),
  recipeQualityRange: z.object({
    min: z.number().positive(),
    max: z.number().positive()
  })
});

const lemonadeRecipeGuidanceSchema = z.object({
  minimumStrength: z.number().positive(),
  maximumStrength: z.number().positive(),
  minimumPrice: z.number().positive(),
  maximumPrice: z.number().positive()
});

const startupDecisionOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  effects: z.object({
    funding: z.number().optional(),
    burn: z.number().optional(),
    users: z.number().optional(),
    revenue: z.number().optional(),
    growth: z.number().optional(),
    revenuePerUser: z.number().optional()
  })
});

const startupDecisionSchema = z.object({
  id: z.string(),
  type: z.enum(['funding', 'team', 'product', 'marketing', 'strategy']),
  title: z.string(),
  description: z.string(),
  options: z.array(startupDecisionOptionSchema).min(1)
});

const startupStageSchema = z.object({
  id: z.string(),
  name: z.string(),
  badgeClassName: z.string(),
  progress: z.number().int().min(0).max(100),
  icon: z.string().default('rocket')
});

const startupDecisionFlowSchema = z.object({
  stageId: z.string(),
  decisionIds: z.array(z.string())
});

const startupWinConditionSchema = z.object({
  revenueTarget: z.number().nonnegative(),
  timeLimitMonths: z.number().int().positive(),
  timeLimitRevenueTarget: z.number().nonnegative(),
  successStageId: z.string(),
  successRevenueTarget: z.number().nonnegative()
});

const budgetExpenseConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean(),
  defaultAmount: z.number().nonnegative(),
  icon: z.string(),
  color: z.string()
});

const budgetGameStateSchema = z.object({
  monthlyIncome: z.number().positive(),
  month: z.number().int().positive(),
  totalSavings: z.number().nonnegative(),
  emergencyFund: z.number().nonnegative(),
  financialHealth: z.number().min(0).max(100)
});

const budgetSavingsConfigSchema = z.object({
  emergencyFundContributionRate: z.number().min(0).max(1),
  healthScoreBase: z.number(),
  savingsMultiplier: z.number(),
  emergencyMultiplier: z.number()
});

const financialStatementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  focus: z.string().optional(),
  icon: z.string().optional(),
  howItHelps: z.string().optional()
});

const financialStatementItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  statementId: z.string(),
  category: z.string(),
  hint: z.string().optional()
});

const trialBalanceSideSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  type: z.enum(['debit', 'credit']),
  badgeLabel: z.string().optional()
});

const trialBalanceAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().nonnegative(),
  sideId: z.string(),
  category: z.string(),
  context: z.string().optional()
});

export const activityPropsSchemas = {
  'comprehension-quiz': z.object({
    title: z.string().default('Comprehension Check'),
    description: z.string().default('Test your understanding of the lesson.'),
    showExplanations: z.boolean().default(true),
    allowRetry: z.boolean().default(true),
    questions: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        type: z.enum(['multiple-choice', 'true-false', 'short-answer']),
        options: z.array(z.string()).optional(),
        correctAnswer: z.union([z.string(), z.array(z.string())]),
        explanation: z.string().optional(),
      }),
    ).min(1),
  }),
  'drag-and-drop': z.object({
    title: z.string(),
    description: z.string(),
    items: z.array(matchingItemSchema).min(2),
    leftColumnTitle: z.string().default('Items'),
    rightColumnTitle: z.string().default('Matches'),
    showHints: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'account-categorization': z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(accountCategorySchema).min(1),
    accounts: z.array(accountItemSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'budget-category-sort': z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(budgetCategorySchema).min(1),
    expenses: z.array(budgetExpenseSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'percentage-calculation-sorting': z.object({
    title: z.string(),
    description: z.string(),
    calculationTypes: z.array(percentageCategorySchema).min(1),
    scenarios: z.array(percentageScenarioSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'inventory-flow-diagram': z.object({
    title: z.string(),
    description: z.string(),
    scenarios: z.array(inventoryScenarioSchema).min(1)
  }),
  'ratio-matching': z.object({
    title: z.string(),
    description: z.string(),
    ratios: z.array(ratioDefinitionSchema).min(1),
    formulaZones: z.array(ratioFormulaZoneSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'break-even-components': z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(breakEvenCategorySchema).min(1),
    costItems: z.array(breakEvenCostItemSchema).min(1),
    salesAssumptions: salesAssumptionSchema,
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'cash-flow-timeline': z.object({
    title: z.string(),
    description: z.string(),
    periods: z.array(cashFlowPeriodSchema).min(1),
    cashFlowItems: z.array(cashFlowItemSchema).min(1),
    startingCash: z.number().default(0),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'financial-statement-matching': z.object({
    title: z.string(),
    description: z.string(),
    statements: z.array(financialStatementSchema).min(1),
    lineItems: z.array(financialStatementItemSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'trial-balance-sorting': z.object({
    title: z.string(),
    description: z.string(),
    sides: z.array(trialBalanceSideSchema).min(2),
    accounts: z.array(trialBalanceAccountSchema).min(1),
    showCategoryBadges: z.boolean().default(true),
    shuffleItems: z.boolean().default(true)
  }),
  'fill-in-the-blank': z.object({
    title: z.string(),
    description: z.string(),
    sentences: z.array(blankSentenceSchema).min(1),
    showWordList: z.boolean().default(true),
    randomizeWordOrder: z.boolean().default(true),
    showHints: z.boolean().default(false)
  }),
  'journal-entry-building': z.object({
    title: z.string().default('Journal Entry Builder'),
    description: z.string().default('Practice building balanced journal entries.'),
    availableAccounts: z.array(z.string()).default([]),
    scenarios: z.array(journalScenarioSchema).min(1),
    showInstructionsDefaultOpen: z.boolean().default(false)
  }),
  'reflection-journal': z.object({
    unitTitle: z.string().default('Learning Reflection'),
    prompts: z.array(reflectionPromptSchema).min(1)
  }),
  'peer-critique-form': z.object({
    projectTitle: z.string().default('Project Presentation'),
    peerName: z.string().default('Peer'),
    unitNumber: z.number().int().positive().optional(),
    reviewerNameLabel: z.string().optional(),
    categories: z.array(peerCritiqueCategorySchema).min(1),
    overallPrompt: z.string().optional()
  }),
  'profit-calculator': z.object({
    initialRevenue: z.number().optional(),
    initialExpenses: z.number().optional(),
    allowNegative: z.boolean().default(false),
    currency: z.string().default('USD'),
  }),
  'budget-worksheet': z.object({
    categories: z.array(z.string()),
    totalBudget: z.number(),
    constraints: z.record(z.string(), z.number()).optional(),
  }),
  'lemonade-stand': z.object({
    title: z.string().default('Lemonade Stand Tycoon'),
    description: z.string().default('Run a lemonade stand to learn pricing, inventory, and profit.'),
    supplyOptions: z.array(lemonadeSupplyOptionSchema).default([
      { id: 'lemons', label: 'Fresh Lemons', quantity: 10, cost: 3, unit: 'bag' },
      { id: 'sugar', label: 'Organic Sugar', quantity: 10, cost: 2, unit: 'bag' },
      { id: 'cups', label: 'Compostable Cups', quantity: 20, cost: 1.5, unit: 'pack' }
    ]),
    weatherPatterns: z.array(lemonadeWeatherSchema).default([
      { id: 'sunny', emoji: '☀️', description: 'Perfect lemonade weather!', multiplier: 1.5 },
      { id: 'hot', emoji: '🔥', description: 'Everyone wants cold drinks!', multiplier: 2 },
      { id: 'cloudy', emoji: '☁️', description: 'Moderate demand expected', multiplier: 0.8 },
      { id: 'rainy', emoji: '🌧️', description: 'Few customers today', multiplier: 0.3 }
    ]),
    ingredientCosts: z
      .object({
        lemons: z.number().positive(),
        sugar: z.number().positive(),
        cup: z.number().positive()
      })
      .default({
        lemons: 0.3,
        sugar: 0.2,
        cup: 0.075
      }),
    demand: lemonadeDemandSchema.default({
      baseCustomers: { min: 20, max: 70 },
      priceSensitivity: {
        highPriceThreshold: 2,
        highPriceMultiplier: 0.5,
        lowPriceThreshold: 1,
        lowPriceMultiplier: 1.2
      },
      recipeQualityRange: {
        min: 0.3,
        max: 1.5
      }
    }),
    recipeGuidance: lemonadeRecipeGuidanceSchema.default({
      minimumStrength: 2,
      maximumStrength: 5,
      minimumPrice: 0.5,
      maximumPrice: 3
    }),
    initialState: z
      .object({
        cash: z.number().nonnegative().default(50),
        day: z.number().int().positive().default(1),
        revenue: z.number().nonnegative().default(0),
        expenses: z.number().nonnegative().default(0),
        inventory: lemonadeInventorySchema.default({
          lemons: 0,
          sugar: 0,
          cups: 0
        }),
        recipe: lemonadeRecipeSchema.default({
          lemons: 2,
          sugar: 1,
          price: 1
        }),
        weather: z.string().default('sunny'),
        customerSatisfaction: z.number().min(0).max(100).default(100),
        isSellingActive: z.boolean().default(false),
        dailySales: lemonadeDailySalesSchema.default({
          cupsSold: 0,
          dailyRevenue: 0,
          dailyExpenses: 0
        }),
        gameStatus: z.enum(['playing', 'ended']).default('playing')
      })
      .default({
        cash: 50,
        day: 1,
        revenue: 0,
        expenses: 0,
        inventory: { lemons: 0, sugar: 0, cups: 0 },
        recipe: { lemons: 2, sugar: 1, price: 1 },
        weather: 'sunny',
        customerSatisfaction: 100,
        isSellingActive: false,
        dailySales: { cupsSold: 0, dailyRevenue: 0, dailyExpenses: 0 },
        gameStatus: 'playing'
      })
  }),
  'startup-journey': z.object({
    title: z.string().default('Startup Journey'),
    description: z
      .string()
      .default('Build a tech startup from idea to success and balance funding, growth, and strategy.'),
    stages: z
      .array(startupStageSchema)
      .min(1)
      .default([
        { id: 'idea', name: 'Idea', badgeClassName: 'bg-yellow-100 text-yellow-800 border-yellow-300', progress: 20, icon: 'lightbulb' },
        { id: 'prototype', name: 'Prototype', badgeClassName: 'bg-blue-100 text-blue-800 border-blue-300', progress: 40, icon: 'code' },
        { id: 'launch', name: 'Launch', badgeClassName: 'bg-purple-100 text-purple-800 border-purple-300', progress: 60, icon: 'rocket' },
        { id: 'growth', name: 'Growth', badgeClassName: 'bg-green-100 text-green-800 border-green-300', progress: 80, icon: 'chart-line' },
        { id: 'success', name: 'Success', badgeClassName: 'bg-amber-100 text-amber-800 border-amber-300', progress: 100, icon: 'crown' }
      ]),
    decisions: z.array(startupDecisionSchema).default([
      {
        id: 'initial-funding',
        type: 'funding',
        title: 'Initial Funding Strategy',
        description: 'You have a great app idea! How will you fund development?',
        options: [
          {
            id: 'bootstrap',
            title: 'Bootstrap with Personal Savings',
            description: 'Use $5,000 of your own money. Lower burn rate but limited resources.',
            effects: { funding: 5000, burn: -500 }
          },
          {
            id: 'accelerator',
            title: 'Apply to Startup Accelerator',
            description: 'Get $25,000 funding plus mentorship and network access.',
            effects: { funding: 25000, users: 100, growth: 0.2 }
          },
          {
            id: 'angel-investors',
            title: 'Pitch to Angel Investors',
            description: 'Raise $100,000 but higher pressure and burn rate.',
            effects: { funding: 100000, burn: 6000 }
          }
        ]
      },
      {
        id: 'team-building',
        type: 'team',
        title: 'First Hire Decision',
        description: 'Your startup is gaining traction. Who should you hire first?',
        options: [
          {
            id: 'developer',
            title: 'Senior Developer',
            description: 'Accelerate product development and add new features.',
            effects: { burn: 5000, growth: 0.3 }
          },
          {
            id: 'marketer',
            title: 'Marketing Manager',
            description: 'Focus on user acquisition and brand building.',
            effects: { burn: 3000, users: 500, growth: 0.5 }
          },
          {
            id: 'business-dev',
            title: 'Business Development',
            description: 'Build partnerships and explore revenue opportunities.',
            effects: { burn: 4000, revenue: 1000, revenuePerUser: 2 }
          }
        ]
      },
      {
        id: 'product-focus',
        type: 'product',
        title: 'Product Development Priority',
        description: 'Limited development resources. What should be your focus?',
        options: [
          {
            id: 'new-features',
            title: 'Build New Features',
            description: 'Add functionality to attract more users.',
            effects: { users: 300, burn: 2000 }
          },
          {
            id: 'user-feedback',
            title: 'Focus on User Feedback',
            description: 'Improve existing features based on user input.',
            effects: { growth: 0.4, revenuePerUser: 1 }
          },
          {
            id: 'scaling',
            title: 'Technical Scaling',
            description: 'Prepare infrastructure for rapid growth.',
            effects: { burn: 3000, growth: 0.6 }
          }
        ]
      },
      {
        id: 'marketing-strategy',
        type: 'marketing',
        title: 'Growth Strategy',
        description: 'How will you acquire your next 1000 users?',
        options: [
          {
            id: 'paid-ads',
            title: 'Paid Advertising',
            description: 'Invest in Facebook and Google ads for rapid acquisition.',
            effects: { users: 800, burn: 5000 }
          },
          {
            id: 'content-marketing',
            title: 'Content Marketing',
            description: 'Build organic growth through valuable content.',
            effects: { users: 300, growth: 0.3, burn: 1000 }
          },
          {
            id: 'partnerships',
            title: 'Strategic Partnerships',
            description: 'Partner with established companies for user access.',
            effects: { users: 600, revenue: 2000, burn: 2000 }
          }
        ]
      },
      {
        id: 'revenue-model',
        type: 'strategy',
        title: 'Monetization Strategy',
        description: "Time to start generating revenue. What's your approach?",
        options: [
          {
            id: 'freemium',
            title: 'Freemium Model',
            description: 'Free basic version with premium features.',
            effects: { revenuePerUser: 3, growth: 0.2 }
          },
          {
            id: 'subscription',
            title: 'Monthly Subscription',
            description: 'Recurring revenue but may slow user growth.',
            effects: { revenuePerUser: 8, growth: -0.1 }
          },
          {
            id: 'enterprise',
            title: 'Enterprise Sales',
            description: 'Target businesses with high-value contracts.',
            effects: { revenuePerUser: 15, burn: 3000, users: -100 }
          }
        ]
      }
    ]),
    decisionFlow: z
      .array(startupDecisionFlowSchema)
      .default([
        { stageId: 'idea', decisionIds: ['initial-funding'] },
        { stageId: 'prototype', decisionIds: ['team-building', 'product-focus'] },
        { stageId: 'launch', decisionIds: ['marketing-strategy'] },
        { stageId: 'growth', decisionIds: ['revenue-model'] },
        { stageId: 'success', decisionIds: [] }
      ]),
    winConditions: startupWinConditionSchema.default({
      revenueTarget: 50000,
      successRevenueTarget: 50000,
      timeLimitMonths: 24,
      timeLimitRevenueTarget: 20000,
      successStageId: 'success'
    }),
    initialState: z
      .object({
        stage: z.string().default('idea'),
        funding: z.number().nonnegative().default(10000),
        monthlyBurn: z.number().nonnegative().default(2000),
        users: z.number().nonnegative().default(100),
        revenue: z.number().nonnegative().default(0),
        month: z.number().int().positive().default(1),
        maxMonths: z.number().int().positive().default(24),
        decisions: z.array(z.string()).default([]),
        currentDecisionId: z.string().nullable().default('initial-funding'),
        userGrowthRate: z.number().nonnegative().default(0.1),
        revenuePerUser: z.number().nonnegative().default(0),
        gameStatus: z.enum(['playing', 'won', 'lost']).default('playing')
      })
      .default({
        stage: 'idea',
        funding: 10000,
        monthlyBurn: 2000,
        users: 100,
        revenue: 0,
        month: 1,
        maxMonths: 24,
        decisions: [],
        currentDecisionId: 'initial-funding',
        userGrowthRate: 0.1,
        revenuePerUser: 0,
        gameStatus: 'playing'
      })
  }),
  'budget-balancer': z.object({
    title: z.string().default('Budget Balancer'),
    description: z
      .string()
      .default('Manage monthly income, required bills, and discretionary spending to build savings.'),
    expenses: z
      .array(budgetExpenseConfigSchema)
      .default([
        { id: 'rent', label: 'Rent', required: true, defaultAmount: 1200, icon: 'home', color: 'bg-blue-500' },
        { id: 'utilities', label: 'Utilities', required: true, defaultAmount: 300, icon: 'zap', color: 'bg-yellow-500' },
        { id: 'groceries', label: 'Groceries', required: true, defaultAmount: 400, icon: 'shopping-cart', color: 'bg-green-500' },
        { id: 'transportation', label: 'Transportation', required: true, defaultAmount: 200, icon: 'car', color: 'bg-purple-500' },
        { id: 'entertainment', label: 'Entertainment', required: false, defaultAmount: 0, icon: 'coffee', color: 'bg-pink-500' },
        { id: 'dining', label: 'Dining', required: false, defaultAmount: 0, icon: 'utensils', color: 'bg-orange-500' },
        { id: 'shopping', label: 'Shopping', required: false, defaultAmount: 0, icon: 'shopping-bag', color: 'bg-indigo-500' }
      ]),
    savingsConfig: budgetSavingsConfigSchema.default({
      emergencyFundContributionRate: 0.1,
      healthScoreBase: 50,
      savingsMultiplier: 50,
      emergencyMultiplier: 25
    }),
    initialState: budgetGameStateSchema.default({
      monthlyIncome: 5000,
      month: 1,
      totalSavings: 1000,
      emergencyFund: 500,
      financialHealth: 100
    })
  }),
} as const;

export type ActivityComponentKey = keyof typeof activityPropsSchemas;

export type ActivityProps = {
  [K in ActivityComponentKey]: z.infer<(typeof activityPropsSchemas)[K]>;
}[ActivityComponentKey];

export type ComprehensionQuizActivityProps = z.infer<typeof activityPropsSchemas['comprehension-quiz']>;
export type DragAndDropActivityProps = z.infer<typeof activityPropsSchemas['drag-and-drop']>;
export type AccountCategorizationActivityProps = z.infer<typeof activityPropsSchemas['account-categorization']>;
export type BudgetCategorySortActivityProps = z.infer<typeof activityPropsSchemas['budget-category-sort']>;
export type PercentageCalculationSortingActivityProps = z.infer<typeof activityPropsSchemas['percentage-calculation-sorting']>;
export type InventoryFlowDiagramActivityProps = z.infer<typeof activityPropsSchemas['inventory-flow-diagram']>;
export type RatioMatchingActivityProps = z.infer<typeof activityPropsSchemas['ratio-matching']>;
export type BreakEvenComponentsActivityProps = z.infer<typeof activityPropsSchemas['break-even-components']>;
export type CashFlowTimelineActivityProps = z.infer<typeof activityPropsSchemas['cash-flow-timeline']>;
export type FinancialStatementMatchingActivityProps = z.infer<typeof activityPropsSchemas['financial-statement-matching']>;
export type TrialBalanceSortingActivityProps = z.infer<typeof activityPropsSchemas['trial-balance-sorting']>;
export type FillInTheBlankActivityProps = z.infer<typeof activityPropsSchemas['fill-in-the-blank']>;
export type JournalEntryActivityProps = z.infer<typeof activityPropsSchemas['journal-entry-building']>;
export type ReflectionJournalActivityProps = z.infer<typeof activityPropsSchemas['reflection-journal']>;
export type PeerCritiqueActivityProps = z.infer<typeof activityPropsSchemas['peer-critique-form']>;
export type LemonadeStandActivityProps = z.infer<typeof activityPropsSchemas['lemonade-stand']>;
export type StartupJourneyActivityProps = z.infer<typeof activityPropsSchemas['startup-journey']>;
export type BudgetBalancerActivityProps = z.infer<typeof activityPropsSchemas['budget-balancer']>;

export const gradingConfigSchema = z.object({
  autoGrade: z.boolean().default(false),
  passingScore: z.number().min(0).max(100).optional(),
  partialCredit: z.boolean().default(false),
  rubric: z
    .array(
      z.object({
        criteria: z.string(),
        points: z.number(),
      }),
    )
    .optional(),
});

export type GradingConfig = z.infer<typeof gradingConfigSchema>;

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  componentKey: text('component_key').$type<ActivityComponentKey>().notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  props: jsonb('props').$type<ActivityProps>().notNull(),
  gradingConfig: jsonb('grading_config').$type<GradingConfig | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
