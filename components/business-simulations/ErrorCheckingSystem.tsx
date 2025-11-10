/**
 * ErrorCheckingSystem Component
 *
 * DEVELOPER USAGE:
 * ================
 * Import and use this component in any React page or component:
 *
 * ```tsx
 * import ErrorCheckingSystem from '@/components/business-simulations/ErrorCheckingSystem'
 *
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <ErrorCheckingSystem />
 *     </div>
 *   )
 * }
 * ```
 *
 * The component is fully self-contained with its own state management.
 * No props are required - it initializes with default business validation scenarios.
 *
 * STUDENT INTERACTION & LEARNING OBJECTIVES:
 * ==========================================
 *
 * OBJECTIVE: Students learn to build conditional formatting rules for business data validation,
 * supporting Excel automation skills needed across all units, particularly Unit 2's Month-End
 * Wizard where automated error checking reduces closing time from days to hours.
 *
 * HOW STUDENTS INTERACT:
 * 1. **Interactive Rule Builder**: Students see common business data validation scenarios and
 *    must build conditional formatting rules to identify errors, outliers, and data quality issues.
 *
 * 2. **Validation Categories**: The interface teaches four key validation types:
 *    - Range Validation: Identifying values outside acceptable business ranges
 *    - Logic Validation: Finding data that violates business logic rules
 *    - Format Validation: Detecting incorrect data formats (dates, currencies, IDs)
 *    - Completeness Validation: Highlighting missing or incomplete data entries
 *
 * 3. **Real-World Business Context**: Each scenario includes practical validation needs:
 *    - "Payroll hours exceed 40 per week - highlight overtime calculations"
 *    - "Inventory quantities below minimum stock levels - flag for reordering"
 *    - "Account balances that don't match trial balance - identify posting errors"
 *
 * 4. **Excel Formula Integration**: Shows the actual Excel conditional formatting formulas
 *    and teaches students to use functions like IF, AND, OR, ISNUMBER, ISBLANK for validation.
 *
 * 5. **Rule Building Process**: Interactive builder that shows:
 *    - Condition identification (what makes data "invalid")
 *    - Formula construction with proper Excel syntax
 *    - Color coding and formatting options for visual error identification
 *    - Testing with sample data to verify rule accuracy
 *
 * 6. **Safety Features**: Uses SafeFormulaEvaluator to prevent code injection
 *    while allowing students to test validation formulas safely.
 *
 * EDUCATIONAL VALUE:
 * ==================
 * - Builds Excel automation skills essential for Month-End Wizard (Unit 2)
 * - Prepares students for error-checking in financial models and business analytics
 * - Teaches systematic approach to data quality and business rule validation
 * - Supports advanced Excel skills needed for capstone project financial models
 * - Demonstrates how conditional formatting improves data accuracy and reduces manual errors
 */

'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle, Eye, Code, RefreshCw, HelpCircle, ChevronDown, ChevronUp, Shield, Target, BookOpen } from 'lucide-react'

// Types
interface ValidationRule {
  id: string
  name: string
  description: string
  category: 'range' | 'logic' | 'format' | 'completeness'
  condition: string
  excelFormula: string
  businessContext: string
  colorCode: string
  priority: 'High' | 'Medium' | 'Low'
  sampleData: unknown[]
  expectedResults: boolean[]
}

interface ValidationScenario {
  id: string
  title: string
  description: string
  businessContext: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  rules: ValidationRule[]
  dataColumns: string[]
  sampleDataset: Record<string, unknown>[]
}

