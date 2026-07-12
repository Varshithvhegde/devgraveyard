"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FireflyParticles from "@/components/shared/FireflyParticles";

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030305]">

      {/* Deep background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(88,28,135,0.25),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(139,92,246,0.06),transparent)]" />

      {/* Fireflies */}
      <FireflyParticles count={35} />

      {/* Fog layers */}
      <div className="fog-layer-1 absolute inset-0 pointer-events-none" style={{ zIndex: 2 }} />
      <div className="fog-layer-2 absolute inset-0 pointer-events-none" style={{ zIndex: 2 }} />

      {/* Ground mist line */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[rgba(88,28,135,0.08)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-800/30 to-transparent" />
      </div>

      {/* Hero content */}
      <div className="relative text-center max-w-5xl mx-auto px-6 py-24" style={{ zIndex: 3 }}>

        {/* Coffin — animate in */}
        <div
          className="text-8xl mb-8 select-none animate-float"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.7)",
            transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
            filter: "drop-shadow(0 0 32px rgba(139,92,246,0.6)) drop-shadow(0 0 8px rgba(251,191,36,0.3))",
          }}
        >
          ⚰️
        </div>

        {/* Eyebrow pill */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.15s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s",
          }}
        >
          <span className="inline-flex items-center gap-2 border border-purple-700/50 bg-purple-950/40 text-purple-300 text-xs uppercase tracking-[0.25em] px-5 py-2 rounded-full backdrop-blur-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            A Memorial for Dead Side Projects
          </span>
        </div>

        {/* Main headline — staggered words */}
        <h1 className="font-gothic leading-[1.05] mb-6">
          {["Give Your", "Abandoned Projects", "a Proper"].map((line, i) => (
            <div
              key={i}
              className="block text-5xl sm:text-6xl lg:text-7xl text-bone [text-shadow:0_2px_40px_rgba(0,0,0,1)]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.7s ease ${0.25 + i * 0.1}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.25 + i * 0.1}s`,
              }}
            >
              {line}
            </div>
          ))}
          <div
            className="block text-5xl sm:text-6xl lg:text-7xl"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s ease 0.55s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s",
            }}
          >
            <span className="burial-text relative inline-block">
              Burial
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            </span>
          </div>
        </h1>

        {/* Subheading */}
        <p
          className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.65s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.65s",
          }}
        >
          Every developer has a graveyard of passion projects — started with fire,
          abandoned quietly on a Tuesday.{" "}
          <span className="text-zinc-300">They deserve tombstones.</span>
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.75s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.75s",
          }}
        >
          <Link
            href="/bury"
            className="group relative px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 text-lg overflow-hidden"
            style={{ boxShadow: "0 0 32px rgba(139,92,246,0.35), 0 4px 16px rgba(0,0,0,0.5)" }}
          >
            <span className="relative z-10 flex items-center gap-2">
              ⚰️ Bury a Project
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }} />
          </Link>
          <Link
            href="/graveyard"
            className="px-8 py-4 border border-zinc-700 hover:border-purple-700/60 text-zinc-300 hover:text-white font-semibold rounded-xl transition-all duration-300 hover:bg-purple-950/20 text-lg backdrop-blur-sm"
          >
            Browse the Graveyard →
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="flex items-center justify-center gap-10"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease 0.9s",
          }}
        >
          {[
            { icon: "⚰️", label: "Projects Buried", color: "text-purple-400" },
            { icon: "🕯️", label: "Candles Lit", color: "text-amber-400" },
            { icon: "↑", label: "Resurrections Voted", color: "text-emerald-400" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={`${s.color} text-base`}>{s.icon}</span>
              <span className="text-zinc-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030305] to-transparent" style={{ zIndex: 3 }} />

      {/* Subtle scroll hint */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{
          zIndex: 4,
          opacity: visible ? 0.4 : 0,
          transition: "opacity 1s ease 1.2s",
        }}
      >
        <span className="text-zinc-600 text-xs uppercase tracking-widest">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
      </div>
    </section>
  );
}
