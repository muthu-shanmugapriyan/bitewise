import React, { useState, useEffect, useMemo } from "react";
import Modal from "../components/common/Modal";
import Icon from "../components/common/Icon";
import FoodIcon from "../components/common/FoodIcon";
import EmptyState from "../components/common/EmptyState";
import * as api from "../services/api";
import { formatMoney } from "../utils/formatters";
import { ICON_CATEGORIES, getProductIconKey, getIconTileClass } from "../constants/icons";

function ProductsPage({ products = [], currency, onProductsChanged }) {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    sellingPrice: "",
    costPrice: "",
    iconKey: "burger",
    categoryId: "",
  });

  const loadCategories = async () => {
    try {
      const list = await api.getProductCategories();
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCat === "all" || p.categoryId === selectedCat;
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCat, searchQuery]);

  const handleOpenAdd = () => {
    setForm({
      name: "",
      sellingPrice: "",
      costPrice: "",
      iconKey: "burger",
      categoryId: categories[0]?.id || "",
    });
    setEditingProduct(null);
    setShowAddModal(true);
    setError("");
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sellingPrice: product.sellingPrice.toString(),
      costPrice: product.costPrice.toString(),
      iconKey: product.iconKey || "burger",
      categoryId: product.categoryId || "",
    });
    setShowAddModal(true);
    setError("");
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      costPrice: parseFloat(form.costPrice) || 0,
      iconKey: form.iconKey,
      categoryId: form.categoryId || null,
      active: true,
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        setSuccess(`Updated "${payload.name}".`);
      } else {
        await api.addProduct(payload);
        setSuccess(`Added "${payload.name}" to your menu.`);
      }
      setShowAddModal(false);
      if (onProductsChanged) onProductsChanged();
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the active menu?`)) return;
    try {
      await api.deleteProduct(id);
      setSuccess(`Removed "${name}".`);
      if (onProductsChanged) onProductsChanged();
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSubmitting(true);
    try {
      await api.addProductCategory({ name: categoryName.trim() });
      setCategoryName("");
      setShowCategoryModal(false);
      loadCategories();
      setSuccess("Category added.");
    } catch (err) {
      setError(err.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const sellingNum = parseFloat(form.sellingPrice) || 0;
  const costNum = parseFloat(form.costPrice) || 0;
  const unitProfit = sellingNum - costNum;
  const unitMargin = sellingNum > 0 ? ((unitProfit / sellingNum) * 100).toFixed(1) : 0;

  return (
    <div className="tab-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Menu &amp; pricing</h1>
          <p className="page-sub">Set what you sell, its price and its cost — margins follow automatically.</p>
        </div>

        <div className="header-actions">
          <button type="button" className="secondary-button" onClick={() => setShowCategoryModal(true)}>
            <Icon type="plus" size={14} /> Category
          </button>
          <button type="button" className="primary-button" onClick={handleOpenAdd}>
            <Icon type="plus" size={15} /> Add item
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <Icon type="search" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search menu items&hellip;"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-chips">
          <button type="button" className={`filter-chip ${selectedCat === "all" ? "active" : ""}`} onClick={() => setSelectedCat("all")}>
            All ({products.length})
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" className={`filter-chip ${selectedCat === c.id ? "active" : ""}`} onClick={() => setSelectedCat(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <section className="products-card">
        <div className="products-header">
          <h2>Your menu board</h2>
          <span>{filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"}</span>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            icon="products"
            title="No items here yet"
            message="Add your first menu item to start tracking sales and profit."
            action={handleOpenAdd}
            actionLabel="+ Add first item"
          />
        ) : (
          <div className="products-grid">
            {filteredProducts.map((p) => {
              const iconKey = getProductIconKey(p.iconKey, p.name);
              const profit = Number(p.sellingPrice) - Number(p.costPrice);
              const margin = Number(p.sellingPrice) > 0 ? ((profit / Number(p.sellingPrice)) * 100).toFixed(1) : 0;

              return (
                <article className="product-row" key={p.id}>
                  <div className={`product-icon ${getIconTileClass(iconKey)}`}>
                    <FoodIcon name={iconKey} size={24} />
                  </div>
                  <div className="product-info">
                    <strong>{p.name}</strong>
                    <span className="tabular">
                      {formatMoney(p.sellingPrice, currency)} · cost {formatMoney(p.costPrice, currency)}
                    </span>
                  </div>

                  <div className="product-margin-badge">
                    <strong className="tabular">+{formatMoney(profit, currency)}</strong>
                    <span className={Number(margin) >= 50 ? "high-margin" : ""}>{margin}% margin</span>
                  </div>

                  <div className="product-row-actions">
                    <button type="button" className="icon-btn" onClick={() => handleOpenEdit(p)} title="Edit">
                      <Icon type="edit" size={15} />
                    </button>
                    <button type="button" className="icon-btn danger" onClick={() => handleDeleteProduct(p.id, p.name)} title="Remove">
                      <Icon type="trash" size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showAddModal && (
        <Modal
          title={editingProduct ? "Edit menu item" : "Add a new menu item"}
          subtitle="Set a selling price and cost to unlock automatic profit tracking"
          onClose={() => setShowAddModal(false)}
        >
          <form onSubmit={handleSaveProduct} className="modal-form">
            <div className="form-group">
              <label>Item name</label>
              <input
                type="text"
                required
                placeholder="e.g. Chicken Biryani, Cheese Pizza, Cold Coffee"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Selling price ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="150"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Cost price ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="70"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="profit-preview-box">
              <span>Unit profit</span>
              <strong className="tabular">{formatMoney(unitProfit, currency)}</strong>
              <span className="tabular">{unitMargin}% margin</span>
            </div>

            <div className="icon-selector-grid">
              <div className="icon-preview-row">
                <label>Choose an icon</label>
                <div className="icon-preview-badge">
                  <FoodIcon name={getProductIconKey(form.iconKey, form.name)} size={20} />
                  Preview
                </div>
              </div>
              <div className="emoji-picker-container">
                {ICON_CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="emoji-category-section">
                    <span className="emoji-category-title">{cat.name}</span>
                    <div className="emoji-picker-row">
                      {cat.items.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          className={`emoji-btn ${form.iconKey === opt.key ? "selected" : ""}`}
                          onClick={() => setForm({ ...form, iconKey: opt.key })}
                          title={opt.label}
                        >
                          <FoodIcon name={opt.key} size={19} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? "Saving\u2026" : editingProduct ? "Update item" : "Add to menu"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showCategoryModal && (
        <Modal title="Create a menu category" subtitle="Group items like Starters, Mains, Drinks, Desserts" onClose={() => setShowCategoryModal(false)}>
          <form onSubmit={handleAddCategory} className="modal-form">
            <div className="form-group">
              <label>Category name</label>
              <input
                type="text"
                required
                placeholder="e.g. Starters, Main Course, Drinks"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowCategoryModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? "Saving\u2026" : "Create category"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ProductsPage;
