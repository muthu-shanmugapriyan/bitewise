import React, { useState, useEffect, useMemo } from "react";
import Modal from "../components/common/Modal";
import Icon from "../components/common/Icon";
import FoodIcon from "../components/common/FoodIcon";
import EmptyState from "../components/common/EmptyState";
import * as api from "../services/api";
import { formatMoney, getTodayString, formatDateDisplay } from "../utils/formatters";
import { getProductIconKey, getIconTileClass } from "../constants/icons";

function DailyUpdatePage({ products = [], currency, onSalesSaved }) {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [counts, setCounts] = useState({});
  const [orderCount, setOrderCount] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [justClosed, setJustClosed] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);

  const loadDailyRecord = async (date) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const sale = await api.getDailySale(date);
      const newCounts = Object.fromEntries(activeProducts.map((p) => [p.id, 0]));
      let totalQty = 0;
      if (sale && sale.items) {
        sale.items.forEach((item) => {
          newCounts[item.productId] = item.quantity;
          totalQty += item.quantity;
        });
      }
      setCounts(newCounts);
      setOrderCount(sale?.orderCount || totalQty);
      setIsClosed(Boolean(sale?.closed));
      if (sale?.closed) {
        setMessage("This business day is closed. Numbers are finalized.");
      }
    } catch {
      const zeroCounts = Object.fromEntries(activeProducts.map((p) => [p.id, 0]));
      setCounts(zeroCounts);
      setOrderCount(0);
      setIsClosed(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeProducts.length > 0) {
      loadDailyRecord(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, activeProducts.length]);

  const changeQuantity = (productId, delta) => {
    if (isClosed) return;
    setMessage("");
    setError("");
    setCounts((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev, [productId]: next };
      const totalUnits = Object.values(updated).reduce((a, b) => a + b, 0);
      setOrderCount(totalUnits);
      return updated;
    });
  };

  const handleDirectInput = (productId, valStr) => {
    if (isClosed) return;
    const num = Math.max(0, parseInt(valStr, 10) || 0);
    setCounts((prev) => {
      const updated = { ...prev, [productId]: num };
      const totalUnits = Object.values(updated).reduce((a, b) => a + b, 0);
      setOrderCount(totalUnits);
      return updated;
    });
  };

  const totalUnits = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  const totalRevenue = useMemo(
    () =>
      activeProducts.reduce((sum, p) => sum + Number(p.sellingPrice || 0) * (counts[p.id] || 0), 0),
    [activeProducts, counts]
  );

  const totalCost = useMemo(
    () => activeProducts.reduce((sum, p) => sum + Number(p.costPrice || 0) * (counts[p.id] || 0), 0),
    [activeProducts, counts]
  );

  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;

  const handleSaveSales = async () => {
    if (isClosed) {
      setError("Cannot modify a closed day.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");

    const items = activeProducts
      .filter((p) => (counts[p.id] || 0) > 0)
      .map((p) => ({ productId: p.id, quantity: counts[p.id] }));

    const payload = {
      date: selectedDate,
      orderCount: Math.max(orderCount, totalUnits > 0 ? 1 : 0),
      items,
    };

    try {
      await api.saveDailySale(payload);
      setMessage("Daily sales saved to today's ticket.");
      if (onSalesSaved) onSalesSaved();
    } catch (err) {
      setError(err.message || "Failed to save daily sales.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmCloseDay = async () => {
    setClosing(true);
    setError("");
    try {
      await api.closeDay(selectedDate);
      setIsClosed(true);
      setShowCloseModal(false);
      setJustClosed(true);
      setMessage("Day closed. Summary and insights are finalized.");
      if (onSalesSaved) onSalesSaved();
    } catch (err) {
      setError(err.message || "Failed to close day.");
    } finally {
      setClosing(false);
    }
  };

  const isToday = selectedDate === getTodayString();
  const dateLabel = formatDateDisplay(selectedDate);

  return (
    <div className="tab-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Daily sales entry</h1>
          <p className="page-sub">
            Tap in quantities sold — BiteWise works out revenue, costs and margin automatically.
          </p>
        </div>
      </div>

      <div className="daily-sales-header">
        <div className="header-left">
          <label>
            <Icon type="calendar" size={15} /> Date
          </label>
          <input
            type="date"
            className="date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {!isToday && <span className="date-tag">Viewing {dateLabel.full}</span>}
        </div>

        <div className="header-right">
          <span className={`status-badge ${isClosed ? "closed" : "open"}`}>
            <span className="status-dot-sm" />
            {isClosed ? "Day closed" : "Day open"}
          </span>
          {!isClosed && (
            <button
              type="button"
              className="close-day-btn"
              onClick={() => setShowCloseModal(true)}
              disabled={closing || saving || loading || totalUnits === 0}
            >
              <Icon type="lock" size={15} />
              Finalize &amp; close day
            </button>
          )}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {message && <div className={`form-success ${justClosed ? "stamped" : ""}`}>{message}</div>}

      <section className="sales-card">
        {loading && <div className="loading-bar">Loading sales data&hellip;</div>}

        {activeProducts.length === 0 && !loading && (
          <EmptyState
            icon="products"
            title="Your menu is empty"
            message="Add the items you sell in the Menu tab first — then daily entry takes seconds."
          />
        )}

        <div className="sale-products-list">
          {activeProducts.map((product) => {
            const qty = counts[product.id] || 0;
            const iconKey = getProductIconKey(product.iconKey, product.name);
            const lineRev = qty * Number(product.sellingPrice || 0);

            return (
              <div className={`sales-item-row ${qty > 0 ? "has-qty" : ""}`} key={product.id}>
                <div className={`product-icon ${getIconTileClass(iconKey)}`}>
                  <FoodIcon name={iconKey} size={22} />
                </div>
                <div className="product-info">
                  <strong>{product.name}</strong>
                  <span className="tabular">
                    {formatMoney(product.sellingPrice, currency)} · cost {formatMoney(product.costPrice, currency)}
                  </span>
                </div>

                <div className="quick-presets">
                  <button type="button" className="preset-btn" disabled={isClosed} onClick={() => changeQuantity(product.id, 5)}>
                    +5
                  </button>
                  <button type="button" className="preset-btn" disabled={isClosed} onClick={() => changeQuantity(product.id, 10)}>
                    +10
                  </button>
                </div>

                <div className="counter-box">
                  <button type="button" className="counter-btn" disabled={isClosed || qty <= 0} onClick={() => changeQuantity(product.id, -1)} aria-label="Decrease">
                    <Icon type="minus" size={14} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    className="counter-input tabular"
                    value={qty}
                    disabled={isClosed}
                    onChange={(e) => handleDirectInput(product.id, e.target.value)}
                  />
                  <button type="button" className="counter-btn" disabled={isClosed} onClick={() => changeQuantity(product.id, 1)} aria-label="Increase">
                    <Icon type="plus" size={14} />
                  </button>
                </div>

                <div className="sale-item-total">
                  <strong className="tabular">{formatMoney(lineRev, currency)}</strong>
                  <span>{qty} sold</span>
                </div>
              </div>
            );
          })}
        </div>

        {activeProducts.length > 0 && (
          <div className="daily-summary-footer">
            <div className="summary-pills">
              <div className="sum-pill">
                <span>Units sold</span>
                <strong className="tabular">{totalUnits}</strong>
              </div>
              <div className="sum-pill">
                <span>Gross revenue</span>
                <strong className="tabular">{formatMoney(totalRevenue, currency)}</strong>
              </div>
              <div className="sum-pill">
                <span>Production cost</span>
                <strong className="tabular">{formatMoney(totalCost, currency)}</strong>
              </div>
              <div className="sum-pill highlight">
                <span>Gross profit &middot; {grossMargin}%</span>
                <strong className="tabular">{formatMoney(grossProfit, currency)}</strong>
              </div>
            </div>

            <div className="save-action-row">
              <div className="order-count-input">
                <label>Orders</label>
                <input
                  type="number"
                  min="0"
                  className="tabular"
                  value={orderCount}
                  disabled={isClosed}
                  onChange={(e) => setOrderCount(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <button
                type="button"
                className="primary-button save-sales-btn"
                onClick={handleSaveSales}
                disabled={saving || closing || isClosed || activeProducts.length === 0}
              >
                {saving ? "Saving\u2026" : "Save daily sales"}
                {!saving && <Icon type="arrow" size={16} />}
              </button>
            </div>
          </div>
        )}
      </section>

      {showCloseModal && (
        <Modal
          title="Close today's ticket"
          subtitle={`Review performance for ${dateLabel.full} before finalizing`}
          onClose={() => setShowCloseModal(false)}
        >
          <div className="close-day-summary-box">
            <div className="cd-metric-row">
              <span>Gross revenue</span>
              <strong className="tabular">{formatMoney(totalRevenue, currency)}</strong>
            </div>
            <div className="cd-metric-row">
              <span>Food production cost</span>
              <span className="tabular">&minus; {formatMoney(totalCost, currency)}</span>
            </div>
            <div className="perf-divider" />
            <div className="cd-metric-row highlight">
              <span>Gross profit</span>
              <strong className="profit-text tabular">
                +{formatMoney(grossProfit, currency)} ({grossMargin}%)
              </strong>
            </div>
            <div className="cd-metric-row">
              <span>Units / orders</span>
              <span className="tabular">
                {totalUnits} units across {orderCount} orders
              </span>
            </div>

            <p className="cd-notice">
              <Icon type="alert" size={14} /> Closing the day finalizes your records and generates
              automated business insights.
            </p>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowCloseModal(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={handleConfirmCloseDay} disabled={closing}>
                {closing ? "Finalizing\u2026" : "Confirm & close day"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default DailyUpdatePage;
