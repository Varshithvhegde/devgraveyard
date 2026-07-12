import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ ids: [] });

  const { data } = await supabase
    .from("tombstones")
    .select("github_repo_id")
    .eq("user_id", user.id);

  const ids = (data ?? []).map((r: { github_repo_id: number }) => r.github_repo_id);
  return NextResponse.json({ ids });
}
