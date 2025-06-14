"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartProps<T = Record<string, string | number>> {
  data: T[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  secondaryYAxisKey?: string;
}

interface PieChartProps<T = Record<string, string | number>> {
  data: T[];
  nameKey: string;
  valueKey: string;
  colors?: string[];
  height?: number;
  valueFormatter?: (value: number) => string;
}

export function LineChart({
  data,
  xKey,
  yKey,
  color = "#ef4444",
  height = 300,
  valueFormatter,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter} />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export function BarChart({
  data,
  xKey,
  yKey,
  color = "#ef4444",
  height = 300,
  valueFormatter,
  secondaryYAxisKey,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis tickFormatter={valueFormatter} />
        {secondaryYAxisKey && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={valueFormatter}
          />
        )}
        <Tooltip formatter={valueFormatter} />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        {secondaryYAxisKey && (
          <Bar
            dataKey={secondaryYAxisKey}
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            yAxisId="right"
          />
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function PieChart({
  data,
  nameKey,
  valueKey,
  colors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"],
  height = 300,
  valueFormatter,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={valueFormatter} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
