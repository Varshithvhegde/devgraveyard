import Link from "next/link";
import { TombstoneWithStats } from "@/types/tombstone";
import { formatDate, topLanguages } from "@/lib/utils";
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
    <div className="tombstone-card group relative flex flex-col bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/60 rounded-t-[50%_40px] shadow-2xl shadow-black/60 overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-purple-900/20 hover:border-zinc-600">
      {/* stone texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

      {/* top arch glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 p-6 flex flex-col gap-4 flex-1">
        {/* RIP + cross */}
        <div className="text-center">
          <div className="text-zinc-500 text-xs font-mono tracking-[0.3em] uppercase mb-1">
            R.I.P.
          </div>
          <div className="text-zinc-600 text-lg select-none">✝</div>
        </div>

        {/* Project name */}
        <div className="text-center">
          <h3 className="font-gothic text-xl text-bone font-bold tracking-wide leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
            {tombstone.repo_name}
          </h3>
          {tombstone.github_username && (
            <p className="text-zinc-500 text-xs mt-1 font-mono">
              @{tombstone.github_username}
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="text-center font-mono text-sm text-zinc-400 leading-relaxed">
          <div>{bornYear} — {diedYear}</div>
          <div className="text-zinc-600 text-xs mt-0.5">({age})</div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-700/60" />

        {/* Cause of death */}
        <div className="text-center">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">
            Cause of Death
          </span>
          <p className="text-purple-400 text-sm font-medium mt-1 italic">
            &ldquo;{tombstone.cause_of_death}&rdquo;
          </p>
        </div>

        {/* Last words */}
        {tombstone.last_words && (
          <div className="text-center">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">
              Last Words
            </span>
            <p className="text-zinc-400 text-xs mt-1 font-mono italic line-clamp-2">
              &ldquo;{tombstone.last_words}&rdquo;
            </p>
          </div>
        )}

        {/* Epitaph */}
        {tombstone.epitaph && (
          <div className="text-center border border-zinc-700/40 rounded p-3 bg-black/20">
            <p className="text-bone/80 text-sm italic font-gothic leading-relaxed">
              {tombstone.epitaph}
            </p>
          </div>
        )}

        {/* Languages */}
        {langs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {langs.map((lang) => (
              <LanguageBadge key={lang} language={lang} small />
            ))}
          </div>
        )}

        {/* Peak obsession stats */}
        {(tombstone.peak_streak_days > 1 || tombstone.most_commits_one_day > 1) && (
          <div className="grid grid-cols-2 gap-2 text-center">
            {tombstone.peak_streak_days > 1 && (
              <div className="bg-black/30 rounded p-2">
                <div className="text-purple-400 text-lg font-bold font-mono">
                  {tombstone.peak_streak_days}d
                </div>
                <div className="text-zinc-600 text-[10px] uppercase tracking-wider">
                  Peak Streak
                </div>
              </div>
            )}
            {tombstone.most_commits_one_day > 1 && (
              <div className="bg-black/30 rounded p-2">
                <div className="text-purple-400 text-lg font-bold font-mono">
                  {tombstone.most_commits_one_day}
                </div>
                <div className="text-zinc-600 text-[10px] uppercase tracking-wider">
                  Best Day
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar: community stats */}
      <div className="relative z-10 border-t border-zinc-700/40 bg-black/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-amber-400/80 text-sm">
          <CandleFlicker size={16} />
          <span className="font-mono">{tombstone.candle_count}</span>
        </div>
        <div className="text-zinc-600 text-xs font-mono">
          {tombstone.commits_count} commits
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400/70 text-sm">
          <span>↑</span>
          <span className="font-mono">{tombstone.resurrection_votes}</span>
        </div>
      </div>
    </div>
  );

  if (!interactive) return card;

  return (
    <Link href={`/tombstone/${tombstone.id}`} className="block">
      {card}
    </Link>
  );
}
