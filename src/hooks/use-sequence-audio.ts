"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useSequenceAudio(basePath: string = "/sounds/numbers/") {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);

  useEffect(() => {
    audioRef.current = new Audio();

    const handleEnded = () => {
      if (queueRef.current.length > 0) {
        const nextFile = queueRef.current.shift();
        if (audioRef.current && nextFile) {
          audioRef.current.src = `${basePath}${nextFile}.mp3`;
          audioRef.current
            .play()
            .catch((e) => console.error("Audio play failed", e));
        }
      } else {
        setIsPlaying(false);
      }
    };

    audioRef.current.addEventListener("ended", handleEnded);
    return () => {
      audioRef.current?.removeEventListener("ended", handleEnded);
      audioRef.current?.pause();
    };
  }, [basePath]);

  const playSequence = useCallback(
    (filenames: string[]) => {
      if (!filenames.length) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const queue = [...filenames];
      const first = queue.shift();

      queueRef.current = queue;
      setIsPlaying(true);

      if (audioRef.current && first) {
        audioRef.current.src = `${basePath}${first}.mp3`;
        audioRef.current.play().catch((e) => {
          console.error("Playback error", e);
          setIsPlaying(false);
        });
      }
    },
    [basePath],
  );

  return { isPlaying, playSequence };
}
