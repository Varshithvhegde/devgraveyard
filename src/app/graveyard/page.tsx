import { createClient } from "@/lib/supabase/server";
import { TombstoneWithStats } from "@/types/tombstone";
import TombstoneGrid from "@/components/tombstone/TombstoneGrid";
import TombstoneFilters from "@/components/tombstone/TombstoneFilters";
import { Suspense } from "react";
import Link from "next/link";
import FireflyParticles from "@/components/shared/FireflyParticles";

export const metadata = { title: "The Graveyard — DevGraveyard" };

interface PageProps {
  searchParams: Promise<{ cause?: string; language?: string; sort?: string }>;
}

async function GraveyardContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const { cause, sort = "newest" } = params;

  const supabase = await createClient();
  let query = supabase
    .from("tombstone_stats")
    .select("*, users(github_username, github_avatar_url)")
    .eq("is_public", true)
    .limit(24);

  if (cause) query = query.eq("cause_of_death", cause);

  switch (sort) {
    case "most_mourned":  query = query.order("candle_count",         { ascending: false }); break;
    case "most_votes":    query = query.order("resurrection_votes",   { ascending: false }); break;
    case "oldest":        query = query.order("created_at",           { ascending: true });  break;
    default:              query = query.order("created_at",           { ascending: false });
  }

  const { data } = await query;
  const tombstones = (data ?? []) as TombstoneWithStats[];

  if (tombstones.length === 0) {
    return (
      <div className="text-center py-32 space-y-4">
        <div className="text-6xl select-none">🌑</div>
        <p className="text-zinc-500 text-lg font-gothic">The graveyard is empty.</p>
        <Link href="/bury" className="inline-block mt-2 text-purple-400 hover:text-purple-300 text-sm transition-colors">
          Be the first to bury a project →
        </Link>
      </div>
    );
  }

  return <TombstoneGrid tombstones={tombstones} />;
}

export default function GraveyardPage({ searchParams }: PageProps) {
  return (
    <div className="relative min-h-screen bg-[#030305]">
      {/* Subtle ambient fireflies */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ height: 300 }}>
        <FireflyParticles count={12} />
      </div>

      {/* Page header */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="mb-2 text-[10px] text-zinc-700 uppercase tracking-[0.3em] font-mono">
          Memorial Wall
        </div>
        <h1 className="font-gothic text-5xl text-[#f5f0e8] mb-3"
          style={{ textShadow: "0 0 60px rgba(139,92,246,0.2)" }}>
          The Graveyard
        </h1>
        <p className="text-zinc-600 text-sm max-w-sm">
          Every tombstone here was once someone&apos;s passion project.
        </p>

        {/* Divider */}
        <div className="mt-8 mb-8 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.3) 30%, rgba(139,92,246,0.15) 70%, transparent)" }}
        />

        <Suspense fallback={null}>
          <TombstoneFilters />
        </Suspense>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <Suspense fallback={<TombstoneGrid loading skeletonCount={6} />}>
          <GraveyardContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
