import React, { useState, useEffect } from "react";
import * as api from "../services/api";
import { formatMoney, getTodayString } from "../utils/formatters";
import StatCard from "../components/common/StatCard";
import Icon from "../components/common/Icon";
import ProfitLineChart from "../components/charts/ProfitLineChart";
import RevenueBarChart from "../components/charts/RevenueBarChart";
import ExpenseDonutChart from "../components/charts/ExpenseDonutChart";
import CategoryBarChart from "../components/charts/CategoryBarChart";

const AnalyticsPage = ({ currency = "INR" }) => {
  const [period, setPeriod] = useState("weekly");
  const [report, setReport] = useState(null);
  const [prevReport, setPrevReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customRange, setCustomRange] = useState({
    from: getTodayString(),
    to: getTodayString(),
  });

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      let data = null;
      let prevData = null;
      if (period === "daily") {
        data = await api.getDailyAnalytics(getTodayString());
      } else if (period === "weekly") {
        data = await api.getWeeklyAnalytics();

        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const yyyy = lastWeek.getFullYear();
        const mm = String(lastWeek.getMonth() + 1).padStart(2, "0");
        const dd = String(lastWeek.getDate()).padStart(2, "0");
        const endOfLastWeek = `${yyyy}-${mm}-${dd}`;
        try {
          prevData = await api.getWeeklyAnalytics(endOfLastWeek);
        } catch {
          // previous week comparison is best-effort
        }
      } else if (period === "monthly") {
        const d = new Date();
        data = await api.getMonthlyAnalytics(d.getFullYear(), d.getMonth() + 1);
      } else if (period === "quarterly") {
        const d = new Date();
        const qStartMonth = Math.floor(d.getMonth() / 3) * 3;
        const from = new Date(d.getFullYear(), qStartMonth, 1);
        const to = new Date(d.getFullYear(), qStartMonth + 3, 0);
        const iso = (dt) =>
          `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        data = await api.getRangeAnalytics(iso(from), iso(to));
      } else if (period === "annual") {
        const d = new Date();
        data = await api.getRangeAnalytics(`${d.getFullYear()}-01-01`, `${d.getFullYear()}-12-31`);
      } else if (period === "range") {
        data = await api.getRangeAnalytics(customRange.from, customRange.to);
      }
      setReport(data);
      setPrevReport(prevData);
    } catch (err) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customRange.from, customRange.to]);

  const summary = report?.summary || {};
  const productsPerf = report?.products || [];
  const expensesBreakdown = report?.expenses || [];
  const insights = report?.insights || [];
  const trendData = report?.trend || [];

  const prevSummary = prevReport?.summary || {};

  const calculateChange = (current, previous) => {
    if (!previous) return null;
    const diff = current - previous;
    return (diff / previous) * 100;
  };

  const revenueChange = calculateChange(summary.revenue, prevSummary.revenue);
  const profitChange = calculateChange(summary.profit, prevSummary.profit);
  const unitsChange = calculateChange(summary.unitsSold, prevSummary.unitsSold);

  const ChangeTag = ({ change }) => {
    if (change === null || change === undefined) return null;
    const isPositive = change >= 0;
    return (
      <span className={`change-tag ${isPositive ? "up" : "down"}`}>
        <Icon type={isPositive ? "up" : "down"} size={11} />
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  const topProduct = [...productsPerf].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];
  const mostProfitable = [...productsPerf].sort((a, b) => (b.margin || 0) - (a.margin || 0))[0];
  const needsAttention = [...productsPerf].sort((a, b) => (a.unitsSold || 0) - (b.unitsSold || 0))[0];

  const aov = summary.orders ? summary.revenue / summary.orders : 0;
  const revPerUnit = summary.unitsSold ? summary.revenue / summary.unitsSold : 0;
  const costEfficiency = summary.revenue ? ((summary.revenue - summary.expenses) / summary.revenue) * 100 : 0;

  return (
    <div className="tab-content analytics-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Business analytics &amp; reports</h1>
          <p className="page-sub">
            A full breakdown of product profitability, sales classification, expense share and automated insights.
          </p>
        </div>

        <div className="period-tabs">
          {[
            { id: "daily", label: "Today" },
            { id: "weekly", label: "Last 7 days" },
            { id: "monthly", label: "This month" },
            { id: "quarterly", label: "This quarter" },
            { id: "annual", label: "This year" },
            { id: "range", label: "Custom range" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              className={`filter-chip ${period === p.id ? "active" : ""}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {period === "range" && (
        <div className="filter-bar-card">
          <div className="date-range-pickers">
            <div>
              <label>From</label>
              <input
                type="date"
                className="date-input-sm"
                value={customRange.from}
                onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })}
              />
            </div>
            <div>
              <label>To</label>
              <input
                type="date"
                className="date-input-sm"
                value={customRange.to}
                onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {error && <div className="form-error">{error}</div>}
      {loading && <div className="loading-bar">Computing business metrics&hellip;</div>}

      <div className="stats-grid">
        <StatCard
          label="Total revenue"
          value={formatMoney(summary.revenue || 0, currency)}
          detail={
            <span>
              From {summary.orders || 0} orders {period === "weekly" && <ChangeTag change={revenueChange} />}
            </span>
          }
          positive={Number(summary.revenue || 0) > 0}
          icon="expenses"
          accent="turmeric"
        />
        <StatCard
          label="Operating expenses"
          value={formatMoney(summary.expenses || 0, currency)}
          detail="Overheads & supplies"
          neutral
          icon="expenses"
          accent="brick"
        />
        <StatCard
          label="Net profit"
          value={formatMoney(summary.profit || 0, currency)}
          detail={
            <span>
              Margin {summary.margin || 0}% {period === "weekly" && <ChangeTag change={profitChange} />}
            </span>
          }
          positive={Number(summary.profit || 0) > 0}
          icon="analytics"
          accent="curry"
        />
        <StatCard
          label="Total units sold"
          value={(summary.unitsSold || 0).toString()}
          detail={
            <span>
              Avg. order {formatMoney(summary.averageOrderValue || 0, currency)}{" "}
              {period === "weekly" && <ChangeTag change={unitsChange} />}
            </span>
          }
          positive
          icon="products"
          accent="chili"
        />
      </div>

      <div className="metric-tiles">
        <div className="metric-tile">
          <span>Average order value</span>
          <strong className="tabular">{formatMoney(aov, currency)}</strong>
        </div>
        <div className="metric-tile">
          <span>Revenue per unit</span>
          <strong className="tabular">{formatMoney(revPerUnit, currency)}</strong>
        </div>
        <div className="metric-tile">
          <span>Cost efficiency</span>
          <strong className="tabular">{costEfficiency.toFixed(1)}%</strong>
        </div>
        <div className="metric-tile">
          <span>Net margin</span>
          <strong className="tabular">{summary.margin || 0}%</strong>
        </div>
      </div>

      {productsPerf.length > 0 && (
        <div className="performer-cards">
          {topProduct && (
            <div className="performer-card top">
              <div className="performer-tag">
                <Icon type="sparkle" size={13} /> Top product
              </div>
              <div className="performer-name">{topProduct.productName}</div>
              <div className="performer-sub tabular">{formatMoney(topProduct.revenue, currency)} revenue</div>
            </div>
          )}
          {mostProfitable && (
            <div className="performer-card profit">
              <div className="performer-tag">
                <Icon type="up" size={13} /> Most profitable
              </div>
              <div className="performer-name">{mostProfitable.productName}</div>
              <div className="performer-sub tabular">{mostProfitable.margin}% margin</div>
            </div>
          )}
          {needsAttention && (
            <div className="performer-card attention">
              <div className="performer-tag">
                <Icon type="alert" size={13} /> Needs attention
              </div>
              <div className="performer-name">{needsAttention.productName}</div>
              <div className="performer-sub tabular">Only {needsAttention.unitsSold} units sold</div>
            </div>
          )}
        </div>
      )}

      <div className="analytics-comparison-grid">
        <section className="analytics-card">
          <div className="section-heading">
            <div>
              <h2>Revenue &amp; profit trend</h2>
              <p>Daily performance over the selected period</p>
            </div>
          </div>
          <ProfitLineChart data={trendData} currency={currency} />
        </section>

        <section className="analytics-card">
          <div className="section-heading">
            <div>
              <h2>Product sales volume</h2>
              <p>
                {productsPerf.length > 8
                  ? `Top 8 of ${productsPerf.length} menu items by units sold — full list below`
                  : "Units sold per menu item"}
              </p>
            </div>
          </div>
          <RevenueBarChart data={productsPerf} currency={currency} />
        </section>

        <section className="analytics-card">
          <div className="section-heading">
            <div>
              <h2>Profit margin comparison</h2>
              <p>
                {productsPerf.length > 8
                  ? `Top 8 of ${productsPerf.length} menu items by revenue — full list below`
                  : "Product profitability at a glance"}
              </p>
            </div>
          </div>
          <CategoryBarChart data={productsPerf} currency={currency} />
        </section>

        <section className="analytics-card">
          <div className="section-heading">
            <div>
              <h2>Expense distribution</h2>
              <p>Where operating costs are going</p>
            </div>
          </div>
          <ExpenseDonutChart data={expensesBreakdown} currency={currency} />
        </section>
      </div>

      {productsPerf.length > 0 && (
        <section className="products-card">
          <div className="products-header">
            <h2>Product classification &amp; profit breakdown</h2>
            <span>High sales vs. high profit vs. high margin — these are different things</span>
          </div>
          <div className="performance-table">
            <div className="perf-header-row">
              <span>Product</span>
              <span>Classification</span>
              <span>Units</span>
              <span>Revenue</span>
              <span>Profit</span>
              <span>Margin</span>
            </div>
            {productsPerf.map((p) => {
              const isBestSeller = p.productId === topProduct?.productId;
              const isHighMargin = Number(p.margin) >= 50;
              const isLowPerformer = p.unitsSold <= 2 || p.productId === needsAttention?.productId;

              let badgeClass = "badge-standard";
              let badgeLabel = "Standard";
              if (isBestSeller) {
                badgeClass = "badge-best";
                badgeLabel = "Best seller";
              } else if (isHighMargin) {
                badgeClass = "badge-margin";
                badgeLabel = "High margin";
              } else if (isLowPerformer) {
                badgeClass = "badge-attention";
                badgeLabel = "Needs attention";
              }

              return (
                <div className="perf-row" key={p.productId}>
                  <strong>{p.productName}</strong>
                  <div>
                    <span className={`class-badge ${badgeClass}`}>{badgeLabel}</span>
                  </div>
                  <span className="tabular">{p.unitsSold}</span>
                  <span className="tabular">{formatMoney(p.revenue, currency)}</span>
                  <span className="tabular profit-text">+{formatMoney(p.profit, currency)}</span>
                  <span className="tabular margin-pill">{p.margin}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {insights.length > 0 && (
        <section className="analytics-card insights-card">
          <div className="section-heading">
            <div>
              <h2>Automated business insights</h2>
              <p>Deterministic, rule-based — no guesswork</p>
            </div>
          </div>
          <div className="insight-list">
            {insights.map((txt, idx) => (
              <div key={idx} className="insight-item">
                <Icon type="up" size={14} />
                <p>{txt}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AnalyticsPage;
