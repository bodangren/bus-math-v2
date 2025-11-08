'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, Download, Calculator, Eye } from 'lucide-react'
import { useState } from 'react'

export interface DetailedCashFlowData {
  period: string
  operatingActivities: {
    netIncome: number
    adjustments: {
      depreciation: number
      amortization: number
      lossOnSaleOfAssets: number
      badDebtExpense: number
      stockBasedCompensation: number
      deferredTaxes: number
      totalAdjustments: number
    }
    workingCapitalChanges: {
      accountsReceivable: number
      inventory: number
      prepaidExpenses: number
      accountsPayable: number
      accruedLiabilities: number
      deferredRevenue: number
      totalWorkingCapitalChanges: number
    }
    netOperatingCashFlow: number
  }
  investingActivities: {
    capitalExpenditures: {
      equipmentPurchases: number
      buildingPurchases: number
      vehiclePurchases: number
      totalCapEx: number
    }
    assetSales: {
      equipmentSales: number
      buildingSales: number
      totalAssetSales: number
    }
    investments: {
      purchaseOfSecurities: number
      saleOfSecurities: number
      acquisitions: number
      totalInvestments: number
    }
    netInvestingCashFlow: number
  }
  financingActivities: {
    equity: {
      stockIssuance: number
      stockRepurchases: number
      dividendPayments: number
      totalEquity: number
    }
    debt: {
      loanProceeds: number
      loanRepayments: number
      bondIssuance: number
      bondRepayments: number
      totalDebt: number
    }
    netFinancingCashFlow: number
  }
  supplementalDisclosures: {
    interestPaid: number
    taxesPaid: number
    nonCashTransactions: {
      assetAcquisitionByDebt: number
      stockIssuedForServices: number
    }
  }
  netChangeInCash: number
  beginningCash: number
  endingCash: number
}

export interface CashFlowStatementDetailedProps {
  data: DetailedCashFlowData
  title?: string
  showCalculations?: boolean
  showSupplemental?: boolean
  className?: string
}

