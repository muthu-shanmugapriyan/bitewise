import React from "react";
import { formatMoney } from "../../utils/formatters";

/* The signature BiteWise device: today's performance rendered as a
   till receipt — the one artefact every food stall already produces
   a dozen times a day. Perforated top, dashed line-items, torn
   bottom edge via clip-path. No dependency on imagery. */
function ReceiptCard({
  businessName,
  dateLabel,
  revenue,
  expenses,
  profit,
  margin,
  orders,
  unitsSold,
  currency,
  status,
}) {
  return (
    <div className="receipt-wrap">
      <div className="receipt torn-edge-top">
        <div className="receipt-head">
          <span className="receipt-eyebrow">Today&rsquo;s Ticket</span>
          <h2>{businessName || "Your Business"}</h2>
          <span className="receipt-date tabular">{dateLabel}</span>
        </div>

        <div className="perf-divider" />

        <div className="receipt-lines">
          <div className="receipt-line">
            <span>Gross revenue</span>
            <span className="tabular">{formatMoney(revenue, currency)}</span>
          </div>
          <div className="receipt-line">
            <span>Expenses &amp; costs</span>
            <span className="tabular">&minus; {formatMoney(expenses, currency)}</span>
          </div>
          <div className="perf-divider" />
          <div className="receipt-line receipt-total">
            <span>Net profit</span>
            <span className="tabular">{formatMoney(profit, currency)}</span>
          </div>
          <div className="receipt-line receipt-sub">
            <span>Profit margin</span>
            <span className="tabular">{margin}%</span>
          </div>
        </div>

        <div className="perf-divider" />

        <div className="receipt-foot">
          <div>
            <strong className="tabular">{orders}</strong>
            <span>orders</span>
          </div>
          <div>
            <strong className="tabular">{unitsSold}</strong>
            <span>items sold</span>
          </div>
          {status && <div className={`receipt-stamp stamp-${status.toLowerCase()}`}>{status}</div>}
        </div>
      </div>
    </div>
  );
}

export default ReceiptCard;
