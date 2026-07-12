"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { useRef } from "react";
import { TombstoneWithStats } from "@/types/tombstone";
import { topLanguages } from "@/lib/utils";
import { ageString } from "@/lib/github/analyze";
import LanguageBadge from "@/components/shared/LanguageBadge";

interface TombstoneCardProps {
  tombstone: TombstoneWithStats;
  interactive?: boolean;
  index?: number;
}

function TombstoneShape({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 220 300" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <defs>
        <clipPath id="tombstone-clip">
          <path d="M20,110 Q20,20 110,20 Q200,20 200,110 L200,275 Q200,285 190,285 L30,285 Q20,285 20,275 Z" />
        </clipPath>
        {/* Stone base gradient */}
        <linearGradient id="stone-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a2835" />
          <stop offset="30%" stopColor="#1e1c28" />
          <stop offset="70%" stopColor="#181620" />
          <stop offset="100%" stopColor="#0f0e16" />
        </linearGradient>
        {/* Left edge highlight — 3D light */}
        <linearGradient id="stone-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        {/* Top arch highlight */}
        <radialGradient id="stone-top" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        {/* Noise texture filter */}
        <filter id="stone-texture" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
          <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blend"/>
          <feComposite in="blend" in2="SourceGraphic" operator="in"/>
        </filter>
        {/* Moss gradient at base */}
        <linearGradient id="moss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,197,94,0)" />
          <stop offset="100%" stopColor="rgba(34,197,94,0.06)" />
        </linearGradient>
        {/* Candlelight glow */}
        <radialGradient id="candle-glow" cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.12)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </radialGradient>
        <radialGradient id="purple-glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.08)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </radialGradient>
      </defs>

      {/* Shadow/depth — right and bottom offset shape */}
      <path
        d="M23,113 Q23,23 113,23 Q203,23 203,113 L203,278 Q203,288 193,288 L33,288 Q23,288 23,278 Z"
        fill="rgba(0,0,0,0.6)"
      />

      {/* Main stone face */}
      <path
        d="M20,110 Q20,20 110,20 Q200,20 200,110 L200,275 Q200,285 190,285 L30,285 Q20,285 20,275 Z"
        fill="url(#stone-face)"
      />

      {/* Noise texture overlay */}
      <path
        d="M20,110 Q20,20 110,20 Q200,20 200,110 L200,275 Q200,285 190,285 L30,285 Q20,285 20,275 Z"
        fill="url(#stone-face)"
        filter="url(#stone-texture)"
        opacity="0.3"
      />

      {/* Left edge highlight — 3D */}
      <path
        d="M20,110 Q20,20 110,20 Q200,20 200,110 L200,275 Q200,285 190,285 L30,285 Q20,285 20,275 Z"
        fill="url(#stone-left)"
      />

      {/* Top arch light */}
      <path
        d="M20,110 Q20,20 110,20 Q200,20 200,110 L200,275 Q200,285 190,285 L30,285 Q20,285 20,275 Z"
        fill="url(#stone-top)"
      />

      {/* Purple ambient */}
      <path
        d="M20,110 Q20,20 110,20 Q200,20 200,110 L200,275 Q200,285 190,285 L30,285 Q20,285 20,275 Z"
        fill="url(#purple-glow)"
        className="candle-ambient"
      />

      {/* Candlelight glow overlay (visible on hover) */}
      <path
        d="M20,110 Q20,20 110,20 Q200,20 200,110 L200,275 Q200,285 190,285 L30,285 Q20,285 20,275 Z"
        fill="url(#candle-glow)"
        className="tombstone-candle-glow"
        opacity="0"
      />

      {/* Moss at base */}
      <path
        d="M20,240 L200,240 L200,275 Q200,285 190,285 L30,285 Q20,285 20,275 Z"
        fill="url(#moss)"
      />

      {/* Outline/border */}
      <path
        d="M20,110 Q20,20 110,20 Q200,20 200,110 L200,275 Q200,285 190,285 L30,285 Q20,285 20,275 Z"
        fill="none"
        stroke="rgba(139,92,246,0.12)"
        strokeWidth="1"
      />

      {/* Top arch highlight line — 3D edge */}
      <path
        d="M21,109 Q21,21 110,21 Q199,21 199,109"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="tombstone-arch-highlight"
      />

      {/* Subtle crack */}
      <path
        d="M95,180 L98,195 L94,210 L97,225"
        fill="none"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      {children}
    </svg>
  );
}

