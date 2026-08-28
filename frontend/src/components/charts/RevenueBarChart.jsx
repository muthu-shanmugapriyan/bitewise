import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { THEME } from "../../constants/theme";
import EmptyState from "../common/EmptyState";

const tooltipStyle = {
  backgroundColor: THEME.paperCard,
  border: "none",
  borderRadius: 12,
  fontSize: 12,
  color: THEME.paperCardInk,
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const RevenueBarChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <EmptyState icon="products" title="No sales yet" message="Record a few days of sales to see your top movers." />;
  }

  const sorted = [...data].sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0)).slice(0, 8);

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={sorted} layout="vertical" margin={{ top: 10, right: 24, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 5" stroke={THEME.paper + "14"} horizontal vertical={false} />
          <XAxis type="number" tick={{ fill: THEME.paperDim, fontSize: 11 }} axisLine={{ stroke: THEME.paper + "1f" }} tickLine={false} />
          <YAxis type="category" dataKey="productName" tick={{ fill: THEME.paperDim, fontSize: 12 }} axisLine={{ stroke: THEME.paper + "1f" }} tickLine={false} width={104} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: THEME.paper + "0a" }} formatter={(value) => [`${value} units`, "Units sold"]} />
          <Bar dataKey="unitsSold" radius={[0, 6, 6, 0]} barSize={18}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={i === 0 ? THEME.chili : THEME.turmeric} fillOpacity={i === 0 ? 1 : 0.75} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueBarChart;
