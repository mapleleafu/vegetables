export const LANGUAGE_CODES = ["TR"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  TR: "Turkish",
};
