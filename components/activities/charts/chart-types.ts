import type { ChartConfig } from "@/components/ui/chart";

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

export interface ChartDataPoint {
  [key: string]: string | number | null | undefined;
}

export interface ChartSegment {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export const DEFAULT_CHART_COLORS = [
  "hsl(222, 47%, 11%)",
  "hsl(210, 84%, 53%)",
  "hsl(142, 70%, 45%)",
  "hsl(6, 78%, 57%)",
  "hsl(27, 96%, 55%)",
  "hsl(271, 90%, 65%)"
];

export function buildChartConfig(series: ChartSeries[]): ChartConfig {
  return series.reduce<ChartConfig>((config, item, index) => {
    config[item.key] = {
      label: item.label,
      color: item.color ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
    };
    return config;
  }, {});
}

export const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
