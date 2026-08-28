import React from "react";

/* ──────────────────────────────────────────────────────────────
   BiteWise Food Icon System
   Hand-drawn-style line glyphs, single colour (currentColor),
   consistent 32×32 grid + 1.6 stroke. No photography, no emoji —
   every icon reads as a simple, warm signage mark.
   ────────────────────────────────────────────────────────────── */

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* Small reusable steam wisp, used across hot-food icons */
const Steam = ({ x }) => (
  <path
    {...common}
    strokeWidth={1.3}
    opacity="0.65"
    d={`M${x} 6c-1.4 1-1.4 2 0 3s1.4 2 0 3`}
  />
);

const GLYPHS = {
  /* ── Indian meals & breakfast ── */
  idly: (
    <g {...common}>
      <ellipse cx="16" cy="23" rx="10" ry="2.6" />
      <path d="M7 21c0-3 2.5-5.4 4.6-6.6a2.6 2.6 0 0 1 2.4-.2c1 .4 2 .4 3 0a2.6 2.6 0 0 1 2.4.2C21.5 15.6 24 18 24 21" />
      <ellipse cx="16" cy="21" rx="9" ry="2.2" />
    </g>
  ),
  dosa: (
    <g {...common}>
      <path d="M5 20c0-6 5-11 11-11 3.8 0 6 2 6 4.6 0 3.6-4 4-8.4 5.6C9 20.7 6 22 5 20Z" />
      <path strokeWidth="1.2" opacity="0.6" d="M9 17.5c2.6-3.6 6.4-6 10-6.6" />
    </g>
  ),
  vada: (
    <g {...common}>
      <circle cx="16" cy="16" r="8.4" />
      <circle cx="16" cy="16" r="2.6" />
      <path strokeWidth="1.2" opacity="0.55" d="M9 12.5c1.5-.6 3-.9 4.5-1M22.5 19.2c-1.4.7-2.9 1.1-4.4 1.3" />
    </g>
  ),
  biryani: (
    <g {...common}>
      <path d="M6.5 21c0-4.5 4.2-7.6 9.5-7.6s9.5 3.1 9.5 7.6" />
      <ellipse cx="16" cy="21" rx="9.5" ry="2.6" />
      <path strokeWidth="1.2" d="M12 15.5l.6 2M16 14.6l.5 2.2M20 15.5l-.6 2" opacity="0.6" />
      <Steam x="12" />
      <Steam x="19.5" />
    </g>
  ),
  meals: (
    <g {...common}>
      <circle cx="16" cy="16" r="9.4" />
      <circle cx="16" cy="16" r="4" />
      <path d="M16 6.6v2.4M25.4 16H23M16 25.4v-2.4M6.6 16H9" strokeWidth="1.3" opacity="0.6" />
    </g>
  ),
  parotta: (
    <g {...common}>
      <ellipse cx="16" cy="18" rx="9" ry="4" />
      <path strokeWidth="1.2" opacity="0.7" d="M8.5 16.4c2-1.6 4.7-2.4 7.5-2.4s5.5.8 7.5 2.4M9.6 19.8c1.9 1 4.1 1.6 6.4 1.6s4.5-.6 6.4-1.6" />
    </g>
  ),
  panipuri: (
    <g {...common}>
      <circle cx="12" cy="14" r="4.2" />
      <circle cx="20" cy="12.5" r="3.4" />
      <circle cx="17" cy="19.5" r="3.6" />
      <path strokeWidth="1.2" opacity="0.5" d="M10.4 12.6l1.2 1.2M18.8 11.2l1 1M15.6 18l1.2 1.2" />
    </g>
  ),
  samosa: (
    <g {...common}>
      <path d="M16 6 26 22H6Z" strokeLinejoin="round" />
      <path strokeWidth="1.2" opacity="0.6" d="M16 11 22 20M16 11l-6 9" />
    </g>
  ),
  pavbhaji: (
    <g {...common}>
      <path d="M7 19.5a2.6 2.6 0 0 1 2.6-2.6h12.8a2.6 2.6 0 0 1 2.6 2.6v.6a2.8 2.8 0 0 1-2.8 2.8H9.8A2.8 2.8 0 0 1 7 20.1Z" />
      <path d="M8.5 17c0-3.4 3.4-6 7.5-6s7.5 2.6 7.5 6" />
      <circle cx="16" cy="14.2" r="1.3" fill="currentColor" stroke="none" />
    </g>
  ),
  chaat: (
    <g {...common}>
      <path d="M8 15c0-3.6 3.6-6.4 8-6.4s8 2.8 8 6.4" />
      <ellipse cx="16" cy="15" rx="8" ry="2.4" />
      <path d="M9 16.4 10.6 23M23 16.4 21.4 23M16 17v6" strokeWidth="1.3" opacity="0.6" />
    </g>
  ),
  vadapav: (
    <g {...common}>
      <path d="M6.5 14.6c0-2.8 2.2-4.4 4.6-4.4h9.8c2.4 0 4.6 1.6 4.6 4.4 0 1-.6 1.7-1.5 1.9-2 3.4-3.3 3.4-5.3 0h-5.4c-2 3.4-3.3 3.4-5.3 0-.9-.2-1.5-.9-1.5-1.9Z" />
      <circle cx="16" cy="15.4" r="2.4" />
    </g>
  ),
  bajji: (
    <g {...common}>
      <ellipse cx="12" cy="13" rx="3.6" ry="4.6" transform="rotate(-18 12 13)" />
      <ellipse cx="20" cy="14.5" rx="3.2" ry="4.2" transform="rotate(14 20 14.5)" />
      <ellipse cx="15.5" cy="21" rx="4" ry="3" transform="rotate(-6 15.5 21)" />
    </g>
  ),
  friedrice: (
    <g {...common}>
      <path d="M6 21.5c0-5 4.5-9 10-9s10 4 10 9" />
      <ellipse cx="16" cy="21.5" rx="10" ry="2.2" />
      <circle cx="12" cy="17.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="17" cy="15.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="20.5" cy="18.5" r=".9" fill="currentColor" stroke="none" />
      <Steam x="16" />
    </g>
  ),
  noodles: (
    <g {...common}>
      <path d="M6.5 19c0-4.4 4.3-8 9.5-8s9.5 3.6 9.5 8" />
      <ellipse cx="16" cy="19" rx="9.5" ry="2.4" />
      <path strokeWidth="1.2" opacity="0.65" d="M11 18c1-2 1-4-.4-6M16 17.4c.8-2.4.4-4.6-1-6.6M21 18c-1-2.2-.8-4.4.6-6.4" />
    </g>
  ),
  momos: (
    <g {...common}>
      <path d="M16 9c4 0 7 3.4 7 7.6 0 4.4-3.3 6.4-7 6.4s-7-2-7-6.4C9 12.4 12 9 16 9Z" />
      <path strokeWidth="1.3" d="M16 9v1.4M12.4 10.4l.8 1.1M19.6 10.4l-.8 1.1" opacity="0.7" />
      <circle cx="16" cy="9" r="1" fill="currentColor" stroke="none" />
    </g>
  ),

  /* ── Fast food & mains ── */
  burger: (
    <g {...common}>
      <path d="M6.5 14.2C6.5 10.8 10.7 8 16 8s9.5 2.8 9.5 6.2Z" />
      <path d="M6 15.6h20M6.6 18.4h18.8M7 21.2h18a2 2 0 0 1 2 2v.2a1.4 1.4 0 0 1-1.4 1.4H6.4A1.4 1.4 0 0 1 5 23.4v-.2a2 2 0 0 1 2-2Z" />
      <path strokeWidth="1.3" opacity="0.6" d="M10 12.3q1.2-1 2.4 0M15 11.8q1.2-1 2.4 0M20 12.3q1.2-1 2.4 0" />
    </g>
  ),
  pizza: (
    <g {...common}>
      <path d="M16 6 27 24H5Z" strokeLinejoin="round" />
      <path d="M9.4 19.2 16 8l6.6 11.2" strokeWidth="1.2" opacity="0.5" />
      <circle cx="16" cy="15.4" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="13.4" cy="19.4" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18.6" cy="19.4" r="1.1" fill="currentColor" stroke="none" />
    </g>
  ),
  sandwich: (
    <g {...common}>
      <path d="M5.5 23 16 8l10.5 15Z" strokeLinejoin="round" />
      <path d="M9 19h14M10.6 16.6h10.8" strokeWidth="1.3" opacity="0.6" />
    </g>
  ),
  fries: (
    <g {...common}>
      <path d="M9 14 8 24h16l-1-10Z" />
      <path d="M10.5 14V8.6M14 14V7.4M18 14V7.4M21.5 14V8.6" />
    </g>
  ),
  pasta: (
    <g {...common}>
      <path d="M6.5 20c0-4.6 4.2-8.4 9.5-8.4s9.5 3.8 9.5 8.4" />
      <ellipse cx="16" cy="20" rx="9.5" ry="2.4" />
      <path strokeWidth="1.2" opacity="0.6" d="M10.5 19c1.6-2 1.6-4.2.4-6.4M16 18.4c.6-2.6-.2-4.8-1.8-6.6M21.5 19c-1.6-2-1.6-4.2-.4-6.4" />
      <circle cx="13" cy="16.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="19" cy="16.5" r=".9" fill="currentColor" stroke="none" />
    </g>
  ),

  /* ── Drinks ── */
  tea: (
    <g {...common}>
      <path d="M8 13h13.5l-1.3 9.4a2 2 0 0 1-2 1.7H11.3a2 2 0 0 1-2-1.7Z" />
      <path d="M21.3 14.4h1.9a2.6 2.6 0 0 1 0 5.2h-2.6" />
      <Steam x="12.5" />
      <Steam x="16.5" />
    </g>
  ),
  coffee: (
    <g {...common}>
      <path d="M8 13h11l-.9 8.4a2.2 2.2 0 0 1-2.2 2H11.1a2.2 2.2 0 0 1-2.2-2Z" />
      <path d="M19 14.4h1.7a2.4 2.4 0 0 1 0 4.8H19.4" />
      <Steam x="11.5" />
      <Steam x="15.5" />
    </g>
  ),
  juice: (
    <g {...common}>
      <path d="M10.5 9h11l-1.6 14.4a2 2 0 0 1-2 1.8h-3.8a2 2 0 0 1-2-1.8Z" />
      <path d="M10.5 9 9 6.4M21.5 9 23 6.4" strokeWidth="1.3" opacity="0.6" />
      <path d="M11.2 13.8h9.6" strokeWidth="1.2" opacity="0.5" />
    </g>
  ),
  milkshake: (
    <g {...common}>
      <path d="M11 11h10l-1.4 12.6a2 2 0 0 1-2 1.8h-3.2a2 2 0 0 1-2-1.8Z" />
      <path d="M13 11 12 6.5h8L19 11" />
      <path d="M17.5 6.5V4M17.5 4l1.6.9M17.5 4l-1.6.9" strokeWidth="1.2" />
      <path d="M11.5 15.6h9" strokeWidth="1.2" opacity="0.5" />
    </g>
  ),
  mocktail: (
    <g {...common}>
      <path d="M7.5 9h17L18 18.4v5h3.4M18 18.4 9.5 9" />
      <path d="M14.6 23.4h6.8" />
      <path d="M22 12.5c1.6.4 2.6-.5 2.4-1.8" strokeWidth="1.2" opacity="0.6" />
    </g>
  ),

  /* ── Desserts ── */
  icecream: (
    <g {...common}>
      <path d="M11 14a5 5 0 0 1 10 0c0 .3 0 .6-.1.9l-4 11.6a1 1 0 0 1-1.8 0l-4-11.6c-.1-.3-.1-.6-.1-.9Z" />
      <path strokeWidth="1.2" opacity="0.6" d="M11.3 15.4h9.4" />
    </g>
  ),
  cake: (
    <g {...common}>
      <path d="M7 17.5h18v5.4a1.6 1.6 0 0 1-1.6 1.6H8.6A1.6 1.6 0 0 1 7 22.9Z" />
      <path d="M7 17.5c0-2.4 1.7-3.6 3-4.4a2.4 2.4 0 0 0 1-2.9c-.3-.8 0-1.5.6-2M25 17.5c0-2.4-1.7-3.6-3-4.4a2.4 2.4 0 0 1-1-2.9c.3-.8 0-1.5-.6-2" />
      <path d="M11.5 17.5v6.8M16 17.5v6.8M20.5 17.5v6.8" strokeWidth="1.2" opacity="0.55" />
      <path d="M16 6.4v2" strokeWidth="1.3" />
      <path strokeWidth="1.2" opacity="0.7" d="M16 5c-.9.7-.9 1.3 0 2" />
    </g>
  ),
  desserts: (
    <g {...common}>
      <path d="M9 20c0-4 3.1-7 7-7s7 3 7 7" />
      <ellipse cx="16" cy="20" rx="7" ry="2" />
      <circle cx="16" cy="10.6" r="2.2" />
      <circle cx="11.5" cy="12.4" r="1.4" />
      <circle cx="20.5" cy="12.4" r="1.4" />
    </g>
  ),

  /* ── Fallback ── */
  default: (
    <g {...common}>
      <circle cx="16" cy="16" r="9.6" />
      <path d="M12.4 10.4v5.2a1.6 1.6 0 0 0 3.2 0v-5.2M14 10.4v11.2" />
      <path d="M20 10.4c-1.4 0-2.2 1.4-2.2 3.4s.8 3 2.2 3v5.8" />
    </g>
  ),
};