// Sample business validation scenarios
const VALIDATION_SCENARIOS: ValidationScenario[] = [
  {
    id: 'payroll-validation',
    title: 'Payroll Data Validation',
    description: 'Detect overtime violations, missing employee data, and calculation errors in payroll processing.',
    businessContext: 'Unit 5 PayDay Simulator: Automated payroll error checking prevents costly mistakes and compliance issues.',
    difficulty: 'Medium',
    dataColumns: ['Employee_ID', 'Hours_Worked', 'Hourly_Rate', 'Gross_Pay', 'Department'],
    sampleDataset: [
      { Employee_ID: 'EMP001', Hours_Worked: 45, Hourly_Rate: 18.50, Gross_Pay: 832.50, Department: 'Sales' },
      { Employee_ID: 'EMP002', Hours_Worked: 38, Hourly_Rate: 22.00, Gross_Pay: 836.00, Department: 'Management' },
      { Employee_ID: '', Hours_Worked: 40, Hourly_Rate: 15.00, Gross_Pay: 600.00, Department: 'Kitchen' },
      { Employee_ID: 'EMP004', Hours_Worked: 52, Hourly_Rate: 16.75, Gross_Pay: 871.00, Department: 'Service' },
      { Employee_ID: 'EMP005', Hours_Worked: 35, Hourly_Rate: 25.00, Gross_Pay: 875.00, Department: '' }
    ],
    rules: [
      {
        id: 'overtime-check',
        name: 'Overtime Hours Detection',
        description: 'Highlight employees working more than 40 hours per week',
        category: 'range',
        condition: 'Hours_Worked > 40',
        excelFormula: '=B2>40',
        businessContext: 'Identifies overtime situations requiring 1.5x pay calculations and compliance tracking',
        colorCode: 'bg-yellow-100 border-yellow-400 text-yellow-800',
        priority: 'High',
        sampleData: [45, 38, 40, 52, 35],
        expectedResults: [true, false, false, true, false]
      },
      {
        id: 'missing-employee-id',
        name: 'Missing Employee ID',
        description: 'Flag blank or missing employee identification numbers',
        category: 'completeness',
        condition: 'Employee_ID is blank',
        excelFormula: '=ISBLANK(A2)',
        businessContext: 'Prevents payroll processing errors and ensures proper employee record tracking',
        colorCode: 'bg-red-100 border-red-400 text-red-800',
        priority: 'High',
        sampleData: ['EMP001', 'EMP002', '', 'EMP004', 'EMP005'],
        expectedResults: [false, false, true, false, false]
      },
      {
        id: 'pay-calculation-error',
        name: 'Gross Pay Calculation Error',
        description: 'Detect discrepancies between calculated and entered gross pay',
        category: 'logic',
        condition: 'Gross_Pay ≠ Hours_Worked × Hourly_Rate',
        excelFormula: '=ABS(D2-(B2*C2))>0.01',
        businessContext: 'Catches calculation errors that could lead to underpayment or overpayment issues',
        colorCode: 'bg-red-100 border-red-400 text-red-800',
        priority: 'High',
        sampleData: [832.50, 836.00, 600.00, 871.00, 875.00],
        expectedResults: [false, false, false, false, false]
      },
      {
        id: 'missing-department',
        name: 'Missing Department Assignment',
        description: 'Identify employees without department assignments',
        category: 'completeness',
        condition: 'Department is blank',
        excelFormula: '=ISBLANK(E2)',
        businessContext: 'Ensures proper cost center allocation and organizational reporting',
        colorCode: 'bg-orange-100 border-orange-400 text-orange-800',
        priority: 'Medium',
        sampleData: ['Sales', 'Management', 'Kitchen', 'Service', ''],
        expectedResults: [false, false, false, false, true]
      }
    ]
  },
  {
    id: 'inventory-validation',
    title: 'Inventory Management Validation',
    description: 'Monitor stock levels, identify reorder points, and catch data entry errors in inventory tracking.',
    businessContext: 'Unit 7 Asset & Inventory Tracker: Automated validation prevents stockouts and overstock situations.',
    difficulty: 'Medium',
    dataColumns: ['Product_ID', 'Current_Stock', 'Minimum_Stock', 'Unit_Cost', 'Last_Updated'],
    sampleDataset: [
      { Product_ID: 'PROD001', Current_Stock: 5, Minimum_Stock: 20, Unit_Cost: 12.50, Last_Updated: '2024-01-15' },
      { Product_ID: 'PROD002', Current_Stock: 150, Minimum_Stock: 50, Unit_Cost: 8.75, Last_Updated: '2024-01-20' },
      { Product_ID: 'PROD003', Current_Stock: 0, Minimum_Stock: 10, Unit_Cost: 25.00, Last_Updated: '2023-12-10' },
      { Product_ID: '', Current_Stock: 75, Minimum_Stock: 30, Unit_Cost: 15.25, Last_Updated: '2024-01-18' },
      { Product_ID: 'PROD005', Current_Stock: 25, Minimum_Stock: 15, Unit_Cost: -5.00, Last_Updated: '2024-01-22' }
    ],
    rules: [
      {
        id: 'low-stock-alert',
        name: 'Low Stock Level Alert',
        description: 'Flag items where current stock is below minimum threshold',
        category: 'range',
        condition: 'Current_Stock < Minimum_Stock',
        excelFormula: '=B2<C2',
        businessContext: 'Triggers reorder alerts to prevent stockouts and maintain service levels',
        colorCode: 'bg-red-100 border-red-400 text-red-800',
        priority: 'High',
        sampleData: [5, 150, 0, 75, 25],
        expectedResults: [true, false, true, false, false]
      },
      {
        id: 'zero-stock-critical',
        name: 'Zero Stock Critical Alert',
        description: 'Highlight items that are completely out of stock',
        category: 'range',
        condition: 'Current_Stock = 0',
        excelFormula: '=B2=0',
        businessContext: 'Immediate action required to prevent sales loss and customer dissatisfaction',
        colorCode: 'bg-red-200 border-red-600 text-red-900',
        priority: 'High',
        sampleData: [5, 150, 0, 75, 25],
        expectedResults: [false, false, true, false, false]
      },
      {
        id: 'negative-cost',
        name: 'Invalid Unit Cost',
        description: 'Detect negative or zero unit costs that indicate data entry errors',
        category: 'logic',
        condition: 'Unit_Cost ≤ 0',
        excelFormula: '=D2<=0',
        businessContext: 'Prevents costing errors that could distort profit calculations and pricing decisions',
        colorCode: 'bg-red-100 border-red-400 text-red-800',
        priority: 'High',
        sampleData: [12.50, 8.75, 25.00, 15.25, -5.00],
        expectedResults: [false, false, false, false, true]
      },
      {
        id: 'stale-data',
        name: 'Outdated Inventory Data',
        description: 'Flag inventory records not updated in the last 30 days',
        category: 'format',
        condition: 'Last_Updated > 30 days ago',
        excelFormula: '=TODAY()-E2>30',
        businessContext: 'Ensures inventory accuracy by identifying potentially stale or forgotten records',
        colorCode: 'bg-yellow-100 border-yellow-400 text-yellow-800',
        priority: 'Medium',
        sampleData: ['2024-01-15', '2024-01-20', '2023-12-10', '2024-01-18', '2024-01-22'],
        expectedResults: [false, false, true, false, false]
      }
    ]
  },
  {
    id: 'financial-validation',
    title: 'Financial Statement Validation',
    description: 'Verify trial balance accuracy, detect posting errors, and validate account classifications.',
    businessContext: 'Unit 2 Month-End Wizard: Automated validation reduces closing time and improves accuracy.',
    difficulty: 'Hard',
    dataColumns: ['Account_Code', 'Account_Name', 'Debit_Balance', 'Credit_Balance', 'Account_Type'],
    sampleDataset: [
      { Account_Code: '1010', Account_Name: 'Cash', Debit_Balance: 15000, Credit_Balance: 0, Account_Type: 'Asset' },
      { Account_Code: '2010', Account_Name: 'Accounts Payable', Debit_Balance: 0, Credit_Balance: 8500, Account_Type: 'Liability' },
      { Account_Code: '3010', Account_Name: 'Owner Equity', Debit_Balance: 2000, Credit_Balance: 12000, Account_Type: 'Equity' },
      { Account_Code: '4010', Account_Name: 'Sales Revenue', Debit_Balance: 500, Credit_Balance: 25000, Account_Type: 'Revenue' },
      { Account_Code: '5010', Account_Name: 'Cost of Goods Sold', Debit_Balance: 12000, Credit_Balance: 0, Account_Type: 'Expense' }
    ],
    rules: [
      {
        id: 'account-balance-logic',
        name: 'Account Balance Logic Error',
        description: 'Flag accounts with balances in wrong columns based on account type',
        category: 'logic',
        condition: 'Normal balance side violation',
        excelFormula: '=IF(OR(AND(E2="Asset",C2<B2),AND(E2="Expense",C2<B2),AND(E2="Liability",B2<C2),AND(E2="Equity",B2<C2),AND(E2="Revenue",B2<C2)),TRUE,FALSE)',
        businessContext: 'Identifies posting errors that could misstate financial position and performance',
        colorCode: 'bg-red-100 border-red-400 text-red-800',
        priority: 'High',
        sampleData: [15000, 8500, 2000, 25000, 12000],
        expectedResults: [false, false, true, true, false]
      },
      {
        id: 'both-balance-sides',
        name: 'Both Debit and Credit Balances',
        description: 'Highlight accounts with balances on both debit and credit sides',
        category: 'logic',
        condition: 'Debit_Balance > 0 AND Credit_Balance > 0',
        excelFormula: '=AND(B2>0,C2>0)',
        businessContext: 'Indicates potential posting errors or accounts needing reconciliation',
        colorCode: 'bg-yellow-100 border-yellow-400 text-yellow-800',
        priority: 'Medium',
        sampleData: [[15000, 0], [0, 8500], [2000, 12000], [500, 25000], [12000, 0]],
        expectedResults: [false, false, true, true, false]
      },
      {
        id: 'missing-account-code',
        name: 'Missing Account Code',
        description: 'Flag accounts without proper account code assignments',
        category: 'completeness',
        condition: 'Account_Code is blank',
        excelFormula: '=ISBLANK(A2)',
        businessContext: 'Ensures proper chart of accounts organization and financial reporting accuracy',
        colorCode: 'bg-red-100 border-red-400 text-red-800',
        priority: 'High',
        sampleData: ['1010', '2010', '3010', '4010', '5010'],
        expectedResults: [false, false, false, false, false]
      }
    ]
  }
]

