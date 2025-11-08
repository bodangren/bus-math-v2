"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart as RechartsLineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { buildChartConfig, formatCurrency } from "./chart-types";

export interface BreakEvenChartProps {
  fixedCosts?: number;
  variableCostRate?: number;
  sellingPrice?: number;
  interactive?: boolean;
  showCard?: boolean;
  className?: string;
  height?: number;
  currency?: string;
}

interface BreakEvenDataPoint {
  units: number;
  revenue: number;
  totalCosts: number;
  profit: number;
}

export function BreakEvenChart({
  fixedCosts: defaultFixedCosts = 10000,
  variableCostRate: defaultVariableRate = 0.6,
  sellingPrice: defaultSellingPrice = 25,
  interactive = true,
  showCard = true,
  className,
  height = 360,
  currency = "USD"
}: BreakEvenChartProps) {
  const [fixedCosts, setFixedCosts] = useState(defaultFixedCosts);
  const [variableCostRate, setVariableCostRate] = useState(defaultVariableRate);
  const [sellingPrice, setSellingPrice] = useState(defaultSellingPrice);

  const summary = useMemo(() => {
    const contributionMargin = sellingPrice - sellingPrice * variableCostRate;
    const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
    const breakEvenRevenue = breakEvenUnits * sellingPrice;

    return {
      contributionMargin,
      contributionMarginRatio: sellingPrice ? contributionMargin / sellingPrice : 0,
      breakEvenUnits,
      breakEvenRevenue
    };
  }, [fixedCosts, variableCostRate, sellingPrice]);

  const chartData = useMemo<BreakEvenDataPoint[]>(() => {
    const maxUnits = Math.max(summary.breakEvenUnits * 2, 100);
    const step = Math.max(Math.floor(maxUnits / 18), 5);
    const points: BreakEvenDataPoint[] = [];

    for (let units = 0; units <= maxUnits; units += step) {
      const revenue = units * sellingPrice;
      const totalCosts = fixedCosts + units * sellingPrice * variableCostRate;
      points.push({
        units,
        revenue,
        totalCosts,
        profit: revenue - totalCosts
      });
    }

    return points;
  }, [fixedCosts, variableCostRate, sellingPrice, summary.breakEvenUnits]);

  const chartConfig = useMemo(
    () =>
      buildChartConfig([
        { key: "revenue", label: "Revenue", color: "hsl(142, 70%, 45%)" },
        { key: "totalCosts", label: "Total Costs", color: "hsl(6, 78%, 57%)" },
        { key: "profit", label: "Profit / Loss", color: "hsl(210, 84%, 53%)" }
      ]),
    []
  );

  const resetValues = () => {
    setFixedCosts(defaultFixedCosts);
    setVariableCostRate(defaultVariableRate);
    setSellingPrice(defaultSellingPrice);
  };

  const chart = (
    <div className="space-y-4" data-testid="breakeven-chart">
      {interactive && (
        <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="fixed-costs">Fixed Costs</Label>
            <Input
              id="fixed-costs"
              type="number"
              min={0}
              value={fixedCosts}
              onChange={(event) => setFixedCosts(Number(event.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="variable-rate">Variable Cost Rate</Label>
            <Input
              id="variable-rate"
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={variableCostRate}
              onChange={(event) => setVariableCostRate(Number(event.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="selling-price">Selling Price</Label>
            <Input
              id="selling-price"
              type="number"
              min={0}
              value={sellingPrice}
              onChange={(event) => setSellingPrice(Number(event.target.value) || 0)}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" className="w-full" onClick={resetValues}>
              Reset
            </Button>
          </div>
        </div>
      )}

      <ChartContainer
        role="img"
        aria-label="Break-even analysis chart with revenue, cost, and profit"
        config={chartConfig}
        className="w-full rounded-xl border border-gray-100 bg-white"
        style={{ height }}
      >
        <RechartsLineChart
          data={chartData}
          margin={{
            top: 16,
            right: 24,
            left: 24,
            bottom: 16
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="units" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatCurrency(Number(value), currency)} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [
                  formatCurrency(Number(value), currency),
                  chartConfig[name as keyof typeof chartConfig]?.label ?? name
                ]}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="totalCosts"
            stroke="var(--color-totalCosts)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="var(--color-profit)"
            strokeWidth={2}
            dot={false}
          />
          <ReferenceLine
            x={summary.breakEvenUnits}
            stroke="var(--color-revenue)"
            strokeDasharray="5 5"
            label={{ value: "Break-even", position: "top", fill: "hsl(222, 47%, 11%)" }}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </RechartsLineChart>
      </ChartContainer>

      <dl className="grid gap-4 rounded-lg border border-gray-200 p-4 text-sm md:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Break-even Units</dt>
          <dd className="text-lg font-semibold" data-testid="breakeven-units">
            {summary.breakEvenUnits.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Break-even Revenue</dt>
          <dd className="text-lg font-semibold">
            {formatCurrency(summary.breakEvenRevenue, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Contribution Margin</dt>
          <dd className="text-lg font-semibold">
            {formatCurrency(summary.contributionMargin, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Contribution Margin Ratio</dt>
          <dd className="text-lg font-semibold">
            {(summary.contributionMarginRatio * 100).toFixed(1)}%
          </dd>
        </div>
      </dl>
    </div>
  );

  if (!showCard) {
    return chart;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Break-even Analysis</CardTitle>
        <CardDescription>Explore how cost structure impacts profitability.</CardDescription>
      </CardHeader>
      <CardContent>{chart}</CardContent>
    </Card>
  );
}
