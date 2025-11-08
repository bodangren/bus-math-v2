'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Scale, Download, AlertCircle } from 'lucide-react'

export interface BalanceSheetSimpleData {
  asOfDate: string
  assets: {
    currentAssets: {
      cash: number
      accountsReceivable: number
      inventory: number
      prepaidExpenses: number
      totalCurrentAssets: number
    }
    fixedAssets: {
      equipment: number
      accumulatedDepreciation: number
      netEquipment: number
      buildings: number
      land: number
      totalFixedAssets: number
    }
    totalAssets: number
  }
  liabilities: {
    currentLiabilities: {
      accountsPayable: number
      accruedLiabilities: number
      shortTermDebt: number
      totalCurrentLiabilities: number
    }
    longTermLiabilities: {
      longTermDebt: number
      mortgagePayable: number
      totalLongTermLiabilities: number
    }
    totalLiabilities: number
  }
  equity: {
    commonStock: number
    retainedEarnings: number
    totalEquity: number
  }
  totalLiabilitiesAndEquity: number
}

export interface BalanceSheetSimpleProps {
  data: BalanceSheetSimpleData
  title?: string
  showCalculations?: boolean
  showRatios?: boolean
  className?: string
}

export function BalanceSheetSimple({
  data,
  title = 'Balance Sheet',
  showCalculations = false,
  showRatios = true,
  className = ''
}: BalanceSheetSimpleProps) {
  const statementData = data

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const isBalanced = statementData.assets.totalAssets === statementData.totalLiabilitiesAndEquity

  const getBalanceBadge = () => {
    if (isBalanced) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <Scale className="w-3 h-3 mr-1" />
          Balanced
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
        <AlertCircle className="w-3 h-3 mr-1" />
        Out of Balance
      </Badge>
    )
  }

  const LineItem = ({
    label,
    amount,
    isSubtotal = false,
    isTotal = false,
    indent = false,
    negative = false
  }: {
    label: string
    amount: number
    isSubtotal?: boolean
    isTotal?: boolean
    indent?: boolean
    negative?: boolean
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
      <span
        className={`${isTotal ? 'text-gray-900' : 'text-gray-700'} ${negative ? 'text-red-600' : ''}`}
      >
        {label}
      </span>
      <span
        className={`${isTotal ? 'text-gray-900' : 'text-gray-600'} font-mono ${
          negative ? 'text-red-600' : ''
        }`}
      >
        {negative && amount > 0 ? `(${formatCurrency(amount)})` : formatCurrency(amount)}
      </span>
    </div>
  )

  const currentRatio =
    statementData.assets.currentAssets.totalCurrentAssets /
    statementData.liabilities.currentLiabilities.totalCurrentLiabilities
  const debtToEquityRatio =
    statementData.liabilities.totalLiabilities / statementData.equity.totalEquity
  const workingCapital =
    statementData.assets.currentAssets.totalCurrentAssets -
    statementData.liabilities.currentLiabilities.totalCurrentLiabilities

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <Scale className="w-6 h-6" />
              {title}
            </CardTitle>
            <CardDescription className="text-lg mt-1">{statementData.asOfDate}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getBalanceBadge()}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-800 mb-4">ASSETS</h3>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-blue-700 mb-3">Current Assets</h4>
              <LineItem
                label="Cash and Cash Equivalents"
                amount={statementData.assets.currentAssets.cash}
                indent
              />
              <LineItem
                label="Accounts Receivable"
                amount={statementData.assets.currentAssets.accountsReceivable}
                indent
              />
              <LineItem
                label="Inventory"
                amount={statementData.assets.currentAssets.inventory}
                indent
              />
              <LineItem
                label="Prepaid Expenses"
                amount={statementData.assets.currentAssets.prepaidExpenses}
                indent
              />
              <LineItem
                label="Total Current Assets"
                amount={statementData.assets.currentAssets.totalCurrentAssets}
                isSubtotal
              />
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-blue-700 mb-3">Fixed Assets</h4>
              <LineItem label="Equipment" amount={statementData.assets.fixedAssets.equipment} indent />
              <LineItem
                label="Less: Accumulated Depreciation"
                amount={statementData.assets.fixedAssets.accumulatedDepreciation}
                indent
                negative
              />
              <LineItem
                label="Net Equipment"
                amount={statementData.assets.fixedAssets.netEquipment}
                indent
              />
              <LineItem label="Buildings" amount={statementData.assets.fixedAssets.buildings} indent />
              <LineItem label="Land" amount={statementData.assets.fixedAssets.land} indent />
              <LineItem
                label="Total Fixed Assets"
                amount={statementData.assets.fixedAssets.totalFixedAssets}
                isSubtotal
              />
            </div>

            <LineItem label="TOTAL ASSETS" amount={statementData.assets.totalAssets} isTotal />
          </div>

          <div className="space-y-6">
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-red-800 mb-4">LIABILITIES</h3>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-red-700 mb-3">Current Liabilities</h4>
                <LineItem
                  label="Accounts Payable"
                  amount={statementData.liabilities.currentLiabilities.accountsPayable}
                  indent
                />
                <LineItem
                  label="Accrued Liabilities"
                  amount={statementData.liabilities.currentLiabilities.accruedLiabilities}
                  indent
                />
                <LineItem
                  label="Short-term Debt"
                  amount={statementData.liabilities.currentLiabilities.shortTermDebt}
                  indent
                />
                <LineItem
                  label="Total Current Liabilities"
                  amount={statementData.liabilities.currentLiabilities.totalCurrentLiabilities}
                  isSubtotal
                />
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-red-700 mb-3">Long-term Liabilities</h4>
                <LineItem
                  label="Long-term Debt"
                  amount={statementData.liabilities.longTermLiabilities.longTermDebt}
                  indent
                />
                <LineItem
                  label="Mortgage Payable"
                  amount={statementData.liabilities.longTermLiabilities.mortgagePayable}
                  indent
                />
                <LineItem
                  label="Total Long-term Liabilities"
                  amount={statementData.liabilities.longTermLiabilities.totalLongTermLiabilities}
                  isSubtotal
                />
              </div>

              <LineItem label="TOTAL LIABILITIES" amount={statementData.liabilities.totalLiabilities} isSubtotal />
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-800 mb-4">EQUITY</h3>
              <LineItem label="Common Stock" amount={statementData.equity.commonStock} indent />
              <LineItem label="Retained Earnings" amount={statementData.equity.retainedEarnings} indent />
              <LineItem label="TOTAL EQUITY" amount={statementData.equity.totalEquity} isSubtotal />

              <div className="mt-4 pt-3 border-t-2 border-gray-800">
                <LineItem
                  label="TOTAL LIABILITIES & EQUITY"
                  amount={statementData.totalLiabilitiesAndEquity}
                  isTotal
                />
              </div>
            </div>
          </div>
        </div>

        {showCalculations ? (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-3">Fundamental Accounting Equation:</h4>
            <div className="text-center text-lg font-semibold">
              <span className="text-blue-600">Assets</span> = <span className="text-red-600">Liabilities</span> +{' '}
              <span className="text-green-600">Equity</span>
            </div>
            <div className="text-center text-sm mt-2">
              {formatCurrency(statementData.assets.totalAssets)} = {formatCurrency(statementData.liabilities.totalLiabilities)} +{' '}
              {formatCurrency(statementData.equity.totalEquity)}
            </div>
            {!isBalanced ? (
              <div className="text-center text-red-600 text-sm mt-2 font-semibold">
                ⚠️ Balance Sheet does not balance! Difference:{' '}
                {formatCurrency(Math.abs(statementData.assets.totalAssets - statementData.totalLiabilitiesAndEquity))}
              </div>
            ) : null}
          </div>
        ) : null}

        {showRatios ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentRatio.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Current Ratio</div>
              <div className="text-xs text-gray-500 mt-1">
                {currentRatio >= 2 ? 'Strong liquidity' : currentRatio >= 1 ? 'Adequate liquidity' : 'Liquidity concern'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(workingCapital)}</div>
              <div className="text-sm text-gray-600">Working Capital</div>
              <div className="text-xs text-gray-500 mt-1">Current Assets - Current Liabilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{debtToEquityRatio.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Debt-to-Equity</div>
              <div className="text-xs text-gray-500 mt-1">
                {debtToEquityRatio <= 1 ? 'Conservative' : debtToEquityRatio <= 2 ? 'Moderate' : 'High leverage'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {((statementData.equity.totalEquity / statementData.assets.totalAssets) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Equity Ratio</div>
              <div className="text-xs text-gray-500 mt-1">Owner&rsquo;s stake in assets</div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default BalanceSheetSimple
