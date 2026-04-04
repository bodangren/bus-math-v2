# 8 Core Simulations Specification

> Part of Track 4: Legacy Cleanup — Component Pruning, Charts, and Simulations
> Each simulation must be `practice.v1` compliant with defined `parts` and `artifact` contracts.

## Simulation Placement by Unit

| # | Unit | Simulation | Type | Placement | Description |
|---|------|------------|------|-----------|-------------|
| 1 | Balance by Design | **Startup Journey** | Discovery | Lesson 1 | Multi-stage startup decision-making (funding, team, product, growth) |
| 2 | Flow of Transactions | **Cash Flow Challenge** | Discovery | Lesson 1 | Manage incoming/outgoing cash flows, credit decisions |
| 3 | Statements in Balance | **Business Stress Test** | Synthesis | Lesson 7 | Respond to business disasters, adjust financial statements |
| 4 | Payroll in Motion | **Pay Structure Decision Lab** | Synthesis | Lesson 7 | Choose payroll structures (hourly/salary/commission), calculate taxes |
| 5 | Assets That Age | **Asset Time Machine** | Discovery | Lesson 1 | Depreciation decisions, asset lifecycle management |
| 6 | Inventory and Project Costing | **Inventory Manager** | Synthesis | Lesson 7 | Inventory optimization, demand forecasting, ordering decisions |
| 7 | Financing the Future | **Capital Negotiation** | Synthesis | Lesson 7 | Funding decisions, term negotiation, capital structure |
| 8 | Integrated Model Sprint | **Notebook Organizer** | Synthesis | Lesson 7 | Complete business workflow simulation, capstone integration |

---

## Simulation 1: Startup Journey (Unit 1 - Discovery)

### Overview
Students experience the startup journey from idea to growth, learning about funding decisions, burn rates, user acquisition, and strategic choices.

### Parts (Key Decisions)

```typescript
interface StartupJourneyParts {
  // Part 1: Initial Funding Decision
  fundingDecision: {
    partId: 'startup-funding-decision'
    choice: 'bootstrap' | 'accelerator' | 'angel_investors'
    reasoning: string
  }
  
  // Part 2: Team Building Priority
  teamDecision: {
    partId: 'startup-team-decision'
    choice: 'developers' | 'marketers' | 'business_development'
    reasoning: string
  }
  
  // Part 3: Product Strategy
  productDecision: {
    partId: 'startup-product-decision'
    choice: 'focus_features' | 'user_feedback' | 'scale_infrastructure'
    reasoning: string
  }
  
  // Part 4: Growth Strategy
  growthDecision: {
    partId: 'startup-growth-decision'
    choice: 'marketing_spend' | 'organic_growth' | 'partnerships'
    reasoning: string
  }
  
  // Part 5: Final Stage Reached
  finalStage: {
    partId: 'startup-final-stage'
    stageReached: 'idea' | 'prototype' | 'launch' | 'growth' | 'success'
    monthsElapsed: number
  }
}
```

### Artifact (Teacher-Readable Report)

```typescript
interface StartupJourneyArtifact {
  type: 'startup-journey-report'
  summary: {
    companyName: string
    finalStage: string
    monthsToComplete: number
    successStatus: 'won' | 'lost' | 'in_progress'
  }
  financials: {
    startingFunding: number
    finalFunding: number
    totalRevenue: number
    finalBurnRate: number
    runwayMonths: number
  }
  metrics: {
    totalUsers: number
    userGrowthRate: number
    revenuePerUser: number
  }
  decisions: Array<{
    stage: string
    decisionType: string
    choiceMade: string
    impact: string
  }>
  outcome: {
    keyAchievements: string[]
    challengesFaced: string[]
    lessonsLearned: string[]
  }
}
```

### Win/Loss Conditions
- **Win**: Reach "success" stage OR generate $100,000+ revenue by month 24
- **Loss**: Run out of funding (cash < 0) OR fail to reach $50,000 revenue by month 24

