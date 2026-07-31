"use client";

import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Bar, BarChart
} from "recharts";

interface EmailChartProps {
  data: { date: string; count: number }[];
  title?: string;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-foreground font-semibold text-sm">{payload[0]?.value} outreach items</p>
    </div>
  );
}

export default function EmailChart({ data, title = "Outreach" }: EmailChartProps) {
  const total = data.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className="dashboard-chart-card p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground tabular-nums">{total}</p>
        <p className="mt-1 text-xs text-muted-foreground">Prepared outreach items</p>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 5, right: 0, bottom: 5, left: -24 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="hsl(var(--signal))"
            radius={[5, 5, 2, 2]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
