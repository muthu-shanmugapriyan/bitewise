import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { THEME, CHART_PALETTE } from "../../constants/theme";
import { formatMoney } from "../../utils/formatters";
import EmptyState from "../common/EmptyState";

const tooltipStyle = {
  backgroundColor: THEME.paperCard,
  border: "none",
  borderRadius: 12,
  fontSize: 12,
  color: THEME.paperCardInk,
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const ExpenseDonutChart = ({ data = [], currency = "INR" }) => {
  if (!data || data.length === 0) {
    return <EmptyState icon="expenses" title="No expenses yet" message="Once you log expenses for this range, the split shows up here." />;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ ...tooltipStyle, padding: 10 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>{d.category}</p>
          <p style={{ margin: "4px 0 0" }}>{formatMoney(d.amount, currency)}</p>
          <p style={{ margin: "4px 0 0", color: THEME.paperFaint }}>{d.share}% of total</p>
        </div>
      );
    }
    return null;
  };

  const total = data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div style={{ width: "100%", height: 320, position: "relative" }}>
      <ResponsiveContainer>
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={76}
            outerRadius={104}
            paddingAngle={3}
            cornerRadius={6}
            dataKey="amount"
            nameKey="category"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={40}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 18, color: THEME.paperDim }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <span>Total</span>
        <strong className="tabular">{formatMoney(total, currency)}</strong>
      </div>
    </div>
  );
};

export default ExpenseDonutChart;
