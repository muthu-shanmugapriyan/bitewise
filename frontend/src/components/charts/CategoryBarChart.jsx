import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
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

const getMarginColor = (margin) => {
  if (margin > 50) return THEME.curry;
  if (margin >= 30) return THEME.turmeric;
  return THEME.brick;
};

const CategoryBarChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <EmptyState icon="analytics" title="No margin data yet" message="Product margins will chart here once you have sales." />;
  }

  // With many menu items this chart would otherwise render one bar (and one
  // rotated label) per product, which becomes unreadable past a handful of
  // items. Show the top 8 by revenue — the products that matter most to the
  // business — while the full list stays available in the table below.
  const sorted = [...data].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 8);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ ...tooltipStyle, padding: 10 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>{d.productName}</p>
          <p style={{ margin: "4px 0 0" }}>Margin: {d.margin}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={sorted} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 5" stroke={THEME.paper + "14"} vertical={false} />
          <XAxis
            dataKey="productName"
            tick={{ fill: THEME.paperDim, fontSize: 11 }}
            axisLine={{ stroke: THEME.paper + "1f" }}
            tickLine={false}
            angle={-40}
            textAnchor="end"
            interval={0}
            height={56}
          />
          <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: THEME.paperDim, fontSize: 11 }} axisLine={{ stroke: THEME.paper + "1f" }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: THEME.paper + "0a" }} />
          <Bar dataKey="margin" radius={[6, 6, 0, 0]} barSize={28}>
            {sorted.map((entry, index) => (
              <Cell key={index} fill={getMarginColor(entry.margin)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBarChart;
