/* ──────────────────────────────────────────────────────────
   BiteWise Food Icon Catalogue
   Maps every catalogue entry to a key rendered by <FoodIcon />.
   Organised the way an Indian food-stall menu board would be —
   by station, not by cuisine taxonomy.
   ────────────────────────────────────────────────────────── */

export const ICON_CATEGORIES = [
  {
    name: "Indian Meals & Tiffin",
    items: [
      { key: "idly", label: "Idly" },
      { key: "dosa", label: "Dosa" },
      { key: "vada", label: "Vada" },
      { key: "biryani", label: "Biryani" },
      { key: "meals", label: "Meals / Thali" },
      { key: "parotta", label: "Parotta / Roti" },
    ],
  },
  {
    name: "Street Food & Snacks",
    items: [
      { key: "panipuri", label: "Pani Puri" },
      { key: "samosa", label: "Samosa" },
      { key: "pavbhaji", label: "Pav Bhaji" },
      { key: "chaat", label: "Chaat" },
      { key: "vadapav", label: "Vada Pav" },
      { key: "bajji", label: "Bajji / Pakora" },
      { key: "momos", label: "Momos" },
    ],
  },
  {
    name: "Fast Food & Mains",
    items: [
      { key: "friedrice", label: "Fried Rice" },
      { key: "noodles", label: "Noodles" },
      { key: "burger", label: "Burger" },
      { key: "pizza", label: "Pizza" },
      { key: "sandwich", label: "Sandwich" },
      { key: "fries", label: "Fries" },
      { key: "pasta", label: "Pasta" },
    ],
  },
  {
    name: "Drinks & Beverages",
    items: [
      { key: "tea", label: "Tea" },
      { key: "coffee", label: "Coffee" },
      { key: "juice", label: "Juice" },
      { key: "milkshake", label: "Milkshake" },
      { key: "mocktail", label: "Mocktail" },
    ],
  },
  {
    name: "Desserts & Sweets",
    items: [
      { key: "icecream", label: "Ice Cream" },
      { key: "cake", label: "Cake" },
      { key: "desserts", label: "Desserts / Sweets" },
    ],
  },
  {
    name: "General",
    items: [{ key: "default", label: "Neutral / Other Item" }],
  },
];

export const ICON_OPTIONS = ICON_CATEGORIES.flatMap((cat) => cat.items);

export const DEFAULT_FOOD_ICON = { key: "default", label: "Neutral / Other Item" };

const NAME_HINTS = [
  [/idl?y|idli/, "idly"],
  [/dosa|dosai|uttapam|pesarattu/, "dosa"],
  [/vada\s*pav|vadapav/, "vadapav"],
  [/vada|medu/, "vada"],
  [/biryani|pulao|kebab|chicken/, "biryani"],
  [/thali|meal|sambar|pongal|curd rice|lemon rice/, "meals"],
  [/parotta|paratha|roti|naan|poori|bhatura|chapati/, "parotta"],
  [/pani\s*puri|golgappa|gol gappa/, "panipuri"],
  [/samosa/, "samosa"],
  [/pav\s*bhaji/, "pavbhaji"],
  [/chaat|bhel/, "chaat"],
  [/bajji|pakora|bonda|fritter/, "bajji"],
  [/momo/, "momos"],
  [/fried rice/, "friedrice"],
  [/noodle|chowmein|hakka/, "noodles"],
  [/burger/, "burger"],
  [/pizza/, "pizza"],
  [/sandwich|toast|hot dog|hotdog|taco|wrap|roll|frankie/, "sandwich"],
  [/fries|fry\b|finger chips/, "fries"],
  [/pasta|macaroni/, "pasta"],
  [/\btea\b|chai/, "tea"],
  [/coffee|latte|cappuccino|espresso/, "coffee"],
  [/juice/, "juice"],
  [/shake|lassi|smoothie/, "milkshake"],
  [/mocktail|mojito|soda|soft drink|cooler/, "mocktail"],
  [/ice\s*cream|kulfi|sundae/, "icecream"],
  [/cake|pastry|cupcake/, "cake"],
  [/sweet|dessert|gulab|jamun|halwa|barfi|donut|doughnut/, "desserts"],
];

/**
 * Resolves a product's icon to a catalogue key, preferring an explicit
 * iconKey, then falling back to matching the product name against
 * common menu-board vocabulary, then a neutral default.
 */
export function getProductIconKey(iconKey, name = "") {
  if (iconKey && ICON_OPTIONS.some((o) => o.key === iconKey)) return iconKey;

  const n = (name || "").toLowerCase();
  for (const [pattern, key] of NAME_HINTS) {
    if (pattern.test(n)) return key;
  }
  return "default";
}

/* Vivid per-item tile colours — the icon system's "menu board" pop.
   Keyed by icon (not category) so the same dish always reads the
   same colour everywhere it appears in the app. */
const TILE_COLOR_MAP = {
  idly: "amber",
  dosa: "amber",
  vada: "chili",
  biryani: "chili",
  meals: "curry",
  parotta: "amber",
  panipuri: "teal",
  samosa: "chili",
  pavbhaji: "curry",
  chaat: "chili",
  vadapav: "amber",
  bajji: "chili",
  momos: "curry",
  friedrice: "curry",
  noodles: "curry",
  burger: "amber",
  pizza: "chili",
  sandwich: "amber",
  fries: "amber",
  pasta: "curry",
  tea: "chili",
  coffee: "amber",
  juice: "teal",
  milkshake: "plum",
  mocktail: "teal",
  icecream: "plum",
  cake: "plum",
  desserts: "plum",
  default: "neutral",
};

export function getIconTileClass(key) {
  const resolved = ICON_OPTIONS.some((o) => o.key === key) ? key : "default";
  return `icon-tile-${TILE_COLOR_MAP[resolved] || "neutral"}`;
}
