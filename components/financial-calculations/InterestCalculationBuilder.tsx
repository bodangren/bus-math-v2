'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, DollarSign, TrendingUp, Calendar, AlertTriangle, CheckCircle, RefreshCw, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

// Types
interface BusinessScenario {
  id: string
  title: string
  description: string
  context: string
  calculationType: 'simple' | 'compound' | 'annuity' | 'presentValue'
  defaultValues: {
    principal?: number
    rate?: number
    time?: number
    payment?: number
    periods?: number
    futureValue?: number
  }
  businessApplication: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  formula: string
  excelFunction: string
}

interface CalculationResult {
  result: number
  formula: string
  interpretation: string
  businessAdvice: string
  excelFormula: string
}

// Business scenarios focused on payroll and cash flow management
const BUSINESS_SCENARIOS: BusinessScenario[] = [
  {
    id: 'payroll-bridge-loan',
    title: 'Payroll Bridge Loan',
    description: 'Need immediate cash to cover payroll while waiting for client payments',
    context: 'Your small business has $15,000 in payroll due but invoices won\'t be paid for 30 days. You need a short-term loan.',
    calculationType: 'simple',
    defaultValues: { principal: 15000, rate: 8.5, time: 30 },
    businessApplication: 'Calculate the cost of short-term financing to maintain payroll timing',
    difficulty: 'Easy',
    formula: 'Interest = Principal × Rate × Time',
    excelFunction: '=Principal * (Rate/100) * (Time/365)'
  },
  {
    id: 'equipment-financing',
    title: 'POS System Equipment Loan',
    description: 'Finance a new point-of-sale system to improve operational efficiency',
    context: 'Investing $25,000 in a new POS system at 6.5% annual rate with 36-month financing to reduce labor costs.',
    calculationType: 'annuity',
    defaultValues: { principal: 25000, rate: 6.5, periods: 36 },
    businessApplication: 'Calculate monthly payments for equipment that improves payroll efficiency',
    difficulty: 'Medium',
    formula: 'PMT = PV × [r(1+r)^n] / [(1+r)^n - 1]',
    excelFunction: '=PMT(Rate/12, Periods, -Principal)'
  },
  {
    id: 'invoice-factoring',
    title: 'Invoice Factoring for Cash Flow',
    description: 'Sell invoices at a discount to get immediate cash for operations',
    context: 'Factor $12,000 in invoices at 3% monthly rate to get immediate cash for payroll and rent.',
    calculationType: 'simple',
    defaultValues: { principal: 12000, rate: 3, time: 1 },
    businessApplication: 'Calculate the cost of immediate cash versus waiting for payment',
    difficulty: 'Medium',
    formula: 'Net Cash = Principal - (Principal × Rate × Time)',
    excelFunction: '=Principal - (Principal * Rate/100 * Time)'
  },
  {
    id: 'emergency-fund-growth',
    title: 'Emergency Fund Planning',
    description: 'Build an emergency fund to avoid future cash flow crises',
    context: 'Save monthly to build a $20,000 emergency fund earning 4.2% annually to cover 3 months of expenses.',
    calculationType: 'compound',
    defaultValues: { futureValue: 20000, rate: 4.2, periods: 24 },
    businessApplication: 'Plan savings strategy to avoid future payroll financing needs',
    difficulty: 'Hard',
    formula: 'FV = PV × (1 + r)^n',
    excelFunction: '=FV(Rate/12, Periods, -Payment, 0)'
  },
  {
    id: 'credit-line-interest',
    title: 'Business Credit Line',
    description: 'Calculate interest on revolving credit for operational flexibility',
    context: 'Maintain a $30,000 credit line at 12% annual rate for unexpected payroll or operational expenses.',
    calculationType: 'simple',
    defaultValues: { principal: 30000, rate: 12, time: 90 },
    businessApplication: 'Understand the cost of maintaining credit availability for cash flow gaps',
    difficulty: 'Easy',
    formula: 'Interest = Principal × Rate × (Days/365)',
    excelFunction: '=Principal * (Rate/100) * (Time/365)'
  },
  {
    id: 'lease-vs-buy',
    title: 'Equipment Lease Analysis',
    description: 'Compare leasing versus buying equipment for cash flow impact',
    context: 'Compare $800 monthly lease versus $22,000 purchase (financed at 7.5% for 36 months) for kitchen equipment.',
    calculationType: 'presentValue',
    defaultValues: { payment: 800, rate: 7.5, periods: 36 },
    businessApplication: 'Evaluate financing options impact on monthly cash flow and payroll capacity',
    difficulty: 'Hard',
    formula: 'PV = PMT × [1 - (1+r)^-n] / r',
    excelFunction: '=PV(Rate/12, Periods, -Payment)'
  }
]

