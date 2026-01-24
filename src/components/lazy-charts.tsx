"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Chart loading skeleton
 */
function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  );
}

/**
 * Pie chart loading skeleton
 */
function PieChartSkeleton({ size = 200 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <Skeleton className="rounded-full" style={{ width: size * 0.85, height: size * 0.85 }} />
    </div>
  );
}

// Dynamically import Recharts components
const DynamicPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  { ssr: false, loading: () => <PieChartSkeleton /> }
);

const DynamicPie = dynamic(
  () => import("recharts").then((mod) => mod.Pie),
  { ssr: false }
);

const DynamicCell = dynamic(
  () => import("recharts").then((mod) => mod.Cell),
  { ssr: false }
);

const DynamicBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const DynamicBar = dynamic(
  () => import("recharts").then((mod) => mod.Bar),
  { ssr: false }
);

const DynamicXAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);

const DynamicYAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);

const DynamicResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

const DynamicTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);

// Re-export with lazy loading wrapper
export const LazyPieChart = DynamicPieChart;
export const LazyPie = DynamicPie;
export const LazyCell = DynamicCell;
export const LazyBarChart = DynamicBarChart;
export const LazyBar = DynamicBar;
export const LazyXAxis = DynamicXAxis;
export const LazyYAxis = DynamicYAxis;
export const LazyResponsiveContainer = DynamicResponsiveContainer;
export const LazyTooltip = DynamicTooltip;

/**
 * Pre-configured lazy pie chart with loading state
 */
interface LazyPieChartWrapperProps {
  data: Array<{ name: string; value: number; color: string }>;
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  children?: React.ReactNode;
}

export function LazyPieChartWrapper({
  data,
  width = 200,
  height = 200,
  innerRadius = 60,
  outerRadius = 85,
  paddingAngle = 2,
  children,
}: LazyPieChartWrapperProps) {
  return (
    <Suspense fallback={<PieChartSkeleton size={Math.min(width, height)} />}>
      <LazyResponsiveContainer width={width} height={height}>
        <LazyPieChart>
          <LazyPie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <LazyCell key={`cell-${index}`} fill={entry.color} />
            ))}
          </LazyPie>
          <LazyTooltip
            formatter={(value) => [value ?? 0, "Locks"]}
            contentStyle={{
              background: "#fffcf9",
              border: "1px solid #e8e2dc",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
          {children}
        </LazyPieChart>
      </LazyResponsiveContainer>
    </Suspense>
  );
}

/**
 * Pre-configured lazy bar chart with loading state
 */
interface LazyBarChartWrapperProps {
  data: Array<Record<string, unknown>>;
  width?: number | `${number}%`;
  height?: number;
  bars: Array<{
    dataKey: string;
    name: string;
    fill: string;
  }>;
  xAxisDataKey?: string;
}

export function LazyBarChartWrapper({
  data,
  width = "100%",
  height = 200,
  bars,
  xAxisDataKey = "day",
}: LazyBarChartWrapperProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <LazyResponsiveContainer width={width} height={height}>
        <LazyBarChart data={data} barGap={4}>
          <LazyXAxis
            dataKey={xAxisDataKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8c7b70", fontSize: 12 }}
          />
          <LazyYAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8c7b70", fontSize: 12 }}
            allowDecimals={false}
          />
          <LazyTooltip
            contentStyle={{
              background: "#fffcf9",
              border: "1px solid #e8e2dc",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
          {bars.map((bar) => (
            <LazyBar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.fill}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </LazyBarChart>
      </LazyResponsiveContainer>
    </Suspense>
  );
}

// Export skeleton components for custom use
export { ChartSkeleton, PieChartSkeleton };
