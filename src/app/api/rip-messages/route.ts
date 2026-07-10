import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tombstone_id = searchParams.get("tombstone_id");
  const cursor = searchParams.get("cursor");
  const limit = 20;

  if (!tombstone_id) {
    return NextResponse.json({ error: "tombstone_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("rip_messages")
    .select("*")
    .eq("tombstone_id", tombstone_id)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const hasMore = (data?.length ?? 0) > limit;
  const messages = data?.slice(0, limit) ?? [];

  return NextResponse.json({
    messages,
    hasMore,
    nextCursor: hasMore ? messages[messages.length - 1]?.created_at : null,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tombstone_id, message } = await request.json();

  if (!message || message.length > 280) {
    return NextResponse.json({ error: "Message must be 1-280 chars" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("github_username, github_avatar_url")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("rip_messages")
    .insert({
      tombstone_id,
      user_id: user.id,
      author_name: profile?.github_username ?? "Anonymous",
      author_avatar: profile?.github_avatar_url ?? null,
      message,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data }, { status: 201 });
}
