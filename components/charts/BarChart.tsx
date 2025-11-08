"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  type XAxisProps,
  type YAxisProps
} from "recharts";

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

export interface BarChartProps {
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
  stacked?: boolean;
  layout?: "horizontal" | "vertical";
  formatValue?: (value: number) => string;
  xAxisProps?: Partial<XAxisProps>;
  yAxisProps?: Partial<YAxisProps>;
}

const DEFAULT_BAR_FORMAT = (value: number) => value.toLocaleString();

export function BarChart({
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
  stacked = false,
  layout = "horizontal",
  formatValue = DEFAULT_BAR_FORMAT,
  xAxisProps,
  yAxisProps
}: BarChartProps) {
  const chartConfig = useMemo(() => buildChartConfig(series), [series]);
  const containerLabel = ariaLabel ?? `${title ?? "Bar"} chart visualization`;

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
        data-testid="bar-chart"
      >
        <RechartsBarChart
          data={data}
          layout={layout === "vertical" ? "vertical" : "horizontal"}
          margin={{ top: 16, right: 16, left: 16, bottom: 16 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          {showXAxis && (
            <XAxis
              dataKey={layout === "vertical" ? undefined : xAxisKey}
              type={layout === "vertical" ? "number" : "category"}
              tickLine={false}
              axisLine={false}
              className="text-xs"
              {...xAxisProps}
            />
          )}
          {showYAxis && (
            <YAxis
              dataKey={layout === "vertical" ? xAxisKey : undefined}
              type={layout === "vertical" ? "category" : "number"}
              tickLine={false}
              axisLine={false}
              className="text-xs"
              tickFormatter={(value) =>
                layout === "vertical" ? String(value) : formatValue(Number(value))
              }
              {...yAxisProps}
            />
          )}
          <ChartTooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
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
            <Bar
              key={item.key}
              dataKey={item.key}
              fill={`var(--color-${item.key})`}
              radius={4}
              stackId={stacked ? "stack" : undefined}
              aria-label={`${item.label} bar series`}
            />
          ))}
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        </RechartsBarChart>
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
