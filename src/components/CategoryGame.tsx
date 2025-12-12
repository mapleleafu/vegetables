"use client";

import { useEffect, useState, useCallback } from "react";
import { WordCard } from "@/components/WordCard";
import { Button } from "@/components/ui/button";
import { submitAnswer, startTestSession } from "@/app/actions/game";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Coins } from "@/components/ui/coins";

interface CategoryGameProps {
  words: any[];
  userTargetLanguage: string;
  categoryName: string;
  categoryId: string;
  initialUserCoins: number;
}

export function CategoryGame({
  words,
  userTargetLanguage,
  categoryName,
  categoryId,
  initialUserCoins,
}: CategoryGameProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [coins, setCoins] = useState(initialUserCoins);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const currentWord = words[currentIndex];

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

    let activeSessionId = sessionId;

    try {
      if (!activeSessionId) {
        activeSessionId = await startTestSession(categoryId);
        setSessionId(activeSessionId);
      }
    } catch (e) {
      toast.error("Could not start game session");
      setIsSubmitting(false);
      return;
    }

    const isCorrect = selectedWordId === currentWord.id;

    if (isCorrect) {
      setStatus("correct");
      const audio = new Audio("/sounds/success.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } else {
      setStatus("wrong");
      const audio = new Audio("/sounds/error.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }

    try {
      const result = await submitAnswer(
        activeSessionId,
        selectedWordId,
        categoryId,
        isCorrect,
        currentIndex,
      );

      if (result.status === "correct") {
        if (result.rewardType === "coin" && result.newCoins !== undefined) {
          setCoins(result.newCoins);
        }
        if (result.rewardType === "point" && result.message) {
          toast.info(result.message);
        }
      }
    } catch (error) {
      toast.error("Something went wrong saving your progress.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedWordId,
    isSubmitting,
    sessionId,
    categoryId,
    currentWord.id,
    currentIndex,
  ]);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setStatus("idle");
      setSelectedWordId(null);
    } else {
      toast.success("Category Completed!");
      router.push("/categories");
    }
  }, [currentIndex, words.length, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

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
    selectedWordId,
    words,
    handleConfirm,
    handleNext,
    handleSelect,
  ]);

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="relative h-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform">
          <Coins userCoins={coins} />
        </div>
      </div>
      <div className="border-darkBrown rounded-2xl border-[2.5px] bg-[#ccb17c] p-4 shadow-[0_0px_55px_25px_#00000040]">
        <div className="border-darkBrown bg-lightBrown mb-4 rounded-2xl border bg-[url('/static/border.png')] bg-cover bg-center bg-no-repeat bg-blend-hard-light">
          <h1 className="rounded-lg border border-[#3e3535] bg-transparent p-4 text-center text-3xl font-semibold shadow-[0_0px_5px_7px_#422d2b25]">
            <span className="uppercase">{categoryName}</span>
          </h1>
        </div>

        <ul className="grid grid-cols-4 gap-2">
          {words.map((word) => {
            const isSelected = selectedWordId === word.id;
            const isCorrect = word.id === currentWord.id;

            let borderClass = "border-transparent";
            if (status === "idle" && isSelected)
              borderClass = "ring-4 ring-lightBrown rounded-lg";
            if (status === "correct" && isCorrect)
              borderClass = "ring-4 ring-green-500 rounded-lg";
            if (status === "wrong" && isSelected)
              borderClass = "ring-4 ring-red-400 rounded-lg";
            if (status === "wrong" && isCorrect)
              borderClass = "ring-4 ring-green-400 rounded-lg";

            return (
              <div
                key={word.id}
                className={`cursor-pointer transition-all ${borderClass}`}
                onClick={() => handleSelect(word, true)}
              >
                <WordCard
                  name={word.name}
                  imageUrl={word.imageUrl}
                  audioUrl={null}
                />
              </div>
            );
          })}
        </ul>

        <h1 className="pt-4 text-center text-3xl font-semibold">
          Which one is{" "}
          <span className="text-lightBrown inline-flex capitalize">
            {currentWord.name.split("").map((char: string, index: number) => (
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
            className={`border-darkBrown w-full max-w-sm border-2 p-6 text-xl font-bold text-white capitalize ${
              status === "correct"
                ? "bg-green-600 hover:bg-green-700"
                : status === "wrong"
                  ? "bg-lightBrown hover:bg-red-400"
                  : "bg-lightBrown hover:bg-[#5a3e3b]"
            }`}
            onClick={status === "idle" ? handleConfirm : handleNext}
            disabled={(!selectedWordId && status === "idle") || isSubmitting}
          >
            {status === "idle"
              ? isSubmitting
                ? "Checking..."
                : "Check Answer"
              : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
