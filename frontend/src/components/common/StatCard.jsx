import React from "react";
import Icon from "./Icon";

function StatCard({ label, value, detail, positive, neutral, icon, accent = "chili" }) {
  const tone = neutral ? "neutral" : positive ? "positive" : "negative";
  return (
    <article className={`stat-card accent-${accent}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {icon && (
          <span className="stat-icon">
            <Icon type={icon} size={16} />
          </span>
        )}
      </div>
      <strong className="stat-value tabular">{value}</strong>
      <span className={`stat-detail ${tone}`}>{detail}</span>
    </article>
  );
}

export default StatCard;
