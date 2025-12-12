export const GAME_CONFIG = {
  // Economy
  DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY: 5,
  DEFAULT_MAX_COINS_PER_WORD: 10,
  DEFAULT_CATEGORY_COST: 64,

  // Rewards
  POINTS_PER_CORRECT_WORD: 1,
  POINTS_PER_MAXED_WORD: 1, // Points given when word is already maxed
} as const;

export const PUBLIC_ROUTES = ["/login", "/register"];
export const IS_TUTORIAL_ON = false;
