"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Word } from "@prisma/client";
import { Loader2, Check, Paintbrush, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { BadRequestError } from "@/lib/errors";
import { Skeleton } from "@/components/ui/skeleton";

const pageSize = 10;

const GRADIENT_PRESETS = [
  { name: "Sage (Default)", value: "from-[#DBE7C1] to-[#A9B792]" },
  { name: "Soft Sky", value: "from-sky-100 to-blue-200" },
  { name: "Warm Peach", value: "from-orange-100 to-rose-200" },
  { name: "Lavender", value: "from-purple-100 to-indigo-200" },
  { name: "Minty Fresh", value: "from-emerald-100 to-teal-200" },
  { name: "Lemonade", value: "from-yellow-100 to-amber-200" },
  { name: "Cool Gray", value: "from-slate-200 to-slate-400" },
  { name: "Midnight", value: "from-indigo-900 to-slate-900" },
  { name: "Forest", value: "from-green-800 to-emerald-950" },
];

const SOLID_PRESETS = [
  { name: "White", value: "#ffffff" },
  { name: "Light Gray", value: "#f3f4f6" },
  { name: "Cream", value: "#fffdd0" },
  { name: "Mint", value: "#ccffcc" },
  { name: "Sky", value: "#e0f2fe" },
  { name: "Rose", value: "#ffe4e6" },
  { name: "Slate", value: "#cbd5e1" },
  { name: "Black", value: "#1a1a1a" },
];

const SelectableImageTile = ({
  src,
  alt,
  isSelected,
}: {
  src: string;
  alt: string;
  isSelected: boolean;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="bg-secondary/20 relative aspect-square w-full overflow-hidden">
      {!isLoaded && (
        <Skeleton className="absolute inset-0 h-full w-full bg-primary/5 animate-pulse rounded-none" />
      )}

      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "h-full w-full object-cover p-2 transition-all duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
      />

      {isSelected && (
        <div className="animate-in fade-in zoom-in absolute inset-0 flex items-center justify-center bg-black/20 duration-200 opacity-60">
          <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-sm">
            <Check className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
};

export function UserBackgroundSelector({
  currentWordId,
  currentGradient,
}: {
  currentWordId: string | null;
  currentGradient?: string;
}) {
  const [backgroundSelecterOpen, setBackgroundSelectorOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [colorStart, setColorStart] = useState("#DBE7C1");
  const [colorEnd, setColorEnd] = useState("#A9B792");
  const [solidColor, setSolidColor] = useState("#DBE7C1");

  const router = useRouter();

  const fetchWords = useCallback(
    async (pageNum: number) => {
      if (loading) return;
      setLoading(true);

      try {
        const res = await api.user.userWords(pageNum, pageSize);
        const words = res.words;

        if (!words) throw new Error("Failed to load words");

        if (pageNum === 0) {
          setWords(words);
        } else {
          setWords((prev) => [...prev, ...words]);
        }

        setHasMore(words.length === pageSize);
      } catch (err) {
        toast.error("Failed to load background options");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  useEffect(() => {
    if (backgroundSelecterOpen && words.length === 0) {
      fetchWords(0);
      setPage(0);
    }
  }, [backgroundSelecterOpen, fetchWords, words.length]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWords(nextPage);
  };

  const setBackgroundWord = async (wordId: string | null) => {
    try {
      const res = await api.user.setBackgroundWord(wordId);
      if (!res.success) throw new BadRequestError("Update failed");

      toast.success("Background image updated!");
      router.refresh();
      setBackgroundSelectorOpen(false);
    } catch (err) {
      toast.error("Failed to update background image");
    }
  };

  const saveGradient = async (gradientString: string) => {
    try {
      const res = await api.user.setBackgroundGradient(gradientString);
      if (!res.success) throw new BadRequestError("Update failed");

      toast.success("Theme color updated!");
      router.refresh();
      setColorPickerOpen(false);
    } catch (err) {
      toast.error("Failed to update theme color");
    }
  };

  const handleCustomGradientSave = () => {
    const customString = `from-[${colorStart}] to-[${colorEnd}]`;
    saveGradient(customString);
  };

  const handleSolidSave = (color: string) => {
    const solidString = `from-[${color}] to-[${color}]`;
    saveGradient(solidString);
  };

  const resetAndOpen = () => {
    setWords([]);
    setPage(0);
    setHasMore(true);
    setBackgroundSelectorOpen(true);
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-2 sm:flex-row">
        <Button onClick={resetAndOpen} variant="outline" className="flex-1">
          <Paintbrush className="mr-2 h-4 w-4" />
          Change Image
        </Button>
        <Button
          onClick={() => setColorPickerOpen(true)}
          variant="outline"
          className="flex-1"
        >
          <Palette className="mr-2 h-4 w-4" />
          Change Color
        </Button>
      </div>

      {/* --- Image Selector Dialog --- */}
      <Dialog
        open={backgroundSelecterOpen}
        onOpenChange={setBackgroundSelectorOpen}
      >
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Background Image</DialogTitle>
          </DialogHeader>

          <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
            {words.map((word) => (
              <button
                key={word.id}
                onClick={() => setBackgroundWord(word.id)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border-4 transition-all duration-200",
                  currentWordId === word.id
                    ? "border-primary ring-primary/20 scale-95 shadow-xl ring-4"
                    : "border-transparent hover:scale-105 hover:border-gray-200",
                )}
              >
                <SelectableImageTile
                  src={word.image!}
                  alt={word.name}
                  isSelected={currentWordId === word.id}
                />

                <div className="bg-secondary/50 px-2 py-2">
                  <p className="text-foreground truncate text-center text-xs font-semibold capitalize">
                    {word.name}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={loadMore}
                disabled={loading}
                variant="ghost"
                className="w-full sm:w-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load More Words
              </Button>
            </div>
          )}

          {!loading && words.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <Paintbrush className="mb-4 h-12 w-12 opacity-20" />
              <p>No unlocked words with images yet.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Color Picker Dialog --- */}
      <Dialog open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Customize Theme</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="presets">Gradients</TabsTrigger>
              <TabsTrigger value="solid">Solid Color</TabsTrigger>
              <TabsTrigger value="custom">Custom Mix</TabsTrigger>
            </TabsList>

            {/* GRADIENT PRESETS */}
            <TabsContent value="presets" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => saveGradient(preset.value)}
                    className={cn(
                      "group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 shadow-sm transition-all hover:scale-105",
                      currentGradient === preset.value
                        ? "border-primary ring-primary/30 ring-2"
                        : "hover:border-border border-transparent",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-linear-to-br",
                        preset.value,
                      )}
                    />
                    <span className="relative z-10 text-xs font-bold text-black/70 mix-blend-plus-darker">
                      {preset.name}
                    </span>
                    {currentGradient === preset.value && (
                      <div className="text-primary absolute top-2 right-2 z-20 rounded-full bg-white p-1 shadow-sm">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </TabsContent>

            {/* SOLID COLOR */}
            <TabsContent value="solid" className="mt-4 space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {SOLID_PRESETS.map((color) => {
                  const isSelected =
                    currentGradient ===
                    `from-[${color.value}] to-[${color.value}]`;
                  return (
                    <button
                      key={color.name}
                      onClick={() => handleSolidSave(color.value)}
                      className={cn(
                        "group relative aspect-square rounded-full border shadow-sm transition-transform hover:scale-110",
                        isSelected ? "ring-primary/20 scale-105 ring-4" : "",
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-6 w-6 text-black/50" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 rounded-xl border p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-full rounded-full border shadow-sm"
                    style={{ backgroundColor: solidColor }}
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="solid-picker">Pick any custom color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="solid-picker"
                        type="color"
                        value={solidColor}
                        onChange={(e) => setSolidColor(e.target.value)}
                        className="h-10 w-20 cursor-pointer p-1"
                      />
                      <Button onClick={() => handleSolidSave(solidColor)}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* CUSTOM GRADIENT MIXER */}
            <TabsContent value="custom" className="mt-4 space-y-6">
              <div className="rounded-xl border p-4 shadow-sm">
                <div className="text-muted-foreground mb-4 text-sm font-medium">
                  Preview
                </div>
                <div
                  className="flex h-32 w-full items-center justify-center rounded-lg shadow-inner transition-all duration-300"
                  style={{
                    background: `linear-gradient(to bottom right, ${colorStart}, ${colorEnd})`,
                  }}
                >
                  <span className="rounded-md bg-white/30 px-3 py-1 text-sm font-bold text-black/80 backdrop-blur-md">
                    Your Theme
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="color-start">Start Color (Top Left)</Label>
                  <div className="flex gap-2">
                    <div
                      className="h-10 w-10 shrink-0 rounded border shadow-sm"
                      style={{ backgroundColor: colorStart }}
                    />
                    <Input
                      id="color-start"
                      type="color"
                      value={colorStart}
                      onChange={(e) => setColorStart(e.target.value)}
                      className="h-10 flex-1 cursor-pointer p-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color-end">End Color (Bottom Right)</Label>
                  <div className="flex gap-2">
                    <div
                      className="h-10 w-10 shrink-0 rounded border shadow-sm"
                      style={{ backgroundColor: colorEnd }}
                    />
                    <Input
                      id="color-end"
                      type="color"
                      value={colorEnd}
                      onChange={(e) => setColorEnd(e.target.value)}
                      className="h-10 flex-1 cursor-pointer p-1"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleCustomGradientSave} className="w-full">
                Save Custom Gradient
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
