"use client";

import dynamic from "next/dynamic";
import { TombstoneWithStats } from "@/types/tombstone";

// Three.js must be dynamically imported — no SSR
const GraveyardScene = dynamic(
  () => import("@/components/graveyard3d/GraveyardScene"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#050309]">
        <div className="w-10 h-10 rounded-full border-2 border-t-purple-500 border-zinc-800 animate-spin" />
        <p className="text-zinc-600 font-mono text-sm">Loading the graveyard...</p>
      </div>
    ),
  }
);

export default function GraveyardSceneWrapper({ tombstones }: { tombstones: TombstoneWithStats[] }) {
  return (
    <div className="w-full h-full">
      <GraveyardScene tombstones={tombstones} />
    </div>
  );
}
