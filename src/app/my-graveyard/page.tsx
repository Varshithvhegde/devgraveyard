"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { TombstoneWithStats } from "@/types/tombstone";
import TombstoneCard from "@/components/tombstone/TombstoneCard";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function DeleteButton({ tombstoneId, onDeleted }: { tombstoneId: string; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = async () => {
    if (!confirm) {
      setConfirm(true);
      timer.current = setTimeout(() => setConfirm(false), 3500);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setDeleting(true);
    try {
      const res = await fetch(`/api/tombstones/${tombstoneId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Tombstone removed 🪦");
      onDeleted();
    } catch {
      toast.error("Failed to remove tombstone");
      setDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={deleting}
      whileTap={{ scale: 0.95 }}
      className="w-full mt-2 py-2 rounded-lg text-xs font-medium transition-all"
      style={{
        border: `1px solid ${confirm ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.18)"}`,
        background: confirm ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.04)",
        color: confirm ? "rgba(252,165,165,0.9)" : "rgba(239,68,68,0.55)",
      }}
      animate={{ scale: confirm ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 0.2 }}
    >
      {deleting ? "Removing…" : confirm ? "⚠️ Confirm remove?" : "🗑️ Remove tombstone"}
    </motion.button>
  );
}

export default function MyGraveyardPage() {
  const [tombstones, setTombstones] = useState<TombstoneWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setAuthed(false); setLoading(false); return; }
      const { data } = await supabase
        .from("tombstone_stats")
        .select("*, users(github_username, github_avatar_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setTombstones((data ?? []) as TombstoneWithStats[]);
      setLoading(false);
    });
  }, []);

  const handleDeleted = (id: string) => {
    setTombstones(ts => ts.filter(t => t.id !== id));
  };

  if (!authed) return (
    <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-500">Please sign in to view your graveyard.</p>
      <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 text-sm">Sign in →</Link>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 rounded-full border-2 border-t-purple-500 border-zinc-800" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030305] px-4 sm:px-6 py-12 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <div className="text-[10px] text-zinc-700 uppercase tracking-[0.3em] font-mono mb-1">Your Memorial</div>
          <h1 className="font-gothic text-4xl text-[#f5f0e8] mb-1"
            style={{ textShadow: "0 0 40px rgba(139,92,246,0.2)" }}>
            My Graveyard
          </h1>
          <p className="text-zinc-600 text-sm">
            {tombstones.length} project{tombstones.length !== 1 ? "s" : ""} at rest
          </p>
        </div>
        <Link href="/bury"
          className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
          + Bury another
        </Link>
      </motion.div>

      {tombstones.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 space-y-4">
          <div className="text-7xl select-none opacity-30">🌿</div>
          <h2 className="font-gothic text-2xl text-zinc-500">Your graveyard is empty</h2>
          <p className="text-zinc-700 text-sm max-w-xs mx-auto">
            Every developer has abandoned projects. Give yours a proper memorial.
          </p>
          <Link href="/bury"
            className="inline-block mt-4 px-6 py-3 text-white font-semibold rounded-xl transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            Bury your first project
          </Link>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          <AnimatePresence mode="popLayout">
            {tombstones.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.3 } }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <TombstoneCard tombstone={t} index={i} />
                <DeleteButton tombstoneId={t.id} onDeleted={() => handleDeleted(t.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
