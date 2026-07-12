import { createClient } from "@/lib/supabase/server";
import GraveyardStatsClient from "./GraveyardStatsClient";

export default async function GraveyardStats() {
  const supabase = await createClient();
  const [{ count: buried }, { count: candles }, { count: messages }] = await Promise.all([
    supabase.from("tombstones").select("*", { count: "exact", head: true }).eq("is_public", true),
    supabase.from("candles").select("*", { count: "exact", head: true }),
    supabase.from("rip_messages").select("*", { count: "exact", head: true }),
  ]);
  return (
    <GraveyardStatsClient
      buried={buried ?? 0}
      candles={candles ?? 0}
      messages={messages ?? 0}
    />
  );
}
