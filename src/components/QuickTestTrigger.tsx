"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shuffle, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startRandomCategory, startMixedWords } from "@/app/actions/quick-test";

export function QuickTestTrigger() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRandomCategory = () => {
    startTransition(async () => {
      const result = await startRandomCategory();
      if (result?.error) {
        toast.error(result.error);
      } else {
        setOpen(false);
      }
    });
  };

  const handleMixedWords = () => {
    startTransition(async () => {
      const result = await startMixedWords();
      setOpen(true);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="mt-2 mr-5 ml-5 flex-1 cursor-pointer"
        >
          Quick Test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Test</DialogTitle>
          <DialogDescription>
            Choose how you want to test your knowledge today.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="hover:border-primary/50 hover:bg-accent flex h-32 flex-col items-center justify-center gap-3 border-2"
            onClick={handleRandomCategory}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Layers className="h-8 w-8" />
            )}
            <span className="font-semibold">Random Category</span>
          </Button>

          <Button
            variant="outline"
            className="hover:border-primary/50 hover:bg-accent flex h-32 flex-col items-center justify-center gap-3 border-2"
            onClick={handleMixedWords}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Shuffle className="h-8 w-8" />
            )}
            <span className="font-semibold">Mixed Words</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
