"use client";

import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

interface WordCardProps {
  name: string;
  imageUrl: string | null;
  audioUrl: string | null;
}

export function WordCard({ name, imageUrl, audioUrl }: WordCardProps) {
  const playAudio = () => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch((e) => console.error("Play failed", e));
  };

  return (
    <li className="relative flex flex-col items-center rounded-lg border border-white/50 bg-green-800/50 p-3">
      {imageUrl ? (
        <div className="mt-2 flex w-full justify-center">
          <Image
            src={imageUrl}
            alt={name}
            width={200}
            height={200}
            onClick={playAudio}
            className={`aspect-square rounded-md object-cover transition-transform duration-100 select-none hover:scale-105 active:scale-95 ${
              audioUrl ? "cursor-pointer" : "cursor-default opacity-50"
            }`}
          />
        </div>
      ) : (
        <div
          onClick={playAudio}
          className={`flex aspect-square w-full items-center justify-center rounded-md bg-black/20 transition-transform duration-100 hover:scale-105 active:scale-95 ${
            audioUrl ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <ImageIcon size={32} className="text-white/50" />
        </div>
      )}
    </li>
  );
}