---

## Simulation 2: Cash Flow Challenge (Unit 2 - Discovery)

### Overview
Students manage cash flow for a small business, making decisions about incoming payments, outgoing expenses, and using credit strategically.

### Parts (Key Decisions)

```typescript
interface CashFlowParts {
  // Part 1: Payment Expediting Decision
  expediteDecision: {
    partId: 'cashflow-expedite-decision'
    customerPaymentsExpedited: string[] // IDs of payments expedited
    totalFeesPaid: number
  }
  
  // Part 2: Payment Terms Negotiation
  negotiateDecision: {
    partId: 'cashflow-negotiate-decision'
    expensesNegotiated: string[] // IDs of expenses negotiated
    extensionsGained: number // total days extended
    penaltiesIncurred: number
  }
  
  // Part 3: Credit Line Usage
  creditDecision: {
    partId: 'cashflow-credit-decision'
    creditEstablished: boolean
    creditDrawn: number
    interestPaid: number
  }
  
  // Part 4: Expense Delay Strategy
  delayDecision: {
    partId: 'cashflow-delay-decision'
    expensesDelayed: string[] // IDs of expenses delayed
    penaltiesIncurred: number
  }
  
  // Part 5: Final Cash Position
  finalPosition: {
    partId: 'cashflow-final-position'
    endingCash: number
    daysManaged: number
    actionsUsed: {
      requestPayment: number
      negotiateTerms: number
      lineOfCredit: number
      delayExpense: number
    }
  }
}
```

### Artifact (Teacher-Readable Report)

```typescript
interface CashFlowArtifact {
  type: 'cash-flow-report'
  summary: {
    startingCash: number
    endingCash: number
    netChange: number
    daysManaged: number
    successStatus: 'won' | 'lost' | 'in_progress'
  }
  cashFlows: {
    incoming: Array<{
      description: string
      amount: number
      originalDue: number
      expedited: boolean
    }>
    outgoing: Array<{
      description: string
      amount: number
      originalDue: number
      negotiated: boolean
      delayed: boolean
    }>
  }
  creditUsage: {
    lineEstablished: boolean
    creditLimit: number
    amountDrawn: number
    interestPaid: number
  }
  actionsSummary: {
    paymentsExpedited: number
    termsNegotiated: number
    expensesDelayed: number
    totalFeesAndPenalties: number
  }
  healthIndicators: {
    finalCashStatus: 'Healthy' | 'Good' | 'Tight' | 'Critical' | 'Bankrupt'
    daysSurvived: number
    liquidityRatio: number
  }
}
```

### Win/Loss Conditions
- **Win**: Manage cash flow for 30 days without going negative
- **Loss**: Cash position drops below $0

---

## Simulation 3: Business Stress Test (Unit 3 - Synthesis)

### Overview
Students respond to business disasters and market events, adjusting financial statements and business strategies to survive.

### Parts (Key Decisions)

```typescript
interface BusinessStressTestParts {
  // Part 1-5: Disaster Responses (one per round)
  disasterResponses: Array<{
    partId: string // e.g., 'stress-round-1-response'
    roundNumber: number
    disasterType: string
    responseStrategy: 'raise_price' | 'increase_volume' | 'cut_staff' | 'use_reserves'
    projectedImpact: {
      revenueChange: number
      expenseChange: number
      cashChange: number
    }
  }>
  
  // Part 6: Final Financial Position
  finalPosition: {
    partId: 'stress-final-position'
    roundsSurvived: number
    finalCash: number
    finalRevenue: number
    finalExpenses: number
  }
}
```

### Artifact (Teacher-Readable Report)

