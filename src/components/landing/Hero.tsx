import Link from "next/link";
import FogAnimation from "@/components/shared/FogAnimation";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      <FogAnimation />

      {/* background grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_60%,rgba(139,92,246,0.08),transparent)]" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-24">
        {/* floating coffin */}
        <div className="text-8xl mb-8 animate-float select-none">⚰️</div>

        <div className="inline-block border border-purple-800/40 bg-purple-950/20 text-purple-400 text-xs uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-6">
          A Memorial for Dead Side Projects
        </div>

        <h1 className="font-gothic text-5xl sm:text-6xl lg:text-7xl text-bone leading-tight mb-6 [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
          Give Your Abandoned
          <br />
          Projects a Proper{" "}
          <span className="text-purple-400">Burial</span>
        </h1>

        <p className="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Every developer has a graveyard of passion projects — started with fire,
          abandoned quietly. They deserve tombstones.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/bury"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-purple-900/30 text-lg"
          >
            ⚰️ Bury a Project
          </Link>
          <Link
            href="/graveyard"
            className="px-8 py-4 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold rounded-lg transition-all text-lg"
          >
            Browse the Graveyard →
          </Link>
        </div>

        {/* stats teaser */}
        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="text-purple-500">⚰️</span>
            <span>Projects buried forever</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="text-amber-500">🕯️</span>
            <span>Candles lit in memory</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">↑</span>
            <span>Votes to resurrect</span>
          </div>
        </div>
      </div>

      {/* bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
    </section>
  );
}
