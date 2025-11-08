"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import {
  buildChartConfig,
  type ChartSegment,
  DEFAULT_CHART_COLORS,
  formatCurrency
} from "./chart-types";

export interface DoughnutChartProps {
  title?: string;
  description?: string;
  segments: ChartSegment[];
  showCard?: boolean;
  showLegend?: boolean;
  className?: string;
  ariaLabel?: string;
  height?: number;
  innerRadius?: number;
  valueFormatter?: (value: number) => string;
  totalLabel?: string;
}

export function DoughnutChart({
  title,
  description,
  segments,
  showCard = true,
  showLegend = true,
  className,
  ariaLabel,
  height = 340,
  innerRadius = 70,
  valueFormatter = (value) => formatCurrency(value),
  totalLabel = "Total"
}: DoughnutChartProps) {
  const chartConfig = useMemo(
    () =>
      buildChartConfig(
        segments.map((segment, index) => ({
          key: segment.id,
          label: segment.label,
          color: segment.color ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
        }))
      ),
    [segments]
  );

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const data = segments.map((segment, index) => ({
    name: segment.label,
    value: segment.value,
    key: segment.id,
    fill: segment.color ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
  }));

  const containerLabel =
    ariaLabel ?? `${title ?? "Doughnut"} chart showing ${segments.length} categories`;

  const chart = (
    <figure className={cn("space-y-3", showCard ? "" : className)}>
      {!showCard && (title || description) && (
        <div className="space-y-1">
          {title && <p className="text-base font-semibold text-foreground">{title}</p>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="relative">
        <ChartContainer
          role="img"
          aria-label={containerLabel}
          config={chartConfig}
          className="w-full rounded-xl border border-gray-100 bg-white"
          style={{ height }}
          data-testid="doughnut-chart"
        >
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              innerRadius={innerRadius}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} stroke="rgba(255,255,255,0.8)" />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [valueFormatter(Number(value)), name]}
                  labelFormatter={() => ""}
                  indicator="dot"
                />
              }
            />
            {showLegend && (
              <ChartLegend
                content={<ChartLegendContent />}
                verticalAlign="bottom"
                height={36}
              />
            )}
          </RechartsPieChart>
        </ChartContainer>
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
          aria-hidden="true"
        >
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{totalLabel}</span>
          <span className="text-lg font-semibold text-foreground">{valueFormatter(total)}</span>
        </div>
      </div>
    </figure>
  );

  if (!showCard) {
    return chart;
  }

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader className="space-y-1">
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{chart}</CardContent>
    </Card>
  );
}
