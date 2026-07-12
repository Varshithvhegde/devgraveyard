import { getUserRepos } from "@/lib/github/api";
import { getGitHubToken } from "@/lib/github/token";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await getGitHubToken();

  if (!token) {
    return NextResponse.json(
      { error: "GitHub token missing. Please sign out and reconnect GitHub." },
      { status: 401 }
    );
  }

  try {
    const repos = await getUserRepos(token);
    return NextResponse.json({ repos });
  } catch (err) {
    console.error("GitHub repos fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
