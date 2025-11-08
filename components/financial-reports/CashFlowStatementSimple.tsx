'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, Download, Info } from 'lucide-react'

export interface CashFlowStatementSimpleData {
  period: string
  operatingActivities: {
    netIncome: number
    depreciation: number
    changeInReceivables: number
    changeInInventory: number
    changeInPayables: number
    netOperatingCashFlow: number
  }
  investingActivities: {
    equipmentPurchases: number
    equipmentSales: number
    investmentPurchases: number
    investmentSales: number
    netInvestingCashFlow: number
  }
  financingActivities: {
    stockIssuance: number
    dividendPayments: number
    loanProceeds: number
    loanRepayments: number
    netFinancingCashFlow: number
  }
  netChangeInCash: number
  beginningCash: number
  endingCash: number
}

export interface CashFlowStatementSimpleProps {
  data: CashFlowStatementSimpleData
  title?: string
  showCalculations?: boolean
  className?: string
}

export function CashFlowStatementSimple({
  data,
  title = 'Cash Flow Statement',
  showCalculations = false,
  className = ''
}: CashFlowStatementSimpleProps) {
  const statementData = data

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCashFlowBadge = (netChange: number) => {
    if (netChange > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <TrendingUp className="w-3 h-3 mr-1" />
          Cash Increased
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
        <TrendingDown className="w-3 h-3 mr-1" />
        Cash Decreased
      </Badge>
    )
  }

  const getActivityBadge = (amount: number, activity: string) => {
    const color =
      activity === 'Operating'
        ? 'bg-blue-100 text-blue-800 border-blue-300'
        : activity === 'Investing'
          ? 'bg-purple-100 text-purple-800 border-purple-300'
          : 'bg-orange-100 text-orange-800 border-orange-300'

    return (
      <Badge variant="outline" className={color}>
        {amount > 0 ? '+' : ''}
        {formatCurrency(amount)}
      </Badge>
    )
  }

  const LineItem = ({
    label,
    amount,
    isSubtotal = false,
    isTotal = false,
    indent = false,
    showSign = true
  }: {
    label: string
    amount: number
    isSubtotal?: boolean
    isTotal?: boolean
    indent?: boolean
    showSign?: boolean
  }) => (
    <div
      className={`flex justify-between items-center py-2 ${
        isTotal
          ? 'border-t-2 border-gray-800 font-bold text-lg pt-3'
          : isSubtotal
            ? 'border-t border-gray-300 font-semibold pt-2'
            : ''
      } ${indent ? 'pl-4' : ''}`}
    >
      <span className={isTotal ? 'text-gray-900' : 'text-gray-700'}>{label}</span>
      <span className={`${isTotal ? 'text-gray-900' : 'text-gray-600'} font-mono`}>
        {amount < 0 && showSign ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount)}
      </span>
    </div>
  )

  return (
    <Card className={`max-w-3xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              {title}
            </CardTitle>
            <CardDescription className="text-lg mt-1">{statementData.period}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getCashFlowBadge(statementData.netChangeInCash)}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-blue-800">CASH FLOWS FROM OPERATING ACTIVITIES</h3>
              {getActivityBadge(statementData.operatingActivities.netOperatingCashFlow, 'Operating')}
            </div>
            <LineItem label="Net Income" amount={statementData.operatingActivities.netIncome} indent />
            <LineItem label="Depreciation Expense" amount={statementData.operatingActivities.depreciation} indent />
            <LineItem label="Increase in Accounts Receivable" amount={statementData.operatingActivities.changeInReceivables} indent />
            <LineItem label="Increase in Inventory" amount={statementData.operatingActivities.changeInInventory} indent />
            <LineItem label="Increase in Accounts Payable" amount={statementData.operatingActivities.changeInPayables} indent />
            <LineItem
              label="Net Cash Provided by Operating Activities"
              amount={statementData.operatingActivities.netOperatingCashFlow}
              isSubtotal
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-purple-800">CASH FLOWS FROM INVESTING ACTIVITIES</h3>
              {getActivityBadge(statementData.investingActivities.netInvestingCashFlow, 'Investing')}
            </div>
            <LineItem label="Purchase of Equipment" amount={statementData.investingActivities.equipmentPurchases} indent />
            <LineItem label="Sale of Equipment" amount={statementData.investingActivities.equipmentSales} indent />
            <LineItem label="Purchase of Investments" amount={statementData.investingActivities.investmentPurchases} indent />
            <LineItem label="Sale of Investments" amount={statementData.investingActivities.investmentSales} indent />
            <LineItem
              label="Net Cash Used in Investing Activities"
              amount={statementData.investingActivities.netInvestingCashFlow}
              isSubtotal
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-orange-800">CASH FLOWS FROM FINANCING ACTIVITIES</h3>
              {getActivityBadge(statementData.financingActivities.netFinancingCashFlow, 'Financing')}
            </div>
            <LineItem label="Issuance of Common Stock" amount={statementData.financingActivities.stockIssuance} indent />
            <LineItem label="Payment of Dividends" amount={statementData.financingActivities.dividendPayments} indent />
            <LineItem label="Proceeds from Loan" amount={statementData.financingActivities.loanProceeds} indent />
            <LineItem label="Repayment of Loan" amount={statementData.financingActivities.loanRepayments} indent />
            <LineItem
              label="Net Cash Provided by Financing Activities"
              amount={statementData.financingActivities.netFinancingCashFlow}
              isSubtotal
            />
          </div>

          <div className="border-t-2 border-gray-300 pt-4">
            <LineItem label="Net Increase in Cash" amount={statementData.netChangeInCash} isSubtotal />
            <LineItem label="Cash at Beginning of Year" amount={statementData.beginningCash} />
            <LineItem label="Cash at End of Year" amount={statementData.endingCash} isTotal />
          </div>
        </div>

        {showCalculations ? (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Understanding Cash Flow Activities:
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Operating:</strong> Cash from day-to-day business operations
              </div>
              <div>
                <strong>Investing:</strong> Cash from buying/selling long-term assets
              </div>
              <div>
                <strong>Financing:</strong> Cash from dealings with owners and creditors
              </div>
              <div className="pt-2 border-t border-blue-200">
                <strong>Formula:</strong> Ending Cash = Beginning Cash + Net Change in Cash
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default CashFlowStatementSimple
