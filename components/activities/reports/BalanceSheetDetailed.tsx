'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Scale, Download, AlertCircle, Eye, Info } from 'lucide-react'

export interface BalanceSheetDetailedData {
  asOfDate: string
  assets: {
    currentAssets: {
      cashAndEquivalents: {
        cashOnHand: number
        checkingAccount: number
        savingsAccount: number
        moneyMarketFunds: number
        totalCash: number
      }
      receivables: {
        accountsReceivable: number
        notesReceivable: number
        allowanceForDoubtfulAccounts: number
        netReceivables: number
      }
      inventory: {
        rawMaterials: number
        workInProcess: number
        finishedGoods: number
        totalInventory: number
      }
      otherCurrentAssets: {
        prepaidExpenses: number
        marketableSecurities: number
        totalOtherCurrent: number
      }
      totalCurrentAssets: number
    }
    fixedAssets: {
      propertyPlantEquipment: {
        land: number
        buildings: number
        equipment: number
        vehicles: number
        furniture: number
        totalPPE: number
        accumulatedDepreciation: number
        netPPE: number
      }
      intangibleAssets: {
        patents: number
        trademarks: number
        goodwill: number
        totalIntangible: number
      }
      investments: {
        longTermInvestments: number
        subsidiaryInvestments: number
        totalInvestments: number
      }
      totalFixedAssets: number
    }
    totalAssets: number
  }
  liabilities: {
    currentLiabilities: {
      payables: {
        accountsPayable: number
        notesPayable: number
        accruedExpenses: number
        totalPayables: number
      }
      shortTermDebt: {
        shortTermLoans: number
        currentPortionLongTerm: number
        totalShortTermDebt: number
      }
      otherCurrentLiabilities: {
        accruedWages: number
        accruedTaxes: number
        deferredRevenue: number
        totalOtherCurrent: number
      }
      totalCurrentLiabilities: number
    }
    longTermLiabilities: {
      longTermDebt: {
        mortgagePayable: number
        bondsPayable: number
        bankLoans: number
        totalLongTermDebt: number
      }
      otherLongTermLiabilities: {
        deferredTaxLiability: number
        pensionLiability: number
        totalOtherLongTerm: number
      }
      totalLongTermLiabilities: number
    }
    totalLiabilities: number
  }
  equity: {
    paidInCapital: {
      commonStock: number
      preferredStock: number
      additionalPaidInCapital: number
      totalPaidInCapital: number
    }
    retainedEarnings: {
      beginningRetainedEarnings: number
      netIncome: number
      dividendsPaid: number
      endingRetainedEarnings: number
    }
    otherEquity: {
      treasuryStock: number
      accumulatedOtherIncome: number
      totalOtherEquity: number
    }
    totalEquity: number
  }
  totalLiabilitiesAndEquity: number
}

export interface BalanceSheetDetailedProps {
  data: BalanceSheetDetailedData
  title?: string
  showCalculations?: boolean
  className?: string
}

