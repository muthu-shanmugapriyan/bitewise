import React, { useMemo } from "react";

function TrendChart({ trendData = [] }) {
  const width = 1000;
  const height = 280;
  const paddingX = 20;
  const paddingY = 34;

  const data = useMemo(() => {
    if (trendData && trendData.length > 0) {
      return trendData.map((d) => {
        const dateStr = d.date || d.summaryDate;
        const dateObj = new Date(`${dateStr}T00:00:00`);
        const dayLabel = Number.isNaN(dateObj.getTime())
          ? String(dateStr || "").slice(0, 6)
          : dateObj.toLocaleDateString("en-IN", { weekday: "short" });
        return {
          day: dayLabel,
          date: dateStr,
          revenue: Number(d.revenue || 0),
          profit: Number(d.profit || d.netProfit || 0),
        };
      });
    }
    return Array.from({ length: 7 }, (_, i) => ({
      day: i === 6 ? "Today" : `Day ${i + 1}`,
      revenue: 0,
      profit: 0,
    }));
  }, [trendData]);

  const maxVal = useMemo(() => {
    const values = data.flatMap((d) => [d.revenue, d.profit]);
    const max = Math.max(...values, 1000);
    return Math.ceil(max / 500) * 500;
  }, [data]);

  const makePoints = (key) =>
    data
      .map((item, index) => {
        const x = paddingX + (index * (width - paddingX * 2)) / Math.max(data.length - 1, 1);
        const val = Math.max(0, item[key]);
        const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
        return `${x},${y}`;
      })
      .join(" ");

  const hasData = data.some((d) => d.revenue > 0 || d.profit > 0);

  return (
    <section className="chart-card">
      <div className="section-heading">
        <div>
          <h2>Revenue &amp; profit trend</h2>
          <p>Last 7 days of closed business days</p>
        </div>
        <div className="chart-legend">
          <span>
            <i className="legend revenue" /> Revenue
          </span>
          <span>
            <i className="legend profit" /> Net profit
          </span>
        </div>
      </div>

      <div className="chart-wrapper">
        {!hasData && (
          <div className="chart-overlay-hint">Close a few daily tickets to see your trend line come alive.</div>
        )}
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="chart">
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--turmeric)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--turmeric)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((line) => {
            const y = paddingY + (line * (height - paddingY * 2)) / 3;
            return <line key={line} x1="0" x2={width} y1={y} y2={y} className="grid-line" />;
          })}

          <polygon
            points={`${paddingX},${height - paddingY} ${makePoints("revenue")} ${width - paddingX},${height - paddingY}`}
            fill="url(#revenue-fill)"
            stroke="none"
          />

          <polyline points={makePoints("revenue")} className="revenue-line" pathLength="100" />
          <polyline points={makePoints("profit")} className="profit-line" pathLength="100" />

          {data.map((item, index) => {
            const x = paddingX + (index * (width - paddingX * 2)) / Math.max(data.length - 1, 1);
            const revenueY = height - paddingY - (Math.max(0, item.revenue) / maxVal) * (height - paddingY * 2);
            const profitY = height - paddingY - (Math.max(0, item.profit) / maxVal) * (height - paddingY * 2);
            const dotDelay = `${0.35 + index * 0.06}s`;

            return (
              <g key={index}>
                <circle cx={x} cy={revenueY} r="4.5" className="revenue-dot" style={{ animationDelay: dotDelay }} />
                <circle cx={x} cy={profitY} r="4.5" className="profit-dot" style={{ animationDelay: dotDelay }} />
              </g>
            );
          })}
        </svg>

        <div className="chart-labels">
          {data.map((item, i) => (
            <span key={i} title={item.date || ""}>
              {item.day}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrendChart;
