import { GAME_CONFIG } from "@/lib/constants";
import { WordProgress, Word } from "@prisma/client";

export type RewardType = "coin" | "point" | "none";
export type Status = "correct" | "wrong" | "idle" | "unauthorized";
export type PointReason = "globalMax" | "categoryMax" | "adminAdjust";

const DEFAULT_MAX_COINS_PER_WORD = GAME_CONFIG.DEFAULT_MAX_COINS_PER_WORD;
const DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY =
  GAME_CONFIG.DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY;

export function checkWordReward(wordProgress: WordProgress, word: Word) {
  const globalWordCap = word.maxCoinsPerUser || DEFAULT_MAX_COINS_PER_WORD;
  const categoryModeCap = DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY;

  const isGlobalMaxed = wordProgress?.coinsEarned >= globalWordCap;
  const isCategoryModeMaxed = wordProgress?.coinsEarned >= categoryModeCap;

  let rewardType: RewardType = "none";
  let message = "";
  let pointReason: PointReason | null = null;

  if (isGlobalMaxed) {
    rewardType = "point";
    message = "Word maxed out! +1 Point";
    pointReason = "globalMax";
  } else if (isCategoryModeMaxed) {
    rewardType = "point";
    message = "Category coin limit reached for this word! +1 Point";
    pointReason = "categoryMax";
  } else {
    rewardType = "coin";
  }

  return { rewardType, message, pointReason };
}
