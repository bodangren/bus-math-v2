'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, FileText, Download, Eye } from 'lucide-react'

export interface IncomeStatementDetailedData {
  period: string
  revenues: {
    productSales: number
    serviceSales: number
    otherRevenues: number
    totalRevenue: number
  }
  costOfGoodsSold: {
    beginningInventory: number
    purchases: number
    directLabor: number
    manufacturingOverhead: number
    goodsAvailableForSale: number
    endingInventory: number
    totalCOGS: number
  }
  grossProfit: number
  operatingExpenses: {
    selling: {
      advertising: number
      salesCommissions: number
      deliveryExpense: number
      totalSelling: number
    }
    administrative: {
      salaries: number
      rent: number
      utilities: number
      insurance: number
      depreciation: number
      totalAdministrative: number
    }
    totalOperating: number
  }
  operatingIncome: number
  nonOperating: {
    interestIncome: number
    dividendIncome: number
    gainOnSaleOfAssets: number
    totalOtherIncome: number
    interestExpense: number
    totalNonOperating: number
  }
  incomeBeforeTaxes: number
  incomeTaxes: {
    currentTax: number
    deferredTax: number
    totalTaxes: number
  }
  netIncome: number
}

export interface IncomeStatementDetailedProps {
  data: IncomeStatementDetailedData
  title?: string
  showCalculations?: boolean
  showComparatives?: boolean
  className?: string
}

