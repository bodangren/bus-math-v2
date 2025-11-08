'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, FileText, Download } from 'lucide-react'

export interface IncomeStatementSimpleData {
  period: string
  revenue: number
  costOfGoodsSold: number
  grossProfit: number
  operatingExpenses: number
  operatingIncome: number
  otherIncome: number
  interestExpense: number
  netIncomeBeforeTaxes: number
  taxes: number
  netIncome: number
}

export interface IncomeStatementSimpleProps {
  data: IncomeStatementSimpleData
  title?: string
  showCalculations?: boolean
  className?: string
}

export function IncomeStatementSimple({
  data,
  title = 'Income Statement',
  showCalculations = false,
  className = ''
}: IncomeStatementSimpleProps) {
  const statementData = data

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getProfitabilityBadge = (netIncome: number) => {
    if (netIncome > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <TrendingUp className="w-3 h-3 mr-1" />
          Profitable
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
        <TrendingDown className="w-3 h-3 mr-1" />
        Loss
      </Badge>
    )
  }

  const LineItem = ({
    label,
    amount,
    isSubtotal = false,
    isTotal = false,
    indent = false
  }: {
    label: string
    amount: number
    isSubtotal?: boolean
    isTotal?: boolean
    indent?: boolean
  }) => (
    <div
      className={`flex justify-between items-center py-2 ${
        isTotal
          ? 'border-t-2 border-gray-800 font-bold text-lg pt-3'
          : isSubtotal
            ? 'border-t border-gray-300 font-semibold'
            : ''
      } ${indent ? 'pl-4' : ''}`}
    >
      <span className={isTotal ? 'text-gray-900' : 'text-gray-700'}>{label}</span>
      <span className={`${isTotal ? 'text-gray-900' : 'text-gray-600'} font-mono`}>
        {formatCurrency(amount)}
      </span>
    </div>
  )

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              {title}
            </CardTitle>
            <CardDescription className="text-lg mt-1">{statementData.period}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getProfitabilityBadge(statementData.netIncome)}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="bg-gray-50 p-4 rounded-lg">
          <LineItem label="Revenue" amount={statementData.revenue} />
          <LineItem label="Cost of Goods Sold" amount={statementData.costOfGoodsSold} />
          <LineItem label="Gross Profit" amount={statementData.grossProfit} isSubtotal />

          <div className="mt-4">
            <LineItem label="Operating Expenses" amount={statementData.operatingExpenses} />
            <LineItem label="Operating Income" amount={statementData.operatingIncome} isSubtotal />
          </div>

          <div className="mt-4">
            <LineItem label="Other Income" amount={statementData.otherIncome} />
            <LineItem label="Interest Expense" amount={statementData.interestExpense} />
            <LineItem
              label="Income Before Taxes"
              amount={statementData.netIncomeBeforeTaxes}
              isSubtotal
            />
          </div>

          <div className="mt-4">
            <LineItem label="Income Tax Expense" amount={statementData.taxes} />
            <LineItem label="Net Income" amount={statementData.netIncome} isTotal />
          </div>
        </div>

        {showCalculations ? (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">Key Calculations:</h4>
            <div className="space-y-2 text-sm">
              <div>Gross Profit = Revenue - Cost of Goods Sold</div>
              <div>Operating Income = Gross Profit - Operating Expenses</div>
              <div>Income Before Taxes = Operating Income + Other Income - Interest Expense</div>
              <div>Net Income = Income Before Taxes - Taxes</div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {((statementData.grossProfit / statementData.revenue) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Gross Margin</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {((statementData.operatingIncome / statementData.revenue) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Operating Margin</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {((statementData.netIncome / statementData.revenue) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Net Margin</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default IncomeStatementSimple
