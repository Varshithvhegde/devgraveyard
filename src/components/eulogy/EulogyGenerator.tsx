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

  if (!isOwner || existingEulogy) return null;

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
      toast.success("Eulogy written 🖤");
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
      className="group w-full py-4 rounded-xl border text-sm font-medium transition-all duration-300 relative overflow-hidden"
      style={{
        borderColor: loading ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.2)",
        background: "rgba(88,28,135,0.06)",
        color: "rgba(167,139,250,0.8)",
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.12), transparent)" }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border border-purple-400/50 border-t-purple-400 rounded-full animate-spin" />
            <span>Writing the final words...</span>
          </>
        ) : (
          <>
            <span>✍️</span>
            <span>Generate AI Eulogy</span>
            <span className="text-zinc-600 text-xs ml-1">(Gemini writes a breakup letter)</span>
          </>
        )}
      </span>
    </button>
  );
}
