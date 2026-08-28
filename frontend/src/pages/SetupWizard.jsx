import React, { useState, useMemo } from "react";
import Modal from "../components/common/Modal";
import Icon from "../components/common/Icon";
import FoodIcon from "../components/common/FoodIcon";
import * as api from "../services/api";
import { ICON_CATEGORIES, getProductIconKey, getIconTileClass } from "../constants/icons";
import { formatMoney } from "../utils/formatters";

function SetupWizard({ business, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [bizForm, setBizForm] = useState({
    name: business?.name || "",
    businessType: business?.businessType || "Food Truck",
    location: business?.location || "",
    currency: business?.currency || "INR",
    operatingDays: "Mon - Sat",
  });

  const [categories] = useState([]);

  const [productForm, setProductForm] = useState({
    name: "",
    sellingPrice: "",
    costPrice: "",
    iconKey: "burger",
    categoryId: "",
  });

  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [ingredients, setIngredients] = useState([
    { name: "Main ingredient (e.g. patty / meat)", cost: "" },
    { name: "Base (e.g. bun / rice / bread)", cost: "" },
    { name: "Cheese / sauce / veggies", cost: "" },
    { name: "Packaging", cost: "" },
  ]);

  const [addedProducts, setAddedProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const calculatedIngredientCost = useMemo(
    () => ingredients.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0),
    [ingredients]
  );

  const handleApplyIngredientCost = () => {
    if (calculatedIngredientCost > 0) {
      setProductForm((prev) => ({ ...prev, costPrice: calculatedIngredientCost.toFixed(2) }));
    }
  };

  const handleAddProductInWizard = () => {
    if (!productForm.name || !productForm.sellingPrice || !productForm.costPrice) {
      setError("Please fill item name, selling price, and cost price.");
      return;
    }
    setError("");
    const newProd = {
      name: productForm.name.trim(),
      sellingPrice: parseFloat(productForm.sellingPrice),
      costPrice: parseFloat(productForm.costPrice),
      iconKey: productForm.iconKey,
      categoryId: productForm.categoryId || null,
      active: true,
    };
    setAddedProducts([...addedProducts, newProd]);
    setProductForm({
      name: "",
      sellingPrice: "",
      costPrice: "",
      iconKey: "burger",
      categoryId: categories[0]?.id || "",
    });
    setIngredients([
      { name: "Main ingredient", cost: "" },
      { name: "Base / bread", cost: "" },
      { name: "Sauce / extras", cost: "" },
      { name: "Packaging", cost: "" },
    ]);
    setShowCostBreakdown(false);
  };

  const handleFinishWizard = async () => {
    setSaving(true);
    setError("");
    try {
      await api.updateBusiness(bizForm);
      for (const p of addedProducts) {
        await api.addProduct(p).catch(() => null);
      }
      onComplete();
    } catch (err) {
      setError(err.message || "Failed to complete setup.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="BiteWise quick setup"
      subtitle={`Step ${step} of 3 — set up your food business once, track it effortlessly.`}
      onClose={onCancel}
      size="lg"
    >
      <div className="wizard-stepper">
        <button type="button" className={`wizard-step-item ${step === 1 ? "active" : ""}`} onClick={() => setStep(1)}>
          <span>1</span> Business info
        </button>
        <button type="button" className={`wizard-step-item ${step === 2 ? "active" : ""}`} onClick={() => setStep(2)}>
          <span>2</span> Menu &amp; costs
        </button>
        <button type="button" className={`wizard-step-item ${step === 3 ? "active" : ""}`} onClick={() => setStep(3)}>
          <span>3</span> Review &amp; launch
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {step === 1 && (
        <div className="wizard-step-content">
          <div className="form-group">
            <label>Business name</label>
            <input
              type="text"
              required
              value={bizForm.name}
              onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
              placeholder="e.g. Priyan's Street Bites"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Business type</label>
              <select value={bizForm.businessType} onChange={(e) => setBizForm({ ...bizForm, businessType: e.target.value })}>
                <option value="Food Truck">Food Truck</option>
                <option value="Cafe">Cafe</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Street Food">Street Food Cart</option>
                <option value="Bakery">Bakery</option>
                <option value="Cloud Kitchen">Cloud Kitchen</option>
                <option value="Juice Shop">Juice &amp; Beverages</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select value={bizForm.currency} onChange={(e) => setBizForm({ ...bizForm, currency: e.target.value })}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Location / city</label>
            <input
              type="text"
              placeholder="e.g. MG Road, Vijayawada"
              value={bizForm.location}
              onChange={(e) => setBizForm({ ...bizForm, location: e.target.value })}
            />
          </div>

          <div className="wizard-actions">
            <span />
            <button type="button" className="primary-button" onClick={() => setStep(2)} disabled={!bizForm.name}>
              Continue to menu setup <Icon type="arrow" size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-step-content">
          <p className="wizard-hint">
            Add the items you sell with a selling price and a cost to produce — BiteWise works out unit
            profit and margin instantly.
          </p>

          <div className="wizard-product-entry-card">
            <div className="form-group">
              <label>Item name</label>
              <input
                type="text"
                placeholder="e.g. Crispy Chicken Burger, Masala Dosa"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Selling price ({bizForm.currency})</label>
                <input
                  type="number"
                  placeholder="150"
                  value={productForm.sellingPrice}
                  onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Cost price ({bizForm.currency})</label>
                <input
                  type="number"
                  placeholder="75"
                  value={productForm.costPrice}
                  onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="icon-selector-grid">
              <div className="icon-preview-row">
                <label>Choose an icon</label>
                <div className="icon-preview-badge">
                  <FoodIcon name={getProductIconKey(productForm.iconKey, productForm.name)} size={20} />
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
                          className={`emoji-btn ${productForm.iconKey === opt.key ? "selected" : ""}`}
                          onClick={() => setProductForm({ ...productForm, iconKey: opt.key })}
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

            <div className="cost-breakdown-toggle-box">
              <button type="button" className="toggle-text-btn" onClick={() => setShowCostBreakdown(!showCostBreakdown)}>
                <Icon type={showCostBreakdown ? "chevronDown" : "arrow"} size={13} />
                {showCostBreakdown ? "Hide ingredient cost breakdown" : "Optional: build cost from ingredients"}
              </button>

              {showCostBreakdown && (
                <div className="ingredient-breakdown-panel">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="ingredient-input-row">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => {
                          const copy = [...ingredients];
                          copy[i].name = e.target.value;
                          setIngredients(copy);
                        }}
                      />
                      <input
                        type="number"
                        placeholder="₹"
                        value={ing.cost}
                        onChange={(e) => {
                          const copy = [...ingredients];
                          copy[i].cost = e.target.value;
                          setIngredients(copy);
                        }}
                      />
                    </div>
                  ))}
                  <div className="breakdown-total-row">
                    <span className="tabular">Total calculated cost: ₹{calculatedIngredientCost}</span>
                    <button type="button" className="secondary-button-sm" onClick={handleApplyIngredientCost}>
                      Use ₹{calculatedIngredientCost} as cost
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="button" className="secondary-button full-btn" onClick={handleAddProductInWizard}>
              <Icon type="plus" size={14} /> Add item to list
            </button>
          </div>

          {addedProducts.length > 0 && (
            <div className="wizard-added-list">
              <h4>Added menu items ({addedProducts.length})</h4>
              {addedProducts.map((p, idx) => {
                const profit = p.sellingPrice - p.costPrice;
                const margin = ((profit / p.sellingPrice) * 100).toFixed(1);
                return (
                  <div key={idx} className="wizard-added-row">
                    <span className="wizard-added-name">
                      <FoodIcon name={getProductIconKey(p.iconKey, p.name)} size={17} /> {p.name}
                    </span>
                    <span className="tabular">
                      {formatMoney(p.sellingPrice, bizForm.currency)} · cost {formatMoney(p.costPrice, bizForm.currency)}
                    </span>
                    <strong className="profit-text tabular">
                      +{formatMoney(profit, bizForm.currency)} ({margin}%)
                    </strong>
                  </div>
                );
              })}
            </div>
          )}

          <div className="wizard-actions">
            <button type="button" className="secondary-button" onClick={() => setStep(1)}>
              <Icon type="arrow" size={14} className="icon-flip" /> Back
            </button>
            <button type="button" className="primary-button" onClick={() => setStep(3)}>
              Review &amp; finish <Icon type="arrow" size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="wizard-step-content">
          <div className="wizard-summary-card">
            <div className="wizard-summary-icon">
              <Icon type="sparkle" size={20} />
            </div>
            <h3>You&rsquo;re ready to roll!</h3>
            <p>
              Your business <strong>{bizForm.name}</strong> is configured with <strong>{addedProducts.length}</strong>{" "}
              menu item{addedProducts.length === 1 ? "" : "s"}.
            </p>
            <div className="wizard-features-list">
              <div>
                <Icon type="check" size={14} /> Automatic gross &amp; net profit tracking
              </div>
              <div>
                <Icon type="check" size={14} /> Five-minute daily sales entry
              </div>
              <div>
                <Icon type="check" size={14} /> Deterministic business insights
              </div>
              <div>
                <Icon type="check" size={14} /> Weekly &amp; monthly visual intelligence
              </div>
            </div>
          </div>

          <div className="wizard-actions">
            <button type="button" className="secondary-button" onClick={() => setStep(2)}>
              <Icon type="arrow" size={14} className="icon-flip" /> Back
            </button>
            <button type="button" className="primary-button" onClick={handleFinishWizard} disabled={saving}>
              {saving ? "Finalizing\u2026" : "Launch BiteWise dashboard"}
              {!saving && <Icon type="bolt" size={15} />}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default SetupWizard;