```typescript
interface BusinessStressTestArtifact {
  type: 'business-stress-report'
  summary: {
    roundsSurvived: number
    totalDisasters: number
    finalCash: number
    successStatus: 'survived' | 'failed'
  }
  rounds: Array<{
    roundNumber: number
    disaster: {
      name: string
      description: string
      impact: {
        revenue: number
        expenses: number
        cash: number
      }
    }
    response: {
      strategy: string
      rationale: string
    }
    financialSnapshot: {
      cash: number
      revenue: number
      expenses: number
      profit: number
    }
  }>
  strategyAnalysis: {
    priceAdjustments: number
    volumeAdjustments: number
    staffAdjustments: number
    reserveUsage: number
  }
  survivalMetrics: {
    cashResilience: number // percentage of initial cash preserved
    recoverySpeed: number // rounds to recover from disaster
    strategicConsistency: number // consistency of response strategy
  }
}
```

### Win/Loss Conditions
- **Win**: Survive all 5 disaster rounds with positive cash
- **Loss**: Cash drops to $0 or below at any point

---

## Simulation 4: Pay Structure Decision Lab (Unit 4 - Synthesis)

### Overview
Students choose and calculate different pay structures (hourly, salary, commission) with tax implications for different employee scenarios.

### Parts (Key Decisions)

```typescript
interface PayStructureParts {
  // Part 1: Scenario Selection
  scenarioSelection: {
    partId: 'payroll-scenario-selection'
    scenarioId: 'service' | 'product' | 'sales'
    roleType: string
  }
  
  // Part 2: Pay Structure Choice
  structureChoice: {
    partId: 'payroll-structure-choice'
    selectedType: 'hourly' | 'salary' | 'commission'
    justification: string
  }
  
  // Part 3: Pay Calculation
  payCalculation: {
    partId: 'payroll-pay-calculation'
    grossPay: number
    socialSecurity: number
    medicare: number
    stateUnemployment: number
    federalUnemployment: number
    netPay: number
  }
  
  // Part 4: Compliance Check
  complianceCheck: {
    partId: 'payroll-compliance-check'
    overtimeCompliant: boolean
    exemptionStatus: 'exempt' | 'non_exempt'
    totalEmployerCost: number
  }
}
```

### Artifact (Teacher-Readable Report)

```typescript
interface PayStructureArtifact {
  type: 'payroll-decision-report'
  summary: {
    scenarioName: string
    roleType: string
    payStructureSelected: string
    totalEmployerCost: number
  }
  employeeProfile: {
    role: string
    context: string
    workPattern: string
  }
  payStructureAnalysis: {
    type: string
    strengths: string[]
    risks: string[]
    rationale: string
  }
  calculationDetails: {
    grossPay: number
    employeeDeductions: {
      socialSecurity: number
      medicare: number
      federalWithholding: number
      stateWithholding: number
    }
    employerCosts: {
      socialSecurity: number
      medicare: number
      stateUnemployment: number
      federalUnemployment: number
      workersComp: number
    }
    netPay: number
    totalCostToEmployer: number
  }
  complianceStatus: {
    overtimeCompliant: boolean
    exemptionClassification: string
    ficaCompliant: boolean
    futaSutaCompliant: boolean
  }
}
```

### Win/Loss Conditions
- **Win**: Correctly calculate all payroll components with proper compliance
- **Partial**: Minor calculation errors but correct compliance status
- **Retry**: Major errors in compliance or calculation

---

## Simulation 5: Asset Time Machine (Unit 5 - Discovery)

### Overview
Students manage assets through their lifecycle, making depreciation method decisions and understanding asset aging.

### Parts (Key Decisions)

```typescript
interface AssetTimeMachineParts {
  // Part 1: Asset Acquisition Decisions
  acquisitions: Array<{
    partId: string // e.g., 'asset-acquire-1'
    assetType: string
    purchaseCost: number
    salvageValue: number
    usefulLife: number
  }>
  
  // Part 2: Depreciation Method Selection
  depreciationMethod: {
    partId: 'asset-depreciation-method'
    method: 'straight_line' | 'double_declining' | 'units_of_production'
    justification: string
  }
  
  // Part 3: Annual Depreciation Calculations
  annualCalculations: Array<{
    partId: string // e.g., 'asset-year-1'
    year: number
    beginningBookValue: number
    annualDepreciation: number
    endingBookValue: number
    accumulatedDepreciation: number
  }>
  
  // Part 4: Disposal Decision
  disposalDecision: {
    partId: 'asset-disposal-decision'
    disposed: boolean
    salePrice: number
    gainOrLoss: number
  }
}
```

