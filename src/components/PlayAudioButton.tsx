"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlayAudioButton({ audioUrl }: { audioUrl: string }) {
  const play = () => {
    const audio = new Audio(audioUrl);
    audio.play().catch((e) => console.error("Play failed", e));
  };

  return (
    <Button onClick={play} className="h-4 w-4 p-0 bg-transparent">
      <Volume2 size={8} className="text-muted-foreground" />
    </Button>
  );
}
