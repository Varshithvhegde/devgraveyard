"use client";

import { use, useEffect, useState } from "react";
import { TombstoneWithStats, RipMessage } from "@/types/tombstone";
import TombstoneCard from "@/components/tombstone/TombstoneCard";
import CandleButton from "@/components/community/CandleButton";
import ResurrectVoteButton from "@/components/community/ResurrectVoteButton";
import RipMessageForm from "@/components/community/RipMessageForm";
import RipMessageList from "@/components/community/RipMessageList";
import EulogyGenerator from "@/components/eulogy/EulogyGenerator";
import EulogySection from "@/components/eulogy/EulogySection";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TombstonePage({ params }: PageProps) {
  const { id } = use(params);
  const [tombstone, setTombstone] = useState<TombstoneWithStats | null>(null);
  const [messages, setMessages] = useState<RipMessage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCandle, setUserCandle] = useState(false);
  const [userVote, setUserVote] = useState(false);
  const [eulogy, setEulogy] = useState<string | null>(null);
  const [eulogyFresh, setEulogyFresh] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    fetch(`/api/tombstones/${id}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.tombstone) {
          setTombstone(data.tombstone);
          setEulogy(data.tombstone.eulogy);

          // check user interactions
          const { data: { user: u } } = await supabase.auth.getUser();
          if (u) {
            const [{ data: candle }, { data: vote }] = await Promise.all([
              supabase
                .from("candles")
                .select("id")
                .eq("tombstone_id", id)
                .eq("user_id", u.id)
                .maybeSingle(),
              supabase
                .from("resurrection_votes")
                .select("id")
                .eq("tombstone_id", id)
                .eq("user_id", u.id)
                .maybeSingle(),
            ]);
            setUserCandle(!!candle);
            setUserVote(!!vote);
          }
        }
        setLoading(false);
      });

    fetch(`/api/rip-messages?tombstone_id=${id}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-zinc-600 font-mono text-sm animate-pulse">
          Digging up the records...
        </div>
      </div>
    );
  }

  if (!tombstone) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <div className="text-6xl select-none">🌑</div>
        <p className="text-zinc-500">This tombstone does not exist.</p>
        <Link href="/graveyard" className="text-purple-400 hover:text-purple-300 text-sm">
          ← Return to the graveyard
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === tombstone.user_id;

  return (
    <div className="min-h-screen bg-[#050505] px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/graveyard"
          className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors inline-flex items-center gap-1 mb-8"
        >
          ← Back to the graveyard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left: tombstone card */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <TombstoneCard tombstone={tombstone} interactive={false} />

              {/* Repo link */}
              <a
                href={tombstone.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-zinc-700/50 hover:border-zinc-600 text-zinc-500 hover:text-zinc-300 text-sm rounded-lg transition-all bg-zinc-900/30"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>

          {/* Right: detail + community */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-gothic text-3xl text-bone mb-1">
                {tombstone.repo_name}
              </h1>
              <p className="text-zinc-500 text-sm font-mono">
                Buried on {formatDate(tombstone.buried_at)}
                {tombstone.github_username && (
                  <> by @{tombstone.github_username}</>
                )}
              </p>
            </div>

            {/* Peak obsession stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Commits",
                  value: tombstone.commits_count,
                  mono: true,
                },
                {
                  label: "Peak Streak",
                  value: tombstone.peak_streak_days
                    ? `${tombstone.peak_streak_days}d`
                    : "—",
                  mono: true,
                },
                {
                  label: "Best Day",
                  value: tombstone.most_commits_one_day || "—",
                  mono: true,
                },
                {
                  label: "Latest Night",
                  value: tombstone.latest_night_commit_time ?? "Reasonable hours",
                  mono: false,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-3 text-center"
                >
                  <div
                    className={`text-purple-400 text-lg font-bold ${
                      stat.mono ? "font-mono" : ""
                    }`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Eulogy */}
            <div className="space-y-3">
              <h2 className="font-gothic text-xl text-zinc-300">Eulogy</h2>
              {eulogy ? (
                <EulogySection eulogy={eulogy} animate={eulogyFresh} />
              ) : (
                <EulogyGenerator
                  tombstoneId={tombstone.id}
                  isOwner={isOwner}
                  existingEulogy={eulogy}
                  onGenerated={(e) => { setEulogy(e); setEulogyFresh(true); }}
                />
              )}
              {!eulogy && !isOwner && (
                <p className="text-zinc-600 text-sm italic text-center py-4">
                  No eulogy written yet.
                </p>
              )}
            </div>

            {/* Community actions */}
            <div className="space-y-3">
              <h2 className="font-gothic text-xl text-zinc-300">Pay Respects</h2>
              <div className="flex flex-wrap gap-3">
                <CandleButton
                  tombstoneId={tombstone.id}
                  initialCount={tombstone.candle_count}
                  initialLit={userCandle}
                />
                <ResurrectVoteButton
                  tombstoneId={tombstone.id}
                  initialCount={tombstone.resurrection_votes}
                  initialVoted={userVote}
                />
              </div>
            </div>

            {/* RIP Messages */}
            <div className="space-y-4">
              <h2 className="font-gothic text-xl text-zinc-300">
                Condolences ({tombstone.rip_count})
              </h2>
              <RipMessageForm
                tombstoneId={tombstone.id}
                onMessage={(msg) => setMessages((m) => [msg, ...m])}
              />
              <RipMessageList messages={messages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
