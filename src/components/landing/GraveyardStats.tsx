import { createClient } from "@/lib/supabase/server";

export default async function GraveyardStats() {
  const supabase = await createClient();

  const [
    { count: buried },
    { count: candles },
    { count: messages },
  ] = await Promise.all([
    supabase
      .from("tombstones")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true),
    supabase.from("candles").select("*", { count: "exact", head: true }),
    supabase.from("rip_messages").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { emoji: "⚰️", value: buried ?? 0, label: "Projects Buried" },
    { emoji: "🕯️", value: candles ?? 0, label: "Candles Lit" },
    { emoji: "🪦", value: messages ?? 0, label: "RIP Messages" },
  ];

  return (
    <section className="py-16 border-y border-zinc-800/50 bg-black/20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl mb-2 select-none">{s.emoji}</div>
              <div className="font-gothic text-4xl text-bone font-bold">
                {s.value.toLocaleString()}
              </div>
              <div className="text-zinc-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
