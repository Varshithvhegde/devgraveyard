import { createClient } from "@/lib/supabase/server";

export async function getGitHubToken(): Promise<string | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // First try the live session provider_token (present right after login)
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.provider_token) {
    // Opportunistically refresh the stored token
    await supabase
      .from("users")
      .update({ github_token: session.provider_token })
      .eq("id", user.id);
    return session.provider_token;
  }

  // Fall back to the persisted token in the database
  const { data: profile } = await supabase
    .from("users")
    .select("github_token")
    .eq("id", user.id)
    .single();

  return profile?.github_token ?? null;
}
