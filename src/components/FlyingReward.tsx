import { motion } from "framer-motion";

export default function FlyingReward({ start, end }: { start: any; end: any }) {
  const duration = 0.8;

  return (
    <motion.div
      initial={{
        position: "fixed",
        top: start.y,
        left: start.x,
        width: start.width,
        height: start.height,
        zIndex: 50,
      }}
      animate={{
        top: end.y,
        left: end.x,
        width: 40, // Shrink to Coin Size
        height: 40,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        duration: duration,
        ease: "easeInOut",
      }}
      className="pointer-events-none flex items-center justify-center rounded-full"
    >
      <div className="relative h-full w-full">
        {/* 1. The Word Image */}
        {start.img && (
          <motion.img
            src={start.img}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ borderRadius: "8px" }}
            // Keyframes: [Start, Just Before Mid, At Mid, End]
            animate={{
              opacity: [1, 1, 0, 0],
              borderRadius: ["8px", "50%", "50%", "50%"],
            }}
            transition={{
              duration: duration,
              times: [0, 0.49, 0.5, 1], // Hard cut at 0.5
            }}
          />
        )}

        {/* 2. The Coin Icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-4xl"
          // Keyframes: [Start, Just Before Mid, At Mid, End]
          animate={{
            opacity: [0, 0, 1, 1],
            scale: [0.5, 0.5, 1, 1],
          }}
          transition={{
            duration: duration,
            times: [0, 0.49, 0.5, 1], // Hard cut at 0.5
          }}
        >
          🪙
        </motion.div>
      </div>
    </motion.div>
  );
}
