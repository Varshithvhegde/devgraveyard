import { createClient } from "@/lib/supabase/server";
import TombstoneCard from "@/components/tombstone/TombstoneCard";
import Link from "next/link";
import { TombstoneWithStats } from "@/types/tombstone";

export default async function FeaturedTombstones() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tombstone_stats")
    .select("*, users(github_username, github_avatar_url)")
    .eq("is_public", true)
    .order("candle_count", { ascending: false })
    .limit(3);

  const tombstones = (data ?? []) as TombstoneWithStats[];

  if (tombstones.length === 0) return null;

  return (
    <section className="py-16 max-w-6xl mx-auto px-6">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-gothic text-3xl text-bone">Most Mourned</h2>
          <p className="text-zinc-500 text-sm mt-1">
            The projects we couldn&apos;t let go of
          </p>
        </div>
        <Link
          href="/graveyard"
          className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {tombstones.map((t) => (
          <TombstoneCard key={t.id} tombstone={t} />
        ))}
      </div>
    </section>
  );
}
