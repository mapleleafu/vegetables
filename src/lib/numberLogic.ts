import { DEFAULT_LANGUAGE_CODE } from "@/types/language";

export interface NumberSpeechStrategy {
  getAudioKeys(num: number): string[];
}

const turkishStrategy: NumberSpeechStrategy = {
  getAudioKeys(num: number): string[] {
    if (num === 0) return ["0"];

    const parts: string[] = [];

    if (num >= 1000000000000) {
      const trillions = Math.floor(num / 1000000000000);
      const remainder = num % 1000000000000;
      if (trillions === 1) {
        parts.push("1", "1000000000000");
      } else {
        parts.push(...turkishStrategy.getAudioKeys(trillions), "1000000000000");
      }
      if (remainder > 0) parts.push(...turkishStrategy.getAudioKeys(remainder));
      return parts;
    }

    if (num >= 1000000000) {
      const billions = Math.floor(num / 1000000000);
      const remainder = num % 1000000000;
      if (billions === 1) {
        parts.push("1", "1000000000");
      } else {
        parts.push(...turkishStrategy.getAudioKeys(billions), "1000000000");
      }
      if (remainder > 0) parts.push(...turkishStrategy.getAudioKeys(remainder));
      return parts;
    }

    if (num >= 1000000) {
      const millions = Math.floor(num / 1000000);
      const remainder = num % 1000000;
      if (millions === 1) {
        parts.push("1", "1000000");
      } else {
        parts.push(...turkishStrategy.getAudioKeys(millions), "1000000");
      }
      if (remainder > 0) parts.push(...turkishStrategy.getAudioKeys(remainder));
      return parts;
    }

    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;

      // Rule: 1000 is just "bin" (1000), not "bir bin" (1, 1000)
      if (thousands === 1) {
        parts.push("1000");
      } else {
        parts.push(...turkishStrategy.getAudioKeys(thousands), "1000");
      }

      if (remainder > 0) parts.push(...turkishStrategy.getAudioKeys(remainder));
      return parts;
    }

    if (num >= 100) {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;

      // Rule: 100 is just "yuz" (100)
      if (hundreds === 1) {
        parts.push("100");
      } else {
        parts.push(...turkishStrategy.getAudioKeys(hundreds), "100");
      }

      if (remainder > 0) parts.push(...turkishStrategy.getAudioKeys(remainder));
      return parts;
    }

    if (num >= 10) {
      const ten = Math.floor(num / 10) * 10; // e.g., 34 -> 30
      const one = num % 10;
      parts.push(ten.toString());
      if (one > 0) parts.push(one.toString());
      return parts;
    }

    if (num > 0) {
      parts.push(num.toString());
    }

    return parts;
  },
};

export function getNumberAudioKeys(
  num: number,
  languageCode: string,
): string[] {
  const code = languageCode?.toUpperCase() || DEFAULT_LANGUAGE_CODE;
  switch (code) {
    case "TR":
      return turkishStrategy.getAudioKeys(num);
    default:
      console.warn(
        `No number strategy for language: ${code}, defaulting to TR`,
      );
      return turkishStrategy.getAudioKeys(num);
  }
}

export function getAllRequiredAudioKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i <= 9; i++) keys.push(i.toString());
  for (let i = 10; i <= 90; i += 10) keys.push(i.toString());
  keys.push("100", "1000", "1000000", "1000000000", "1000000000000");
  return keys;
}