### Artifact (Teacher-Readable Report)

```typescript
interface AssetTimeMachineArtifact {
  type: 'asset-management-report'
  summary: {
    totalAssetsAcquired: number
    totalAcquisitionCost: number
    depreciationMethod: string
    finalBookValue: number
    totalDepreciationRecognized: number
  }
  assetSchedule: Array<{
    assetName: string
    acquisitionDate: string
    cost: number
    salvageValue: number
    usefulLife: number
    depreciationMethod: string
    annualDepreciation: number
    accumulatedDepreciation: number
    currentBookValue: number
  }>
  depreciationTimeline: Array<{
    year: number
    beginningBookValue: number
    depreciationExpense: number
    endingBookValue: number
    accumulatedDepreciation: number
  }>
  disposalAnalysis: {
    disposed: boolean
    salePrice: number
    bookValueAtDisposal: number
    gainOrLoss: number
    gainLossType: 'gain' | 'loss' | 'none'
  }
  financialImpact: {
    totalDepreciationExpense: number
    taxShieldValue: number // estimated tax savings
    returnOnAsset: number
  }
}
```

### Win/Loss Conditions
- **Win**: Correctly calculate depreciation for all assets across their useful life
- **Partial**: Minor calculation errors in some years
- **Retry**: Major errors in depreciation method application

---

## Simulation 6: Inventory Manager (Unit 6 - Synthesis)

### Overview
Students optimize inventory levels across multiple products, managing demand forecasting, ordering decisions, and storage costs.

### Parts (Key Decisions)

```typescript
interface InventoryManagerParts {
  // Part 1-7: Daily Ordering Decisions (one per day)
  dailyOrders: Array<{
    partId: string // e.g., 'inventory-day-1-orders'
    day: number
    orders: Array<{
      productId: string
      quantityOrdered: number
      orderCost: number
    }>
    totalOrderCost: number
  }>
  
  // Part 8: Final Performance Summary
  finalPerformance: {
    partId: 'inventory-final-performance'
    totalRevenue: number
    totalExpenses: number
    finalProfit: number
    profitTargetMet: boolean
  }
}
```

### Artifact (Teacher-Readable Report)

```typescript
interface InventoryManagerArtifact {
  type: 'inventory-management-report'
  summary: {
    totalDays: number
    finalProfit: number
    profitTarget: number
    targetMet: boolean
    successStatus: 'target_met' | 'target_missed'
  }
  productPerformance: Array<{
    productName: string
    totalOrdered: number
    totalSold: number
    totalRevenue: number
    demandPattern: 'high' | 'medium' | 'low' | 'volatile'
    sellThroughRate: number
  }>
  dailySummaries: Array<{
    day: number
    startingCash: number
    ordersPlaced: number
    orderCost: number
    storageCost: number
    unitsSold: number
    revenue: number
    endingCash: number
  }>
  financials: {
    startingCash: number
    totalRevenue: number
    totalOrderCosts: number
    totalStorageCosts: number
    finalProfit: number
    profitMargin: number
  }
  inventoryMetrics: {
    averageInventoryLevel: number
    stockoutIncidents: number
    overstockCosts: number
    inventoryTurnover: number
  }
}
```

### Win/Loss Conditions
- **Win**: Meet or exceed profit target over the simulation period
- **Loss**: End with negative profit or fail to meet minimum profit threshold

---

## Simulation 7: Capital Negotiation (Unit 7 - Synthesis)

### Overview
Students negotiate funding terms with different capital providers, understanding debt vs. equity trade-offs and cost of capital.

### Parts (Key Decisions)

