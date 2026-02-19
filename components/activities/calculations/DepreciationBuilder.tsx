'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingDown, DollarSign, Calendar, AlertTriangle, RefreshCw, Eye, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface AssetInfo {
  name: string;
  cost: number;
  salvageValue: number;
  usefulLife: number;
  unitsProduced?: number;
  totalUnits?: number;
}

interface DepreciationSchedule {
  year: number;
  beginningBookValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingBookValue: number;
  rate?: number;
}

interface DepreciationMethod {
  id: string;
  name: string;
  description: string;
  formula: string;
  businessUse: string;
  taxImplications: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calculate: (asset: AssetInfo, year: number) => DepreciationSchedule[];
}

const DEPRECIATION_METHODS: DepreciationMethod[] = [
  {
    id: 'straight-line',
    name: 'Straight-Line Depreciation',
    description: 'Equal depreciation expense each year over the asset\'s useful life',
    formula: '(Cost - Salvage Value) / Useful Life',
    businessUse: 'Most common method for financial reporting; simple and predictable expense',
    taxImplications: 'Provides consistent tax deduction each year',
    difficulty: 'Easy',
    calculate: (asset: AssetInfo) => {
      const annualDepreciation = (asset.cost - asset.salvageValue) / asset.usefulLife;
      const schedule: DepreciationSchedule[] = [];

      for (let year = 1; year <= asset.usefulLife; year++) {
        const beginningBookValue = year === 1 ? asset.cost : schedule[year - 2].endingBookValue;
        const accumulatedDepreciation = annualDepreciation * year;
        const endingBookValue = asset.cost - accumulatedDepreciation;

        schedule.push({
          year,
          beginningBookValue,
          depreciationExpense: annualDepreciation,
          accumulatedDepreciation,
          endingBookValue
        });
      }

      return schedule;
    }
  },
  {
    id: 'double-declining',
    name: 'Double Declining Balance',
    description: 'Accelerated depreciation with higher expenses in early years',
    formula: '(2 / Useful Life) × Beginning Book Value',
    businessUse: 'Matches expense to higher productivity of new assets; common for vehicles and technology',
    taxImplications: 'Larger tax deductions in early years, reducing taxable income sooner',
    difficulty: 'Medium',
    calculate: (asset: AssetInfo) => {
      const rate = 2 / asset.usefulLife;
      const schedule: DepreciationSchedule[] = [];

      for (let year = 1; year <= asset.usefulLife; year++) {
        const beginningBookValue = year === 1 ? asset.cost : schedule[year - 2].endingBookValue;
        let depreciationExpense = beginningBookValue * rate;

        // Don't depreciate below salvage value
        if (beginningBookValue - depreciationExpense < asset.salvageValue) {
          depreciationExpense = beginningBookValue - asset.salvageValue;
        }

        const accumulatedDepreciation = year === 1 ? depreciationExpense : schedule[year - 2].accumulatedDepreciation + depreciationExpense;
        const endingBookValue = asset.cost - accumulatedDepreciation;

        schedule.push({
          year,
          beginningBookValue,
          depreciationExpense,
          accumulatedDepreciation,
          endingBookValue,
          rate: rate * 100
        });
      }

      return schedule;
    }
  },
  {
    id: 'sum-of-years',
    name: 'Sum-of-the-Years\' Digits',
    description: 'Accelerated depreciation using a fraction based on remaining useful life',
    formula: '(Remaining Life / Sum of Years) × (Cost - Salvage Value)',
    businessUse: 'Accelerated depreciation that\'s less aggressive than double declining; good for equipment',
    taxImplications: 'Front-loads tax deductions while providing smoother decline than double declining',
    difficulty: 'Hard',
    calculate: (asset: AssetInfo) => {
      const sumOfYears = (asset.usefulLife * (asset.usefulLife + 1)) / 2;
      const depreciableBase = asset.cost - asset.salvageValue;
      const schedule: DepreciationSchedule[] = [];

      for (let year = 1; year <= asset.usefulLife; year++) {
        const remainingLife = asset.usefulLife - year + 1;
        const depreciationExpense = (remainingLife / sumOfYears) * depreciableBase;
        const beginningBookValue = year === 1 ? asset.cost : schedule[year - 2].endingBookValue;
        const accumulatedDepreciation = year === 1 ? depreciationExpense : schedule[year - 2].accumulatedDepreciation + depreciationExpense;
        const endingBookValue = asset.cost - accumulatedDepreciation;

        schedule.push({
          year,
          beginningBookValue,
          depreciationExpense,
          accumulatedDepreciation,
          endingBookValue,
          rate: (remainingLife / sumOfYears) * 100
        });
      }

      return schedule;
    }
  },
  {
    id: 'units-of-production',
    name: 'Units of Production',
    description: 'Depreciation based on actual usage or output rather than time',
    formula: '((Cost - Salvage) / Total Units) × Units Produced',
    businessUse: 'Best for assets where usage varies significantly; matches expense to actual use',
    taxImplications: 'Deduction varies with production levels; requires accurate usage tracking',
    difficulty: 'Medium',
    calculate: (asset: AssetInfo) => {
      if (!asset.totalUnits || !asset.unitsProduced) {
        throw new Error('Units of production method requires totalUnits and unitsProduced');
      }

      const perUnitDepreciation = (asset.cost - asset.salvageValue) / asset.totalUnits;
      const schedule: DepreciationSchedule[] = [];

      // For demonstration, we'll show one year's calculation
      // In reality, this would vary based on actual production each year
      const depreciationExpense = perUnitDepreciation * asset.unitsProduced;
      const accumulatedDepreciation = depreciationExpense;
      const endingBookValue = asset.cost - accumulatedDepreciation;

      schedule.push({
        year: 1,
        beginningBookValue: asset.cost,
        depreciationExpense,
        accumulatedDepreciation,
        endingBookValue,
        rate: (asset.unitsProduced / asset.totalUnits) * 100
      });

      return schedule;
    }
  }
];

