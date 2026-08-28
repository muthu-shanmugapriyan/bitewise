import React, { useState, useEffect, useMemo } from "react";
import * as api from "../services/api";
import Icon from "../components/common/Icon";
import EmptyState from "../components/common/EmptyState";

const ACTION_ICON = {
  CREATE: "plus",
  UPDATE: "edit",
  DELETE: "trash",
  LOGIN: "unlock",
  LOGOUT: "lock",
};

const ACTION_LABEL = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  LOGIN: "Signed in",
  LOGOUT: "Signed out",
};

function formatTimestamp(value) {
  if (!value) return { date: "", time: "" };
  const d = new Date(value);
  return {
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

function BusinessHistoryPage({ setPage }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getAuditLog()
      .then((data) => {
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load business history.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const entityTypes = useMemo(() => {
    const set = new Set(entries.map((e) => e.entityType).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [entries]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return entries;
    return entries.filter((e) => e.entityType === filter);
  }, [entries, filter]);

  return (
    <div className="tab-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Business history</h1>
          <p className="page-sub">
            A running record of changes to your menu, expenses, and business profile — plus account
            activity like sign-ins.
          </p>
        </div>

        {setPage && (
          <button type="button" className="secondary-button" onClick={() => setPage("settings")}>
            <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
              <Icon type="arrow" size={14} />
            </span>
            Back to settings
          </button>
        )}
      </div>

      {entityTypes.length > 2 && (
        <div className="category-chips" style={{ marginBottom: 18 }}>
          {entityTypes.map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-chip ${filter === t ? "active" : ""}`}
              onClick={() => setFilter(t)}
            >
              {t === "ALL" ? "All activity" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {error && <div className="form-error">{error}</div>}
      {loading && <div className="loading-bar">Loading business history\u2026</div>}

      {!loading && filtered.length === 0 && !error && (
        <EmptyState
          icon="history"
          title="No activity recorded yet"
          message="As you add products, log expenses, or update your business profile, those actions will show up here."
        />
      )}

      {filtered.length > 0 && (
        <div className="history-timeline">
          {filtered.map((entry) => {
            const { date, time } = formatTimestamp(entry.createdAt);
            return (
              <div className="history-row" key={entry.id}>
                <div className={`history-icon action-${(entry.action || "").toLowerCase()}`}>
                  <Icon type={ACTION_ICON[entry.action] || "history"} size={15} />
                </div>
                <div className="history-details">
                  <div className="history-details-top">
                    <strong>{ACTION_LABEL[entry.action] || entry.action}</strong>
                    {entry.entityType && <span className="history-entity-tag">{entry.entityType}</span>}
                  </div>
                  <p>{entry.details}</p>
                  <span className="history-actor">by {entry.actorName}</span>
                </div>
                <div className="history-timestamp">
                  <span>{date}</span>
                  <span>{time}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BusinessHistoryPage;
