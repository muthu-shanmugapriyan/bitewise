import React from "react";
import ReceiptCard from "../components/common/ReceiptCard";
import TrendChart from "../components/charts/TrendChart";
import FoodIcon from "../components/common/FoodIcon";
import Icon from "../components/common/Icon";
import { formatMoney, formatDateDisplay, getTodayString } from "../utils/formatters";
import { getProductIconKey, getIconTileClass } from "../constants/icons";

function HomePage({ setPage, dashboard, business, loading, error, currency }) {
  const todaySummary = dashboard?.today || {};
  const insights = dashboard?.insights || dashboard?.insightData || [];
  const trend = dashboard?.trend || [];
  const topProducts = dashboard?.topProducts || [];

  const revenueToday = Number(todaySummary.revenue || 0);
  const expensesToday = Number(todaySummary.expenses || todaySummary.operatingExpenses || 0);
  const profitToday = Number(todaySummary.profit || todaySummary.netProfit || 0);
  const ordersToday = Number(todaySummary.orders || todaySummary.orderCount || 0);
  const marginToday = Number(todaySummary.margin || 0);
  const avgOrder = Number(todaySummary.averageOrderValue || todaySummary.avgOrderValue || 0);
  const unitsToday = Number(todaySummary.unitsSold || 0);

  return (
    <div className="tab-content home-page">
      {error && <div className="form-error">{error}</div>}
      {loading && !dashboard && <div className="loading-bar">Warming up the counter&hellip;</div>}

      <div className="home-hero">
        <ReceiptCard
          businessName={business?.name}
          dateLabel={formatDateDisplay(getTodayString()).full}
          revenue={revenueToday}
          expenses={expensesToday}
          profit={profitToday}
          margin={marginToday}
          orders={ordersToday}
          unitsSold={unitsToday}
          currency={currency}
          status={ordersToday > 0 ? "Live" : undefined}
        />

        <div className="home-hero-side">
          <div className="mini-stats-row">
            <div className="mini-stat">
              <span>Avg. order</span>
              <strong className="tabular">{formatMoney(avgOrder, currency)}</strong>
            </div>
            <div className="mini-stat-divider" />
            <div className="mini-stat">
              <span>Orders today</span>
              <strong className="tabular">{ordersToday}</strong>
            </div>
          </div>
          <div className="quick-actions-stack">
            <button type="button" className="quick-action-btn primary pulse" onClick={() => setPage("update")}>
              <Icon type="bolt" size={17} />
              Record today&rsquo;s sales
            </button>
            <button type="button" className="quick-action-btn secondary" onClick={() => setPage("expenses")}>
              <Icon type="expenses" size={16} />
              Add expense
            </button>
            <button type="button" className="quick-action-btn secondary" onClick={() => setPage("products")}>
              <Icon type="products" size={16} />
              Menu &amp; pricing
            </button>
            <button type="button" className="quick-action-btn secondary" onClick={() => setPage("analytics")}>
              <Icon type="analytics" size={16} />
              View analytics
            </button>
          </div>
        </div>
      </div>

      <TrendChart trendData={trend} />

      {topProducts.length > 0 && (
        <section className="products-card rise">
          <div className="products-header">
            <h2>Top performing menu items</h2>
            <span>Last 7 days</span>
          </div>
          <div className="top-products-grid">
            {topProducts.slice(0, 3).map((p, idx) => {
              const iconKey = getProductIconKey("", p.productName);
              return (
                <div key={p.productId || idx} className={`top-product-card rank-${idx + 1}`}>
                  <div className="badge-rank tabular">#{idx + 1}</div>
                  <div className={`tp-icon ${getIconTileClass(iconKey)}`}>
                    <FoodIcon name={iconKey} size={26} />
                  </div>
                  <div className="tp-details">
                    <strong>{p.productName}</strong>
                    <span>{p.unitsSold} units sold</span>
                    <div className="tp-profit tabular">+{formatMoney(p.profit, currency)} profit</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="snapshot rise">
        <div className="snapshot-header">
          <h2>Business intelligence</h2>
          <span>Calculated deterministically from your data</span>
        </div>

        <div className="insights-container">
          {insights && insights.length > 0 ? (
            insights.map((text, idx) => (
              <div key={idx} className="snapshot-content">
                <div className="snapshot-icon">
                  <Icon type="sparkle" size={16} />
                </div>
                <div>
                  <p>{text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="snapshot-content">
              <div className="snapshot-icon">
                <Icon type="sparkle" size={16} />
              </div>
              <div>
                <strong>Welcome to BiteWise!</strong>
                <p>
                  Start by adding your menu items and recording today&rsquo;s sales. BiteWise will
                  automatically work out your profits, margins, and business insights from there.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