export default function DepreciationMethodBuilder() {
  const [selectedMethod, setSelectedMethod] = useState<DepreciationMethod>(DEPRECIATION_METHODS[0]);
  const [assetInfo, setAssetInfo] = useState<AssetInfo>({
    name: 'Restaurant Kitchen Equipment',
    cost: 50000,
    salvageValue: 5000,
    usefulLife: 5,
    unitsProduced: 10000,
    totalUnits: 50000
  });
  const [schedule, setSchedule] = useState<DepreciationSchedule[] | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonSchedules, setComparisonSchedules] = useState<Record<string, DepreciationSchedule[]>>({});
  const [showInstructions, setShowInstructions] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);

  const handleInputChange = (field: keyof AssetInfo, value: string) => {
    const numValue = parseFloat(value) || 0;
    setAssetInfo(prev => ({ ...prev, [field]: numValue }));
  };

  const calculateDepreciation = () => {
    try {
      const result = selectedMethod.calculate(assetInfo, 1);
      setSchedule(result);
    } catch {
      setSchedule([]);
      alert('Calculation failed. Please check your input values.');
    }
  };

  const compareAllMethods = () => {
    const comparisons: Record<string, DepreciationSchedule[]> = {};

    DEPRECIATION_METHODS.forEach(method => {
      try {
        if (method.id === 'units-of-production' && (!assetInfo.totalUnits || !assetInfo.unitsProduced)) {
          return; // Skip units of production if units aren\'t provided
        }
        comparisons[method.id] = method.calculate(assetInfo, 1);
      } catch {
        // Skip methods that fail
      }
    });

    setComparisonSchedules(comparisons);
    setCompareMode(true);
  };

  const resetInputs = () => {
    setAssetInfo({
      name: 'Restaurant Kitchen Equipment',
      cost: 50000,
      salvageValue: 5000,
      usefulLife: 5,
      unitsProduced: 10000,
      totalUnits: 50000
    });
    setSchedule(null);
    setCompareMode(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl">📉</span>
          <h1 className="text-3xl font-bold text-gray-900">Depreciation Method Builder</h1>
          <span className="text-4xl">💼</span>
        </div>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Master asset depreciation calculations for business decision-making and tax planning. Build the financial
          analysis skills needed for Unit 7 Asset & Inventory Tracker - where asset management directly impacts business profitability.
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
        <Card className="border-blue-300 bg-blue-100">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              How to Use the Depreciation Method Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Learning Objectives</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Compare four major depreciation methods used in business accounting</li>
                <li>• Understand tax implications of different depreciation strategies</li>
                <li>• Calculate multi-year depreciation schedules for long-term assets</li>
                <li>• Learn how depreciation affects business profitability and cash flow</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 mb-2">📋 Step-by-Step Instructions</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                <li>Choose a depreciation method from the tabs</li>
                <li>Enter asset information (cost, salvage value, useful life)</li>
                <li>Click &quot;Calculate Depreciation&quot; to see the full schedule</li>
                <li>Review year-by-year breakdown and book values</li>
                <li>Use &quot;Compare All Methods&quot; to see different approaches side-by-side</li>
                <li>Analyze which method best fits your business needs</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 mb-2">💡 Business Applications</h4>
              <p className="text-blue-800 text-sm">
                Depreciation method choice significantly impacts financial statements, tax obligations, and business decisions.
                Straight-line provides consistency, while accelerated methods (DDB, SYD) front-load expenses and tax deductions.
                Understanding these trade-offs helps business owners make strategic asset management decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Information Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Asset Information
          </CardTitle>
          <CardDescription>Enter the details of your business asset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="assetName">Asset Name</Label>
              <Input
                id="assetName"
                value={assetInfo.name}
                onChange={(e) => setAssetInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Kitchen Equipment"
              />
            </div>
            <div>
              <Label htmlFor="cost">Asset Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                value={assetInfo.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="Purchase price"
              />
            </div>
            <div>
              <Label htmlFor="salvageValue">Salvage Value ($)</Label>
              <Input
                id="salvageValue"
                type="number"
                value={assetInfo.salvageValue}
                onChange={(e) => handleInputChange('salvageValue', e.target.value)}
                placeholder="Estimated end value"
              />
            </div>
            <div>
              <Label htmlFor="usefulLife">Useful Life (years)</Label>
              <Input
                id="usefulLife"
                type="number"
                value={assetInfo.usefulLife}
                onChange={(e) => handleInputChange('usefulLife', e.target.value)}
                placeholder="Years of use"
              />
            </div>
            <div>
              <Label htmlFor="totalUnits">Total Units (lifetime)</Label>
              <Input
                id="totalUnits"
                type="number"
                value={assetInfo.totalUnits || ''}
                onChange={(e) => handleInputChange('totalUnits', e.target.value)}
                placeholder="For units of production"
              />
            </div>
            <div>
              <Label htmlFor="unitsProduced">Units This Year</Label>
              <Input
                id="unitsProduced"
                type="number"
                value={assetInfo.unitsProduced || ''}
                onChange={(e) => handleInputChange('unitsProduced', e.target.value)}
                placeholder="For units of production"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method Selection Tabs */}
      <Tabs value={selectedMethod.id} onValueChange={(value) => {
        const method = DEPRECIATION_METHODS.find(m => m.id === value);
        if (method) {
          setSelectedMethod(method);
          setSchedule(null);
          setCompareMode(false);
        }
      }}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {DEPRECIATION_METHODS.map((method) => (
            <TabsTrigger key={method.id} value={method.id} className="text-xs">
              {method.name.split(' ')[0]} {method.name.split(' ')[1]}
            </TabsTrigger>
          ))}
        </TabsList>

        {DEPRECIATION_METHODS.map((method) => (
          <TabsContent key={method.id} value={method.id}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Method Information */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    {method.name}
                    <Badge variant={method.difficulty === 'Hard' ? 'destructive' : method.difficulty === 'Medium' ? 'secondary' : 'outline'}>
                      {method.difficulty}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showFormulas && (
                    <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                      <h4 className="font-medium text-blue-900 mb-2">Formula:</h4>
                      <code className="text-sm text-blue-800 block">{method.formula}</code>
                    </div>
                  )}

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Business Use:</h4>
                    <p className="text-sm text-green-700">{method.businessUse}</p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Tax Implications:</h4>
                    <p className="text-sm text-yellow-700">{method.taxImplications}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={calculateDepreciation} className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Calculate Depreciation
                    </Button>
                    <Button onClick={compareAllMethods} variant="outline" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Compare All Methods
                    </Button>
                    <Button onClick={resetInputs} variant="outline" className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results/Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {compareMode ? 'Method Comparison' : 'Depreciation Schedule'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {compareMode ? (
                    <div className="space-y-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-3 py-2 text-left">Method</th>
                              <th className="border border-gray-300 px-3 py-2 text-right">Year 1 Expense</th>
                              <th className="border border-gray-300 px-3 py-2 text-right">Total Depreciation</th>
                              <th className="border border-gray-300 px-3 py-2 text-right">Final Book Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(comparisonSchedules).map(([methodId, sched]) => {
                              const methodName = DEPRECIATION_METHODS.find(m => m.id === methodId)?.name || methodId;
                              const year1Expense = sched[0]?.depreciationExpense || 0;
                              const totalDepreciation = sched[sched.length - 1]?.accumulatedDepreciation || 0;
                              const finalBookValue = sched[sched.length - 1]?.endingBookValue || 0;

                              return (
                                <tr key={methodId}>
                                  <td className="border border-gray-300 px-3 py-2 font-medium">{methodName}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-right">
                                    ${year1Expense.toFixed(2)}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-right">
                                    ${totalDepreciation.toFixed(2)}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-right">
                                    ${finalBookValue.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-4 bg-blue-100 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Comparison Insights:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Accelerated methods (DDB, SYD) provide higher Year 1 deductions</li>
                          <li>• All methods reach the same total depreciation over the asset&apos;s life</li>
                          <li>• Straight-line offers predictable, consistent expenses each year</li>
                          <li>• Choose based on tax strategy and matching principle needs</li>
                        </ul>
                      </div>
                    </div>
                  ) : schedule ? (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-2 py-1 text-left">Year</th>
                              <th className="border border-gray-300 px-2 py-1 text-right">Beginning Value</th>
                              <th className="border border-gray-300 px-2 py-1 text-right">Depreciation</th>
                              <th className="border border-gray-300 px-2 py-1 text-right">Accumulated</th>
                              <th className="border border-gray-300 px-2 py-1 text-right">Ending Value</th>
                              {schedule[0]?.rate !== undefined && (
                                <th className="border border-gray-300 px-2 py-1 text-right">Rate</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {schedule.map((row) => (
                              <tr key={row.year}>
                                <td className="border border-gray-300 px-2 py-1">{row.year}</td>
                                <td className="border border-gray-300 px-2 py-1 text-right">
                                  ${row.beginningBookValue.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 px-2 py-1 text-right font-medium text-red-600">
                                  ${row.depreciationExpense.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 px-2 py-1 text-right">
                                  ${row.accumulatedDepreciation.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 px-2 py-1 text-right font-medium text-green-600">
                                  ${row.endingBookValue.toFixed(2)}
                                </td>
                                {row.rate !== undefined && (
                                  <td className="border border-gray-300 px-2 py-1 text-right">
                                    {row.rate.toFixed(2)}%
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-100 rounded-lg text-center">
                          <div className="text-sm text-blue-600 mb-1">Total Depreciation</div>
                          <div className="text-2xl font-bold text-blue-900">
                            ${schedule[schedule.length - 1].accumulatedDepreciation.toFixed(0)}
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <div className="text-sm text-green-600 mb-1">Final Book Value</div>
                          <div className="text-2xl font-bold text-green-800">
                            ${schedule[schedule.length - 1].endingBookValue.toFixed(0)}
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg text-center">
                          <div className="text-sm text-purple-600 mb-1">Year 1 Expense</div>
                          <div className="text-2xl font-bold text-purple-800">
                            ${schedule[0].depreciationExpense.toFixed(0)}
                          </div>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg text-center">
                          <div className="text-sm text-orange-600 mb-1">Years</div>
                          <div className="text-2xl font-bold text-orange-800">
                            {schedule.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter asset details and click &quot;Calculate Depreciation&quot; to see the schedule</p>
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
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Asset & Inventory Tracker Connection</h3>
              <p className="text-yellow-700 mb-3">
                These depreciation skills are essential for Unit 7 Asset &amp; Inventory Tracker, where students learn to:
              </p>
              <ul className="text-yellow-700 space-y-1 text-sm">
                <li>• Track long-term asset values and depreciation schedules in business systems</li>
                <li>• Make strategic decisions about asset purchases based on tax implications</li>
                <li>• Calculate accurate book values for financial statement preparation</li>
                <li>• Understand how depreciation affects business profitability and tax planning</li>
                <li>• Build Excel models that automate depreciation tracking across multiple assets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
