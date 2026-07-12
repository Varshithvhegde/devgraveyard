import Link from "next/link";
import { TombstoneWithStats } from "@/types/tombstone";
import { topLanguages } from "@/lib/utils";
import { ageString } from "@/lib/github/analyze";
import LanguageBadge from "@/components/shared/LanguageBadge";
import CandleFlicker from "@/components/shared/CandleFlicker";

interface TombstoneCardProps {
  tombstone: TombstoneWithStats;
  interactive?: boolean;
}

export default function TombstoneCard({
  tombstone,
  interactive = true,
}: TombstoneCardProps) {
  const age = ageString(tombstone.born_at, tombstone.died_at);
  const langs = topLanguages(tombstone.languages ?? {}, 3);
  const bornYear = new Date(tombstone.born_at).getFullYear();
  const diedYear = new Date(tombstone.died_at).getFullYear();

  const card = (
    <div className="tombstone-card group relative flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-2"
      style={{
        borderRadius: "50% 50% 6px 6px / 48px 48px 6px 6px",
        background: "linear-gradient(170deg, #1c1c24 0%, #111118 40%, #0a0a0f 100%)",
        border: "1px solid rgba(139,92,246,0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03) inset",
      }}
    >
      {/* Candlelight hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 120%, rgba(251,191,36,0.06), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.12), transparent)",
          borderRadius: "inherit",
        }}
      />

      {/* Top arch glow line */}
      <div
        className="absolute top-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.7) 30%, rgba(251,191,36,0.5) 50%, rgba(139,92,246,0.7) 70%, transparent)",
        }}
      />

      {/* Stone texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative z-10 p-6 flex flex-col gap-3 flex-1">

        {/* Cross engraving */}
        <div className="text-center pt-1">
          <svg className="mx-auto mb-1" width="16" height="22" viewBox="0 0 16 22" fill="none">
            <rect x="7" y="0" width="2" height="22" rx="1" fill="rgba(255,255,255,0.12)" />
            <rect x="0" y="7" width="16" height="2" rx="1" fill="rgba(255,255,255,0.12)" />
          </svg>
          <div className="text-[10px] font-mono tracking-[0.35em] text-zinc-600 uppercase">R.I.P.</div>
        </div>

        {/* Project name */}
        <div className="text-center mt-1">
          <h3
            className="font-gothic text-xl font-bold leading-tight tracking-wide"
            style={{
              color: "#f5f0e8",
              textShadow: "0 1px 12px rgba(0,0,0,0.9), 0 0 32px rgba(139,92,246,0)",
            }}
          >
            {tombstone.repo_name}
          </h3>
          {tombstone.github_username && (
            <p className="text-zinc-600 text-[11px] mt-1 font-mono tracking-wide">
              @{tombstone.github_username}
            </p>
          )}
        </div>

        {/* Dates — chiseled style */}
        <div className="text-center">
          <div className="font-mono text-sm text-zinc-400 tracking-widest">
            {bornYear} — {diedYear}
          </div>
          <div className="text-zinc-600 text-[11px] mt-0.5 italic">({age})</div>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-2 my-1">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-zinc-700/50" />
          <div className="text-zinc-700 text-[10px]">✦</div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-zinc-700/50" />
        </div>

        {/* Cause of death */}
        <div className="text-center">
          <span className="text-[9px] text-zinc-600 uppercase tracking-[0.25em]">Cause of Death</span>
          <p
            className="text-sm font-medium mt-1 italic"
            style={{ color: "rgba(167,139,250,0.9)" }}
          >
            &ldquo;{tombstone.cause_of_death}&rdquo;
          </p>
        </div>

        {/* Last words */}
        {tombstone.last_words && (
          <div className="text-center">
            <span className="text-[9px] text-zinc-600 uppercase tracking-[0.25em]">Last Words</span>
            <p className="text-zinc-500 text-[11px] mt-1 font-mono italic line-clamp-2">
              &ldquo;{tombstone.last_words}&rdquo;
            </p>
          </div>
        )}

        {/* Epitaph — engraved look */}
        {tombstone.epitaph && (
          <div
            className="text-center px-4 py-3 rounded"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
            }}
          >
            <p className="text-zinc-300/70 text-sm italic font-gothic leading-relaxed">
              {tombstone.epitaph}
            </p>
          </div>
        )}

        {/* Languages */}
        {langs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            {langs.map((lang) => (
              <LanguageBadge key={lang} language={lang} small />
            ))}
          </div>
        )}

        {/* Obsession stats */}
        {(tombstone.peak_streak_days > 1 || tombstone.most_commits_one_day > 1) && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {tombstone.peak_streak_days > 1 && (
              <div
                className="text-center py-2 rounded"
                style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}
              >
                <div className="text-purple-400 text-base font-bold font-mono leading-none">
                  {tombstone.peak_streak_days}d
                </div>
                <div className="text-zinc-600 text-[9px] uppercase tracking-wider mt-0.5">Streak</div>
              </div>
            )}
            {tombstone.most_commits_one_day > 1 && (
              <div
                className="text-center py-2 rounded"
                style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}
              >
                <div className="text-purple-400 text-base font-bold font-mono leading-none">
                  {tombstone.most_commits_one_day}
                </div>
                <div className="text-zinc-600 text-[9px] uppercase tracking-wider mt-0.5">Best Day</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Base slab */}
      <div
        className="relative z-10 flex items-center justify-between px-5 py-3"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.4))",
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="group-hover:animate-[flicker_1.5s_ease-in-out_infinite]">
            <CandleFlicker size={14} />
          </div>
          <span className="text-amber-400/70 text-xs font-mono">{tombstone.candle_count}</span>
        </div>
        <span className="text-zinc-700 text-[10px] font-mono">{tombstone.commits_count} commits</span>
        <div className="flex items-center gap-1">
          <span className="text-emerald-500/60 text-xs">↑</span>
          <span className="text-zinc-600 text-xs font-mono">{tombstone.resurrection_votes}</span>
        </div>
      </div>
    </div>
  );

  if (!interactive) return card;

  return (
    <Link href={`/tombstone/${tombstone.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-[50%_50%_6px_6px/48px_48px_6px_6px]">
      {card}
    </Link>
  );
}
