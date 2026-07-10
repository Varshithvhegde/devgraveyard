import { createClient } from "@/lib/supabase/server";
import { TombstoneWithStats } from "@/types/tombstone";
import TombstoneGrid from "@/components/tombstone/TombstoneGrid";
import Link from "next/link";

export const metadata = {
  title: "My Graveyard — DevGraveyard",
};

export default async function MyGraveyardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Please sign in to view your graveyard.</p>
        <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 text-sm">
          Sign in →
        </Link>
      </div>
    );
  }

  const { data } = await supabase
    .from("tombstone_stats")
    .select("*, users(github_username, github_avatar_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const tombstones = (data ?? []) as TombstoneWithStats[];

  return (
    <div className="min-h-screen bg-[#050505] px-4 sm:px-6 py-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-gothic text-4xl text-bone mb-1">My Graveyard</h1>
          <p className="text-zinc-500 text-sm">
            {tombstones.length} project{tombstones.length !== 1 ? "s" : ""} at rest
          </p>
        </div>
        <Link
          href="/bury"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Bury another
        </Link>
      </div>

      {tombstones.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <div className="text-7xl select-none">🌿</div>
          <h2 className="font-gothic text-2xl text-zinc-400">
            Your graveyard is empty
          </h2>
          <p className="text-zinc-600 text-sm max-w-sm mx-auto">
            Every developer has abandoned projects. Give yours a proper memorial.
          </p>
          <Link
            href="/bury"
            className="inline-block mt-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Bury your first project
          </Link>
        </div>
      ) : (
        <TombstoneGrid tombstones={tombstones} />
      )}
    </div>
  );
}
