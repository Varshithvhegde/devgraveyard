"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import CandleFlicker from "@/components/shared/CandleFlicker";
import { toast } from "sonner";

interface CandleButtonProps {
  tombstoneId: string;
  initialCount: number;
  initialLit: boolean;
}

export default function CandleButton({ tombstoneId, initialCount, initialLit }: CandleButtonProps) {
  const [lit, setLit] = useState(initialLit);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [burst, setBurst] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const wasLit = lit;
    setLit(!wasLit);
    setCount((c) => (wasLit ? c - 1 : c + 1));
    if (!wasLit) setBurst(true);

    try {
      const res = await fetch("/api/candles", {
        method: wasLit ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tombstone_id: tombstoneId }),
      });
      if (!res.ok) {
        if (res.status === 401) toast.error("Sign in to light a candle");
        setLit(wasLit);
        setCount((c) => (wasLit ? c + 1 : c - 1));
      }
    } finally {
      setLoading(false);
      setTimeout(() => setBurst(false), 600);
    }
  };

  return (
    <motion.button
      onClick={toggle}
      disabled={loading}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl border transition-colors"
      style={{
        borderColor: lit ? "rgba(251,191,36,0.45)" : "rgba(63,63,70,0.8)",
        background: lit ? "rgba(120,53,15,0.2)" : "rgba(24,24,32,0.6)",
        color: lit ? "rgba(251,191,36,0.95)" : "rgba(113,113,122,0.8)",
      }}
    >
      {/* Particle burst */}
      <AnimatePresence>
        {burst && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 4, height: 4,
                  background: i % 2 === 0 ? "#fbbf24" : "#a78bfa",
                  top: "50%", left: "50%",
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.2, 0],
                  x: Math.cos((i * 60 * Math.PI) / 180) * 28,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 28,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.div
        animate={lit ? { rotate: [0, -8, 8, -5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <CandleFlicker lit={lit} size={20} />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="font-mono text-sm w-5 text-center"
        >
          {count}
        </motion.span>
      </AnimatePresence>

      <span className="text-xs hidden sm:block">
        {lit ? "candle lit" : "light a candle"}
      </span>
    </motion.button>
  );
}
