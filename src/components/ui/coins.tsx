"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useState } from "react";

interface CoinsProps {
  userCoins: number;
  className?: string;
  triggerBump?: boolean;
}

export const Coins = forwardRef<HTMLDivElement, CoinsProps>(
  ({ userCoins, className, triggerBump }, ref) => {
    const [bump, setBump] = useState(false);

    useEffect(() => {
      if (triggerBump) {
        setBump(true);
        const timer = setTimeout(() => setBump(false), 200); // Faster bump
        return () => clearTimeout(timer);
      }
    }, [triggerBump]);

    return (
      <div
        ref={ref}
        className={cn(
          "bg-lightBrown border-gabs flex items-center gap-2 rounded-2xl rounded-br-none rounded-bl-none border-[2.5px] border-b-0 px-4 shadow-[0_0px_5px_7px_#422d2b25] transition-all duration-200",
          bump ? "scale-125 text-green-700" : "scale-100 text-white",
          className,
        )}
      >
        <span className="text-2xl">🪙</span>
        <span className="text-xl font-bold">{userCoins}</span>
      </div>
    );
  },
);

Coins.displayName = "Coins";
