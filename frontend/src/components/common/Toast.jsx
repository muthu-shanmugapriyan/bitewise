import React, { useEffect } from "react";
import Icon from "./Icon";

function Toast({ message, type = "info", onClose, visible }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={`toast toast-${type}`} role="status">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Dismiss">
        <Icon type="close" size={14} />
      </button>
    </div>
  );
}

export default Toast;
