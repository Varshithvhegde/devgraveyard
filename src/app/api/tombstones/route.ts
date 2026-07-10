import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cause = searchParams.get("cause");
  const language = searchParams.get("language");
  const sort = searchParams.get("sort") ?? "newest";
  const cursor = searchParams.get("cursor");
  const limit = 12;

  const supabase = await createClient();

  let query = supabase
    .from("tombstone_stats")
    .select("*, users(github_username, github_avatar_url)")
    .eq("is_public", true)
    .limit(limit + 1);

  if (cause) query = query.eq("cause_of_death", cause);
  if (language) query = query.contains("languages", [language]);
  if (cursor) query = query.lt("created_at", cursor);

  switch (sort) {
    case "most_mourned":
      query = query.order("candle_count", { ascending: false });
      break;
    case "most_votes":
      query = query.order("resurrection_votes", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const hasMore = (data?.length ?? 0) > limit;
  const tombstones = data?.slice(0, limit) ?? [];

  return NextResponse.json({
    tombstones,
    hasMore,
    nextCursor: hasMore
      ? tombstones[tombstones.length - 1]?.created_at
      : null,
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

  const body = await request.json();
  const {
    repo,
    cause_of_death,
    epitaph,
    firstCommitDate,
    lastCommitDate,
    lastCommitMessage,
    languages,
    totalCommits,
    peakStreakDays,
    latestNightCommitTime,
    mostCommitsOneDay,
    mostCommitsDay,
    starsCount,
  } = body;

  const { data, error } = await supabase
    .from("tombstones")
    .insert({
      user_id: user.id,
      github_repo_id: repo.id,
      repo_name: repo.name,
      repo_full_name: repo.full_name,
      repo_url: repo.url,
      born_at: firstCommitDate,
      died_at: lastCommitDate,
      cause_of_death,
      epitaph: epitaph || null,
      last_words: lastCommitMessage,
      languages: languages ?? {},
      stars_count: starsCount ?? 0,
      commits_count: totalCommits ?? 0,
      peak_streak_days: peakStreakDays ?? 0,
      latest_night_commit_time: latestNightCommitTime ?? null,
      most_commits_one_day: mostCommitsOneDay ?? 0,
      most_commits_day: mostCommitsDay ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This repo is already buried." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tombstone: data }, { status: 201 });
}
