import { createClient } from "@/lib/supabase/server";
import {
  getRepoCommits,
  getRepoLanguages,
  getFirstAndLastCommit,
} from "@/lib/github/api";
import { computePeakObsession } from "@/lib/github/analyze";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repoFullName = searchParams.get("repo");

  if (!repoFullName || !repoFullName.includes("/")) {
    return NextResponse.json({ error: "Invalid repo parameter" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [owner, repo] = repoFullName.split("/");
  const token = session.provider_token;

  try {
    const [commits, languages, { first, last }] = await Promise.all([
      getRepoCommits(token, owner, repo),
      getRepoLanguages(token, owner, repo),
      getFirstAndLastCommit(token, owner, repo),
    ]);

    const peak = computePeakObsession(commits);

    return NextResponse.json({
      firstCommitDate: first?.commit.author.date ?? null,
      lastCommitDate: last?.commit.author.date ?? null,
      lastCommitMessage: last?.commit.message?.split("\n")[0] ?? null,
      languages,
      ...peak,
    });
  } catch (err) {
    console.error("Commits fetch error:", err);
    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}
