"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { RipMessage } from "@/types/tombstone";

interface RipMessageFormProps {
  tombstoneId: string;
  onMessage: (msg: RipMessage) => void;
}

const MAX = 280;
const PLACEHOLDERS = [
  "It had so much promise...",
  "Gone too soon. RIP.",
  "I remember when this was just a napkin idea.",
  "You worked on localhost. That was enough.",
  "The README was beautiful. Truly.",
  "Died doing what it loved: being almost finished.",
];

export default function RipMessageForm({ tombstoneId, onMessage }: RipMessageFormProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const placeholder = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
  const remaining = MAX - message.length;
  const pct = (message.length / MAX) * 100;

  const submit = async () => {
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/rip-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tombstone_id: tombstoneId, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) toast.error("Sign in to leave a condolence");
        else throw new Error(data.error);
        return;
      }
      onMessage(data.message);
      setMessage("");
      toast.success("Condolence left 🕯️");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
  };

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${focused ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)"}`,
        boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.08)" : "none",
      }}
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-transparent px-4 pt-4 pb-2 text-zinc-300 placeholder:text-zinc-700 text-sm resize-none outline-none leading-relaxed"
      />

      <div className="flex items-center justify-between px-4 pb-3 pt-1 gap-3">
        {/* Progress ring + char count */}
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
            <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>
            <motion.circle
              cx="10" cy="10" r="8" fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 8}`}
              animate={{
                strokeDashoffset: 2 * Math.PI * 8 * (1 - pct / 100),
                stroke: remaining < 20 ? "#f87171" : remaining < 50 ? "#fbbf24" : "rgba(139,92,246,0.8)",
              }}
              transition={{ duration: 0.2 }}
            />
          </svg>
          <AnimatePresence>
            {remaining < 50 && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className={`text-xs font-mono ${remaining < 20 ? "text-red-400" : "text-amber-400"}`}
              >
                {remaining}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="text-zinc-700 text-[11px]">⌘↵ to submit</span>
        </div>

        <motion.button
          onClick={submit}
          disabled={submitting || !message.trim()}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: message.trim() ? "rgba(139,92,246,0.8)" : "rgba(63,63,70,0.5)",
            color: message.trim() ? "#fff" : "rgba(113,113,122,0.6)",
            cursor: message.trim() ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-3.5 h-3.5 border border-t-white border-purple-400 rounded-full block"
            />
          ) : (
            <>
              <span>🕯️</span>
              <span>Pay Respects</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
