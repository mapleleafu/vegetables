"use client";

import { useState, useEffect, useRef } from "react";

const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/audios/numbers`;

export function useAudioPreloader(languageCode: string, keys: string[]) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAudio = async () => {
      setIsReady(false);
      setProgress(0);
      audioCache.current.clear();

      let loadedCount = 0;
      const total = keys.length;

      const promises = keys.map(async (key) => {
        try {
          const url = `${SUPABASE_STORAGE_URL}/${languageCode}/${key}.mp3`;
          const response = await fetch(url);

          if (!response.ok) throw new Error(`Missing: ${key}`);

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          const audio = new Audio(objectUrl);

          audio.preload = "auto";

          if (isMounted) {
            audioCache.current.set(key, audio);
            loadedCount++;
            setProgress(Math.round((loadedCount / total) * 100));
          }
        } catch (err) {
          console.warn(`Failed to load audio for key: ${key}`, err);
        }
      });

      await Promise.all(promises);

      if (isMounted) {
        setIsReady(true);
      }
    };

    if (keys.length > 0) {
      loadAudio();
    }

    return () => {
      isMounted = false;
      stopAudio(); // Stop any playing audio on unmount
      audioCache.current.forEach((audio) => {
        URL.revokeObjectURL(audio.src);
      });
      audioCache.current.clear();
    };
  }, [languageCode, keys]);

  const stopAudio = () => {
    if (currentAudioRef.current) {
      if (currentHandlerRef.current) {
        currentAudioRef.current.removeEventListener(
          "ended",
          currentHandlerRef.current,
        );
        currentHandlerRef.current = null;
      }
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  };

  const playSequence = async (
    sequenceKeys: string[],
    onComplete?: () => void,
  ) => {
    stop(); // Ensure previous sequence is stopped
    if (!isReady) return;

    const playNext = (index: number) => {
      if (index >= sequenceKeys.length) {
        if (onComplete) onComplete();
        return;
      }

      const key = sequenceKeys[index];
      const audio = audioCache.current.get(key);

      if (audio) {
        audio.currentTime = 0;
        currentAudioRef.current = audio;

        const onEnded = () => {
          audio.removeEventListener("ended", onEnded);
          currentHandlerRef.current = null;
          playNext(index + 1);
        };

        currentHandlerRef.current = onEnded;
        audio.addEventListener("ended", onEnded);
        audio.play().catch((e) => console.error("Play error", e));
      } else {
        playNext(index + 1);
      }
    };

    playNext(0);
  };

  return { isReady, progress, playSequence, stopAudio, error };
}
