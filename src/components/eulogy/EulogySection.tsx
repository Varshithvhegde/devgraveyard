"use client";

import { useEffect, useState } from "react";

interface EulogySectionProps {
  eulogy: string;
  animate?: boolean;
}

export default function EulogySection({ eulogy, animate = false }: EulogySectionProps) {
  const [displayed, setDisplayed] = useState(animate ? "" : eulogy);

  useEffect(() => {
    if (!animate) { setDisplayed(eulogy); return; }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(eulogy.slice(0, i));
      if (i >= eulogy.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [eulogy, animate]);

  return (
    <div
      className="relative overflow-hidden rounded-xl eulogy-reveal"
      style={{
        background: "linear-gradient(160deg, rgba(20,16,32,0.9), rgba(10,8,18,0.95))",
        border: "1px solid rgba(139,92,246,0.15)",
        boxShadow: "0 0 60px rgba(88,28,135,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Corner ornaments */}
      {[
        "top-3 left-3 border-t border-l",
        "top-3 right-3 border-t border-r",
        "bottom-3 left-3 border-b border-l",
        "bottom-3 right-3 border-b border-r",
      ].map((cls) => (
        <div
          key={cls}
          className={`absolute ${cls} w-5 h-5 border-purple-800/40`}
        />
      ))}

      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-700/50 to-transparent" />

      <div className="relative p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-700/40" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Eulogy</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-700/40" />
          </div>
        </div>

        <div
          className="font-gothic text-zinc-300 text-base leading-relaxed whitespace-pre-wrap italic"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
        >
          {displayed}
          {animate && displayed.length < eulogy.length && (
            <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