export default function ErrorCheckingSystem() {
  const [selectedScenario, setSelectedScenario] = useState<ValidationScenario>(VALIDATION_SCENARIOS[0])
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [testData, setTestData] = useState<Record<string, unknown>[]>([])
  const [validationResults, setValidationResults] = useState<boolean[]>([])
  const [isTestingRule, setIsTestingRule] = useState(false)

  // Safe formula evaluator - prevents code injection
  const safeEvaluateCondition = useCallback((condition: string, data: Record<string, unknown>): boolean => {
    try {
      // This is a simplified evaluator for demonstration
      // In production, use a proper expression parser
      switch (condition) {
        case 'Hours_Worked > 40':
          return data.Hours_Worked > 40
        case 'Employee_ID is blank':
          return !data.Employee_ID || data.Employee_ID.trim() === ''
        case 'Gross_Pay ≠ Hours_Worked × Hourly_Rate':
          return Math.abs(data.Gross_Pay - (data.Hours_Worked * data.Hourly_Rate)) > 0.01
        case 'Department is blank':
          return !data.Department || data.Department.trim() === ''
        case 'Current_Stock < Minimum_Stock':
          return data.Current_Stock < data.Minimum_Stock
        case 'Current_Stock = 0':
          return data.Current_Stock === 0
        case 'Unit_Cost ≤ 0':
          return data.Unit_Cost <= 0
        case 'Last_Updated > 30 days ago':
          const lastUpdate = new Date(data.Last_Updated)
          const today = new Date()
          const daysDiff = (today.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24)
          return daysDiff > 30
        case 'Normal balance side violation':
          if (data.Account_Type === 'Asset' || data.Account_Type === 'Expense') {
            return data.Credit_Balance > data.Debit_Balance
          } else {
            return data.Debit_Balance > data.Credit_Balance
          }
        case 'Debit_Balance > 0 AND Credit_Balance > 0':
          return data.Debit_Balance > 0 && data.Credit_Balance > 0
        case 'Account_Code is blank':
          return !data.Account_Code || data.Account_Code.trim() === ''
        default:
          return false
      }
    } catch {
      return false
    }
  }, [])

  // Test validation rule against sample data
  const testValidationRule = useCallback((rule: ValidationRule) => {
    setIsTestingRule(true)
    setSelectedRule(rule)

    // Apply the rule to the scenario's sample dataset
    const results = selectedScenario.sampleDataset.map((data, index) =>
      safeEvaluateCondition(rule.condition, data, index)
    )

    setValidationResults(results)
    setTestData(selectedScenario.sampleDataset)

    setTimeout(() => {
      setIsTestingRule(false)
    }, 1000)
  }, [selectedScenario, safeEvaluateCondition])

  // Reset testing state
  const resetTesting = useCallback(() => {
    setSelectedRule(null)
    setValidationResults([])
    setTestData([])
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'range': return '📊'
      case 'logic': return '🧠'
      case 'format': return '📝'
      case 'completeness': return '✅'
      default: return '🔍'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl">🛡️</span>
          <h1 className="text-3xl font-bold text-gray-900">Error Checking System Builder</h1>
          <span className="text-4xl">🔍</span>
        </div>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Master conditional formatting and data validation rules for business automation. Build the Excel skills needed
          for Unit 2&apos;s Month-End Wizard - where error checking reduces closing time from days to hours.
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
            <Code className="w-4 h-4" />
            {showFormulas ? 'Hide' : 'Show'} Excel Formulas
          </Button>
        </div>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              How to Build Error Checking Systems
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Learning Objectives</h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Build conditional formatting rules for automatic error detection</li>
                <li>• Learn Excel formulas for data validation and quality checking</li>
                <li>• Understand business logic validation for financial and operational data</li>
                <li>• Create automated systems that reduce manual checking time</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-blue-800 mb-2">📋 Step-by-Step Instructions</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                <li>Choose a business validation scenario from the tabs</li>
                <li>Review the sample data and identify potential errors</li>
                <li>Select validation rules to understand their logic and formulas</li>
                <li>Click &quot;Test Rule&quot; to see how the rule identifies errors in the data</li>
                <li>Study the Excel formulas used for each validation type</li>
                <li>Practice building your own validation rules for similar scenarios</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">📊 Range Validation</h5>
                <p className="text-sm text-blue-700 mb-2">Check if values fall within acceptable business ranges</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Overtime hours detection</li>
                  <li>• Stock level monitoring</li>
                  <li>• Account balance limits</li>
                </ul>
              </div>

              <div className="p-4 bg-green-100 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">🧠 Logic Validation</h5>
                <p className="text-sm text-green-700 mb-2">Verify data follows business logic rules</p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• Calculation accuracy checks</li>
                  <li>• Account type balance logic</li>
                  <li>• Cross-field consistency</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-100 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">📝 Format Validation</h5>
                <p className="text-sm text-purple-700 mb-2">Ensure data matches required formats</p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Date format consistency</li>
                  <li>• Currency value formatting</li>
                  <li>• ID number patterns</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-100 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">✅ Completeness Validation</h5>
                <p className="text-sm text-orange-700 mb-2">Identify missing or incomplete data</p>
                <ul className="text-xs text-orange-600 space-y-1">
                  <li>• Required field validation</li>
                  <li>• Blank cell detection</li>
                  <li>• Data entry completion</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Selection Tabs */}
      <Tabs value={selectedScenario.id} onValueChange={(value) => {
        const scenario = VALIDATION_SCENARIOS.find(s => s.id === value)
        if (scenario) {
          setSelectedScenario(scenario)
          resetTesting()
        }
      }}>
        <TabsList className="grid w-full grid-cols-1 lg:grid-cols-3">
          {VALIDATION_SCENARIOS.map((scenario) => (
            <TabsTrigger key={scenario.id} value={scenario.id} className="text-sm">
              {scenario.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {VALIDATION_SCENARIOS.map((scenario) => (
          <TabsContent key={scenario.id} value={scenario.id}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scenario Information */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
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
                    <p className="text-sm text-gray-700">{scenario.businessContext}</p>
                  </div>

                  {/* Validation Rules */}
                  <div>
                    <h4 className="font-medium mb-3">Validation Rules:</h4>
                    <div className="space-y-2">
                      {scenario.rules.map((rule) => (
                        <Card key={rule.id} className={`cursor-pointer transition-all ${
                          selectedRule?.id === rule.id ? 'ring-2 ring-blue-500' : ''
                        }`}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getCategoryIcon(rule.category)}</span>
                                <div>
                                  <h5 className="font-medium text-sm">{rule.name}</h5>
                                  <Badge className={getPriorityColor(rule.priority)} variant="secondary">
                                    {rule.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{rule.description}</p>

                            {showFormulas && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                <strong>Excel Formula:</strong>
                                <code className="block bg-white px-2 py-1 rounded mt-1 text-xs">
                                  {rule.excelFormula}
                                </code>
                              </div>
                            )}

                            <Button
                              onClick={() => testValidationRule(rule)}
                              size="sm"
                              variant="outline"
                              className="w-full mt-2 text-xs"
                              disabled={isTestingRule}
                            >
                              <Target className="w-3 h-3 mr-1" />
                              {isTestingRule ? 'Testing...' : 'Test Rule'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Data and Results */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Sample Data & Validation Results
                    {selectedRule && (
                      <Badge variant="outline" className="ml-2">
                        Testing: {selectedRule.name}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedRule
                      ? `See how the "${selectedRule.name}" rule identifies errors in the sample data`
                      : 'Select a validation rule to test it against the sample data'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {testData.length > 0 ? (
                    <div className="space-y-4">
                      {/* Data Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-2 py-1 text-left">#</th>
                              {scenario.dataColumns.map((column) => (
                                <th key={column} className="border border-gray-300 px-2 py-1 text-left">
                                  {column.replace(/_/g, ' ')}
                                </th>
                              ))}
                              <th className="border border-gray-300 px-2 py-1 text-left">Rule Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {testData.map((row, index) => (
                              <tr key={index} className={validationResults[index] ? selectedRule?.colorCode : ''}>
                                <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                                {scenario.dataColumns.map((column) => (
                                  <td key={column} className="border border-gray-300 px-2 py-1">
                                    {row[column]}
                                  </td>
                                ))}
                                <td className="border border-gray-300 px-2 py-1">
                                  {validationResults[index] ? (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Error Detected
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Valid
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Rule Summary */}
                      {selectedRule && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-blue-800 mb-2">Rule Logic</h4>
                              <p className="text-sm text-blue-700 mb-2">
                                <strong>Condition:</strong> {selectedRule.condition}
                              </p>
                              <p className="text-sm text-blue-700">
                                <strong>Purpose:</strong> {selectedRule.businessContext}
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-green-800 mb-2">Test Results</h4>
                              <div className="flex items-center gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Errors Found:</span>
                                  <Badge variant="destructive" className="ml-2">
                                    {validationResults.filter(Boolean).length}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="font-medium">Valid Records:</span>
                                  <Badge variant="outline" className="ml-2">
                                    {validationResults.filter(r => !r).length}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button onClick={resetTesting} variant="outline" className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Clear Results
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">Select a validation rule to test it</p>
                      <p className="text-sm">The rule will highlight errors in the sample data using conditional formatting colors</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Educational Notes */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Month-End Wizard Connection</h3>
              <p className="text-yellow-700 mb-3">
                These error checking skills are essential for Unit 2&apos;s Month-End Wizard, where students learn to:
              </p>
              <ul className="text-yellow-700 space-y-1 text-sm">
                <li>• Build automated validation systems that catch posting errors before they impact financial statements</li>
                <li>• Use conditional formatting to visually highlight discrepancies and missing data</li>
                <li>• Create Excel formulas that validate complex business logic automatically</li>
                <li>• Reduce month-end closing time from days to hours through systematic error prevention</li>
                <li>• Design validation rules that improve data quality and reduce manual checking</li>
              </ul>
              <p className="text-yellow-700 mt-3 text-sm">
                <strong>Next Step:</strong> Apply these validation concepts to build your own Month-End Wizard with automated error checking systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
