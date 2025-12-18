"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { WordCard } from "@/components/WordCard";
import { Button } from "@/components/ui/button";
import {
  submitAnswer,
  startTestSession,
} from "@/app/actions/game";
import { checkWordReward, Status } from "@/lib/gameUtilts";
import { toast } from "sonner";
import { Coins } from "@/components/ui/coins";
import { AnimatePresence } from "framer-motion";
import FlyingReward from "@/components/FlyingReward";
import { CategoryComplete } from "@/components/CategoryComplete";
import Screws from "@/components/ui/screws";
import Shadow from "@/components/ui/shadow";
import { flyingDuration } from "@/components/FlyingReward";

interface CategoryGameProps {
  words: any[];
  initialWordsProgress: any[];
  questionOrder: number[];
  userTargetLanguage: string;
  categoryName: string;
  categoryId: string;
  initialUserCoins: number;
}

export function CategoryGame({
  words,
  initialWordsProgress,
  questionOrder,
  userTargetLanguage,
  categoryName,
  categoryId,
  initialUserCoins,
}: CategoryGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [coins, setCoins] = useState(initialUserCoins);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [wordProgress, setWordProgress] = useState(initialWordsProgress);

  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [isGameComplete, setIsGameComplete] = useState(false);

  const coinRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [flyAnimation, setFlyAnimation] = useState<{
    start: {
      x: number;
      y: number;
      width: number;
      height: number;
      img: string | null;
    };
    end: { x: number; y: number };
  } | null>(null);
  const [triggerCoinBump, setTriggerCoinBump] = useState(false);

  const currentWordIndex = questionOrder[currentIndex];
  const currentWord = words[currentWordIndex];
  const progress = (currentIndex / words.length) * 100;

  const triggerFlyAnimation = (wordId: string, image: string | null) => {
    const wordEl = wordRefs.current[wordId];
    const coinEl = coinRef.current;

    if (wordEl && coinEl) {
      const startRect = wordEl.getBoundingClientRect();
      const endRect = coinEl.getBoundingClientRect();

      setFlyAnimation({
        start: {
          x: startRect.left,
          y: startRect.top,
          width: startRect.width,
          height: startRect.height,
          img: image,
        },
        end: {
          x: endRect.left + endRect.width / 2 - 20,
          y: endRect.top + endRect.height / 2 - 20,
        },
      });

      setTimeout(() => {
        setFlyAnimation(null);
        setTriggerCoinBump(true);
        setTimeout(() => setTriggerCoinBump(false), 300);
      }, flyingDuration * 1000);
    }
  };

  const handleSelect = useCallback(
    (word: any, playAudio: boolean) => {
      if (status !== "idle" || isSubmitting) return;
      setSelectedWordId(word.id);

      const audioUrl = word.translations.find(
        (t: any) => t.languageCode === userTargetLanguage,
      )?.audioUrl;
      if (audioUrl && playAudio) new Audio(audioUrl).play().catch(() => {});
    },
    [status, isSubmitting, userTargetLanguage],
  );

  const handleConfirm = useCallback(async () => {
    if (!selectedWordId || isSubmitting) return;
    setIsSubmitting(true);

    const isCorrect = selectedWordId === currentWord.id;
    const word = words.find((w) => w.id === selectedWordId);
    const selectedWordProgress = wordProgress.find(
      (w) => w.wordId === selectedWordId,
    );
    const isLastWord = currentIndex === words.length - 1;

    if (isCorrect) {
      setStatus("correct");
      setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));

      const { rewardType, message } = checkWordReward(
        selectedWordProgress,
        word,
      );

      if (rewardType === "coin") {
        triggerFlyAnimation(selectedWordId, word?.image || null);
        setTimeout(() => setCoins((prev) => prev + 1), flyingDuration * 1000);

        setWordProgress((prev) =>
          prev.map((w) =>
            w.wordId === selectedWordId
              ? { ...w, coinsEarned: (w.coinsEarned || 0) + 1 }
              : w,
          ),
        );
      }

      new Audio("/sounds/success.mp3").play().catch(() => {});
    } else {
      setStatus("wrong");
      setStats((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
      new Audio("/sounds/error.mp3").play().catch(() => {});
    }

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      try {
        activeSessionId = await startTestSession(categoryId);
        setSessionId(activeSessionId);
      } catch (e) {
        toast.error("Connection failed");
        setIsSubmitting(false);
        return;
      }
    }

    submitAnswer(
      activeSessionId,
      selectedWordId,
      categoryId,
      isCorrect,
      currentIndex,
      isLastWord,
    ).catch(() => {
      toast.error("Failed to save progress");
    });

    setIsSubmitting(false);
  }, [
    selectedWordId,
    isSubmitting,
    sessionId,
    categoryId,
    currentWord,
    words,
    wordProgress,
  ]);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setStatus("idle");
      setSelectedWordId(null);
    } else {
      setIsGameComplete(true);
    }
  }, [currentIndex, words.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting || isGameComplete) return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (status === "idle") {
          handleConfirm();
        } else {
          handleNext();
        }
        return;
      }

      if (status === "idle") {
        const currentSelectionIndex = words.findIndex(
          (w) => w.id === selectedWordId,
        );
        const gridColumns = 4;
        let nextIndex = currentSelectionIndex;

        if (e.key === "ArrowRight") {
          e.preventDefault();
          nextIndex =
            currentSelectionIndex === -1 ? 0 : currentSelectionIndex + 1;
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          nextIndex =
            currentSelectionIndex === -1 ? 0 : currentSelectionIndex - 1;
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          nextIndex =
            currentSelectionIndex === -1
              ? 0
              : currentSelectionIndex + gridColumns;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          nextIndex =
            currentSelectionIndex === -1
              ? 0
              : currentSelectionIndex - gridColumns;
        }

        if (
          nextIndex >= 0 &&
          nextIndex < words.length &&
          nextIndex !== currentSelectionIndex
        ) {
          handleSelect(words[nextIndex], false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    status,
    isSubmitting,
    isGameComplete,
    selectedWordId,
    words,
    handleConfirm,
    handleNext,
    handleSelect,
  ]);

  if (isGameComplete) {
    return (
      <CategoryComplete
        correct={stats.correct}
        wrong={stats.wrong}
        coinsEarned={coins - initialUserCoins}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <AnimatePresence>
        {flyAnimation && (
          <FlyingReward start={flyAnimation.start} end={flyAnimation.end} />
        )}
      </AnimatePresence>

      <div className="relative h-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform">
          <Shadow opacity="25" />
          <Screws variant="sides" size="sm" />
          <Coins
            ref={coinRef}
            userCoins={coins}
            triggerBump={triggerCoinBump}
          />
        </div>
      </div>

      <div className="border-paleBrown relative rounded-2xl border-[2.5px] bg-[#ccb17c] bg-[url('/static/grain.png')] bg-cover bg-center bg-no-repeat p-4 bg-blend-hard-light shadow-[0_0px_55px_25px_#00000040]">
        <Shadow opacity="20" />
        <Screws />
        {/* Progress Bar */}
        <div className="border-paleBrown bg-darkBrown/20 absolute top-0 -right-3 flex h-full w-3 flex-col-reverse overflow-hidden rounded-full border-2 md:-right-6">
          <div
            className="bg-lightBrown w-full transition-all duration-300 ease-out"
            style={{ height: `${progress}%` }}
          />
        </div>

        <div className="bg-gabs border-gabs relative mb-4">
          <Screws size="sm" />
          <h1 className="border-gabs rounded-lg border bg-transparent p-4 text-center text-3xl font-semibold shadow-[0_0px_5px_7px_#422d2b25]">
            <span className="uppercase">{categoryName}</span>
          </h1>
        </div>

        <ul className="grid-gabs">
          {words.map((word) => {
            const isSelected = selectedWordId === word.id;
            const isCorrect = word.id === currentWord.id;

            let statusEffect = "";

            if (status === "idle" && isSelected) {
              statusEffect =
                "drop-shadow-[0_0_15px_theme('colors.lightBrown')] z-10 scale-115";
            } else if (status === "correct" && isCorrect) {
              statusEffect =
                "drop-shadow-[0_0_15px_theme('colors.green.500')] z-10 scale-115";
            } else if (status === "wrong" && isSelected) {
              statusEffect =
                "drop-shadow-[0_0_15px_theme('colors.red.400')] z-10 scale-115";
            } else if (status === "wrong" && isCorrect) {
              statusEffect =
                "drop-shadow-[0_0_15px_theme('colors.green.400')] z-10 scale-115";
            }

            return (
              <div
                key={word.id}
                ref={(el) => {
                  wordRefs.current[word.id] = el;
                }}
                className={`cursor-pointer transition-all duration-200 ${statusEffect}`}
                onClick={() => handleSelect(word, true)}
              >
                <WordCard
                  name={word.name}
                  image={word.image}
                  audioUrl={null}
                  isActive={!!statusEffect}
                />
              </div>
            );
          })}
        </ul>

        <h1 className="pt-4 text-center text-3xl font-semibold">
          Which one is{" "}
          <span className="inline md:hidden">
            <br />
          </span>
          <span className="text-lightBrown inline-flex">
            {currentWord.translations[0]?.text
              .toLocaleUpperCase("tr-TR")
              .split("")
              .map((char: string, index: number) => (
                <span
                  key={index}
                  className="animate-wave"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
          </span>
          ?
        </h1>

        <div className="flex justify-center pt-4 pb-4">
          <Button
            size="lg"
            className={`border-gabs relative w-full max-w-sm border-2 p-6 text-xl font-bold text-white capitalize ${
              status === "correct"
                ? "bg-green-600 hover:bg-green-700"
                : status === "wrong"
                  ? "bg-lightBrown hover:bg-red-400"
                  : "bg-lightBrown hover:bg-[#5a3e3b]"
            }`}
            onClick={status === "idle" ? handleConfirm : handleNext}
            disabled={!selectedWordId && status === "idle"}
          >
            <Screws size="sm" />

            {status === "idle"
              ? !selectedWordId
                ? "Select a Word"
                : isSubmitting
                  ? "Checking..."
                  : "Check Answer"
              : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
