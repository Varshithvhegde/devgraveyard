import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Persist the GitHub provider_token so it survives session refresh
    if (data.session?.provider_token && data.user) {
      const admin = createAdminClient();
      await admin
        .from("users")
        .update({ github_token: data.session.provider_token })
        .eq("id", data.user.id);
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