/* Aliases so legacy / free-text keys still resolve sensibly */
const ALIASES = {
  idli: "idly",
  dosai: "dosa",
  uttapam: "dosa",
  roti: "parotta",
  naan: "parotta",
  poori: "parotta",
  bhatura: "parotta",
  thali: "meals",
  curd_rice: "meals",
  pongal: "meals",
  sambar: "meals",
  golgappa: "panipuri",
  bhelpuri: "chaat",
  pakora: "bajji",
  bonda: "bajji",
  kathiroll: "parotta",
  frankie: "parotta",
  chicken: "biryani",
  kebab: "biryani",
  hotdog: "sandwich",
  taco: "sandwich",
  softdrink: "mocktail",
  mojito: "mocktail",
  lassi: "milkshake",
  shake: "milkshake",
  sweets: "desserts",
  donut: "desserts",
  snack: "bajji",
};

export function resolveIconKey(key) {
  if (!key) return "default";
  const k = String(key).toLowerCase().trim();
  if (GLYPHS[k]) return k;
  if (ALIASES[k]) return ALIASES[k];
  return "default";
}

function FoodIcon({ name, size = 22, className = "", title }) {
  const key = resolveIconKey(name);
  const glyph = GLYPHS[key] || GLYPHS.default;
  return (
    <svg
      className={`food-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {glyph}
    </svg>
  );
}

export const FOOD_ICON_KEYS = Object.keys(GLYPHS);

export default FoodIcon;
