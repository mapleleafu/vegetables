"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WordCard } from "@/components/WordCard";
import { BadRequestError } from "@/lib/errors";
import { api } from "@/lib/api";
import {
  LANGUAGE_HELLOS,
  LANGUAGE_WELCOME,
  LanguageCode,
  DEFAULT_LANGUAGE_CODE,
} from "@/types/language";
import type { WordTranslation } from "@prisma/client";

interface TutorialProps {
  targetLanguage: LanguageCode;
  helloWord?: { translations: WordTranslation[]; image: string | null };
}

function TutorialIntro({
  targetLanguage,
  onComplete,
}: {
  targetLanguage: LanguageCode;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const words = ["Welcome", LANGUAGE_WELCOME[targetLanguage]];

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < words.length - 1) {
        setIndex((prev) => prev + 1);
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 2000);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [index, onComplete, words.length]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-transparent">
      <AnimatePresence mode="wait">
        <motion.h1
          key={words[index]}
          initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          exit={{ opacity: 0, filter: "blur(10px)", y: -10 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="from-foreground to-foreground/60 bg-linear-to-b bg-clip-text py-2 text-6xl leading-normal font-bold tracking-tight text-transparent"
        >
          {words[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}

function TutorialGame({
  targetLanguage,
  onComplete,
  helloWord,
}: {
  targetLanguage: LanguageCode;
  onComplete: () => Promise<void>;
  helloWord?: { translations: WordTranslation[]; image: string | null };
}) {
  const [selected, setSelected] = useState(false);
  const [status, setStatus] = useState<"idle" | "correct">("idle");
  const [loading, setLoading] = useState(false);
  const targetHello = LANGUAGE_HELLOS[targetLanguage];
  const helloWordTranslation = helloWord?.translations.find(
    (t) =>
      t.languageCode === targetLanguage ||
      t.languageCode === DEFAULT_LANGUAGE_CODE,
  );

  const mockWord = {
    id: "tutorial-1",
    name: "Hello",
    image: helloWord?.image || "",
    audioUrl: helloWordTranslation?.audioUrl || "",
  };

  const handleSelect = () => {
    if (status !== "idle") return;
    setSelected(true);
  };

  const handleCheck = async () => {
    if (!selected) return;

    if (status === "idle") {
      setStatus("correct");
      new Audio("/sounds/success.mp3").play().catch(() => {});
    } else {
      setLoading(true);
      await onComplete();
      setLoading(false);
    }
  };

  let borderClass = "border-transparent";
  if (status === "idle" && selected)
    borderClass = "ring-4 ring-lightBrown rounded-lg";
  if (status === "correct") borderClass = "ring-4 ring-green-500 rounded-lg";

  return (
    <div className="flex w-full max-w-xl flex-1 flex-col justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="border-paleBrown relative rounded-2xl border-[2.5px] bg-[#ccb17c] bg-[url('/static/grain.png')] bg-cover bg-center bg-no-repeat p-4 bg-blend-hard-light shadow-[0_0px_55px_25px_#00000040]"
      >
        {/* Progress Bar */}
        <div className="border-paleBrown bg-darkBrown/20 absolute top-0 -right-3 flex h-full w-3 flex-col-reverse overflow-hidden rounded-full border-2 md:-right-6">
          <div
            className="bg-lightBrown w-full transition-all duration-300 ease-out"
            style={{ height: status === "correct" ? "100%" : "10%" }}
          />
        </div>

        {/* Title */}
        <div className="bg-gabs border-gabs mb-4">
          <h1 className="border-gabs rounded-lg border bg-transparent p-4 text-center text-3xl font-semibold shadow-[0_0px_5px_7px_#422d2b25]">
            <span className="uppercase">{mockWord.name}</span>
          </h1>
        </div>

        {/* Grid */}
        <ul className="flex justify-center py-8">
          <div
            className={`cursor-pointer transition-all ${borderClass}`}
            onClick={handleSelect}
          >
            <WordCard
              name={mockWord.name}
              image={mockWord.image}
              audioUrl={mockWord.audioUrl}
            />
          </div>
        </ul>

        <h1 className="pt-4 pb-4 text-center text-3xl font-semibold">
          Which one is{" "}
          <span className="inline md:hidden">
            <br />
          </span>
          <span className="text-lightBrown inline-flex capitalize">
            {targetHello}
          </span>
          ?
        </h1>

        {/* Button */}
        <div className="flex justify-center pt-4 pb-4">
          <Button
            size="lg"
            className={`border-gabs w-full max-w-sm border-2 p-6 text-xl font-bold text-white capitalize ${
              status === "correct"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-lightBrown hover:bg-[#5a3e3b]"
            }`}
            onClick={handleCheck}
            disabled={!selected || loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : status === "idle" ? (
              !selected ? (
                "Select"
              ) : (
                "Check Answer"
              )
            ) : (
              "Complete Tutorial"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function Tutorial({ targetLanguage, helloWord }: TutorialProps) {
  const router = useRouter();
  const [stage, setStage] = useState<"intro" | "game">("intro");

  const handleTutorialComplete = async () => {
    try {
      const res = await api.user.completeTutorial();
      if (!res.success) throw new BadRequestError();

      toast.success("You are ready to go!");
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      {stage === "intro" ? (
        <TutorialIntro
          targetLanguage={targetLanguage}
          onComplete={() => setStage("game")}
        />
      ) : (
        <TutorialGame
          targetLanguage={targetLanguage}
          helloWord={helloWord}
          onComplete={handleTutorialComplete}
        />
      )}
    </main>
  );
}
