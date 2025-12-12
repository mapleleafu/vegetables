"use client";

import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

let lastPlayed = 0;

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

  const playHover = () => {
    const now = Date.now();
    if (now - lastPlayed < 150) return;

    lastPlayed = now;

    let random = Math.floor(Math.random() * 2) + 1;
    const audio = new Audio(`/sounds/select_00${random}.ogg`);
    audio.volume = 0.01;
    audio.play().catch(() => {});
  };

  return (
    <li className="relative flex flex-col items-center rounded-lg border border-[#6f514e] bg-[#ffd481]">
      {imageUrl ? (
        <div className="flex w-full justify-center">
          <Image
            draggable={false}
            src={imageUrl}
            alt={name}
            width={320}
            height={320}
            onClick={playAudio}
            // onMouseEnter={playHover}
            className={`aspect-square rounded-md object-cover transition-all duration-100 select-none hover:scale-130 hover:drop-shadow-[0_0_4px_#00000095] active:scale-95 cursor-pointer ${
              audioUrl ? "cursor-pointer" : "cursor-default"
            }`}
          />
        </div>
      ) : (
        <div
          onClick={playAudio}
          // onMouseEnter={playHover}
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
