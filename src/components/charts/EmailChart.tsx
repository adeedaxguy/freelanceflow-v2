"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
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
    <div className="bg-surface border border-border rounded-xl p-3 shadow-card-hover">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-foreground font-semibold text-sm">{payload[0]?.value} outreach items</p>
    </div>
  );
}

export default function EmailChart({ data, title = "Outreach" }: EmailChartProps) {
  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-6">
      <h3 className="text-foreground font-semibold mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3A" />
          <XAxis dataKey="date" tick={{ fill: "#8888AA", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#8888AA", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} fill="url(#emailGradient)" dot={false} activeDot={{ r: 4, fill: "#9F67FF" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
