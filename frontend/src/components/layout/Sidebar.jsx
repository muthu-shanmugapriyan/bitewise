import React from "react";
import Icon from "../common/Icon";
import BrandLogo from "../common/BrandLogo";

const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: "home" },
  { id: "update", label: "Daily Update", icon: "update" },
  { id: "expenses", label: "Expenses", icon: "expenses" },
  { id: "products", label: "Menu", icon: "products" },
  { id: "analytics", label: "Analytics", icon: "analytics" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function Sidebar({ page, setPage, onLogout, business, onOpenWizard }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <BrandLogo />

        {business && (
          <div className="sidebar-business-info">
            <span className="biz-dot" />
            <div>
              <div className="biz-name">{business.name}</div>
              <div className="biz-type">{business.businessType || "Food Business"}</div>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        className="sidebar-quick-update-btn"
        onClick={() => setPage("update")}
      >
        <Icon type="bolt" size={16} />
        <span>Record Sales</span>
      </button>

      <div className="perf-divider sidebar-perf" />

      <nav className="side-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            <Icon type={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="perf-divider sidebar-perf" />

      <div className="sidebar-bottom">
        <button type="button" className="wizard-side-btn" onClick={onOpenWizard}>
          <Icon type="sparkle" size={15} />
          <span>Setup Wizard</span>
        </button>
        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>All systems fresh</span>
        </div>
        <button type="button" className="logout-side-btn" onClick={onLogout} title="Log Out">
          <Icon type="logout" size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
