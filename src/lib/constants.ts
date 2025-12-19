export const GAME_CONFIG = {
  // Economy
  DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY: 5,
  DEFAULT_MAX_COINS_PER_WORD: 10,
  DEFAULT_CATEGORY_COST: 64,

  // Rewards
  POINTS_PER_CORRECT_WORD: 1,
  POINTS_PER_GLOBAL_MAX_WORD: 1, // Points given when word is globally maxed
  POINTS_PER_MAXED_WORD: 1, // Points given when word is already maxed
} as const;

export const IS_TUTORIAL_ON = true;
export const PUBLIC_ROUTES = ["/login", "/register"];

export const BACKGROUND_IMAGE_URL = "/static/beetroot.png"; // Default background
export const BACKGROUND_GRADIENT = "from-[#DBE7C1] to-[#A9B792]"; // Default gradient
export const GRADIENT_PRESETS = [
  { name: "Sage (Default)", value: BACKGROUND_GRADIENT },
  { name: "Soft Sky", value: "from-sky-100 to-blue-200" },
  { name: "Warm Peach", value: "from-orange-100 to-rose-200" },
  { name: "Lavender", value: "from-purple-100 to-indigo-200" },
  { name: "Minty Fresh", value: "from-emerald-100 to-teal-200" },
  { name: "Lemonade", value: "from-yellow-100 to-amber-200" },
  { name: "Cool Gray", value: "from-slate-200 to-slate-400" },
  { name: "Midnight", value: "from-indigo-900 to-slate-900" },
  { name: "Forest", value: "from-green-800 to-emerald-950" },
];
export const SOLID_PRESETS = [
  { name: "White", value: "#ffffff" },
  { name: "Light Gray", value: "#f3f4f6" },
  { name: "Cream", value: "#fffdd0" },
  { name: "Mint", value: "#ccffcc" },
  { name: "Sky", value: "#e0f2fe" },
  { name: "Rose", value: "#ffe4e6" },
  { name: "Slate", value: "#cbd5e1" },
  { name: "Black", value: "#1a1a1a" },
];
