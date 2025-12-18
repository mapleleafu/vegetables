export const LANGUAGE_CODES = ["TR"] as const;
export const DEFAULT_LANGUAGE_CODE = "TR";

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  TR: "Turkish",
};

export const LANGUAGE_HELLOS: Record<LanguageCode, string> = {
  TR: "Merhaba",
};

export const LANGUAGE_WELCOME: Record<LanguageCode, string> = {
  TR: "Hoş geldiniz",
};
