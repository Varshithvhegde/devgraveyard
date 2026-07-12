import { createClient } from "@/lib/supabase/server";
import { TombstoneWithStats } from "@/types/tombstone";
import GraveyardSceneWrapper from "./GraveyardSceneWrapper";
import Link from "next/link";

export const metadata = { title: "3D Graveyard — DevGraveyard" };

export default async function Graveyard3DPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tombstone_stats")
    .select("*, users(github_username, github_avatar_url)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(30);

  const tombstones = (data ?? []) as TombstoneWithStats[];

  return (
    <div className="relative w-full bg-[#050309]" style={{ height: "calc(100vh - 56px)" }}>
      {/* Top bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        <div
          className="flex items-center gap-3 px-5 py-2 rounded-full"
          style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(139,92,246,0.2)", backdropFilter: "blur(16px)" }}
        >
          <span className="text-lg select-none" style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }}>⚰️</span>
          <span className="font-gothic text-sm text-zinc-300">The 3D Graveyard</span>
          <span className="text-zinc-700 text-xs font-mono">{tombstones.length} buried</span>
        </div>
      </div>

      {/* Switch view */}
      <div className="absolute top-4 right-4 z-10">
        <Link
          href="/graveyard"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
        >
          ☰ List view
        </Link>
      </div>

      {tombstones.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="text-6xl select-none opacity-30">🌑</div>
          <p className="text-zinc-600 font-gothic text-xl">The graveyard is empty.</p>
          <Link href="/bury" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            Bury the first project →
          </Link>
        </div>
      ) : (
        <GraveyardSceneWrapper tombstones={tombstones} />
      )}
    </div>
  );
}
