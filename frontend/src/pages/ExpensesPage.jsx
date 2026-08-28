import React, { useState, useEffect, useMemo } from "react";
import Modal from "../components/common/Modal";
import Icon from "../components/common/Icon";
import EmptyState from "../components/common/EmptyState";
import * as api from "../services/api";
import { formatMoney, getTodayString, formatCalendarBadge } from "../utils/formatters";

function ExpensesPage({ currency, onExpenseAdded }) {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dateRange, setDateRange] = useState({
    from: getTodayString(),
    to: getTodayString(),
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    description: "",
    categoryId: "",
    expenseDate: getTodayString(),
    expenseType: "VARIABLE",
    recurring: false,
  });

  const [catName, setCatName] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [expList, catList] = await Promise.all([
        api.getExpenses(dateRange.from, dateRange.to),
        api.getExpenseCategories().catch(() => []),
      ]);
      setExpenses(Array.isArray(expList) ? expList : []);
      setCategories(Array.isArray(catList) ? catList : []);
    } catch (err) {
      setError(err.message || "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.from, dateRange.to]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.addExpense({
        date: expenseForm.expenseDate || getTodayString(),
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        categoryId: expenseForm.categoryId || null,
        expenseType: expenseForm.expenseType || "VARIABLE",
        recurring: expenseForm.recurring || false,
      });
      setSuccess("Expense recorded successfully!");
      setShowAddModal(false);
      setExpenseForm({
        amount: "",
        description: "",
        categoryId: "",
        expenseDate: getTodayString(),
        expenseType: "VARIABLE",
        recurring: false,
      });
      loadData();
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      setError(err.message || "Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSubmitting(true);
    try {
      await api.addExpenseCategory({ name: catName.trim() });
      setCatName("");
      setShowCatModal(false);
      const catList = await api.getExpenseCategories();
      setCategories(catList);
      setSuccess("Expense category created!");
    } catch (err) {
      setError(err.message || "Failed to add category.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalExpenseAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const isTodayRange = dateRange.from === getTodayString() && dateRange.to === getTodayString();

  return (
    <div className="tab-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Operating expenses</h1>
          <p className="page-sub">
            Track supplies, packaging, fuel, rent and staff costs — these subtract from gross profit to get your true net.
          </p>
        </div>

        <div className="header-actions">
          <button type="button" className="secondary-button" onClick={() => setShowCatModal(true)}>
            <Icon type="plus" size={14} /> Category
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setShowAddModal(true);
              setExpenseForm((prev) => ({ ...prev, categoryId: categories[0]?.id || "" }));
            }}
          >
            <Icon type="plus" size={15} /> Record expense
          </button>
        </div>
      </div>

      <div className="filter-bar-card">
        <div className="date-filters">
          <button
            type="button"
            className={`filter-chip ${isTodayRange ? "active" : ""}`}
            onClick={() => setDateRange({ from: getTodayString(), to: getTodayString() })}
          >
            Today
          </button>
          <button
            type="button"
            className="filter-chip"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 7);
              setDateRange({ from: d.toISOString().slice(0, 10), to: getTodayString() });
            }}
          >
            Last 7 days
          </button>
          <button
            type="button"
            className="filter-chip"
            onClick={() => {
              const d = new Date();
              d.setDate(1);
              setDateRange({ from: d.toISOString().slice(0, 10), to: getTodayString() });
            }}
          >
            This month
          </button>
        </div>

        <div className="date-range-pickers">
          <div>
            <label>From</label>
            <input
              type="date"
              className="date-input-sm"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
          </div>
          <div>
            <label>To</label>
            <input
              type="date"
              className="date-input-sm"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
          </div>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <div className="expense-stat-banner">
        <div>
          <span>Total expenses for selected range</span>
          <strong className="tabular">{formatMoney(totalExpenseAmount, currency)}</strong>
        </div>
        <div className="expense-count-pill">{expenses.length} record{expenses.length === 1 ? "" : "s"} logged</div>
      </div>

      <section className="products-card">
        {loading && <div className="loading-bar">Loading expenses&hellip;</div>}

        {!loading && expenses.length === 0 && (
          <EmptyState
            icon="expenses"
            title="No expenses recorded"
            message="Nothing logged for this date range yet."
            action={() => setShowAddModal(true)}
            actionLabel="+ Record first expense"
          />
        )}

        <div className="expense-table">
          {expenses.map((item) => {
            const badge = formatCalendarBadge(item.date);
            return (
              <div className="expense-row" key={item.id}>
                <div className="expense-date-badge">
                  <strong className="tabular">{badge.num}</strong>
                  <span>{badge.mon}</span>
                </div>
                <div className="expense-details">
                  <strong>{item.description || "General expense"}</strong>
                  <span className="expense-cat-tag">{item.categoryName || "Other"}</span>
                  {item.recurring && <span className="recurring-tag">Recurring</span>}
                </div>
                <div className="expense-amount tabular">{formatMoney(item.amount, currency)}</div>
              </div>
            );
          })}
        </div>
      </section>

      {showAddModal && (
        <Modal
          title="Record business expense"
          subtitle="Add overheads or supply purchases to calculate net margins"
          onClose={() => setShowAddModal(false)}
        >
          <form onSubmit={handleAddExpense} className="modal-form">
            <div className="form-group">
              <label>Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                placeholder="e.g. 500"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Cooking oil, electricity bill, packaging bags"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                >
                  <option value="">Select or leave as Other</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Expense type</label>
                <select
                  value={expenseForm.expenseType}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseType: e.target.value })}
                >
                  <option value="VARIABLE">Variable (daily supplies, fuel)</option>
                  <option value="FIXED">Fixed (rent, salary, utilities)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expense date</label>
                <input
                  type="date"
                  required
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                />
              </div>

              <div className="form-group checkbox-row">
                <label>Recurring monthly</label>
                <input
                  type="checkbox"
                  checked={expenseForm.recurring}
                  onChange={(e) => setExpenseForm({ ...expenseForm, recurring: e.target.checked })}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? "Saving\u2026" : "Save expense"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showCatModal && (
        <Modal
          title="New expense category"
          subtitle="Group expenses like Raw Materials, Rent, Staff, Utilities, Marketing"
          onClose={() => setShowCatModal(false)}
        >
          <form onSubmit={handleAddCategory} className="modal-form">
            <div className="form-group">
              <label>Category name</label>
              <input
                type="text"
                required
                placeholder="e.g. Raw Materials, Fuel, Rent, Packaging"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowCatModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? "Creating\u2026" : "Create category"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ExpensesPage;