export default function TombstoneCard({
  tombstone,
  interactive = true,
  index = 0,
}: TombstoneCardProps) {
  const age = ageString(tombstone.born_at, tombstone.died_at);
  const langs = topLanguages(tombstone.languages ?? {}, 3);
  const bornYear = new Date(tombstone.born_at).getFullYear();
  const diedYear = new Date(tombstone.died_at).getFullYear();

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 200, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const card = (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 48, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative select-none"
      style={{ perspective: "900px", cursor: interactive ? "pointer" : "default" }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full"
      >
        {/* Outer glow on hover */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-2xl"
          style={{
            background: "radial-gradient(ellipse 70% 40% at 50% 90%, rgba(251,191,36,0.08), transparent), radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.06), transparent)",
            transform: "translateZ(-1px)",
          }}
        />

        {/* The tombstone itself — aspect ratio container */}
        <div className="relative w-full" style={{ paddingBottom: "136%" }}>
          <div className="absolute inset-0">
            {/* SVG stone shape */}
            <TombstoneShape>
              <></>
            </TombstoneShape>

            {/* Content layer on top of SVG */}
            <div className="absolute inset-0 flex flex-col items-center px-5 pt-8 pb-6 gap-2">

              {/* Cross engraving */}
              <div className="flex flex-col items-center mb-1">
                <svg width="18" height="26" viewBox="0 0 18 26" fill="none">
                  <rect x="8" y="0" width="2" height="26" rx="1"
                    fill="rgba(0,0,0,0.5)"
                    style={{ filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.06))" }}
                  />
                  <rect x="0" y="8" width="18" height="2" rx="1"
                    fill="rgba(0,0,0,0.5)"
                    style={{ filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.06))" }}
                  />
                </svg>
                <div
                  className="text-[9px] font-mono tracking-[0.4em] mt-1.5 uppercase"
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    textShadow: "0 1px 0 rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  R.I.P.
                </div>
              </div>

              {/* Project name — chiseled */}
              <div className="text-center mt-1 px-2">
                <h3
                  className="font-gothic font-bold leading-tight tracking-wide"
                  style={{
                    fontSize: "clamp(14px, 3.5vw, 19px)",
                    color: "rgba(245,240,232,0.88)",
                    textShadow:
                      "1px 1px 3px rgba(0,0,0,0.9), -1px -1px 1px rgba(255,255,255,0.04), 0 0 20px rgba(139,92,246,0.15)",
                  }}
                >
                  {tombstone.repo_name}
                </h3>
                {tombstone.github_username && (
                  <p
                    className="text-[10px] mt-0.5 font-mono"
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                    }}
                  >
                    @{tombstone.github_username}
                  </p>
                )}
              </div>

              {/* Dates — engraved */}
              <div className="text-center">
                <div
                  className="font-mono text-xs tracking-widest"
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {bornYear} — {diedYear}
                </div>
                <div
                  className="text-[10px] mt-0.5 italic"
                  style={{ color: "rgba(255,255,255,0.15)", textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                >
                  ({age})
                </div>
              </div>

              {/* Engraved horizontal rule */}
              <div className="w-full flex items-center gap-2 px-4 my-0.5">
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.6) 60%, transparent)" }} />
                <div style={{ color: "rgba(255,255,255,0.12)", fontSize: 8 }}>✦</div>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.6) 60%, transparent)" }} />
              </div>
              {/* Highlight on the rule for 3D engraved look */}
              <div className="w-full flex items-center gap-2 px-4 -mt-2.5">
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.05) 60%, transparent)" }} />
                <div style={{ color: "transparent", fontSize: 8 }}>✦</div>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.05) 60%, transparent)" }} />
              </div>

              {/* Cause of death */}
              <div className="text-center px-3">
                <div
                  className="text-[8px] uppercase tracking-[0.25em] mb-1"
                  style={{ color: "rgba(255,255,255,0.18)", textShadow: "1px 1px 1px rgba(0,0,0,0.8)" }}
                >
                  Cause of Death
                </div>
                <p
                  className="text-[12px] italic font-medium leading-snug"
                  style={{
                    color: "rgba(192,168,255,0.85)",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.9), 0 0 16px rgba(139,92,246,0.3)",
                  }}
                >
                  &ldquo;{tombstone.cause_of_death}&rdquo;
                </p>
              </div>

              {/* Last words */}
              {tombstone.last_words && (
                <div className="text-center px-3">
                  <div
                    className="text-[8px] uppercase tracking-[0.25em] mb-1"
                    style={{ color: "rgba(255,255,255,0.15)", textShadow: "1px 1px 1px rgba(0,0,0,0.8)" }}
                  >
                    Last Words
                  </div>
                  <p
                    className="text-[10px] italic font-mono line-clamp-2 leading-relaxed"
                    style={{
                      color: "rgba(255,255,255,0.22)",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.9)",
                    }}
                  >
                    &ldquo;{tombstone.last_words}&rdquo;
                  </p>
                </div>
              )}

              {/* Epitaph — recessed panel */}
              {tombstone.epitaph && (
                <div
                  className="w-full mx-3 px-3 py-2.5 rounded text-center"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.04)",
                    border: "1px solid rgba(0,0,0,0.4)",
                  }}
                >
                  <p
                    className="text-[11px] italic font-gothic leading-relaxed"
                    style={{
                      color: "rgba(255,255,255,0.28)",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                    }}
                  >
                    {tombstone.epitaph}
                  </p>
                </div>
              )}

              {/* Languages */}
              {langs.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-0.5">
                  {langs.map((lang) => <LanguageBadge key={lang} language={lang} small />)}
                </div>
              )}

              {/* Stats chips */}
              {(tombstone.peak_streak_days > 1 || tombstone.most_commits_one_day > 1) && (
                <div className="grid grid-cols-2 gap-1.5 w-full px-1 mt-0.5">
                  {tombstone.peak_streak_days > 1 && (
                    <div
                      className="text-center py-1.5 rounded"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      <div className="text-purple-400/80 text-sm font-bold font-mono" style={{ textShadow: "0 0 10px rgba(139,92,246,0.4)" }}>
                        {tombstone.peak_streak_days}d
                      </div>
                      <div className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.15)" }}>Streak</div>
                    </div>
                  )}
                  {tombstone.most_commits_one_day > 1 && (
                    <div
                      className="text-center py-1.5 rounded"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      <div className="text-purple-400/80 text-sm font-bold font-mono" style={{ textShadow: "0 0 10px rgba(139,92,246,0.4)" }}>
                        {tombstone.most_commits_one_day}
                      </div>
                      <div className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.15)" }}>Best Day</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Base slab — below the stone */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-2.5"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
                borderTop: "1px solid rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400/60 text-xs">🕯️</span>
                <span className="text-amber-400/60 text-xs font-mono">{tombstone.candle_count}</span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                {tombstone.commits_count} commits
              </span>
              <div className="flex items-center gap-1">
                <span style={{ color: "rgba(52,211,153,0.5)" }} className="text-xs">↑</span>
                <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                  {tombstone.resurrection_votes}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (!interactive) return <div>{card}</div>;
  return (
    <Link href={`/tombstone/${tombstone.id}`} className="block focus:outline-none">
      {card}
    </Link>
  );
}
