"use client";

import { useState } from "react";
import { toast } from "sonner";

interface EulogyGeneratorProps {
  tombstoneId: string;
  isOwner: boolean;
  existingEulogy: string | null;
  onGenerated: (eulogy: string) => void;
}

export default function EulogyGenerator({
  tombstoneId,
  isOwner,
  existingEulogy,
  onGenerated,
}: EulogyGeneratorProps) {
  const [loading, setLoading] = useState(false);

  if (!isOwner) return null;
  if (existingEulogy) return null;

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/eulogy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tombstone_id: tombstoneId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onGenerated(data.eulogy);
      toast.success("Eulogy generated 🖤");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate eulogy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generate}
      disabled={loading}
      className="w-full py-3 border border-zinc-700 hover:border-purple-700 text-zinc-400 hover:text-purple-300 text-sm font-medium rounded-lg transition-all bg-zinc-900/50 hover:bg-purple-950/20"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin">⏳</span> Writing the eulogy...
        </span>
      ) : (
        "✍️ Generate AI Eulogy (Breakup Letter)"
      )}
    </button>
  );
}
