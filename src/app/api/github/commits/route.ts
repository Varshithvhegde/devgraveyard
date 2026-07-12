import { getRepoCommits, getRepoLanguages, getFirstAndLastCommit } from "@/lib/github/api";
import { computePeakObsession } from "@/lib/github/analyze";
import { getGitHubToken } from "@/lib/github/token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repoFullName = searchParams.get("repo");

  if (!repoFullName || !repoFullName.includes("/")) {
    return NextResponse.json({ error: "Invalid repo parameter" }, { status: 400 });
  }

  const token = await getGitHubToken();
  if (!token) {
    return NextResponse.json(
      { error: "GitHub token missing. Please sign out and reconnect GitHub." },
      { status: 401 }
    );
  }

  const [owner, repo] = repoFullName.split("/");

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
    return NextResponse.json({ error: "Failed to analyze repository" }, { status: 500 });
  }
}
