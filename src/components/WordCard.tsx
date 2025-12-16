"use client";

import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { useMemo } from "react";

interface WordCardProps {
  name: string;
  image: string | null;
  audioUrl: string | null;
  isActive?: boolean;
}

export function WordCard({
  name,
  image,
  audioUrl,
  isActive = false,
}: WordCardProps) {
  const rotation = useMemo(() => {
    const rotations = ["rotate-0", "rotate-90", "rotate-180", "rotate-270"];
    const seed = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return rotations[seed % rotations.length];
  }, [name]);

  const playAudio = () => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch((e) => console.error("Play failed", e));
  };

  const activeImageClass = isActive
    ? "scale-115 drop-shadow-[0_0_4px_#00000095]"
    : "hover:scale-130 hover:drop-shadow-[0_0_4px_#00000095]";

  const activeIconClass = isActive ? "scale-105" : "hover:scale-105";

  return (
    <li className="group relative flex flex-col items-center rounded-lg drop-shadow-[0_0_4px_#00000055]">
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-lg">
        <div
          className={`absolute inset-0 bg-[url('/static/paper.png')] bg-size-[115%] bg-center bg-no-repeat ${rotation}`}
        />
      </div>

      {image ? (
        <div className="flex w-full justify-center">
          <Image
            draggable={false}
            src={image}
            alt={name}
            width={320}
            height={320}
            onClick={playAudio}
            className={`aspect-square rounded-md object-cover transition-all duration-100 select-none active:scale-95 ${
              audioUrl ? "cursor-pointer" : "cursor-default"
            } ${activeImageClass}`}
          />
        </div>
      ) : (
        <div
          onClick={playAudio}
          className={`z-10 flex aspect-square w-full items-center justify-center rounded-md bg-black/20 transition-transform duration-100 active:scale-95 ${
            audioUrl ? "cursor-pointer" : "cursor-default"
          } ${activeIconClass}`}
        >
          <ImageIcon size={32} className="text-white/50" />
        </div>
      )}
    </li>
  );
}
