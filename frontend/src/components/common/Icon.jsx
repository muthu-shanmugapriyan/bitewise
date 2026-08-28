import React from "react";

const props = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const PATHS = {
  home: (
    <>
      <path {...props} d="M4 11.5 12 5l8 6.5" />
      <path {...props} d="M6.5 10v8.5A1.5 1.5 0 0 0 8 20h8a1.5 1.5 0 0 0 1.5-1.5V10" />
      <path {...props} d="M10 20v-5h4v5" />
    </>
  ),
  update: (
    <>
      <path {...props} d="M6 12a6 6 0 0 1 10.2-4.3M18 12a6 6 0 0 1-10.2 4.3" />
      <path {...props} d="M16.5 4.5 16.2 7.7 13 7.4M7.5 19.5l.3-3.2 3.2.3" />
    </>
  ),
  products: (
    <>
      <path {...props} d="M4.5 8 12 4l7.5 4-7.5 4-7.5-4Z" />
      <path {...props} d="M4.5 12 12 16l7.5-4M4.5 16 12 20l7.5-4" />
    </>
  ),
  expenses: (
    <>
      <path {...props} d="M6 4.5h9l3 3V19a.5.5 0 0 1-.5.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5Z" />
      <path {...props} d="M8 9.5h8M8 13h8M8 16.5h5" />
    </>
  ),
  analytics: (
    <>
      <path {...props} d="M4.5 19.5h15" />
      <rect {...props} x="6.5" y="13" width="2.8" height="6.2" rx="0.6" />
      <rect {...props} x="10.6" y="8.5" width="2.8" height="10.7" rx="0.6" />
      <rect {...props} x="14.7" y="11" width="2.8" height="8.2" rx="0.6" />
    </>
  ),
  settings: (
    <>
      <circle {...props} cx="12" cy="12" r="2.9" />
      <path
        {...props}
        d="M12 4.5v1.7M12 17.8v1.7M19.5 12h-1.7M6.2 12H4.5M17.1 6.9l-1.2 1.2M8.1 15.9l-1.2 1.2M17.1 17.1l-1.2-1.2M8.1 8.1 6.9 6.9"
      />
    </>
  ),
  arrow: <path {...props} d="M5 12h13.5M13 6.5l6 5.5-6 5.5" />,
  up: <path {...props} d="M6 15.5 12 9l6 6.5M12 9.5v9" />,
  down: <path {...props} d="M6 8.5 12 15l6-6.5M12 14.5v-9" />,
  close: <path {...props} d="M6 6l12 12M18 6 6 18" />,
  check: <path {...props} d="M5 12.5 9.5 17 19 7" />,
  plus: <path {...props} d="M12 5v14M5 12h14" />,
  minus: <path {...props} d="M5 12h14" />,
  edit: (
    <>
      <path {...props} d="M14.5 5.5 18.5 9.5 8 20H4v-4Z" />
      <path {...props} d="M12.5 7.5l4 4" />
    </>
  ),
  trash: (
    <>
      <path {...props} d="M5.5 7.5h13M9.5 7.5V5.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7.5" />
      <path {...props} d="M7 7.5 7.8 19a1.5 1.5 0 0 0 1.5 1.4h5.4A1.5 1.5 0 0 0 16.2 19l.8-11.5" />
      <path {...props} d="M10.3 11v6M13.7 11v6" />
    </>
  ),
  alert: (
    <>
      <path {...props} d="M12 4.5 21 19.5H3Z" />
      <path {...props} d="M12 10v4.2" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  sparkle: (
    <>
      <path {...props} d="M12 4.5c.4 2.7 1 4.3 2.3 5.7 1.3 1.3 3 2 5.7 2.3-2.7.4-4.4 1-5.7 2.3-1.3 1.4-1.9 3-2.3 5.7-.4-2.7-1-4.3-2.3-5.7-1.3-1.3-3-1.9-5.7-2.3 2.7-.3 4.4-1 5.7-2.3 1.3-1.4 1.9-3 2.3-5.7Z" />
    </>
  ),
  calendar: (
    <>
      <rect {...props} x="4.5" y="6" width="15" height="13.5" rx="1.8" />
      <path {...props} d="M4.5 10h15M8.3 4v3.3M15.7 4v3.3" />
    </>
  ),
  lock: (
    <>
      <rect {...props} x="6" y="11" width="12" height="8.5" rx="1.6" />
      <path {...props} d="M8.3 11V8a3.7 3.7 0 0 1 7.4 0v3" />
    </>
  ),
  unlock: (
    <>
      <rect {...props} x="6" y="11" width="12" height="8.5" rx="1.6" />
      <path {...props} d="M8.3 11V8a3.7 3.7 0 0 1 7.1-1.4" />
    </>
  ),
  logout: (
    <>
      <path {...props} d="M10 20H6.5A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4H10" />
      <path {...props} d="M15 8.5 19 12l-4 3.5M19 12H9.5" />
    </>
  ),
  bolt: <path {...props} d="M12.5 3 6 13.5h5L11 21l6.5-10.5h-5Z" />,
  bell: (
    <>
      <path {...props} d="M7 17c0-1.4.7-2 1.2-3 .6-1.2.8-2.8.8-4.3A3 3 0 0 1 12 6.7a3 3 0 0 1 3 3c0 1.5.2 3.1.8 4.3.5 1 1.2 1.6 1.2 3Z" />
      <path {...props} d="M10.3 19.5a1.9 1.9 0 0 0 3.4 0" />
    </>
  ),
  chevronDown: <path {...props} d="M6 9.5 12 15l6-5.5" />,
  grid: (
    <>
      <rect {...props} x="4.5" y="4.5" width="6.5" height="6.5" rx="1.3" />
      <rect {...props} x="13" y="4.5" width="6.5" height="6.5" rx="1.3" />
      <rect {...props} x="4.5" y="13" width="6.5" height="6.5" rx="1.3" />
      <rect {...props} x="13" y="13" width="6.5" height="6.5" rx="1.3" />
    </>
  ),
  search: (
    <>
      <circle {...props} cx="11" cy="11" r="6" />
      <path {...props} d="m19.5 19.5-4-4" />
    </>
  ),
  box: (
    <>
      <path {...props} d="M4.5 8 12 4l7.5 4v8L12 20l-7.5-4Z" />
      <path {...props} d="M4.5 8 12 12l7.5-4M12 12v8" />
    </>
  ),
  history: (
    <>
      <path {...props} d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4" />
      <path {...props} d="M3.5 4.5V8h3.5" />
      <path {...props} d="M12 8v4.3l3 2" />
    </>
  ),
  mail: (
    <>
      <rect {...props} x="4" y="6" width="16" height="12" rx="1.6" />
      <path {...props} d="m5 7 7 6 7-6" />
    </>
  ),
};

function Icon({ type, size = 20, className = "" }) {
  const glyph = PATHS[type];
  if (!glyph) return <span className={`icon-dot ${className}`} />;
  return (
    <svg
      className={`icon icon-${type} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}

export default Icon;