```typescript
interface CapitalNegotiationParts {
  // Part 1: Funding Need Assessment
  fundingNeed: {
    partId: 'capital-funding-need'
    amountNeeded: number
    purpose: string
    timeline: string
  }
  
  // Part 2: Capital Structure Decision
  structureDecision: {
    partId: 'capital-structure-decision'
    debtAmount: number
    equityAmount: number
    debtToEquityRatio: number
    justification: string
  }
  
  // Part 3: Term Negotiations
  termNegotiations: Array<{
    partId: string // e.g., 'capital-term-1'
    providerType: 'bank' | 'venture_capital' | 'angel' | 'crowdfunding'
    interestRate?: number
    equityPercentage?: number
    controlTerms: string[]
    covenants: string[]
  }>
  
  // Part 4: Final Acceptance
  finalAcceptance: {
    partId: 'capital-final-acceptance'
    totalCapitalRaised: number
    weightedAverageCostOfCapital: number
    dilutionPercentage: number
    monthlyDebtService: number
  }
}
```

### Artifact (Teacher-Readable Report)

```typescript
interface CapitalNegotiationArtifact {
  type: 'capital-negotiation-report'
  summary: {
    fundingGoal: number
    totalRaised: number
    capitalStructure: {
      debt: number
      equity: number
      ratio: number
    }
    weightedAverageCostOfCapital: number
  }
  fundingNeeds: {
    amount: number
    purpose: string
    useOfFunds: string[]
    timeline: string
  }
  negotiations: Array<{
    providerType: string
    providerName: string
    offerAmount: number
    terms: {
      interestRate?: number
      equityPercentage?: number
      valuation?: number
      boardSeats?: number
      liquidationPreference?: string
    }
    covenants: string[]
    pros: string[]
    cons: string[]
    accepted: boolean
  }>
  financialAnalysis: {
    preMoneyValuation: number
    postMoneyValuation: number
    founderDilution: number
    monthlyDebtService: number
    debtServiceCoverageRatio: number
    breakEvenRevenue: number
  }
  strategicConsiderations: {
    controlImplications: string
    futureFundingImpact: string
    exitStrategyConsiderations: string[]
  }
}
```

### Win/Loss Conditions
- **Win**: Raise required capital with WACC below threshold (e.g., 15%)
- **Partial**: Raise capital but with high cost or unfavorable terms
- **Retry**: Fail to raise required capital or accept predatory terms

---

## Simulation 8: Notebook Organizer (Unit 8 - Synthesis)

### Overview
Students complete an integrated business workflow simulation, organizing financial records and preparing statements for investor presentation.

### Parts (Key Decisions)

```typescript
interface NotebookOrganizerParts {
  // Part 1: Transaction Recording
  transactionRecording: {
    partId: 'notebook-transaction-recording'
    transactionsRecorded: Array<{
      transactionId: string
      date: string
      description: string
      debits: Array<{ account: string; amount: number }>
      credits: Array<{ account: string; amount: number }>
    }>
    accuracyScore: number
  }
  
  // Part 2: Account Balances
  accountBalances: {
    partId: 'notebook-account-balances'
    tAccountsCompleted: boolean
    trialBalanceBalanced: boolean
    adjustmentsIdentified: string[]
  }
  
  // Part 3: Financial Statement Preparation
  statementPreparation: {
    partId: 'notebook-statement-prep'
    incomeStatementComplete: boolean
    balanceSheetComplete: boolean
    statementOfEquityComplete: boolean
    statementsBalanced: boolean
  }
  
  // Part 4: Analysis and Recommendations
  analysisAndRecommendations: {
    partId: 'notebook-analysis'
    keyRatiosCalculated: Array<{
      ratioName: string
      value: number
      interpretation: string
    }>
    businessRecommendations: string[]
    investorReadinessScore: number
  }
}
```

### Artifact (Teacher-Readable Report)

