"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { TombstoneWithStats } from "@/types/tombstone";
import { topLanguages } from "@/lib/utils";
import { ageString } from "@/lib/github/analyze";
import LanguageBadge from "@/components/shared/LanguageBadge";
import CandleFlicker from "@/components/shared/CandleFlicker";

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

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
      className="tombstone-card group relative flex flex-col cursor-pointer"
      style={{
        borderRadius: "50% 50% 6px 6px / 52px 52px 6px 6px",
        background: "linear-gradient(170deg, #1c1c26 0%, #12121a 50%, #0a0a12 100%)",
        border: "1px solid rgba(139,92,246,0.1)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Hover candlelight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          borderRadius: "inherit",
          background: "radial-gradient(ellipse 90% 70% at 50% 110%, rgba(251,191,36,0.07), transparent 65%), radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.1), transparent)",
        }}
      />

      {/* Top edge glow */}
      <motion.div
        className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
        initial={{ opacity: 0, scaleX: 0 }}
        whileHover={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.4 }}
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8) 30%, rgba(251,191,36,0.6) 50%, rgba(139,92,246,0.8) 70%, transparent)" }}
      />

      {/* Stone texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          borderRadius: "inherit",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "100px",
        }}
      />

      <div className="relative z-10 px-6 pt-7 pb-4 flex flex-col gap-3 flex-1">

        {/* Cross */}
        <div className="text-center">
          <svg className="mx-auto mb-1.5" width="14" height="20" viewBox="0 0 14 20" fill="none">
            <rect x="6" y="0" width="2" height="20" rx="1" fill="rgba(255,255,255,0.1)"/>
            <rect x="0" y="6" width="14" height="2" rx="1" fill="rgba(255,255,255,0.1)"/>
          </svg>
          <span className="text-[9px] font-mono tracking-[0.4em] text-zinc-700 uppercase">R.I.P.</span>
        </div>

        {/* Name */}
        <div className="text-center mt-0.5">
          <h3 className="font-gothic text-xl font-bold text-[#f5f0e8] leading-tight tracking-wide"
            style={{ textShadow: "0 1px 16px rgba(0,0,0,0.9)" }}>
            {tombstone.repo_name}
          </h3>
          {tombstone.github_username && (
            <p className="text-zinc-700 text-[11px] mt-1 font-mono">@{tombstone.github_username}</p>
          )}
        </div>

        {/* Dates */}
        <div className="text-center">
          <span className="font-mono text-sm text-zinc-400 tracking-widest">{bornYear} — {diedYear}</span>
          <p className="text-zinc-600 text-[11px] mt-0.5 italic">({age})</p>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-2 my-0.5">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.25))" }} />
          <span className="text-zinc-700 text-[10px]">✦</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(270deg, transparent, rgba(139,92,246,0.25))" }} />
        </div>

        {/* Cause */}
        <div className="text-center">
          <span className="text-[9px] text-zinc-700 uppercase tracking-[0.2em]">Cause of Death</span>
          <p className="text-[13px] font-medium mt-1 italic" style={{ color: "rgba(167,139,250,0.9)" }}>
            &ldquo;{tombstone.cause_of_death}&rdquo;
          </p>
        </div>

        {/* Last words */}
        {tombstone.last_words && (
          <div className="text-center">
            <span className="text-[9px] text-zinc-700 uppercase tracking-[0.2em]">Last Words</span>
            <p className="text-zinc-600 text-[11px] mt-1 font-mono italic line-clamp-2">
              &ldquo;{tombstone.last_words}&rdquo;
            </p>
          </div>
        )}

        {/* Epitaph */}
        {tombstone.epitaph && (
          <div className="px-3 py-2.5 rounded text-center"
            style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.04)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
            <p className="text-zinc-400 text-[13px] italic font-gothic leading-relaxed">{tombstone.epitaph}</p>
          </div>
        )}

        {/* Languages */}
        {langs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-0.5">
            {langs.map((lang) => <LanguageBadge key={lang} language={lang} small />)}
          </div>
        )}

        {/* Stats chips */}
        {(tombstone.peak_streak_days > 1 || tombstone.most_commits_one_day > 1) && (
          <div className="grid grid-cols-2 gap-2">
            {tombstone.peak_streak_days > 1 && (
              <div className="text-center py-2 rounded" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                <div className="text-purple-400 text-base font-bold font-mono">{tombstone.peak_streak_days}d</div>
                <div className="text-zinc-700 text-[9px] uppercase tracking-wider mt-0.5">Streak</div>
              </div>
            )}
            {tombstone.most_commits_one_day > 1 && (
              <div className="text-center py-2 rounded" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                <div className="text-purple-400 text-base font-bold font-mono">{tombstone.most_commits_one_day}</div>
                <div className="text-zinc-700 text-[9px] uppercase tracking-wider mt-0.5">Best Day</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Base slab */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3 mt-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.5))" }}>
        <div className="flex items-center gap-1.5">
          <CandleFlicker size={14} />
          <span className="text-amber-400/70 text-xs font-mono">{tombstone.candle_count}</span>
        </div>
        <span className="text-zinc-700 text-[10px] font-mono">{tombstone.commits_count} commits</span>
        <div className="flex items-center gap-1">
          <span className="text-emerald-500/60 text-xs">↑</span>
          <span className="text-zinc-600 text-xs font-mono">{tombstone.resurrection_votes}</span>
        </div>
      </div>
    </motion.div>
  );

  if (!interactive) return <div>{card}</div>;

  return (
    <Link href={`/tombstone/${tombstone.id}`} className="block focus:outline-none">
      {card}
    </Link>
  );
}
