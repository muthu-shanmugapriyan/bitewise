import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { THEME } from "../../constants/theme";
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

const ProfitLineChart = ({ data = [], currency = "INR" }) => {
  if (!data || data.length === 0) {
    return <EmptyState icon="analytics" title="No trend data yet" message="Close a few days and your revenue & profit trend will plot here." />;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 5" stroke={THEME.paper + "14"} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: THEME.paperDim, fontSize: 12 }} axisLine={{ stroke: THEME.paper + "1f" }} tickLine={false} />
          <YAxis tickFormatter={(v) => formatMoney(v, currency)} tick={{ fill: THEME.paperDim, fontSize: 11 }} axisLine={{ stroke: THEME.paper + "1f" }} tickLine={false} width={64} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [formatMoney(value, currency), name.charAt(0).toUpperCase() + name.slice(1)]}
            labelStyle={{ color: THEME.paperCardInk, fontWeight: 700, marginBottom: 6 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, color: THEME.paperDim }} iconType="circle" iconSize={8} />
          <Line type="monotone" dataKey="revenue" stroke={THEME.turmeric} strokeWidth={3} dot={{ r: 3.5, fill: THEME.turmeric, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
          <Line type="monotone" dataKey="profit" stroke={THEME.curry} strokeWidth={3} dot={{ r: 3.5, fill: THEME.curry, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitLineChart;
