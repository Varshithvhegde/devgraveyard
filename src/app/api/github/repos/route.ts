import { createClient } from "@/lib/supabase/server";
import { getUserRepos } from "@/lib/github/api";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = session.provider_token;
  if (!token) {
    return NextResponse.json(
      { error: "No GitHub token available. Please re-authenticate." },
      { status: 401 }
    );
  }

  try {
    const repos = await getUserRepos(token);
    return NextResponse.json({ repos });
  } catch (err) {
    console.error("GitHub repos fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