export function IncomeStatementDetailed({
  data,
  title = 'Detailed Income Statement',
  showCalculations = false,
  showComparatives = false,
  className = ''
}: IncomeStatementDetailedProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
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
    indent = 0,
    negative = false
  }: {
    label: string
    amount: number
    isSubtotal?: boolean
    isTotal?: boolean
    indent?: number
    negative?: boolean
  }) => (
    <div
      className={`flex justify-between items-center py-1 ${
        isTotal
          ? 'border-t-2 border-gray-800 font-bold text-lg pt-2'
          : isSubtotal
            ? 'border-t border-gray-300 font-semibold pt-2'
            : ''
      }`}
      style={{ paddingLeft: `${indent * 1.5}rem` }}
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

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
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
            <Button variant="outline" size="sm" onClick={() => setShowBreakdown(!showBreakdown)}>
              <Eye className="w-4 h-4 mr-1" />
              {showBreakdown ? 'Hide' : 'Show'} Details
            </Button>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-3">REVENUES</h3>
            <LineItem label="Product Sales" amount={statementData.revenues.productSales} indent={1} />
            <LineItem label="Service Sales" amount={statementData.revenues.serviceSales} indent={1} />
            <LineItem label="Other Revenues" amount={statementData.revenues.otherRevenues} indent={1} />
            <LineItem label="Total Revenue" amount={statementData.revenues.totalRevenue} isSubtotal />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">COST OF GOODS SOLD</h3>
            {showBreakdown ? (
              <>
                <LineItem
                  label="Beginning Inventory"
                  amount={statementData.costOfGoodsSold.beginningInventory}
                  indent={1}
                />
                <LineItem
                  label="Purchases"
                  amount={statementData.costOfGoodsSold.purchases}
                  indent={1}
                />
                <LineItem
                  label="Direct Labor"
                  amount={statementData.costOfGoodsSold.directLabor}
                  indent={1}
                />
                <LineItem
                  label="Manufacturing Overhead"
                  amount={statementData.costOfGoodsSold.manufacturingOverhead}
                  indent={1}
                />
                <LineItem
                  label="Goods Available for Sale"
                  amount={statementData.costOfGoodsSold.goodsAvailableForSale}
                  indent={1}
                  isSubtotal
                />
                <LineItem
                  label="Less: Ending Inventory"
                  amount={statementData.costOfGoodsSold.endingInventory}
                  indent={1}
                  negative
                />
              </>
            ) : null}
            <LineItem
              label="Total Cost of Goods Sold"
              amount={statementData.costOfGoodsSold.totalCOGS}
              isSubtotal
              negative
            />
            <LineItem label="GROSS PROFIT" amount={statementData.grossProfit} isSubtotal />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">OPERATING EXPENSES</h3>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Selling Expenses</h4>
              {showBreakdown ? (
                <>
                  <LineItem
                    label="Advertising"
                    amount={statementData.operatingExpenses.selling.advertising}
                    indent={1}
                  />
                  <LineItem
                    label="Sales Commissions"
                    amount={statementData.operatingExpenses.selling.salesCommissions}
                    indent={1}
                  />
                  <LineItem
                    label="Delivery Expense"
                    amount={statementData.operatingExpenses.selling.deliveryExpense}
                    indent={1}
                  />
                </>
              ) : null}
              <LineItem
                label="Total Selling Expenses"
                amount={statementData.operatingExpenses.selling.totalSelling}
                indent={showBreakdown ? 0 : 1}
                isSubtotal
              />
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Administrative Expenses</h4>
              {showBreakdown ? (
                <>
                  <LineItem
                    label="Salaries"
                    amount={statementData.operatingExpenses.administrative.salaries}
                    indent={1}
                  />
                  <LineItem
                    label="Rent"
                    amount={statementData.operatingExpenses.administrative.rent}
                    indent={1}
                  />
                  <LineItem
                    label="Utilities"
                    amount={statementData.operatingExpenses.administrative.utilities}
                    indent={1}
                  />
                  <LineItem
                    label="Insurance"
                    amount={statementData.operatingExpenses.administrative.insurance}
                    indent={1}
                  />
                  <LineItem
                    label="Depreciation"
                    amount={statementData.operatingExpenses.administrative.depreciation}
                    indent={1}
                  />
                </>
              ) : null}
              <LineItem
                label="Total Administrative Expenses"
                amount={statementData.operatingExpenses.administrative.totalAdministrative}
                indent={showBreakdown ? 0 : 1}
                isSubtotal
              />
            </div>

            <LineItem
              label="TOTAL OPERATING EXPENSES"
              amount={statementData.operatingExpenses.totalOperating}
              isSubtotal
            />
            <LineItem label="OPERATING INCOME" amount={statementData.operatingIncome} isSubtotal />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">OTHER INCOME & EXPENSES</h3>
            <LineItem
              label="Interest Income"
              amount={statementData.nonOperating.interestIncome}
              indent={1}
            />
            <LineItem
              label="Dividend Income"
              amount={statementData.nonOperating.dividendIncome}
              indent={1}
            />
            <LineItem
              label="Gain on Sale of Assets"
              amount={statementData.nonOperating.gainOnSaleOfAssets}
              indent={1}
            />
            <LineItem
              label="Total Other Income"
              amount={statementData.nonOperating.totalOtherIncome}
              isSubtotal
            />
            <LineItem
              label="Interest Expense"
              amount={statementData.nonOperating.interestExpense}
              indent={1}
              negative
            />
            <LineItem
              label="Total Non-operating"
              amount={statementData.nonOperating.totalNonOperating}
              isSubtotal
            />
          </div>

          <div className="mb-6">
            <LineItem
              label="INCOME BEFORE TAXES"
              amount={statementData.incomeBeforeTaxes}
              isSubtotal
            />
            <LineItem
              label="Income Tax Expense"
              amount={statementData.incomeTaxes.currentTax}
              indent={1}
            />
            <LineItem
              label="Deferred Tax Benefit"
              amount={statementData.incomeTaxes.deferredTax}
              indent={1}
              negative={statementData.incomeTaxes.deferredTax < 0}
            />
            <LineItem
              label="Total Income Tax Expense"
              amount={statementData.incomeTaxes.totalTaxes}
              isSubtotal
            />
            <LineItem label="NET INCOME" amount={statementData.netIncome} isTotal />
          </div>
        </div>

        {showCalculations ? (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">Understanding Income Statement Flow:</h4>
            <div className="space-y-2 text-sm">
              <div>Gross Profit = Total Revenue - Total Cost of Goods Sold</div>
              <div>Operating Income = Gross Profit - Total Operating Expenses</div>
              <div>Income Before Taxes = Operating Income + Non-operating Income</div>
              <div>Net Income = Income Before Taxes - Total Income Tax Expense</div>
            </div>
          </div>
        ) : null}

        {showComparatives ? (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              Comparative analysis placeholder – provide prior-period data via Supabase payloads.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default IncomeStatementDetailed
