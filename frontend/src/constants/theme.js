/* JS mirror of styles/theme.css — used where raw colour strings are
   required (recharts renders to SVG attributes, not CSS custom props). */
export const THEME = {
  ink950: "#150F0B",
  ink900: "#1C140D",
  ink800: "#241A12",
  ink700: "#2D2118",
  ink600: "#3A2A1E",

  paper: "#F7EEDD",
  paperDim: "#C7B49A",
  paperFaint: "#8C7A66",
  paperCard: "#FBF3E4",
  paperCardInk: "#241A12",

  chili: "#E85D2C",
  chiliStrong: "#FF7640",
  chiliDark: "#B8431A",

  turmeric: "#F2B93D",
  turmericDark: "#C6921F",

  curry: "#8FAE52",
  curryDark: "#6C8B37",

  brick: "#C05A42",
  brickDark: "#9A4230",

  teal: "#4A9490",
};

/* Rotating palette for multi-series charts (expense donut, category bars) */
export const CHART_PALETTE = [
  THEME.turmeric,
  THEME.chili,
  THEME.teal,
  THEME.curry,
  THEME.brick,
  "#B98BD1",
  THEME.paperDim,
];
