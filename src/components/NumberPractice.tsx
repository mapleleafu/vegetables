"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAudioPreloader } from "@/hooks/use-audio-preloader";
import { getNumberAudioKeys, getAllRequiredAudioKeys } from "@/lib/numberLogic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, ArrowRight, Loader2, Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_LANGUAGE_CODE } from "@/types/language";

export default function NumberPractice() {
  const { data: session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const editMinInputRef = useRef<HTMLInputElement>(null);
  const editMaxInputRef = useRef<HTMLInputElement>(null);
  const maxLimit = 999999999999999;

  const targetLang = session?.user?.targetLanguage || DEFAULT_LANGUAGE_CODE;
  const requiredKeys = useMemo(() => getAllRequiredAudioKeys(), []);

  const { isReady, progress, playSequence, stopAudio } = useAudioPreloader(
    targetLang,
    requiredKeys,
  );

  const [gameState, setGameState] = useState<"SETUP" | "PLAYING">("SETUP");
  const [rangeMode, setRangeMode] = useState<"presets" | "custom">("presets");
  const [customRange, setCustomRange] = useState([1, 100]);
  const [maxValue, setMaxValue] = useState(100);
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [tempMaxInput, setTempMaxInput] = useState("");
  const [isEditingMin, setIsEditingMin] = useState(false);
  const [tempMinInput, setTempMinInput] = useState("");
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Global key listener for typing numbers without focusing input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "PLAYING") return;

      if (
        document.activeElement === inputRef.current ||
        document.activeElement === editMinInputRef.current ||
        document.activeElement === editMaxInputRef.current
      ) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        setUserInput((prev) => prev + e.key);
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [gameState]);

  const changeDifficulty = () => {
    stopAudio();
    setIsPlaying(false);
    setGameState("SETUP");
  };

  const generateNumber = () => {
    const [min, max] = customRange;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    setTargetNumber(num);
    setGameState("PLAYING");
    setResult(null);
    setUserInput("");

    setTimeout(() => handlePlayAudio(num), 400);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handlePlayAudio = (num: number) => {
    if (!isReady) return;
    stopAudio();
    setIsPlaying(true);
    const keys = getNumberAudioKeys(num, targetLang);

    playSequence(keys, () => {
      setIsPlaying(false);
    });
  };

  const checkAnswer = () => {
    if (!userInput || targetNumber === null) return;
    const guess = parseInt(userInput.replace(/[^0-9]/g, ""));

    if (guess === targetNumber) {
      setResult("correct");
      new Audio("/sounds/success.mp3").play();
    } else {
      setResult("wrong");
      new Audio("/sounds/error.mp3").play();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
        if (result === "correct") generateNumber();
        else checkAnswer();
        break;
      case " ":
        if (gameState === "PLAYING") {
          e.preventDefault();
          if (targetNumber !== null) handlePlayAudio(targetNumber);
        }
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setUserInput(value);
  };

  const handleStartEditMin = () => {
    setTempMinInput(customRange[0].toString());
    setIsEditingMin(true);
    setTimeout(() => editMinInputRef.current?.focus(), 0);
  };

  const handleEditingMin = (value: string) => {
    setTempMinInput(value);
  };

  const handleSaveMin = () => {
    const cleanValue = tempMinInput.replace(/[^0-9]/g, "");
    let newVal = parseInt(cleanValue);

    if (!isNaN(newVal) && newVal >= 0) {
      const currentMax = customRange[1];
      newVal = Math.min(newVal, currentMax);
      setCustomRange([newVal, currentMax]);
    }
    setIsEditingMin(false);
  };

  const handleStartEditMax = () => {
    setTempMaxInput(customRange[1].toString());
    setIsEditingMax(true);
    setTimeout(() => editMaxInputRef.current?.focus(), 0);
  };

  const handleEditingMax = (value: string) => {
    setTempMaxInput(value);
  };

  const handleSaveMax = () => {
    const cleanValue = tempMaxInput.replace(/[^0-9]/g, "");
    let newVal = parseInt(cleanValue);

    if (!isNaN(newVal) && newVal > 0) {
      newVal > maxLimit ? (newVal = maxLimit) : null;
      const currentMin = customRange[0];
      const finalMax = Math.max(newVal, currentMin);

      if (finalMax > maxValue) {
        setMaxValue(finalMax);
      }

      setCustomRange([currentMin, finalMax]);
    }
    setIsEditingMax(false);
  };

  return (
    <>
      <Card className="border-border/60 bg-card/50 border-2 border-dashed p-8 shadow-xl backdrop-blur-sm transition-all duration-300">
        {gameState === "SETUP" ? (
          <div className="animate-in fade-in zoom-in-95 space-y-8">
            {/* Range Selector */}
            <div className="space-y-4">
              <Tabs
                value={rangeMode}
                onValueChange={(v) => setRangeMode(v as any)}
              >
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="presets">Presets</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
              </Tabs>

              {rangeMode === "presets" ? (
                <div className="grid grid-cols-2 gap-3">
                  {[10, 100, 1000, 10000, 100000, 1000000].map((max) => (
                    <Button
                      key={max}
                      variant={customRange[1] === max ? "default" : "outline"}
                      className="h-12 text-lg font-medium"
                      onClick={() => {
                        setMaxValue(max);
                        setCustomRange([1, max]);
                      }}
                    >
                      1 - {max.toLocaleString()}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6 pt-4">
                  <div className="text-muted-foreground flex h-9 items-center justify-between text-sm font-medium">
                    {/* Min Value Editor */}
                    <div className="flex items-center">
                      {isEditingMin ? (
                        <div className="animate-in fade-in slide-in-from-left-2 flex items-center gap-1">
                          <span className="mr-1 text-xs">Min:</span>
                          <Input
                            ref={editMinInputRef}
                            value={tempMinInput}
                            onChange={(e) => handleEditingMin(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveMin();
                              if (e.key === "Escape") setIsEditingMin(false);
                            }}
                            className="h-8 w-24 text-right"
                            placeholder="Min"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={handleSaveMin}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setIsEditingMin(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={handleStartEditMin}
                          className="hover:text-primary group hover:bg-muted/50 -ml-2 flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-all"
                        >
                          <span>Min: {customRange[0].toLocaleString()}</span>
                          <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      )}
                    </div>

                    {/* Max Value Editor */}
                    <div className="flex items-center">
                      {isEditingMax ? (
                        <div className="animate-in fade-in slide-in-from-right-2 flex items-center gap-1">
                          <span className="mr-1 text-xs">Max:</span>
                          <Input
                            ref={editMaxInputRef}
                            value={tempMaxInput}
                            onChange={(e) => handleEditingMax(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveMax();
                              if (e.key === "Escape") setIsEditingMax(false);
                            }}
                            className="h-8 w-24 text-right"
                            placeholder="Max"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={handleSaveMax}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setIsEditingMax(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={handleStartEditMax}
                          className="hover:text-primary group hover:bg-muted/50 -mr-2 flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-all"
                        >
                          <span>Max: {customRange[1].toLocaleString()}</span>
                          <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      )}
                    </div>
                  </div>

                  <Slider
                    defaultValue={[1, 100]}
                    max={maxValue}
                    step={Math.max(1, Math.floor(maxValue / 100))}
                    min={0}
                    value={customRange}
                    onValueChange={setCustomRange}
                    className="py-4"
                  />

                  <p className="text-muted-foreground text-center text-xs">
                    Tip: Click values to edit precisely
                  </p>
                </div>
              )}
            </div>

            <Button
              size="lg"
              className="h-14 w-full text-xl"
              onClick={generateNumber}
            >
              Start Session <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-8 flex flex-col items-center space-y-8">
            {/* Big Audio Button */}
            <button
              onClick={() => targetNumber && handlePlayAudio(targetNumber)}
              className={cn(
                "relative flex h-32 w-32 items-center justify-center rounded-full shadow-lg transition-all duration-300",
                isPlaying
                  ? "scale-105 bg-amber-100 dark:bg-amber-900/30"
                  : "bg-background hover:bg-accent hover:scale-105",
              )}
            >
              <Volume2
                className={cn(
                  "h-12 w-12",
                  isPlaying ? "text-amber-500" : "text-foreground",
                )}
              />
              {isPlaying && (
                <span className="absolute inset-0 animate-ping rounded-full border-2 border-amber-500/50" />
              )}
            </button>

            <div className="relative w-full">
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                placeholder="?"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={result === "correct"}
                className={cn(
                  "placeholder:text-muted-foreground/10 h-24 border-none bg-transparent text-center text-6xl font-bold tracking-widest shadow-none focus-visible:ring-0",
                  result === "correct" && "text-green-600 dark:text-green-400",
                  result === "wrong" && "text-destructive animate-shake",
                )}
                autoComplete="off"
              />
              {/* Underline Status Indicator */}
              <div
                className={cn(
                  "mt-2 h-1.5 w-full rounded-full transition-colors duration-300",
                  result === "correct"
                    ? "bg-green-500"
                    : result === "wrong"
                      ? "bg-destructive"
                      : "bg-muted",
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="h-12 w-full">
              {result === "correct" ? (
                <Button
                  size="lg"
                  onClick={generateNumber}
                  className="animate-in zoom-in w-full bg-green-600 text-white hover:bg-green-700"
                >
                  Next Number <ArrowRight className="ml-2" />
                </Button>
              ) : result === "wrong" ? (
                <div className="animate-in fade-in flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setUserInput("");
                      setResult(null);
                      inputRef.current?.focus();
                    }}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUserInput(targetNumber?.toString() || "");
                      setResult("correct");
                    }}
                  >
                    Reveal
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-muted-foreground w-full"
                  onClick={checkAnswer}
                >
                  Press Enter
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Footer Navigation */}
      {gameState === "PLAYING" && (
        <div className="flex justify-center">
          <Button
            variant="link"
            onClick={changeDifficulty}
            className="text-muted-foreground"
          >
            Change Difficulty
          </Button>
        </div>
      )}
    </>
  );
}