export default function InterestCalculationBuilder() {
  const [selectedScenario, setSelectedScenario] = useState<BusinessScenario>(BUSINESS_SCENARIOS[0])
  const [values, setValues] = useState(selectedScenario.defaultValues)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [calculationHistory, setCalculationHistory] = useState<CalculationResult[]>([])

  // Calculate interest based on selected scenario
  const calculateInterest = useCallback(() => {
    try {
      let calculatedResult: number
      let interpretationText: string
      let businessAdviceText: string
      let excelFormulaText: string

      switch (selectedScenario.calculationType) {
        case 'simple':
          const principal = values.principal || 0
          const rate = (values.rate || 0) / 100
          const time = (values.time || 0) / 365

          if (selectedScenario.id === 'invoice-factoring') {
            calculatedResult = principal - (principal * rate * (values.time || 1))
            interpretationText = `You'll receive $${calculatedResult.toFixed(2)} immediately instead of waiting for the full $${principal.toFixed(2)}`
            businessAdviceText = `The cost of immediate cash is $${(principal - calculatedResult).toFixed(2)}. Consider if this cost is worth avoiding cash flow problems.`
          } else {
            calculatedResult = principal * rate * time
            interpretationText = `Total interest cost: $${calculatedResult.toFixed(2)} on the $${principal.toFixed(2)} loan`
            businessAdviceText = `This ${time * 365}-day loan costs ${((calculatedResult / principal) * 100).toFixed(2)}% of the borrowed amount. Plan for repayment.`
          }
          excelFormulaText = selectedScenario.excelFunction
          break

        case 'compound':
          const fv = values.futureValue || 0
          const compoundRate = (values.rate || 0) / 100 / 12
          const compoundPeriods = values.periods || 0

          calculatedResult = fv / Math.pow(1 + compoundRate, compoundPeriods)
          interpretationText = `Monthly savings needed: $${calculatedResult.toFixed(2)} to reach your $${fv.toFixed(2)} goal`
          businessAdviceText = `Building this emergency fund eliminates future financing costs and reduces business risk significantly.`
          excelFormulaText = `=PMT(${(values.rate || 0) / 100}/12, ${compoundPeriods}, 0, -${fv})`
          break

        case 'annuity':
          const loanAmount = values.principal || 0
          const monthlyRate = (values.rate || 0) / 100 / 12
          const numPayments = values.periods || 0

          calculatedResult = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                           (Math.pow(1 + monthlyRate, numPayments) - 1)
          interpretationText = `Monthly payment: $${calculatedResult.toFixed(2)} for ${numPayments} months`
          businessAdviceText = `Total cost: $${(calculatedResult * numPayments).toFixed(2)} vs $${loanAmount.toFixed(2)} financed. Budget this payment into monthly cash flow.`
          excelFormulaText = selectedScenario.excelFunction
          break

        case 'presentValue':
          const monthlyPayment = values.payment || 0
          const pvRate = (values.rate || 0) / 100 / 12
          const pvPeriods = values.periods || 0

          calculatedResult = monthlyPayment * (1 - Math.pow(1 + pvRate, -pvPeriods)) / pvRate
          interpretationText = `Present value of lease payments: $${calculatedResult.toFixed(2)}`
          businessAdviceText = `Compare this to the purchase price to determine the better financial choice for your cash flow needs.`
          excelFormulaText = selectedScenario.excelFunction
          break

        default:
          throw new Error('Unknown calculation type')
      }

      const newResult: CalculationResult = {
        result: calculatedResult,
        formula: selectedScenario.formula,
        interpretation: interpretationText,
        businessAdvice: businessAdviceText,
        excelFormula: excelFormulaText
      }

      setResult(newResult)
      setCalculationHistory(prev => [newResult, ...prev.slice(0, 4)]) // Keep last 5 calculations

    } catch {
      setResult({
        result: 0,
        formula: 'Error',
        interpretation: 'Calculation failed. Please check your input values.',
        businessAdvice: 'Ensure all required fields are filled with valid positive numbers.',
        excelFormula: 'Error'
      })
    }
  }, [selectedScenario, values])

  // Handle scenario change
  const handleScenarioChange = useCallback((scenario: BusinessScenario) => {
    setSelectedScenario(scenario)
    setValues(scenario.defaultValues)
    setResult(null)
  }, [])

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setValues(prev => ({ ...prev, [field]: numValue }))
  }, [])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setValues(selectedScenario.defaultValues)
    setResult(null)
  }, [selectedScenario])

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl">💰</span>
          <h1 className="text-3xl font-bold text-gray-900">Interest Calculation Builder</h1>
          <span className="text-4xl">📊</span>
        </div>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Master interest calculations for business cash flow management. Build the mathematical skills needed
          for Unit 5 PayDay Simulator - where timing payroll with cash flow is critical for business success.
        </p>

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 mr-4"
          >
            <HelpCircle className="w-4 h-4" />
            How to Use
            {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            {showFormulas ? 'Hide' : 'Show'} Formulas
          </Button>
        </div>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              How to Use the Interest Calculation Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Learning Objectives</h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Calculate interest costs for business financing needs</li>
                <li>• Understand different types of interest calculations for cash flow management</li>
                <li>• Learn Excel financial functions for real-world business analysis</li>
                <li>• Connect mathematical concepts to payroll timing and operational financing</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-blue-800 mb-2">📋 Step-by-Step Instructions</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                <li>Choose a business scenario from the tabs above</li>
                <li>Review the business context and default values</li>
                <li>Adjust input values to explore different scenarios</li>
                <li>Click &quot;Calculate&quot; to see results and business interpretation</li>
                <li>Review the Excel formula for spreadsheet implementation</li>
                <li>Try different scenarios to understand various financing options</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-blue-800 mb-2">💡 Business Context</h4>
              <p className="text-blue-700 text-sm">
                These calculations help business owners make informed decisions about financing, cash flow management,
                and the true cost of different financial options. Understanding interest calculations is essential for
                managing payroll timing, equipment purchases, and operational cash flow challenges.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Selection Tabs */}
      <Tabs value={selectedScenario.id} onValueChange={(value) => {
        const scenario = BUSINESS_SCENARIOS.find(s => s.id === value)
        if (scenario) handleScenarioChange(scenario)
      }}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {BUSINESS_SCENARIOS.map((scenario) => (
            <TabsTrigger key={scenario.id} value={scenario.id} className="text-xs">
              {scenario.title.split(' ')[0]} {scenario.title.split(' ')[1]}
            </TabsTrigger>
          ))}
        </TabsList>

        {BUSINESS_SCENARIOS.map((scenario) => (
          <TabsContent key={scenario.id} value={scenario.id}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scenario Information & Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {scenario.title}
                    <Badge variant={scenario.difficulty === 'Hard' ? 'destructive' : scenario.difficulty === 'Medium' ? 'secondary' : 'outline'}>
                      {scenario.difficulty}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Business Context:</h4>
                    <p className="text-sm text-gray-700">{scenario.context}</p>
                  </div>

                  {showFormulas && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Mathematical Formula:
                      </h4>
                      <p className="text-sm text-blue-700 font-mono mb-2">{scenario.formula}</p>
                      <p className="text-sm text-blue-700">
                        <strong>Excel Function:</strong> <code className="bg-white px-2 py-1 rounded">{scenario.excelFunction}</code>
                      </p>
                    </div>
                  )}

                  {/* Input Fields */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Input Values:</h4>

                    {scenario.defaultValues.principal !== undefined && (
                      <div>
                        <Label htmlFor="principal">Principal Amount ($)</Label>
                        <Input
                          id="principal"
                          type="number"
                          value={values.principal || ''}
                          onChange={(e) => handleInputChange('principal', e.target.value)}
                          placeholder="Enter principal amount"
                        />
                      </div>
                    )}

                    {scenario.defaultValues.rate !== undefined && (
                      <div>
                        <Label htmlFor="rate">Interest Rate (%)</Label>
                        <Input
                          id="rate"
                          type="number"
                          step="0.1"
                          value={values.rate || ''}
                          onChange={(e) => handleInputChange('rate', e.target.value)}
                          placeholder="Enter annual interest rate"
                        />
                      </div>
                    )}

                    {scenario.defaultValues.time !== undefined && (
                      <div>
                        <Label htmlFor="time">Time Period (days)</Label>
                        <Input
                          id="time"
                          type="number"
                          value={values.time || ''}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          placeholder="Enter time in days"
                        />
                      </div>
                    )}

                    {scenario.defaultValues.periods !== undefined && (
                      <div>
                        <Label htmlFor="periods">Number of Periods (months)</Label>
                        <Input
                          id="periods"
                          type="number"
                          value={values.periods || ''}
                          onChange={(e) => handleInputChange('periods', e.target.value)}
                          placeholder="Enter number of periods"
                        />
                      </div>
                    )}

                    {scenario.defaultValues.payment !== undefined && (
                      <div>
                        <Label htmlFor="payment">Monthly Payment ($)</Label>
                        <Input
                          id="payment"
                          type="number"
                          value={values.payment || ''}
                          onChange={(e) => handleInputChange('payment', e.target.value)}
                          placeholder="Enter monthly payment"
                        />
                      </div>
                    )}

                    {scenario.defaultValues.futureValue !== undefined && (
                      <div>
                        <Label htmlFor="futureValue">Future Value Goal ($)</Label>
                        <Input
                          id="futureValue"
                          type="number"
                          value={values.futureValue || ''}
                          onChange={(e) => handleInputChange('futureValue', e.target.value)}
                          placeholder="Enter target future value"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button onClick={calculateInterest} className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Calculate
                    </Button>
                    <Button onClick={resetToDefaults} variant="outline" className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Calculation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-6">
                      {/* Main Result */}
                      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-3xl font-bold text-green-700 mb-2">
                          ${result.result.toFixed(2)}
                        </div>
                        <p className="text-green-600">{result.interpretation}</p>
                      </div>

                      {/* Business Advice */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Business Advice:
                        </h4>
                        <p className="text-blue-700 text-sm">{result.businessAdvice}</p>
                      </div>

                      {/* Excel Implementation */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Excel Formula:</h4>
                        <code className="text-sm bg-white px-3 py-2 rounded border block">
                          {result.excelFormula}
                        </code>
                      </div>

                      {/* Mathematical Formula */}
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-800 mb-2">Mathematical Formula Used:</h4>
                        <code className="text-sm text-purple-700">{result.formula}</code>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter values and click &quot;Calculate&quot; to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Calculation History */}
      {calculationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Calculations
            </CardTitle>
            <CardDescription>Your last few calculations for comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calculationHistory.map((calc, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg text-gray-800">
                    ${calc.result.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{calc.interpretation}</p>
                  <code className="text-xs bg-white px-2 py-1 rounded">{calc.excelFormula}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Notes */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">PayDay Simulator Connection</h3>
              <p className="text-yellow-700 mb-3">
                These interest calculations are essential for Unit 5 PayDay Simulator, where students learn to:
              </p>
              <ul className="text-yellow-700 space-y-1 text-sm">
                <li>• Plan financing for payroll timing challenges</li>
                <li>• Evaluate the true cost of different cash flow solutions</li>
                <li>• Build Excel models that automate financial decision making</li>
                <li>• Understand how interest impacts business profitability and cash flow</li>
                <li>• Make informed decisions about equipment financing versus leasing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
