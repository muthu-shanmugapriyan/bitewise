import React from "react";

function BrandLogo({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <svg className="brand-mark" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <path
          d="M17 3c1 4.5 2.3 7 4.7 9.4 2.4 2.4 4.9 3.7 9.3 4.6-4.4.9-6.9 2.2-9.3 4.6C19.3 24 18 26.5 17 31c-1-4.5-2.3-7-4.7-9.4C9.9 19.2 7.4 17.9 3 17c4.4-.9 6.9-2.2 9.3-4.6C14.7 10 16 7.5 17 3Z"
          fill="url(#bw-flame)"
        />
        <defs>
          <linearGradient id="bw-flame" x1="3" y1="3" x2="31" y2="31" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--turmeric)" />
            <stop offset="1" stopColor="var(--chili)" />
          </linearGradient>
        </defs>
      </svg>
      {!compact && (
        <div>
          <div className="brand-name">BiteWise</div>
          <div className="brand-tagline">Your business, made simple.</div>
        </div>
      )}
    </div>
  );
}

export default BrandLogo;
