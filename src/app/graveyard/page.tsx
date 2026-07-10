import { createClient } from "@/lib/supabase/server";
import { TombstoneWithStats } from "@/types/tombstone";
import TombstoneGrid from "@/components/tombstone/TombstoneGrid";
import TombstoneFilters from "@/components/tombstone/TombstoneFilters";
import { Suspense } from "react";
import Link from "next/link";

export const metadata = {
  title: "The Graveyard — DevGraveyard",
};

interface PageProps {
  searchParams: Promise<{ cause?: string; language?: string; sort?: string }>;
}

async function GraveyardContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const { cause, language, sort = "newest" } = params;

  const supabase = await createClient();
  let query = supabase
    .from("tombstone_stats")
    .select("*, users(github_username, github_avatar_url)")
    .eq("is_public", true)
    .limit(24);

  if (cause) query = query.eq("cause_of_death", cause);

  switch (sort) {
    case "most_mourned":
      query = query.order("candle_count", { ascending: false });
      break;
    case "most_votes":
      query = query.order("resurrection_votes", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data } = await query;
  const tombstones = (data ?? []) as TombstoneWithStats[];

  return (
    <>
      {tombstones.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4 select-none">🌑</div>
          <p className="text-zinc-500 text-lg">No projects buried yet.</p>
          <Link
            href="/bury"
            className="mt-4 inline-block text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            Be the first to bury one →
          </Link>
        </div>
      ) : (
        <TombstoneGrid tombstones={tombstones} />
      )}
    </>
  );
}

export default function GraveyardPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-[#050505] px-4 sm:px-6 py-12 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="font-gothic text-4xl text-bone mb-2">The Graveyard</h1>
        <p className="text-zinc-500 text-sm">
          Every tombstone here was once someone&apos;s passion.
        </p>
      </div>

      <div className="mb-8">
        <Suspense fallback={null}>
          <TombstoneFilters />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <TombstoneGrid loading skeletonCount={6} />
        }
      >
        <GraveyardContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
