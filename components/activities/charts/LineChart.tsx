"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { buildChartConfig, type ChartDataPoint, type ChartSeries } from "./chart-types";

export interface LineChartProps {
  title?: string;
  description?: string;
  data: ChartDataPoint[];
  series: ChartSeries[];
  xAxisKey?: string;
  showCard?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  height?: number;
  className?: string;
  ariaLabel?: string;
  formatValue?: (value: number) => string;
}

const DEFAULT_LINE_VALUE = (value: number) => value.toLocaleString();

export function LineChart({
  title,
  description,
  data,
  series,
  xAxisKey = "label",
  showCard = true,
  showLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  height = 340,
  className,
  ariaLabel,
  formatValue = DEFAULT_LINE_VALUE
}: LineChartProps) {
  const chartConfig = useMemo(() => buildChartConfig(series), [series]);
  const containerLabel = ariaLabel ?? `${title ?? "Line"} chart showing ${series.length} series`;

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
        data-testid="line-chart"
      >
        <RechartsLineChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            left: 16,
            bottom: 16
          }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          )}
          {showXAxis && (
            <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} className="text-xs" />
          )}
          {showYAxis && (
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-xs"
              tickFormatter={(value) => formatValue(Number(value))}
            />
          )}
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, name) => [
                  formatValue(Number(value)),
                  series.find((item) => item.key === name)?.label ?? name
                ]}
              />
            }
          />
          {series.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              stroke={`var(--color-${item.key})`}
              strokeWidth={2}
              dot={false}
              aria-label={`${item.label} data series`}
            />
          ))}
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        </RechartsLineChart>
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