export function BalanceSheetDetailed({
  data,
  title = 'Detailed Balance Sheet',
  showCalculations = true,
  className = ''
}: BalanceSheetDetailedProps) {
  const [showDetails, setShowDetails] = useState(false)
  const statementData = data
  const isBalanced = statementData.assets.totalAssets === statementData.totalLiabilitiesAndEquity

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

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

  const currentRatio =
    statementData.assets.currentAssets.totalCurrentAssets /
    statementData.liabilities.currentLiabilities.totalCurrentLiabilities
  const quickRatio =
    (statementData.assets.currentAssets.totalCurrentAssets -
      statementData.assets.currentAssets.inventory.totalInventory) /
    statementData.liabilities.currentLiabilities.totalCurrentLiabilities
  const debtToEquityRatio =
    statementData.liabilities.totalLiabilities / statementData.equity.totalEquity
  const debtToAssetsRatio = statementData.liabilities.totalLiabilities / statementData.assets.totalAssets
  const workingCapital =
    statementData.assets.currentAssets.totalCurrentAssets -
    statementData.liabilities.currentLiabilities.totalCurrentLiabilities
  const equityRatio = statementData.equity.totalEquity / statementData.assets.totalAssets

  return (
    <Card className={`max-w-6xl mx-auto ${className}`}>
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
            <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
              <Eye className="w-4 h-4 mr-1" />
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
          <div>
            <h3 className="text-xl font-bold text-blue-800 mb-4">ASSETS</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-700 mb-3">Current Assets</h4>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Cash & Equivalents:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Cash on Hand" amount={statementData.assets.currentAssets.cashAndEquivalents.cashOnHand} indent={1} />
                      <LineItem label="Checking Account" amount={statementData.assets.currentAssets.cashAndEquivalents.checkingAccount} indent={1} />
                      <LineItem label="Savings Account" amount={statementData.assets.currentAssets.cashAndEquivalents.savingsAccount} indent={1} />
                      <LineItem label="Money Market Funds" amount={statementData.assets.currentAssets.cashAndEquivalents.moneyMarketFunds} indent={1} />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Cash & Equivalents"
                    amount={statementData.assets.currentAssets.cashAndEquivalents.totalCash}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Receivables:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Accounts Receivable" amount={statementData.assets.currentAssets.receivables.accountsReceivable} indent={1} />
                      <LineItem label="Notes Receivable" amount={statementData.assets.currentAssets.receivables.notesReceivable} indent={1} />
                      <LineItem
                        label="Allowance for Doubtful Accounts"
                        amount={statementData.assets.currentAssets.receivables.allowanceForDoubtfulAccounts}
                        indent={1}
                        negative
                      />
                    </>
                  ) : null}
                  <LineItem
                    label="Net Receivables"
                    amount={statementData.assets.currentAssets.receivables.netReceivables}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Inventory:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Raw Materials" amount={statementData.assets.currentAssets.inventory.rawMaterials} indent={1} />
                      <LineItem label="Work in Process" amount={statementData.assets.currentAssets.inventory.workInProcess} indent={1} />
                      <LineItem label="Finished Goods" amount={statementData.assets.currentAssets.inventory.finishedGoods} indent={1} />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Inventory"
                    amount={statementData.assets.currentAssets.inventory.totalInventory}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Other Current Assets:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Prepaid Expenses" amount={statementData.assets.currentAssets.otherCurrentAssets.prepaidExpenses} indent={1} />
                      <LineItem label="Marketable Securities" amount={statementData.assets.currentAssets.otherCurrentAssets.marketableSecurities} indent={1} />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Other Current Assets"
                    amount={statementData.assets.currentAssets.otherCurrentAssets.totalOtherCurrent}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <LineItem
                  label="TOTAL CURRENT ASSETS"
                  amount={statementData.assets.currentAssets.totalCurrentAssets}
                  isSubtotal
                />
              </div>

              <div>
                <h4 className="font-semibold text-blue-700 mb-3">Fixed & Other Assets</h4>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Property, Plant & Equipment:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Land" amount={statementData.assets.fixedAssets.propertyPlantEquipment.land} indent={1} />
                      <LineItem label="Buildings" amount={statementData.assets.fixedAssets.propertyPlantEquipment.buildings} indent={1} />
                      <LineItem label="Equipment" amount={statementData.assets.fixedAssets.propertyPlantEquipment.equipment} indent={1} />
                      <LineItem label="Vehicles" amount={statementData.assets.fixedAssets.propertyPlantEquipment.vehicles} indent={1} />
                      <LineItem label="Furniture" amount={statementData.assets.fixedAssets.propertyPlantEquipment.furniture} indent={1} />
                      <LineItem
                        label="Total PPE"
                        amount={statementData.assets.fixedAssets.propertyPlantEquipment.totalPPE}
                        indent={1}
                        isSubtotal
                      />
                      <LineItem
                        label="Less: Accumulated Depreciation"
                        amount={statementData.assets.fixedAssets.propertyPlantEquipment.accumulatedDepreciation}
                        indent={1}
                        negative
                      />
                    </>
                  ) : null}
                  <LineItem
                    label="Net Property, Plant & Equipment"
                    amount={statementData.assets.fixedAssets.propertyPlantEquipment.netPPE}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Intangible Assets:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Patents" amount={statementData.assets.fixedAssets.intangibleAssets.patents} indent={1} />
                      <LineItem label="Trademarks" amount={statementData.assets.fixedAssets.intangibleAssets.trademarks} indent={1} />
                      <LineItem label="Goodwill" amount={statementData.assets.fixedAssets.intangibleAssets.goodwill} indent={1} />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Intangible Assets"
                    amount={statementData.assets.fixedAssets.intangibleAssets.totalIntangible}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Investments:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Long-term Investments" amount={statementData.assets.fixedAssets.investments.longTermInvestments} indent={1} />
                      <LineItem label="Subsidiary Investments" amount={statementData.assets.fixedAssets.investments.subsidiaryInvestments} indent={1} />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Investments"
                    amount={statementData.assets.fixedAssets.investments.totalInvestments}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <LineItem label="TOTAL FIXED & OTHER ASSETS" amount={statementData.assets.fixedAssets.totalFixedAssets} isSubtotal />
              </div>
            </div>

            <LineItem label="TOTAL ASSETS" amount={statementData.assets.totalAssets} isTotal />
          </div>

          <div>
            <h3 className="text-xl font-bold text-red-800 mb-4">LIABILITIES</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-red-700 mb-3">Current Liabilities</h4>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Payables:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Accounts Payable" amount={statementData.liabilities.currentLiabilities.payables.accountsPayable} indent={1} />
                      <LineItem label="Notes Payable" amount={statementData.liabilities.currentLiabilities.payables.notesPayable} indent={1} />
                      <LineItem label="Accrued Expenses" amount={statementData.liabilities.currentLiabilities.payables.accruedExpenses} indent={1} />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Payables"
                    amount={statementData.liabilities.currentLiabilities.payables.totalPayables}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Short-term Debt:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Short-term Loans" amount={statementData.liabilities.currentLiabilities.shortTermDebt.shortTermLoans} indent={1} />
                      <LineItem
                        label="Current Portion of Long-term Debt"
                        amount={statementData.liabilities.currentLiabilities.shortTermDebt.currentPortionLongTerm}
                        indent={1}
                      />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Short-term Debt"
                    amount={statementData.liabilities.currentLiabilities.shortTermDebt.totalShortTermDebt}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Other Current Liabilities:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Accrued Wages" amount={statementData.liabilities.currentLiabilities.otherCurrentLiabilities.accruedWages} indent={1} />
                      <LineItem label="Accrued Taxes" amount={statementData.liabilities.currentLiabilities.otherCurrentLiabilities.accruedTaxes} indent={1} />
                      <LineItem label="Deferred Revenue" amount={statementData.liabilities.currentLiabilities.otherCurrentLiabilities.deferredRevenue} indent={1} />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Other Current Liabilities"
                    amount={statementData.liabilities.currentLiabilities.otherCurrentLiabilities.totalOtherCurrent}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <LineItem
                  label="TOTAL CURRENT LIABILITIES"
                  amount={statementData.liabilities.currentLiabilities.totalCurrentLiabilities}
                  isSubtotal
                />
              </div>

              <div>
                <h4 className="font-semibold text-red-700 mb-3">Long-term Liabilities</h4>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Long-term Debt:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Mortgage Payable" amount={statementData.liabilities.longTermLiabilities.longTermDebt.mortgagePayable} indent={1} />
                      <LineItem label="Bonds Payable" amount={statementData.liabilities.longTermLiabilities.longTermDebt.bondsPayable} indent={1} />
                      <LineItem label="Bank Loans" amount={statementData.liabilities.longTermLiabilities.longTermDebt.bankLoans} indent={1} />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Long-term Debt"
                    amount={statementData.liabilities.longTermLiabilities.longTermDebt.totalLongTermDebt}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Other Long-term Liabilities:</h5>
                  {showDetails ? (
                    <>
                      <LineItem label="Deferred Tax Liability" amount={statementData.liabilities.longTermLiabilities.otherLongTermLiabilities.deferredTaxLiability} indent={1} />
                      <LineItem label="Pension Liability" amount={statementData.liabilities.longTermLiabilities.otherLongTermLiabilities.pensionLiability} indent={1} />
                    </>
                  ) : null}
                  <LineItem
                    label="Total Other Long-term Liabilities"
                    amount={statementData.liabilities.longTermLiabilities.otherLongTermLiabilities.totalOtherLongTerm}
                    indent={showDetails ? 0 : 1}
                    isSubtotal
                  />
                </div>

                <LineItem
                  label="TOTAL LONG-TERM LIABILITIES"
                  amount={statementData.liabilities.longTermLiabilities.totalLongTermLiabilities}
                  isSubtotal
                />
              </div>
            </div>

            <LineItem label="TOTAL LIABILITIES" amount={statementData.liabilities.totalLiabilities} isSubtotal />
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-800 mb-4">STOCKHOLDERS&rsquo; EQUITY</h3>

            <div className="mb-4">
              <h5 className="font-semibold text-gray-700 mb-2">Paid-in Capital:</h5>
              {showDetails ? (
                <>
                  <LineItem label="Common Stock" amount={statementData.equity.paidInCapital.commonStock} indent={1} />
                  <LineItem label="Preferred Stock" amount={statementData.equity.paidInCapital.preferredStock} indent={1} />
                  <LineItem
                    label="Additional Paid-in Capital"
                    amount={statementData.equity.paidInCapital.additionalPaidInCapital}
                    indent={1}
                  />
                </>
              ) : null}
              <LineItem
                label="Total Paid-in Capital"
                amount={statementData.equity.paidInCapital.totalPaidInCapital}
                indent={showDetails ? 0 : 1}
                isSubtotal
              />
            </div>

            <div className="mb-4">
              <h5 className="font-semibold text-gray-700 mb-2">Retained Earnings:</h5>
              {showDetails ? (
                <>
                  <LineItem
                    label="Beginning Retained Earnings"
                    amount={statementData.equity.retainedEarnings.beginningRetainedEarnings}
                    indent={1}
                  />
                  <LineItem label="Net Income" amount={statementData.equity.retainedEarnings.netIncome} indent={1} />
                  <LineItem
                    label="Dividends Paid"
                    amount={statementData.equity.retainedEarnings.dividendsPaid}
                    indent={1}
                    negative={statementData.equity.retainedEarnings.dividendsPaid < 0}
                  />
                </>
              ) : null}
              <LineItem
                label="Ending Retained Earnings"
                amount={statementData.equity.retainedEarnings.endingRetainedEarnings}
                indent={showDetails ? 0 : 1}
                isSubtotal
              />
            </div>

            <div className="mb-4">
              <h5 className="font-semibold text-gray-700 mb-2">Other Equity Items:</h5>
              {showDetails ? (
                <>
                  <LineItem
                    label="Treasury Stock"
                    amount={statementData.equity.otherEquity.treasuryStock}
                    indent={1}
                    negative={statementData.equity.otherEquity.treasuryStock < 0}
                  />
                  <LineItem
                    label="Accumulated Other Comprehensive Income"
                    amount={statementData.equity.otherEquity.accumulatedOtherIncome}
                    indent={1}
                  />
                </>
              ) : null}
              <LineItem
                label="Total Other Equity"
                amount={statementData.equity.otherEquity.totalOtherEquity}
                indent={showDetails ? 0 : 1}
                isSubtotal
              />
            </div>

            <LineItem label="TOTAL STOCKHOLDERS&rsquo; EQUITY" amount={statementData.equity.totalEquity} isSubtotal />

            <div className="mt-6 pt-4 border-t-2 border-gray-800">
              <LineItem label="TOTAL LIABILITIES & EQUITY" amount={statementData.totalLiabilitiesAndEquity} isTotal />
            </div>
          </div>
        </div>

        {showCalculations ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{currentRatio.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Current Ratio</div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentRatio >= 2 ? 'Excellent' : currentRatio >= 1.5 ? 'Good' : currentRatio >= 1 ? 'Adequate' : 'Poor'} liquidity
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{formatCurrency(workingCapital)}</div>
                <div className="text-sm text-gray-600">Working Capital</div>
                <div className="text-xs text-gray-500 mt-1">Liquidity cushion</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{debtToEquityRatio.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Debt-to-Equity</div>
                <div className="text-xs text-gray-500 mt-1">
                  {debtToEquityRatio <= 1 ? 'Conservative' : 'Leveraged'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">{(debtToAssetsRatio * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Debt-to-Assets</div>
                <div className="text-xs text-gray-500 mt-1">Leverage ratio</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-600">{(equityRatio * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Equity Ratio</div>
                <div className="text-xs text-gray-500 mt-1">Owner&rsquo;s stake</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-teal-600">
                  {(
                    (statementData.assets.currentAssets.totalCurrentAssets / statementData.assets.totalAssets) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm text-gray-600">Current Asset Mix</div>
                <div className="text-xs text-gray-500 mt-1">Asset structure</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Financial Health Indicators:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Liquidity Analysis:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Current Ratio: {currentRatio >= 2 ? 'Excellent' : currentRatio >= 1.5 ? 'Good' : currentRatio >= 1 ? 'Adequate' : 'Poor'} liquidity position</li>
                    <li>Quick Ratio: {quickRatio >= 1 ? 'Strong' : 'Weak'} ability to meet short-term obligations</li>
                    <li>Working Capital: {formatCurrency(workingCapital)} available for operations</li>
                  </ul>
                </div>
                <div>
                  <strong>Leverage Analysis:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Debt-to-Equity: {debtToEquityRatio <= 1 ? 'Conservative' : debtToEquityRatio <= 2 ? 'Moderate' : 'High'} leverage</li>
                    <li>Equity Ratio: {(equityRatio * 100).toFixed(1)}% of assets financed by equity</li>
                    <li>Asset Structure: {(
                      (statementData.assets.currentAssets.totalCurrentAssets / statementData.assets.totalAssets) *
                      100
                    ).toFixed(1)}
                    % current assets</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default BalanceSheetDetailed
