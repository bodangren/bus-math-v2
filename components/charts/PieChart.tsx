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

export interface PieChartProps {
  title?: string;
  description?: string;
  segments: ChartSegment[];
  showCard?: boolean;
  showLegend?: boolean;
  className?: string;
  ariaLabel?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  showPercentages?: boolean;
}

export function PieChart({
  title,
  description,
  segments,
  showCard = true,
  showLegend = true,
  className,
  ariaLabel,
  height = 340,
  valueFormatter = (value) => formatCurrency(value),
  showPercentages = true
}: PieChartProps) {
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
    fill: segment.color ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
    percentage: total > 0 ? (segment.value / total) * 100 : 0
  }));

  const containerLabel =
    ariaLabel ?? `${title ?? "Pie"} chart showing ${segments.length} categories`;

  const chart = (
    <figure className={cn("space-y-3", showCard ? "" : className)}>
      {!showCard && (title || description) && (
        <div className="space-y-1">
          {title && <p className="text-base font-semibold text-foreground">{title}</p>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <ChartContainer
        role="img"
        aria-label={containerLabel}
        config={chartConfig}
        className="w-full rounded-xl border border-gray-100 bg-white"
        style={{ height }}
        data-testid="pie-chart"
      >
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} stroke="rgba(255,255,255,0.8)" />
            ))}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  const percentage = data.find((item) => item.name === name)?.percentage ?? 0;
                  return [
                    showPercentages
                      ? `${valueFormatter(Number(value))} (${percentage.toFixed(1)}%)`
                      : valueFormatter(Number(value)),
                    name
                  ];
                }}
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
