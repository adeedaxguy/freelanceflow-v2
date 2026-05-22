"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface NichePieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#7C3AED", "#00E5A0", "#FFD166", "#9F67FF", "#00B8D9", "#FF6B6B", "#4ECDC4"];

export default function NichePieChart({ data }: NichePieChartProps) {
  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-6">
      <h3 className="text-foreground font-semibold mb-6">Leads by Niche</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#0F0F1A", border: "1px solid #1E1E3A", borderRadius: "12px", color: "#F0F0FF" }}
          />
          <Legend formatter={(value) => <span style={{ color: "#8888AA", fontSize: 12 }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
