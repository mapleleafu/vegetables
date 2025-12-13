"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LiquidProgressBarProps {
  progress: number;
  className?: string;
}

export function LiquidProgressBar({
  progress,
  className = "",
}: LiquidProgressBarProps) {
  const [isFilling, setIsFilling] = useState(false);

  // Detect changes in progress to trigger the "agitated" state
  useEffect(() => {
    if (progress > 0) {
      setIsFilling(true);
      const timer = setTimeout(() => {
        setIsFilling(false);
      }, 1000); // Fades out 1 second after stopping
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // If the parent passes absolute/fixed, we shouldn't force 'relative'
  // otherwise it breaks the positioning.
  const basePosition =
    className.includes("absolute") || className.includes("fixed")
      ? ""
      : "relative";

  return (
    <div
      className={`border-paleBrown bg-darkBrown/20 flex flex-col-reverse overflow-hidden rounded-full border-2 ${basePosition} ${className}`}
    >
      {/* The Liquid Container */}
      <motion.div
        className="bg-lightBrown relative w-full"
        initial={{ height: "0%" }}
        animate={{ height: `${progress}%` }}
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 15,
          mass: 1,
        }}
      >
        {/* WAVE CONTAINER */}
        <div className="absolute -top-2.5 left-0 h-3 w-[300%]">
          {/* Layer 1: Idle Slosh */}
          <motion.div
            className="absolute top-0 left-0 h-full w-full opacity-60"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 3,
            }}
          >
            <WaveSvg color="#a68b5b" />
          </motion.div>

          {/* Layer 2: Main Surface */}
          <motion.div
            className="absolute top-1 left-0 h-full w-full"
            animate={{ x: ["-50%", "0%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 2,
            }}
          >
            <WaveSvg color="#c4a46c" />
          </motion.div>

          {/* Layer 3: Froth/Foam */}
          <motion.div
            className="absolute top-1 left-0 h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFilling ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="h-full w-full"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 0.5,
              }}
            >
              <WaveSvg color="#ffffff" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function WaveSvg({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="h-full w-full"
      style={{ fill: color }}
    >
      <path
        d="M0,0 V40 Q250,90 500,40 T1000,40 V0 H0 Z"
        transform="scale(1, -1) translate(0, -50)"
      />
      <path d="M0,60 C150,100 300,0 600,60 C900,120 1050,20 1200,60 V120 H0 V60 Z" />
    </svg>
  );
}
