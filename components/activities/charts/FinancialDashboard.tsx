"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { BarChart } from "./BarChart";
import { DoughnutChart } from "./DoughnutChart";
import { LineChart } from "./LineChart";
import { PieChart } from "./PieChart";
import type { ChartDataPoint, ChartSegment, ChartSeries } from "./chart-types";

interface FinancialKpi {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
  helperText?: string;
}

export interface FinancialDashboardProps {
  title?: string;
  description?: string;
  className?: string;
  monthlyMetrics?: ChartDataPoint[];
  performanceSeries?: ChartSeries[];
  cashflowSeries?: ChartSeries[];
  accountBreakdown?: ChartSegment[];
  kpis?: FinancialKpi[];
  refreshable?: boolean;
  exportable?: boolean;
  onRefresh?: () => Promise<void> | void;
  onExport?: () => void;
}

const DEFAULT_MONTHLY_DATA: ChartDataPoint[] = [
  { month: "Jan", revenue: 15000, expenses: 12000, profit: 3000, cashFlow: 3200 },
  { month: "Feb", revenue: 17500, expenses: 13250, profit: 4250, cashFlow: 3600 },
  { month: "Mar", revenue: 18200, expenses: 14000, profit: 4200, cashFlow: 3900 },
  { month: "Apr", revenue: 21000, expenses: 16200, profit: 4800, cashFlow: 4200 },
  { month: "May", revenue: 22500, expenses: 17100, profit: 5400, cashFlow: 4500 },
  { month: "Jun", revenue: 24000, expenses: 18000, profit: 6000, cashFlow: 5100 }
];

const DEFAULT_ACCOUNTS: ChartSegment[] = [
  { id: "cash", label: "Cash", value: 8600 },
  { id: "receivables", label: "Receivables", value: 3800 },
  { id: "inventory", label: "Inventory", value: 5400 },
  { id: "equipment", label: "Equipment", value: 15000 },
  { id: "payables", label: "Payables", value: 3200 }
];

const DEFAULT_KPIS: FinancialKpi[] = [
  { title: "Total Revenue", value: "$118,200", change: 12.4, trend: "up", helperText: "vs last 6 months" },
  { title: "Net Profit", value: "$27,650", change: 8.1, trend: "up", helperText: "margin 23.4%" },
  { title: "Operating Cash", value: "$24,000", change: -2.3, trend: "down", helperText: "due to inventory buys" },
  { title: "Profit Margin", value: "22.3%", change: 1.2, trend: "up", helperText: "target 20%" }
];

const PERFORMANCE_SERIES: ChartSeries[] = [
  { key: "revenue", label: "Revenue" },
  { key: "expenses", label: "Expenses" }
];

const CASHFLOW_SERIES: ChartSeries[] = [
  { key: "profit", label: "Profit" },
  { key: "cashFlow", label: "Cash Flow" }
];

export function FinancialDashboard({
  title = "Financial Dashboard",
  description = "Track revenue, expenses, cash flow, and key KPIs.",
  className,
  monthlyMetrics = DEFAULT_MONTHLY_DATA,
  performanceSeries = PERFORMANCE_SERIES,
  cashflowSeries = CASHFLOW_SERIES,
  accountBreakdown = DEFAULT_ACCOUNTS,
  kpis = DEFAULT_KPIS,
  refreshable = true,
  exportable = true,
  onRefresh,
  onExport
}: FinancialDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totals = useMemo(() => {
    const latest = monthlyMetrics[monthlyMetrics.length - 1] ?? {};
    const cumulativeRevenue = monthlyMetrics.reduce((sum, point) => sum + Number(point.revenue ?? 0), 0);
    return {
      latestRevenue: latest.revenue ?? 0,
      latestProfit: latest.profit ?? 0,
      cumulativeRevenue
    };
  }, [monthlyMetrics]);

  const handleRefresh = async () => {
    if (!refreshable) {
      return;
    }
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    onExport?.();
  };

  return (
    <Card className={cn("w-full", className)} data-testid="financial-dashboard">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex gap-2">
          {refreshable && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              aria-live="polite"
              aria-busy={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              <span className="ml-2">{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
            </Button>
          )}
          {exportable && (
            <Button type="button" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span className="ml-2">Export CSV</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.title}
              className="rounded-lg border border-gray-200 bg-white p-4"
              role="group"
              aria-label={`${kpi.title} KPI`}
            >
              <div className="text-sm text-muted-foreground">{kpi.title}</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{kpi.value}</div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                )}
                <span className={kpi.trend === "up" ? "text-emerald-600" : "text-rose-600"}>
                  {kpi.trend === "up" ? "+" : ""}
                  {kpi.change}%
                </span>
                {kpi.helperText && <span className="text-muted-foreground">{kpi.helperText}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LineChart
              title="Revenue vs Expenses"
              description="Monthly performance over the last six periods."
              data={monthlyMetrics}
              series={performanceSeries}
              xAxisKey="month"
              showCard={false}
              className="rounded-xl border border-gray-200 bg-white p-4"
              formatValue={(value) =>
                new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
              }
            />
          </div>
          <div>
            <PieChart
              title="Account Breakdown"
              description="Share of key account balances."
              segments={accountBreakdown}
              showCard={false}
              className="rounded-xl border border-gray-200 bg-white p-4"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Profit & Cash Flow"
            description="Compare liquidity to operating performance."
            data={monthlyMetrics}
            series={cashflowSeries}
            xAxisKey="month"
            showCard={false}
            className="rounded-xl border border-gray-200 bg-white p-4"
            formatValue={(value) =>
              new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                value
              )
            }
          />
          <DoughnutChart
            title="Working Capital"
            description="Asset allocation snapshot."
            segments={accountBreakdown}
            showCard={false}
            className="rounded-xl border border-gray-200 bg-white p-4"
          />
        </div>

        <div
          className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-muted-foreground"
          aria-live="polite"
        >
          Latest month revenue:{" "}
          <span className="font-semibold text-foreground">
            $
            {Number(totals.latestRevenue).toLocaleString()}
          </span>
          , profit{" "}
          <span className="font-semibold text-foreground">
            ${Number(totals.latestProfit).toLocaleString()}
          </span>
          . Six-month revenue total:{" "}
          <span className="font-semibold text-foreground">
            ${Number(totals.cumulativeRevenue).toLocaleString()}
          </span>
          .
        </div>
      </CardContent>
    </Card>
  );
}
