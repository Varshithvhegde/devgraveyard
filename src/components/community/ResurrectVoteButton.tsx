"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { RESURRECTION_THRESHOLD } from "@/lib/constants";
import { toast } from "sonner";

interface ResurrectVoteButtonProps {
  tombstoneId: string;
  initialCount: number;
  initialVoted: boolean;
}

export default function ResurrectVoteButton({
  tombstoneId,
  initialCount,
  initialVoted,
}: ResurrectVoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const percentage = Math.min((count / RESURRECTION_THRESHOLD) * 100, 100);

  const toggle = async () => {
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
    <div className="space-y-2">
      <button
        onClick={toggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
          voted
            ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-400"
            : "border-zinc-700 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400"
        }`}
      >
        <span>↑</span>
        <span className="font-mono text-sm">{count}</span>
        <span className="text-xs hidden sm:block">
          {voted ? "voted to resurrect" : "vote to resurrect"}
        </span>
      </button>
      <div className="space-y-1">
        <Progress value={percentage} className="h-1.5 bg-zinc-800" />
        <p className="text-zinc-600 text-xs font-mono">
          {count}/{RESURRECTION_THRESHOLD} votes to resurrect
        </p>
      </div>
    </div>
  );
}