```typescript
interface NotebookOrganizerArtifact {
  type: 'notebook-organizer-report'
  summary: {
    companyName: string
    periodCovered: string
    completionStatus: 'complete' | 'partial' | 'incomplete'
    investorReadinessScore: number
    overallGrade: 'excellent' | 'good' | 'needs_improvement'
  }
  transactionLog: {
    totalTransactions: number
    correctlyRecorded: number
    accuracyRate: number
    commonErrors: string[]
  }
  trialBalance: {
    totalDebits: number
    totalCredits: number
    balanced: boolean
    discrepancies: Array<{
      account: string
      expected: number
      actual: number
    }>
  }
  financialStatements: {
    incomeStatement: {
      revenue: number
      expenses: number
      netIncome: number
      complete: boolean
    }
    balanceSheet: {
      totalAssets: number
      totalLiabilities: number
      totalEquity: number
      balanced: boolean
      complete: boolean
    }
    statementOfEquity: {
      beginningEquity: number
      netIncome: number
      ownerContributions: number
      ownerDraws: number
      endingEquity: number
      complete: boolean
    }
  }
  ratioAnalysis: Array<{
    ratioName: string
    formula: string
    calculatedValue: number
    benchmark: number
    assessment: 'strong' | 'adequate' | 'needs_attention'
    interpretation: string
  }>
  investorPresentation: {
    businessHighlights: string[]
    financialStrengths: string[]
    areasForImprovement: string[]
    fundingAsk: string
    useOfFunds: string[]
  }
}
```

### Win/Loss Conditions
- **Win**: Complete all statements accurately with investor readiness score ≥ 80%
- **Partial**: Complete statements with minor errors (score 60-79%)
- **Retry**: Major errors or incomplete statements (score < 60%)

---

## Implementation Notes

### Common Requirements for All Simulations

1. **practice.v1 Contract Compliance**
   - All simulations must emit the standard submission envelope
   - Parts must have stable IDs
   - Artifacts must be teacher-readable without replaying the UI

2. **Component Key Registry**
   - Add simulation entries to the family key registry with status `implemented`
   - Use component keys like: `simulation-startup-journey`, `simulation-cash-flow`, etc.

3. **Props Interface Pattern**
   ```typescript
   interface SimulationActivityProps {
     contractVersion: 'practice.v1'
     familyKey: string // e.g., 'simulation-startup-journey'
     mode: 'guided_practice' | 'independent_practice' | 'assessment'
     prompt: {
       title: string
       stem: string
       instructions: string
     }
     scenario: {
       // Simulation-specific initial state
     }
     parts: PartDefinition[]
     artifact: ArtifactDefinition
   }
   ```

4. **Testing Requirements**
   - Unit tests for simulation logic
   - Integration tests for submission contract compliance
   - Visual regression tests for artifact rendering

5. **Lesson Integration**
   - Unit 1 Lesson 1: Startup Journey (Discovery)
   - Unit 2 Lesson 1: Cash Flow Challenge (Discovery)
   - Unit 3 Lesson 7: Business Stress Test (Synthesis)
   - Unit 4 Lesson 7: Pay Structure Decision Lab (Synthesis)
   - Unit 5 Lesson 1: Asset Time Machine (Discovery)
   - Unit 6 Lesson 7: Inventory Manager (Synthesis)
   - Unit 7 Lesson 7: Capital Negotiation (Synthesis)
   - Unit 8 Lesson 7: Notebook Organizer (Synthesis)

---

## Archive/Deprecate List

The following simulations are NOT part of the 8 core and should be archived or removed:

1. **LemonadeStand** - Conceptually overlaps with Startup Journey; simpler but less comprehensive
2. **CafeSupplyChaos** - Overlaps with Inventory Manager
3. **GrowthPuzzle** - Overlaps with Startup Journey
4. **PitchPresentationBuilder** - Can be replaced by Notebook Organizer's presentation output
5. **BudgetBalancer** - Can be integrated into other simulations as a sub-component

These simulations may be kept as optional enrichment or deleted if they have no active curriculum references.
