"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RESURRECTION_THRESHOLD } from "@/lib/constants";
import { toast } from "sonner";

interface ResurrectVoteButtonProps {
  tombstoneId: string;
  initialCount: number;
  initialVoted: boolean;
}

export default function ResurrectVoteButton({ tombstoneId, initialCount, initialVoted }: ResurrectVoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const percentage = Math.min((count / RESURRECTION_THRESHOLD) * 100, 100);
  const isResurrected = percentage >= 100;

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const wasVoted = voted;
    setVoted(!wasVoted);
    setCount((c) => (wasVoted ? c - 1 : c + 1));

    try {
      const res = await fetch("/api/resurrect", {
        method: wasVoted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tombstone_id: tombstoneId }),
      });
      if (!res.ok) {
        if (res.status === 401) toast.error("Sign in to vote");
        setVoted(wasVoted);
        setCount((c) => (wasVoted ? c + 1 : c - 1));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.button
        onClick={toggle}
        disabled={loading}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border transition-colors"
        style={{
          borderColor: voted ? "rgba(52,211,153,0.45)" : "rgba(63,63,70,0.8)",
          background: voted ? "rgba(6,78,59,0.2)" : "rgba(24,24,32,0.6)",
          color: voted ? "rgba(52,211,153,0.9)" : "rgba(113,113,122,0.8)",
        }}
      >
        <motion.span
          animate={voted ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="text-base"
        >
          ↑
        </motion.span>

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
          {voted ? "voted to resurrect" : "vote to resurrect"}
        </span>
      </motion.button>

      {/* Animated progress bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: isResurrected
                ? "linear-gradient(90deg, #34d399, #6ee7b7)"
                : "linear-gradient(90deg, rgba(139,92,246,0.6), rgba(139,92,246,0.9))",
              boxShadow: voted ? "0 0 8px rgba(139,92,246,0.5)" : "none",
            }}
          />
        </div>
        <p className="text-zinc-600 text-xs font-mono">
          {count}/{RESURRECTION_THRESHOLD} votes to resurrect
          {isResurrected && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-2 text-emerald-400"
            >
              🌱 Ready!
            </motion.span>
          )}
        </p>
      </div>
    </div>
  );
}
