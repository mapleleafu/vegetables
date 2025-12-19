"use client";

import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";
import { BACKGROUND_IMAGE_URL, BACKGROUND_GRADIENT } from "@/lib/constants";

interface DynamicBackgroundProps {
  imageUrl?: string;
  gradient?: string;
  tileCount?: number;
  appyBlur?: boolean;
}

const BackgroundTile = ({
  src,
  className,
  index,
}: {
  src: string;
  className?: string;
  index: number;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  };

  return (
    <div className="relative h-full w-full">
      <img
        src={src}
        alt=""
        loading="eager"
        onLoad={() => {
          handleLoad();
        }}
        ref={(img) => {
          if (img?.complete) {
            handleLoad();
          }
        }}
        className={cn(
          "h-full w-full object-contain transition-all duration-1000 ease-in-out",
          isLoaded ? "scale-100 opacity-90" : "scale-90 opacity-0",
          className,
        )}
      />
    </div>
  );
};
export function DynamicBackground({
  imageUrl,
  gradient = BACKGROUND_GRADIENT,
  tileCount = 400,
  appyBlur = true,
}: DynamicBackgroundProps) {
  const effectiveImage = imageUrl || BACKGROUND_IMAGE_URL;

  const getRotation = (i: number) => {
    const rot = i % 4;
    if (rot === 0) return "rotate-0";
    if (rot === 1) return "rotate-90";
    if (rot === 2) return "rotate-180";
    return "-rotate-90";
  };

  const getStagger = (i: number) => {
    if (i % 3 === 0) return "-translate-y-3";
    if (i % 2 === 0) return "translate-y-2";
    return "translate-y-0";
  };

  const gradientStyle = useMemo(() => {
    if (gradient.includes("from-[") && gradient.includes("to-[")) {
      const fromColor = gradient.match(/from-\[(.*?)\]/)?.[1];
      const toColor = gradient.match(/to-\[(.*?)\]/)?.[1];

      if (fromColor && toColor) {
        return {
          style: {
            background: `linear-gradient(to bottom right, ${fromColor}, ${toColor})`,
          },
          className: "absolute inset-0",
        };
      }
    }

    return {
      style: {},
      className: cn("absolute inset-0 bg-linear-to-br", gradient),
    };
  }, [gradient]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[-1] overflow-hidden bg-center",
        appyBlur && "blur-[1px]",
      )}
    >
      {/* Base Gradient Layer */}
      <div className={gradientStyle.className} style={gradientStyle.style} />

      {/* Texture Layer */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Tiled Images Layer */}
      <div className="absolute -inset-4 mix-blend-multiply">
        <div className="grid h-full w-full auto-rows-max grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2 p-4">
          {Array.from({ length: tileCount }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex aspect-square w-full items-center justify-center p-2 select-none",
                getStagger(i),
              )}
            >
              <BackgroundTile
                key={`${i}-${effectiveImage}`}
                src={effectiveImage}
                className={getRotation(i)}
                index={i}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
