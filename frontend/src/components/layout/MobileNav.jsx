import React from "react";
import Icon from "../common/Icon";

const ITEMS = [
  { id: "home", label: "Home", icon: "home" },
  { id: "expenses", label: "Expenses", icon: "expenses" },
  { id: "update", label: "Update", icon: "bolt" },
  { id: "products", label: "Menu", icon: "products" },
  { id: "analytics", label: "Stats", icon: "analytics" },
];

function MobileNav({ page, setPage }) {
  return (
    <nav className="mobile-nav">
      {ITEMS.map((item) =>
        item.id === "update" ? (
          <button
            key={item.id}
            type="button"
            className="mobile-nav-fab"
            onClick={() => setPage("update")}
            aria-label="Daily Update"
          >
            <Icon type="bolt" size={22} />
          </button>
        ) : (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            <Icon type={item.icon} size={19} />
            <span>{item.label}</span>
          </button>
        )
      )}
    </nav>
  );
}

export default MobileNav;
