import React from "react";
import BrandLogo from "../common/BrandLogo";
import Icon from "../common/Icon";
import { formatDateDisplay, getTodayString } from "../../utils/formatters";

function TopHeader({ business, ownerName, onLogout, setPage }) {
  const hour = new Date().getHours();
  const today = formatDateDisplay(getTodayString());

  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";

  return (
    <header className="top-header">
      <div className="mobile-brand">
        <BrandLogo compact />
      </div>

      <div className="top-header-copy">
        <h1>
          {greeting}, {ownerName || "Chef"} <span className="wave">👋</span>
        </h1>
        <p>
          {business?.name
            ? `Managing ${business.name} · ${business.currency || "INR"}`
            : "Here's how your food business is performing."}
        </p>
      </div>

      <div className="header-right">
        <div className="date-box">
          <span>{today.day}</span>
          <strong className="tabular">{today.full}</strong>
        </div>

        <button
          type="button"
          className="header-daily-update-btn"
          onClick={() => setPage("update")}
        >
          <Icon type="bolt" size={16} />
          Record Sales
        </button>

        <button
          type="button"
          className="header-icon-btn"
          onClick={() => setPage("settings")}
          title="Settings"
        >
          <Icon type="settings" size={17} />
        </button>

        <button
          type="button"
          className="header-icon-btn"
          onClick={onLogout}
          title="Sign Out"
        >
          <Icon type="logout" size={17} />
        </button>
      </div>
    </header>
  );
}

export default TopHeader;
