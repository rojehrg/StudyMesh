"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PartyPopper, CheckCircle2 } from "lucide-react";

interface CelebrationProps {
  show: boolean;
  message?: string;
  subMessage?: string;
  onComplete?: () => void;
  variant?: "confetti" | "success" | "sparkle";
}

// Confetti piece component
function ConfettiPiece({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color, left: `${x}%` }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: 400,
        opacity: [1, 1, 0],
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        x: (Math.random() - 0.5) * 100,
      }}
      transition={{
        duration: 2,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );
}

export function Celebration({
  show,
  message = "Amazing!",
  subMessage,
  onComplete,
  variant = "confetti",
}: CelebrationProps) {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (show && variant === "confetti") {
      // Generate confetti pieces
      const colors = [
        "hsl(var(--primary))",
        "hsl(var(--accent))",
        "hsl(var(--success))",
        "#fbbf24", // gold
        "#f472b6", // pink
        "#818cf8", // indigo
      ];

      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
      }));

      setConfettiPieces(pieces);

      // Call onComplete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, variant, onComplete]);

  if (!show) return null;

  if (variant === "success") {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle2 className="w-10 h-10 text-success" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-foreground mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {message}
            </motion.h2>
            {subMessage && (
              <motion.p
                className="text-muted-foreground"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {subMessage}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (variant === "sparkle") {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Sparkles className="w-16 h-16 text-accent" />
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-accent rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 8) * 60,
                  y: Math.sin((i * Math.PI * 2) / 8) * 60,
                  opacity: 0,
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Confetti variant (default)
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Confetti pieces */}
        <div className="absolute inset-0">
          {confettiPieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              x={piece.x}
              color={piece.color}
              delay={piece.delay}
            />
          ))}
        </div>

        {/* Center message */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center bg-card/95 backdrop-blur rounded-2xl p-8 shadow-2xl border"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <PartyPopper className="w-12 h-12 text-accent mx-auto mb-3" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-foreground mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.h2>
            {subMessage && (
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {subMessage}
              </motion.p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for easier usage
export function useCelebration() {
  const [celebrationState, setCelebrationState] = useState<{
    show: boolean;
    message?: string;
    subMessage?: string;
    variant?: "confetti" | "success" | "sparkle";
  }>({ show: false });

  const celebrate = (options?: {
    message?: string;
    subMessage?: string;
    variant?: "confetti" | "success" | "sparkle";
  }) => {
    setCelebrationState({
      show: true,
      message: options?.message || "Amazing!",
      subMessage: options?.subMessage,
      variant: options?.variant || "confetti",
    });
  };

  const dismiss = () => {
    setCelebrationState({ show: false });
  };

  return {
    celebrate,
    dismiss,
    celebrationState,
    CelebrationComponent: () => (
      <Celebration
        show={celebrationState.show}
        message={celebrationState.message}
        subMessage={celebrationState.subMessage}
        variant={celebrationState.variant}
        onComplete={dismiss}
      />
    ),
  };
}
