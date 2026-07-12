import { createClient } from "@/lib/supabase/server";
import TombstoneCard from "@/components/tombstone/TombstoneCard";
import ScrollReveal from "@/components/shared/ScrollReveal";
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
    <section className="py-20 max-w-6xl mx-auto px-6">
      <ScrollReveal>
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] mb-2">Most Mourned</div>
            <h2 className="font-gothic text-4xl text-bone leading-none">The Beloved Dead</h2>
            <p className="text-zinc-600 text-sm mt-2">Projects the community couldn&apos;t let go of</p>
          </div>
          <Link
            href="/graveyard"
            className="text-purple-500 hover:text-purple-300 text-sm transition-colors flex items-center gap-1.5 group"
          >
            View all graves
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {tombstones.map((t, i) => (
          <ScrollReveal key={t.id} delay={i * 100} direction="up">
            <TombstoneCard tombstone={t} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
