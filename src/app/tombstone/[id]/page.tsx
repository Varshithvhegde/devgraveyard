"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { ageString } from "@/lib/github/analyze";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statItem = (label: string, value: string | number, mono = true) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-3 rounded-xl"
    style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.1)" }}
  >
    <div className={`text-purple-400 text-lg font-bold leading-none ${mono ? "font-mono" : "font-gothic"}`}>
      {value}
    </div>
    <div className="text-zinc-600 text-[10px] uppercase tracking-wider mt-1">{label}</div>
  </motion.div>
);

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
          const { data: { user: u } } = await supabase.auth.getUser();
          if (u) {
            const [{ data: candle }, { data: vote }] = await Promise.all([
              supabase.from("candles").select("id").eq("tombstone_id", id).eq("user_id", u.id).maybeSingle(),
              supabase.from("resurrection_votes").select("id").eq("tombstone_id", id).eq("user_id", u.id).maybeSingle(),
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
      <div className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full border border-t-purple-500 border-zinc-800"
          />
          <p className="text-zinc-600 font-mono text-sm">Digging up the records...</p>
        </div>
      </div>
    );
  }

  if (!tombstone) {
    return (
      <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center gap-4">
        <div className="text-6xl select-none">🌑</div>
        <p className="text-zinc-500 font-gothic text-xl">This tombstone doesn&apos;t exist.</p>
        <Link href="/graveyard" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
          ← Return to the graveyard
        </Link>
      </div>
    );
  }

  const age = ageString(tombstone.born_at, tombstone.died_at);
  const isOwner = user?.id === tombstone.user_id;

  return (
    <div className="min-h-screen bg-[#030305]">
      {/* Header band */}
      <div className="border-b border-zinc-900/80 bg-[#030305]/80 backdrop-blur-sm sticky top-14 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-11 flex items-center gap-3">
          <Link href="/graveyard" className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors flex items-center gap-1.5">
            ← The Graveyard
          </Link>
          <span className="text-zinc-800">/</span>
          <span className="text-zinc-500 text-xs font-mono truncate">{tombstone.repo_name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Left — sticky tombstone */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <TombstoneCard tombstone={tombstone} interactive={false} />
              </motion.div>

              {/* GitHub link */}
              <motion.a
                href={tombstone.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                View on GitHub
              </motion.a>
            </div>
          </div>

          {/* Right — detail */}
          <motion.div
            className="lg:col-span-3 space-y-8"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Title */}
            <div>
              <h1 className="font-gothic text-3xl sm:text-4xl text-[#f5f0e8] mb-2"
                style={{ textShadow: "0 0 40px rgba(139,92,246,0.2)" }}>
                {tombstone.repo_name}
              </h1>
              <p className="text-zinc-600 text-sm font-mono">
                Buried {formatDate(tombstone.buried_at)}
                {tombstone.github_username && <> · @{tombstone.github_username}</>}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.2), transparent)" }} />

            {/* Obsession stats */}
            <div>
              <div className="text-[10px] text-zinc-700 uppercase tracking-[0.25em] mb-3">Obsession Data</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statItem("Total Commits", tombstone.commits_count)}
                {statItem("Peak Streak", tombstone.peak_streak_days ? `${tombstone.peak_streak_days}d` : "—")}
                {statItem("Best Day", tombstone.most_commits_one_day || "—")}
                {statItem("Lived", age, false)}
              </div>
              {tombstone.latest_night_commit_time && (
                <p className="mt-3 text-xs text-zinc-700 font-mono">
                  🌙 Latest night session: <span className="text-purple-500/70">{tombstone.latest_night_commit_time}</span>
                </p>
              )}
            </div>

            {/* Eulogy */}
            <div className="space-y-3">
              <div className="text-[10px] text-zinc-700 uppercase tracking-[0.25em]">The Final Words</div>
              <AnimatePresence>
                {eulogy ? (
                  <motion.div
                    key="eulogy"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <EulogySection eulogy={eulogy} animate={eulogyFresh} />
                  </motion.div>
                ) : (
                  <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <EulogyGenerator
                      tombstoneId={tombstone.id}
                      isOwner={isOwner}
                      existingEulogy={eulogy}
                      onGenerated={(e) => { setEulogy(e); setEulogyFresh(true); }}
                    />
                    {!isOwner && (
                      <p className="text-zinc-700 text-sm italic text-center py-6">No eulogy written yet.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pay Respects */}
            <div className="space-y-4">
              <div className="text-[10px] text-zinc-700 uppercase tracking-[0.25em]">Pay Respects</div>
              <div className="flex flex-wrap gap-3">
                <CandleButton tombstoneId={tombstone.id} initialCount={tombstone.candle_count} initialLit={userCandle} />
                <ResurrectVoteButton tombstoneId={tombstone.id} initialCount={tombstone.resurrection_votes} initialVoted={userVote} />
              </div>
            </div>

            {/* Condolences */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-zinc-700 uppercase tracking-[0.25em]">Condolences</div>
                <span className="text-zinc-700 text-xs font-mono">{tombstone.rip_count} messages</span>
              </div>
              <RipMessageForm tombstoneId={tombstone.id} onMessage={(msg) => setMessages((m) => [msg, ...m])} />
              <AnimatePresence>
                <RipMessageList messages={messages} />
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