export function CashFlowStatementDetailed({ 
  data,
  title = "Detailed Cash Flow Statement",
  showCalculations = false,
  showSupplemental = true,
  className = ""
}: CashFlowStatementDetailedProps) {
  
  const [showBreakdown, setShowBreakdown] = useState(false)

  const statementData = data

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCashFlowBadge = (netChange: number) => {
    if (netChange > 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
        <TrendingUp className="w-3 h-3 mr-1" />
        Cash Increased
      </Badge>
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
        <TrendingDown className="w-3 h-3 mr-1" />
        Cash Decreased
      </Badge>
    }
  }

  const getActivityBadge = (amount: number, activity: string) => {
    const isPositive = amount > 0
    const color = activity === 'Operating' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  activity === 'Investing' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                  'bg-orange-100 text-orange-800 border-orange-300'
    
    return (
      <Badge variant="outline" className={color}>
        {isPositive ? '+' : ''}{formatCurrency(amount)}
      </Badge>
    )
  }

  const LineItem = ({ label, amount, isSubtotal = false, isTotal = false, indent = 0, showSign = true }: {
    label: string
    amount: number
    isSubtotal?: boolean
    isTotal?: boolean
    indent?: number
    showSign?: boolean
  }) => (
    <div className={`flex justify-between items-center py-1 ${
      isTotal ? 'border-t-2 border-gray-800 font-bold text-lg pt-2' : 
      isSubtotal ? 'border-t border-gray-300 font-semibold pt-2' : ''
    }`} style={{ paddingLeft: `${indent * 1.5}rem` }}>
      <span className={isTotal ? 'text-gray-900' : 'text-gray-700'}>
        {label}
      </span>
      <span className={`${isTotal ? 'text-gray-900' : 'text-gray-600'} font-mono`}>
        {amount < 0 && showSign ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount)}
      </span>
    </div>
  )

  return (
    <Card className={`max-w-5xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              {title}
            </CardTitle>
            <CardDescription className="text-lg mt-1">
              {statementData.period}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getCashFlowBadge(statementData.netChangeInCash)}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
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
          {/* Operating Activities */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-800">CASH FLOWS FROM OPERATING ACTIVITIES</h3>
              {getActivityBadge(statementData.operatingActivities.netOperatingCashFlow, 'Operating')}
            </div>
            
            <LineItem label="Net Income" amount={statementData.operatingActivities.netIncome} indent={1} />
            
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Adjustments to reconcile net income to net cash:</h4>
              <LineItem label="Depreciation Expense" amount={statementData.operatingActivities.adjustments.depreciation} indent={2} />
              <LineItem label="Amortization Expense" amount={statementData.operatingActivities.adjustments.amortization} indent={2} />
              <LineItem label="Loss on Sale of Assets" amount={statementData.operatingActivities.adjustments.lossOnSaleOfAssets} indent={2} />
              <LineItem label="Bad Debt Expense" amount={statementData.operatingActivities.adjustments.badDebtExpense} indent={2} />
              <LineItem label="Stock-Based Compensation" amount={statementData.operatingActivities.adjustments.stockBasedCompensation} indent={2} />
              <LineItem label="Deferred Tax Benefit" amount={statementData.operatingActivities.adjustments.deferredTaxes} indent={2} />
              {showBreakdown && (
                <LineItem label="Total Adjustments" amount={statementData.operatingActivities.adjustments.totalAdjustments} indent={2} isSubtotal />
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Changes in operating assets and liabilities:</h4>
              <LineItem label="Accounts Receivable" amount={statementData.operatingActivities.workingCapitalChanges.accountsReceivable} indent={2} />
              <LineItem label="Inventory" amount={statementData.operatingActivities.workingCapitalChanges.inventory} indent={2} />
              <LineItem label="Prepaid Expenses" amount={statementData.operatingActivities.workingCapitalChanges.prepaidExpenses} indent={2} />
              <LineItem label="Accounts Payable" amount={statementData.operatingActivities.workingCapitalChanges.accountsPayable} indent={2} />
              <LineItem label="Accrued Liabilities" amount={statementData.operatingActivities.workingCapitalChanges.accruedLiabilities} indent={2} />
              <LineItem label="Deferred Revenue" amount={statementData.operatingActivities.workingCapitalChanges.deferredRevenue} indent={2} />
              {showBreakdown && (
                <LineItem label="Total Working Capital Changes" amount={statementData.operatingActivities.workingCapitalChanges.totalWorkingCapitalChanges} indent={2} isSubtotal />
              )}
            </div>

            <LineItem 
              label="Net Cash Provided by Operating Activities" 
              amount={statementData.operatingActivities.netOperatingCashFlow} 
              isSubtotal 
            />
          </div>

          {/* Investing Activities */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-purple-800">CASH FLOWS FROM INVESTING ACTIVITIES</h3>
              {getActivityBadge(statementData.investingActivities.netInvestingCashFlow, 'Investing')}
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Capital Expenditures:</h4>
              <LineItem label="Purchase of Equipment" amount={statementData.investingActivities.capitalExpenditures.equipmentPurchases} indent={2} />
              <LineItem label="Purchase of Buildings" amount={statementData.investingActivities.capitalExpenditures.buildingPurchases} indent={2} />
              <LineItem label="Purchase of Vehicles" amount={statementData.investingActivities.capitalExpenditures.vehiclePurchases} indent={2} />
              {showBreakdown && (
                <LineItem label="Total Capital Expenditures" amount={statementData.investingActivities.capitalExpenditures.totalCapEx} indent={2} isSubtotal />
              )}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Asset Sales:</h4>
              <LineItem label="Sale of Equipment" amount={statementData.investingActivities.assetSales.equipmentSales} indent={2} />
              <LineItem label="Sale of Buildings" amount={statementData.investingActivities.assetSales.buildingSales} indent={2} />
              {showBreakdown && (
                <LineItem label="Total from Asset Sales" amount={statementData.investingActivities.assetSales.totalAssetSales} indent={2} isSubtotal />
              )}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Investment Activities:</h4>
              <LineItem label="Purchase of Securities" amount={statementData.investingActivities.investments.purchaseOfSecurities} indent={2} />
              <LineItem label="Sale of Securities" amount={statementData.investingActivities.investments.saleOfSecurities} indent={2} />
              <LineItem label="Business Acquisitions" amount={statementData.investingActivities.investments.acquisitions} indent={2} />
              {showBreakdown && (
                <LineItem label="Net Investment Activities" amount={statementData.investingActivities.investments.totalInvestments} indent={2} isSubtotal />
              )}
            </div>

            <LineItem 
              label="Net Cash Used in Investing Activities" 
              amount={statementData.investingActivities.netInvestingCashFlow} 
              isSubtotal 
            />
          </div>

          {/* Financing Activities */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-orange-800">CASH FLOWS FROM FINANCING ACTIVITIES</h3>
              {getActivityBadge(statementData.financingActivities.netFinancingCashFlow, 'Financing')}
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Equity Transactions:</h4>
              <LineItem label="Issuance of Common Stock" amount={statementData.financingActivities.equity.stockIssuance} indent={2} />
              <LineItem label="Repurchase of Common Stock" amount={statementData.financingActivities.equity.stockRepurchases} indent={2} />
              <LineItem label="Payment of Dividends" amount={statementData.financingActivities.equity.dividendPayments} indent={2} />
              {showBreakdown && (
                <LineItem label="Net from Equity Transactions" amount={statementData.financingActivities.equity.totalEquity} indent={2} isSubtotal />
              )}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Debt Transactions:</h4>
              <LineItem label="Proceeds from Loans" amount={statementData.financingActivities.debt.loanProceeds} indent={2} />
              <LineItem label="Repayment of Loans" amount={statementData.financingActivities.debt.loanRepayments} indent={2} />
              <LineItem label="Issuance of Bonds" amount={statementData.financingActivities.debt.bondIssuance} indent={2} />
              <LineItem label="Repayment of Bonds" amount={statementData.financingActivities.debt.bondRepayments} indent={2} />
              {showBreakdown && (
                <LineItem label="Net from Debt Transactions" amount={statementData.financingActivities.debt.totalDebt} indent={2} isSubtotal />
              )}
            </div>

            <LineItem 
              label="Net Cash Provided by Financing Activities" 
              amount={statementData.financingActivities.netFinancingCashFlow} 
              isSubtotal 
            />
          </div>

          {/* Summary */}
          <div className="border-t-2 border-gray-300 pt-4">
            <LineItem label="Net Increase (Decrease) in Cash" amount={statementData.netChangeInCash} isSubtotal />
            <LineItem label="Cash and Cash Equivalents at Beginning of Year" amount={statementData.beginningCash} />
            <LineItem label="Cash and Cash Equivalents at End of Year" amount={statementData.endingCash} isTotal />
          </div>
        </div>

        {/* Supplemental Disclosures */}
        {showSupplemental && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3">SUPPLEMENTAL CASH FLOW DISCLOSURES</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Cash Payments Made:</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Interest paid</span>
                    <span className="font-mono">{formatCurrency(statementData.supplementalDisclosures.interestPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income taxes paid</span>
                    <span className="font-mono">{formatCurrency(statementData.supplementalDisclosures.taxesPaid)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Non-Cash Transactions:</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Assets acquired by debt</span>
                    <span className="font-mono">{formatCurrency(statementData.supplementalDisclosures.nonCashTransactions.assetAcquisitionByDebt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock issued for services</span>
                    <span className="font-mono">{formatCurrency(statementData.supplementalDisclosures.nonCashTransactions.stockIssuedForServices)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCalculations && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Cash Flow Analysis Methods:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-semibold mb-2">Direct Method:</h5>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Cash receipts from customers</li>
                  <li>Cash payments to suppliers</li>
                  <li>Cash payments for operating expenses</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Indirect Method (Used Here):</h5>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Start with net income</li>
                  <li>Add back non-cash expenses</li>
                  <li>Adjust for working capital changes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Cash Flow Analysis Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(statementData.operatingActivities.netOperatingCashFlow)}
            </div>
            <div className="text-sm text-gray-600">Operating Cash Flow</div>
            <div className="text-xs text-gray-500 mt-1">
              {((statementData.operatingActivities.netOperatingCashFlow / statementData.operatingActivities.netIncome) * 100).toFixed(0)}% of net income
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              {formatCurrency(statementData.investingActivities.netInvestingCashFlow)}
            </div>
            <div className="text-sm text-gray-600">Investing Cash Flow</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatCurrency(Math.abs(statementData.investingActivities.capitalExpenditures.totalCapEx))} in CapEx
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">
              {formatCurrency(statementData.financingActivities.netFinancingCashFlow)}
            </div>
            <div className="text-sm text-gray-600">Financing Cash Flow</div>
            <div className="text-xs text-gray-500 mt-1">
              {statementData.financingActivities.netFinancingCashFlow > 0 ? 'Net financing inflow' : 'Net financing outflow'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {((statementData.endingCash / (statementData.endingCash - statementData.netChangeInCash)) * 100 - 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Cash Growth Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              Year-over-year change
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export default CashFlowStatementDetailed
