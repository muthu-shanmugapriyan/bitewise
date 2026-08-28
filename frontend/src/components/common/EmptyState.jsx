import React from "react";
import Icon from "./Icon";

function EmptyState({ icon = "box", title, message, action, actionLabel }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon type={icon} size={26} />
      </div>
      {title && <strong>{title}</strong>}
      {message && <p>{message}</p>}
      {action && (
        <button type="button" className="primary-button" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
