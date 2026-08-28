import React, { useEffect } from "react";
import Icon from "./Icon";

function Modal({ title, subtitle, onClose, children, size = "md" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <Icon type="close" size={17} />
          </button>
        </div>
        <div className="perf-divider" />
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
