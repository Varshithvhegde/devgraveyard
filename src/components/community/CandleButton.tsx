"use client";

import { useState } from "react";
import CandleFlicker from "@/components/shared/CandleFlicker";
import { toast } from "sonner";

interface CandleButtonProps {
  tombstoneId: string;
  initialCount: number;
  initialLit: boolean;
}

export default function CandleButton({
  tombstoneId,
  initialCount,
  initialLit,
}: CandleButtonProps) {
  const [lit, setLit] = useState(initialLit);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const wasLit = lit;
    setLit(!wasLit);
    setCount((c) => (wasLit ? c - 1 : c + 1));

    try {
      const res = await fetch("/api/candles", {
        method: wasLit ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tombstone_id: tombstoneId }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Sign in to light a candle");
        }
        setLit(wasLit);
        setCount((c) => (wasLit ? c + 1 : c - 1));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
        lit
          ? "border-amber-500/50 bg-amber-950/30 text-amber-400"
          : "border-zinc-700 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400"
      }`}
      title={lit ? "Snuff the candle" : "Light a candle"}
    >
      <CandleFlicker lit={lit} size={20} />
      <span className="font-mono text-sm">{count}</span>
      <span className="text-xs hidden sm:block">
        {lit ? "candle lit" : "light a candle"}
      </span>
    </button>
  );
}
