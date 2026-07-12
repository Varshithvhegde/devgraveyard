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
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), { stiffness: 180, damping: 28 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-7, 7]), { stiffness: 180, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top) / r.height);
  };

  const handleMouseLeave = () => { mouseX.set(0.5); mouseY.set(0.5); };

  const card = (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative select-none"
      style={{ perspective: "900px" }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Outer drop shadow */}
        <div
          className="absolute inset-x-4 bottom-0 h-8 opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-90"
          style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.4), rgba(0,0,0,0.6))" }}
        />

        {/* Stone body */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: "48% 48% 8px 8px / 56px 56px 8px 8px",
            background: "linear-gradient(175deg, #32304a 0%, #252338 25%, #1c1b2e 55%, #141320 100%)",
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.08),
              inset -3px 0 12px rgba(0,0,0,0.4),
              inset 3px 0 6px rgba(255,255,255,0.02),
              0 24px 48px rgba(0,0,0,0.7),
              0 2px 0 rgba(139,92,246,0.15)
            `,
          }}
        >
          {/* Subtle noise grain */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px",
              mixBlendMode: "overlay",
            }}
          />

          {/* Top arch highlight — catches the light */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              height: "56%",
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.05), transparent)",
            }}
          />

          {/* Hover: warm candlelight from below */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: "radial-gradient(ellipse 100% 60% at 50% 110%, rgba(251,191,36,0.09), transparent 60%)",
            }}
          />

          {/* Hover: purple shimmer on arch */}
          <div
            className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.7), transparent)" }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-6 pt-8 pb-5 gap-3">

            {/* Cross */}
            <div className="flex flex-col items-center gap-1.5">
              <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
                <rect x="7" y="0" width="2" height="22" rx="1" fill="rgba(255,255,255,0.35)"/>
                <rect x="0" y="7" width="16" height="2" rx="1" fill="rgba(255,255,255,0.35)"/>
              </svg>
              <span className="text-[9px] font-mono tracking-[0.45em] text-white/40 uppercase">R.I.P.</span>
            </div>

            {/* Project name */}
            <div className="text-center mt-1">
              <h3
                className="font-gothic font-bold tracking-wide leading-tight"
                style={{
                  fontSize: "clamp(16px, 4vw, 22px)",
                  color: "#e8e4f8",
                  textShadow: "0 0 24px rgba(167,139,250,0.4), 0 2px 8px rgba(0,0,0,0.8)",
                }}
              >
                {tombstone.repo_name}
              </h3>
              {tombstone.github_username && (
                <p className="text-white/30 text-[11px] mt-1 font-mono">
                  @{tombstone.github_username}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="text-center">
              <div className="font-mono text-sm text-white/55 tracking-widest">
                {bornYear} — {diedYear}
              </div>
              <div className="text-[11px] mt-0.5 italic text-white/30">({age})</div>
            </div>

            {/* Ornamental rule */}
            <div className="w-full flex items-center gap-2 px-2">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12))" }} />
              <span className="text-white/20 text-[9px]">✦</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(270deg, transparent, rgba(255,255,255,0.12))" }} />
            </div>

            {/* Cause of death */}
            <div className="text-center px-2">
              <div className="text-[9px] text-white/30 uppercase tracking-[0.25em] mb-1">Cause of Death</div>
              <p
                className="text-sm font-medium italic leading-snug"
                style={{ color: "#c4b0ff", textShadow: "0 0 16px rgba(139,92,246,0.5)" }}
              >
                &ldquo;{tombstone.cause_of_death}&rdquo;
              </p>
            </div>

            {/* Last words */}
            {tombstone.last_words && (
              <div className="text-center px-2">
                <div className="text-[9px] text-white/25 uppercase tracking-[0.25em] mb-1">Last Words</div>
                <p className="text-[11px] italic font-mono text-white/40 line-clamp-2 leading-relaxed">
                  &ldquo;{tombstone.last_words}&rdquo;
                </p>
              </div>
            )}

            {/* Epitaph */}
            {tombstone.epitaph && (
              <div
                className="w-full px-3 py-2.5 rounded text-center"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)",
                }}
              >
                <p className="text-sm italic font-gothic text-white/50 leading-relaxed">
                  {tombstone.epitaph}
                </p>
              </div>
            )}

            {/* Languages */}
            {langs.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {langs.map((lang) => <LanguageBadge key={lang} language={lang} small />)}
              </div>
            )}

            {/* Stat chips */}
            {(tombstone.peak_streak_days > 1 || tombstone.most_commits_one_day > 1) && (
              <div className="grid grid-cols-2 gap-2 w-full">
                {tombstone.peak_streak_days > 1 && (
                  <div
                    className="text-center py-2 rounded"
                    style={{
                      background: "rgba(139,92,246,0.1)",
                      border: "1px solid rgba(139,92,246,0.2)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="text-purple-300 font-bold font-mono text-sm" style={{ textShadow: "0 0 12px rgba(167,139,250,0.6)" }}>
                      {tombstone.peak_streak_days}d
                    </div>
                    <div className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">Streak</div>
                  </div>
                )}
                {tombstone.most_commits_one_day > 1 && (
                  <div
                    className="text-center py-2 rounded"
                    style={{
                      background: "rgba(139,92,246,0.1)",
                      border: "1px solid rgba(139,92,246,0.2)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="text-purple-300 font-bold font-mono text-sm" style={{ textShadow: "0 0 12px rgba(167,139,250,0.6)" }}>
                      {tombstone.most_commits_one_day}
                    </div>
                    <div className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">Best Day</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Base bar */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400/70 text-xs">🕯️</span>
              <span className="text-amber-400/70 text-xs font-mono">{tombstone.candle_count}</span>
            </div>
            <span className="text-white/20 text-[10px] font-mono">{tombstone.commits_count} commits</span>
            <div className="flex items-center gap-1">
              <span className="text-emerald-400/60 text-xs">↑</span>
              <span className="text-white/25 text-[10px] font-mono">{tombstone.resurrection_votes}</span>
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
