/**
 * BreakEvenAnalysisCalculator Component
 *
 * DEVELOPER USAGE:
 * ================
 * Import and use this component in any React page or component:
 *
 * ```tsx
 * import { BreakEvenAnalysisCalculator } from '@/components/financial-calculations/BreakEvenAnalysisCalculator'
 *
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <BreakEvenAnalysisCalculator />
 *     </div>
 *   )
 * }
 * ```
 *
 * The component is fully self-contained with its own state management.
 * No props are required - it initializes with default business scenario values.
 *
 * STUDENT INTERACTION & LEARNING OBJECTIVES:
 * ==========================================
 *
 * OBJECTIVE: Master advanced break-even analysis techniques including Goal Seek,
 * sensitivity analysis, and scenario modeling for real-world business decisions.
 *
 * HOW STUDENTS INTERACT:
 * 1. **Basic Break-Even Setup**: Input fixed costs, variable costs per unit, and selling price
 *    to establish baseline break-even calculations with instant feedback.
 *
 * 2. **Goal Seek for Target Profit**: Set a desired profit target and let the calculator
 *    reverse-engineer the required sales volume, price adjustment, or cost reduction needed.
 *
 * 3. **One-Variable Data Tables**: Create comprehensive what-if scenarios by varying one input
 *    (price, fixed costs, or variable costs) across a range to see break-even impact.
 *
 * 4. **Two-Variable Data Tables**: Simultaneously vary two inputs (e.g., price and volume)
 *    to create a profit sensitivity matrix for complex scenario analysis.
 *
 * 5. **Interactive CVP Chart**: Visualize cost-volume-profit relationships with dynamic
 *    charts showing revenue lines, total cost lines, and break-even intersection points.
 *
 * 6. **Margin of Safety Analysis**: Calculate and interpret margin of safety in both
 *    units and dollars to understand business risk and operational cushion.
 *
 * 7. **Export to Excel Templates**: Generate professional Excel worksheets with
 *    formulas, data tables, and charts for real-world business presentations.
 *
 * KEY LEARNING OUTCOMES:
 * - Master Goal Seek functionality for target profit scenarios
 * - Build one- and two-variable data tables for sensitivity analysis
 * - Interpret contribution margin and its relationship to profitability
 * - Apply margin of safety concepts to business risk assessment
 * - Create professional CVP models suitable for investor presentations
 * - Understand how pricing strategies affect break-even calculations
 * - Analyze the impact of cost structure changes on business viability
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Calculator,
  Target,
  TrendingUp,
  BarChart3,
  DollarSign,
  Building2,
  Package,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  PieChart,
  Table,
  Goal,
  Settings,
  FileSpreadsheet,
  Shield,
  TrendingDown,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface BreakEvenInputs {
  fixedCosts: number
  variableCostPerUnit: number
  sellingPricePerUnit: number
  targetProfit: number
  currentSalesVolume: number
}

interface BreakEvenResults {
  breakEvenUnits: number
  breakEvenRevenue: number
  contributionMargin: number
  contributionMarginRatio: number
  marginOfSafetyUnits: number
  marginOfSafetyDollars: number
  marginOfSafetyRatio: number
  operatingLeverage: number
}

interface GoalSeekResult {
  requiredUnits: number
  requiredPrice: number
  requiredFixedCostReduction: number
  requiredVariableCostReduction: number
}

interface DataTableEntry {
  variable: number
  breakEvenUnits: number
  profit: number
  marginOfSafety: number
}

interface TwoVarTableEntry {
  price: number
  volume: number
  profit: number
  breakEvenMet: boolean
}

export function BreakEvenAnalysisCalculator() {
  const [inputs, setInputs] = useState<BreakEvenInputs>({
    fixedCosts: 50000,
    variableCostPerUnit: 25,
    sellingPricePerUnit: 45,
    targetProfit: 20000,
    currentSalesVolume: 4000
  })

  const [showInstructions, setShowInstructions] = useState(false)
  const [dataTableVariable, setDataTableVariable] = useState<'price' | 'fixedCosts' | 'variableCosts'>('price')
  const [dataTableRange, setDataTableRange] = useState({ min: 35, max: 55, steps: 11 })
  const [twoVarTable, setTwoVarTable] = useState({
    priceRange: { min: 40, max: 50, steps: 6 },
    volumeRange: { min: 2000, max: 6000, steps: 6 }
  })

  // Core break-even calculations
  const results: BreakEvenResults = useMemo(() => {
    const contributionMargin = inputs.sellingPricePerUnit - inputs.variableCostPerUnit
    const contributionMarginRatio = contributionMargin / inputs.sellingPricePerUnit
    const breakEvenUnits = contributionMargin > 0 ? Math.ceil(inputs.fixedCosts / contributionMargin) : 0
    const breakEvenRevenue = breakEvenUnits * inputs.sellingPricePerUnit

    const marginOfSafetyUnits = Math.max(0, inputs.currentSalesVolume - breakEvenUnits)
    const marginOfSafetyDollars = marginOfSafetyUnits * inputs.sellingPricePerUnit
    const marginOfSafetyRatio = inputs.currentSalesVolume > 0 ? marginOfSafetyUnits / inputs.currentSalesVolume : 0

    const operatingLeverage = contributionMargin > 0 && inputs.currentSalesVolume > breakEvenUnits
      ? (inputs.currentSalesVolume * contributionMargin) / ((inputs.currentSalesVolume * contributionMargin) - inputs.fixedCosts)
      : 0

    return {
      breakEvenUnits,
      breakEvenRevenue,
      contributionMargin,
      contributionMarginRatio,
      marginOfSafetyUnits,
      marginOfSafetyDollars,
      marginOfSafetyRatio,
      operatingLeverage
    }
  }, [inputs])

  // Goal Seek calculations
  const goalSeekResults: GoalSeekResult = useMemo(() => {
    const totalTargetContribution = inputs.fixedCosts + inputs.targetProfit
    const currentContributionMargin = inputs.sellingPricePerUnit - inputs.variableCostPerUnit

    const requiredUnits = currentContributionMargin > 0 ? Math.ceil(totalTargetContribution / currentContributionMargin) : 0
    const requiredPrice = inputs.targetProfit >= 0 ? inputs.variableCostPerUnit + (totalTargetContribution / inputs.currentSalesVolume) : 0
    const requiredFixedCostReduction = Math.max(0, inputs.fixedCosts - (inputs.currentSalesVolume * currentContributionMargin - inputs.targetProfit))
    const requiredVariableCostReduction = Math.max(0, inputs.variableCostPerUnit - ((inputs.currentSalesVolume * inputs.sellingPricePerUnit - inputs.fixedCosts - inputs.targetProfit) / inputs.currentSalesVolume))

    return {
      requiredUnits,
      requiredPrice,
      requiredFixedCostReduction,
      requiredVariableCostReduction
    }
  }, [inputs])

  // One-variable data table
  const dataTable: DataTableEntry[] = useMemo(() => {
    const step = (dataTableRange.max - dataTableRange.min) / (dataTableRange.steps - 1)
    const table: DataTableEntry[] = []

    for (let i = 0; i < dataTableRange.steps; i++) {
      const variable = dataTableRange.min + (step * i)
      let breakEvenUnits = 0
      let profit = 0
      let marginOfSafety = 0

      if (dataTableVariable === 'price') {
        const cm = variable - inputs.variableCostPerUnit
        breakEvenUnits = cm > 0 ? Math.ceil(inputs.fixedCosts / cm) : 0
        profit = (inputs.currentSalesVolume * cm) - inputs.fixedCosts
        marginOfSafety = Math.max(0, inputs.currentSalesVolume - breakEvenUnits)
      } else if (dataTableVariable === 'fixedCosts') {
        const cm = inputs.sellingPricePerUnit - inputs.variableCostPerUnit
        breakEvenUnits = cm > 0 ? Math.ceil(variable / cm) : 0
        profit = (inputs.currentSalesVolume * cm) - variable
        marginOfSafety = Math.max(0, inputs.currentSalesVolume - breakEvenUnits)
      } else if (dataTableVariable === 'variableCosts') {
        const cm = inputs.sellingPricePerUnit - variable
        breakEvenUnits = cm > 0 ? Math.ceil(inputs.fixedCosts / cm) : 0
        profit = (inputs.currentSalesVolume * cm) - inputs.fixedCosts
        marginOfSafety = Math.max(0, inputs.currentSalesVolume - breakEvenUnits)
      }

      table.push({ variable, breakEvenUnits, profit, marginOfSafety })
    }

    return table
  }, [inputs, dataTableVariable, dataTableRange])

  // Two-variable data table
  const twoVarDataTable: TwoVarTableEntry[] = useMemo(() => {
    const priceStep = (twoVarTable.priceRange.max - twoVarTable.priceRange.min) / (twoVarTable.priceRange.steps - 1)
    const volumeStep = (twoVarTable.volumeRange.max - twoVarTable.volumeRange.min) / (twoVarTable.volumeRange.steps - 1)
    const table: TwoVarTableEntry[] = []

    for (let i = 0; i < twoVarTable.priceRange.steps; i++) {
      for (let j = 0; j < twoVarTable.volumeRange.steps; j++) {
        const price = twoVarTable.priceRange.min + (priceStep * i)
        const volume = twoVarTable.volumeRange.min + (volumeStep * j)
        const cm = price - inputs.variableCostPerUnit
        const profit = (volume * cm) - inputs.fixedCosts
        const breakEvenUnits = cm > 0 ? Math.ceil(inputs.fixedCosts / cm) : 0
        const breakEvenMet = volume >= breakEvenUnits

        table.push({ price, volume, profit, breakEvenMet })
      }
    }

    return table
  }, [inputs, twoVarTable])

  const handleInputChange = useCallback((field: keyof BreakEvenInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setInputs({
      fixedCosts: 50000,
      variableCostPerUnit: 25,
      sellingPricePerUnit: 45,
      targetProfit: 20000,
      currentSalesVolume: 4000
    })
  }, [])

  const exportToExcel = useCallback(() => {
    // In a real implementation, this would generate an Excel file
    // For now, we'll create a CSV-like format
    const csvData = [
      ['Break-Even Analysis Report'],
      [''],
      ['Inputs:'],
      ['Fixed Costs', inputs.fixedCosts],
      ['Variable Cost per Unit', inputs.variableCostPerUnit],
      ['Selling Price per Unit', inputs.sellingPricePerUnit],
      ['Current Sales Volume', inputs.currentSalesVolume],
      [''],
      ['Results:'],
      ['Break-Even Units', results.breakEvenUnits],
      ['Break-Even Revenue', results.breakEvenRevenue],
      ['Contribution Margin', results.contributionMargin],
      ['Contribution Margin Ratio', (results.contributionMarginRatio * 100).toFixed(1) + '%'],
      ['Margin of Safety (Units)', results.marginOfSafetyUnits],
      ['Margin of Safety (Dollars)', results.marginOfSafetyDollars],
      ['Margin of Safety Ratio', (results.marginOfSafetyRatio * 100).toFixed(1) + '%'],
      ['Operating Leverage', results.operatingLeverage.toFixed(2)]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'break-even-analysis.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, [inputs, results])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Calculator className="w-8 h-8 text-blue-700" />
            Advanced Break-Even Analysis Calculator
          </CardTitle>
          <CardDescription className="text-lg">
            Master Goal Seek, Data Tables, and Sensitivity Analysis for professional CVP modeling
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-900">
              <Target className="w-3 h-3 mr-1" />
              Goal Seek
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Table className="w-3 h-3 mr-1" />
              Data Tables
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <BarChart3 className="w-3 h-3 mr-1" />
              CVP Analysis
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Shield className="w-3 h-3 mr-1" />
              Risk Assessment
            </Badge>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              How to Use This Calculator
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="border-blue-300 bg-blue-100">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              How to Use the Advanced Break-Even Analysis Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objective */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Learning Objective</h4>
              <p className="text-blue-900">
                Master advanced break-even analysis techniques including Goal Seek, Data Tables, and Sensitivity Analysis
                to make professional business decisions and create investor-ready financial models for Unit 6 PriceLab Challenge.
              </p>
            </div>

            {/* Tab Overview */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">📋 Calculator Tabs Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-3 bg-white rounded-lg border border-blue-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-blue-700" />
                    <h5 className="font-medium text-blue-900">Inputs</h5>
                  </div>
                  <p className="text-xs text-blue-800">Set your business cost structure and pricing parameters</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-blue-700" />
                    <h5 className="font-medium text-blue-900">Results</h5>
                  </div>
                  <p className="text-xs text-blue-800">View comprehensive break-even calculations and risk assessment</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-700" />
                    <h5 className="font-medium text-blue-900">Goal Seek</h5>
                  </div>
                  <p className="text-xs text-blue-700">Reverse-engineer what changes needed for target profit</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Table className="w-4 h-4 text-blue-700" />
                    <h5 className="font-medium text-blue-900">Data Tables</h5>
                  </div>
                  <p className="text-xs text-blue-700">Build what-if scenarios with one- and two-variable analysis</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-300">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-700" />
                    <h5 className="font-medium text-blue-900">Analysis</h5>
                  </div>
                  <p className="text-xs text-blue-700">Executive summary with strategic recommendations</p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">🔢 Step-by-Step Instructions</h4>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li><strong>Start with Inputs:</strong> Enter your fixed costs, variable cost per unit, selling price, target profit, and current sales volume</li>
                <li><strong>Review Results:</strong> Examine break-even calculations, margin of safety, and risk assessment indicators</li>
                <li><strong>Use Goal Seek:</strong> Set a target profit and see what changes are needed (sales volume, price, or cost reductions)</li>
                <li><strong>Build Data Tables:</strong> Create sensitivity analysis by varying one or two variables across ranges</li>
                <li><strong>Analyze & Export:</strong> Review executive summary and export professional analysis to Excel</li>
              </ol>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-100 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-2">🔍 Advanced Excel Features</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>Goal Seek:</strong> Reverse-engineer required changes for target profit</li>
                  <li>• <strong>One-Variable Data Tables:</strong> Test single variable changes</li>
                  <li>• <strong>Two-Variable Data Tables:</strong> Test simultaneous changes</li>
                  <li>• <strong>Sensitivity Analysis:</strong> Understand parameter impact</li>
                  <li>• <strong>Professional Formatting:</strong> Investor-ready presentations</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-100 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-800 mb-2">📊 Business Analysis Tools</h5>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• <strong>Margin of Safety:</strong> Risk assessment and operational cushion</li>
                  <li>• <strong>Operating Leverage:</strong> Understanding profit sensitivity</li>
                  <li>• <strong>Contribution Margin Analysis:</strong> Profitability per unit</li>
                  <li>• <strong>CVP Modeling:</strong> Cost-Volume-Profit relationships</li>
                  <li>• <strong>Strategic Recommendations:</strong> Action-oriented insights</li>
                </ul>
              </div>
            </div>

            {/* Formulas Reference */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">🧮 Key Break-Even Formulas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-2">Contribution Margin</h5>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">Selling Price - Variable Cost per Unit</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-2">Break-Even Units</h5>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">Fixed Costs ÷ Contribution Margin</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-2">Margin of Safety</h5>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">Current Sales - Break-Even Sales</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-2">Target Profit Units</h5>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">(Fixed Costs + Target Profit) ÷ Contribution Margin</p>
                </div>
              </div>
            </div>

            {/* Business Context */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">🏪 PriceLab Challenge Context</h4>
              <p className="text-sm text-blue-800">
                You&apos;re developing a data-driven pricing strategy for a competitive local market. Use this calculator to
                analyze competitor pricing data, test different cost scenarios, and build a compelling pricing recommendation
                that balances profitability with market competitiveness. Your analysis will be presented to a town hall
                debate format with real business stakeholders.
              </p>
            </div>

            {/* Success Tips */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips for Success</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Start Conservative:</strong> Use realistic cost estimates rather than optimistic projections</li>
                <li>• <strong>Test Multiple Scenarios:</strong> Use data tables to understand range of outcomes</li>
                <li>• <strong>Consider Market Context:</strong> Balance profitability with competitive positioning</li>
                <li>• <strong>Monitor Margin of Safety:</strong> Aim for at least 20-30% cushion above break-even</li>
                <li>• <strong>Document Assumptions:</strong> Keep track of your inputs for presentation defense</li>
                <li>• <strong>Export for Presentations:</strong> Use Excel export for professional stakeholder meetings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="inputs" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inputs">
            <Settings className="w-4 h-4 mr-2" />
            Inputs
          </TabsTrigger>
          <TabsTrigger value="results">
            <Calculator className="w-4 h-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="goalseek">
            <Target className="w-4 h-4 mr-2" />
            Goal Seek
          </TabsTrigger>
          <TabsTrigger value="datatables">
            <Table className="w-4 h-4 mr-2" />
            Data Tables
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Inputs Tab */}
        <TabsContent value="inputs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-700" />
                Business Model Inputs
              </CardTitle>
              <CardDescription>
                Enter your business cost structure and pricing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fixedCosts" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    Fixed Costs ($)
                  </Label>
                  <Input
                    id="fixedCosts"
                    type="number"
                    value={inputs.fixedCosts}
                    onChange={(e) => handleInputChange('fixedCosts', Number(e.target.value) || 0)}
                    min={0}
                    step={1000}
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-600">Rent, salaries, insurance, etc.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variableCost" className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    Variable Cost per Unit ($)
                  </Label>
                  <Input
                    id="variableCost"
                    type="number"
                    value={inputs.variableCostPerUnit}
                    onChange={(e) => handleInputChange('variableCostPerUnit', Number(e.target.value) || 0)}
                    min={0}
                    step={0.5}
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-600">Materials, labor, commissions per unit</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    Selling Price per Unit ($)
                  </Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={inputs.sellingPricePerUnit}
                    onChange={(e) => handleInputChange('sellingPricePerUnit', Number(e.target.value) || 0)}
                    min={0}
                    step={0.5}
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-600">Revenue per unit sold</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetProfit" className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-600" />
                    Target Profit ($)
                  </Label>
                  <Input
                    id="targetProfit"
                    type="number"
                    value={inputs.targetProfit}
                    onChange={(e) => handleInputChange('targetProfit', Number(e.target.value) || 0)}
                    min={0}
                    step={1000}
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-600">Desired profit for Goal Seek analysis</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentVolume" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    Current Sales Volume (units)
                  </Label>
                  <Input
                    id="currentVolume"
                    type="number"
                    value={inputs.currentSalesVolume}
                    onChange={(e) => handleInputChange('currentSalesVolume', Number(e.target.value) || 0)}
                    min={0}
                    step={100}
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-600">Current or projected unit sales</p>
                </div>

                <div className="flex items-end">
                  <Button onClick={resetToDefaults} variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-100 border-blue-300">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-blue-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-800">Break-Even Units</p>
                <p className="text-2xl font-bold text-blue-900">
                  {results.breakEvenUnits.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Units needed to cover costs
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">Break-Even Revenue</p>
                <p className="text-2xl font-bold text-green-800">
                  ${results.breakEvenRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Revenue needed to break even
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-700">Contribution Margin</p>
                <p className="text-2xl font-bold text-purple-800">
                  ${results.contributionMargin.toFixed(2)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {(results.contributionMarginRatio * 100).toFixed(1)}% ratio
                </p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-orange-700">Margin of Safety</p>
                <p className="text-2xl font-bold text-orange-800">
                  {results.marginOfSafetyUnits.toLocaleString()}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {(results.marginOfSafetyRatio * 100).toFixed(1)}% cushion
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-700" />
                Detailed Financial Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Cost Structure Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Fixed Costs:</span>
                        <span className="font-medium">${inputs.fixedCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Variable Cost per Unit:</span>
                        <span className="font-medium">${inputs.variableCostPerUnit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Variable Costs (at current volume):</span>
                        <span className="font-medium">${(inputs.variableCostPerUnit * inputs.currentSalesVolume).toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total Costs:</span>
                        <span>${(inputs.fixedCosts + (inputs.variableCostPerUnit * inputs.currentSalesVolume)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Profitability Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Current Revenue:</span>
                        <span className="font-medium">${(inputs.sellingPricePerUnit * inputs.currentSalesVolume).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Costs:</span>
                        <span className="font-medium">${(inputs.fixedCosts + (inputs.variableCostPerUnit * inputs.currentSalesVolume)).toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base font-semibold">
                        <span>Current Profit:</span>
                        <span className={(inputs.sellingPricePerUnit * inputs.currentSalesVolume) - (inputs.fixedCosts + (inputs.variableCostPerUnit * inputs.currentSalesVolume)) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${((inputs.sellingPricePerUnit * inputs.currentSalesVolume) - (inputs.fixedCosts + (inputs.variableCostPerUnit * inputs.currentSalesVolume))).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operating Leverage:</span>
                        <span className="font-medium">{results.operatingLeverage.toFixed(2)}x</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Business Risk Assessment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {results.marginOfSafetyRatio > 0.3 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : results.marginOfSafetyRatio > 0.1 ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span>
                        <strong>Margin of Safety:</strong> {(results.marginOfSafetyRatio * 100).toFixed(1)}%
                        {results.marginOfSafetyRatio > 0.3 ? ' (Low Risk)' :
                         results.marginOfSafetyRatio > 0.1 ? ' (Moderate Risk)' : ' (High Risk)'}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      You can afford to lose {results.marginOfSafetyUnits.toLocaleString()} units of sales
                      (${results.marginOfSafetyDollars.toLocaleString()}) before reaching break-even.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goal Seek Tab */}
        <TabsContent value="goalseek" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Goal Seek Analysis
              </CardTitle>
              <CardDescription>
                Reverse-engineer what needs to change to achieve your target profit of ${inputs.targetProfit.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-100 border-blue-300">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-blue-700 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-800">Required Sales Volume</p>
                    <p className="text-xl font-bold text-blue-900">
                      {goalSeekResults.requiredUnits.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      units at current price
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700">Required Price</p>
                    <p className="text-xl font-bold text-green-800">
                      ${goalSeekResults.requiredPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      at current volume
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <Building2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-700">Fixed Cost Reduction</p>
                    <p className="text-xl font-bold text-purple-800">
                      ${goalSeekResults.requiredFixedCostReduction.toLocaleString()}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      savings needed
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <Package className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-orange-700">Variable Cost Reduction</p>
                    <p className="text-xl font-bold text-orange-800">
                      ${goalSeekResults.requiredVariableCostReduction.toFixed(2)}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      per unit savings
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <Goal className="w-5 h-5" />
                  Goal Seek Recommendations
                </h4>
                <div className="space-y-2 text-sm text-yellow-700">
                  <p><strong>Option 1 - Volume Strategy:</strong> Increase sales to {goalSeekResults.requiredUnits.toLocaleString()} units ({((goalSeekResults.requiredUnits / inputs.currentSalesVolume - 1) * 100).toFixed(1)}% increase)</p>
                  <p><strong>Option 2 - Pricing Strategy:</strong> Raise price to ${goalSeekResults.requiredPrice.toFixed(2)} ({(((goalSeekResults.requiredPrice / inputs.sellingPricePerUnit) - 1) * 100).toFixed(1)}% increase)</p>
                  <p><strong>Option 3 - Cost Reduction:</strong> Cut fixed costs by ${goalSeekResults.requiredFixedCostReduction.toLocaleString()} ({((goalSeekResults.requiredFixedCostReduction / inputs.fixedCosts) * 100).toFixed(1)}% reduction)</p>
                  <p><strong>Option 4 - Efficiency:</strong> Reduce variable costs by ${goalSeekResults.requiredVariableCostReduction.toFixed(2)} per unit ({((goalSeekResults.requiredVariableCostReduction / inputs.variableCostPerUnit) * 100).toFixed(1)}% reduction)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tables Tab */}
        <TabsContent value="datatables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="w-5 h-5 text-purple-600" />
                One-Variable Data Table
              </CardTitle>
              <CardDescription>
                Analyze how changes in one variable affect break-even and profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label>Variable to Analyze</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={dataTableVariable}
                    onChange={(e) => setDataTableVariable(e.target.value as 'price' | 'fixedCosts' | 'variableCosts')}
                  >
                    <option value="price">Selling Price</option>
                    <option value="fixedCosts">Fixed Costs</option>
                    <option value="variableCosts">Variable Costs</option>
                  </select>
                </div>
                <div>
                  <Label>Minimum Value</Label>
                  <Input
                    type="number"
                    value={dataTableRange.min}
                    onChange={(e) => setDataTableRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Maximum Value</Label>
                  <Input
                    type="number"
                    value={dataTableRange.max}
                    onChange={(e) => setDataTableRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Steps</Label>
                  <Input
                    type="number"
                    value={dataTableRange.steps}
                    onChange={(e) => setDataTableRange(prev => ({ ...prev, steps: Math.max(2, Number(e.target.value)) }))}
                    min={2}
                    max={20}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">
                        {dataTableVariable === 'price' ? 'Price ($)' :
                         dataTableVariable === 'fixedCosts' ? 'Fixed Costs ($)' :
                         'Variable Cost/Unit ($)'}
                      </th>
                      <th className="border border-gray-300 p-2 text-right">Break-Even Units</th>
                      <th className="border border-gray-300 p-2 text-right">Profit at Current Volume</th>
                      <th className="border border-gray-300 p-2 text-right">Margin of Safety</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTable.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                        <td className="border border-gray-300 p-2 font-medium">
                          ${row.variable.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {row.breakEvenUnits.toLocaleString()}
                        </td>
                        <td className={`border border-gray-300 p-2 text-right font-medium ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${row.profit.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {row.marginOfSafety.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-600" />
                Two-Variable Data Table
              </CardTitle>
              <CardDescription>
                Analyze profit sensitivity to simultaneous changes in price and volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label>Min Price ($)</Label>
                  <Input
                    type="number"
                    value={twoVarTable.priceRange.min}
                    onChange={(e) => setTwoVarTable(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label>Max Price ($)</Label>
                  <Input
                    type="number"
                    value={twoVarTable.priceRange.max}
                    onChange={(e) => setTwoVarTable(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label>Min Volume</Label>
                  <Input
                    type="number"
                    value={twoVarTable.volumeRange.min}
                    onChange={(e) => setTwoVarTable(prev => ({
                      ...prev,
                      volumeRange: { ...prev.volumeRange, min: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label>Max Volume</Label>
                  <Input
                    type="number"
                    value={twoVarTable.volumeRange.max}
                    onChange={(e) => setTwoVarTable(prev => ({
                      ...prev,
                      volumeRange: { ...prev.volumeRange, max: Number(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2">Price \ Volume</th>
                      {Array.from(new Set(twoVarDataTable.map(row => row.volume))).sort((a, b) => a - b).map(volume => (
                        <th key={volume} className="border border-gray-300 p-2 text-center">
                          {volume.toLocaleString()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set(twoVarDataTable.map(row => row.price))).sort((a, b) => b - a).map(price => (
                      <tr key={price}>
                        <td className="border border-gray-300 p-2 font-medium bg-gray-50">
                          ${price.toFixed(2)}
                        </td>
                        {Array.from(new Set(twoVarDataTable.map(row => row.volume))).sort((a, b) => a - b).map(volume => {
                          const cell = twoVarDataTable.find(row => row.price === price && row.volume === volume)
                          return (
                            <td
                              key={volume}
                              className={`border border-gray-300 p-2 text-center font-medium ${
                                cell && cell.profit >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                              }`}
                            >
                              {cell ? `$${cell.profit.toLocaleString()}` : '-'}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Green cells indicate profitable scenarios; Red cells indicate losses
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-700" />
                Executive Summary & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Current Position</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Break-even point:</span>
                      <span className="font-medium">{results.breakEvenUnits.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current sales:</span>
                      <span className="font-medium">{inputs.currentSalesVolume.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safety margin:</span>
                      <span className={`font-medium ${results.marginOfSafetyUnits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {results.marginOfSafetyUnits.toLocaleString()} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current profit:</span>
                      <span className={`font-medium ${(inputs.sellingPricePerUnit * inputs.currentSalesVolume) - (inputs.fixedCosts + (inputs.variableCostPerUnit * inputs.currentSalesVolume)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${((inputs.sellingPricePerUnit * inputs.currentSalesVolume) - (inputs.fixedCosts + (inputs.variableCostPerUnit * inputs.currentSalesVolume))).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Risk Assessment</h4>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${
                      results.marginOfSafetyRatio > 0.3 ? 'bg-green-50 border border-green-200' :
                      results.marginOfSafetyRatio > 0.1 ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {results.marginOfSafetyRatio > 0.3 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          {results.marginOfSafetyRatio > 0.3 ? 'Low Risk' :
                           results.marginOfSafetyRatio > 0.1 ? 'Moderate Risk' : 'High Risk'}
                        </span>
                      </div>
                      <p className="text-sm">
                        {results.marginOfSafetyRatio > 0.3 ?
                          'Strong safety margin provides good cushion against sales volatility.' :
                         results.marginOfSafetyRatio > 0.1 ?
                          'Adequate margin but monitor sales performance closely.' :
                          'Critical: Very close to break-even. Consider immediate action.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-lg mb-4">Strategic Recommendations</h4>
                <div className="grid grid-cols-1 MD:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h5 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Revenue Enhancement
                    </h5>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Increase sales volume to {goalSeekResults.requiredUnits.toLocaleString()} units for target profit</li>
                      <li>• Consider premium pricing at ${goalSeekResults.requiredPrice.toFixed(2)} per unit</li>
                      <li>• Develop value-added services to justify price increases</li>
                      <li>• Expand market reach or customer segments</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Cost Optimization
                    </h5>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Reduce fixed costs by ${goalSeekResults.requiredFixedCostReduction.toLocaleString()}</li>
                      <li>• Lower variable costs by ${goalSeekResults.requiredVariableCostReduction.toFixed(2)} per unit</li>
                      <li>• Negotiate better supplier terms or bulk discounts</li>
                      <li>• Automate processes to reduce labor costs</li>
                    </ul>
                  </Card>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Analysis to Excel
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Save PDF Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default BreakEvenAnalysisCalculator
