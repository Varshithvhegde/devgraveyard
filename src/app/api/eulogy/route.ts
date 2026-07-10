import { createClient } from "@/lib/supabase/server";
import { generateEulogy } from "@/lib/gemini/eulogy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tombstone_id } = await request.json();

  const { data: tombstone, error: fetchError } = await supabase
    .from("tombstone_stats")
    .select("*")
    .eq("id", tombstone_id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !tombstone) {
    return NextResponse.json(
      { error: "Tombstone not found or not yours" },
      { status: 404 }
    );
  }

  if (tombstone.eulogy) {
    return NextResponse.json({ eulogy: tombstone.eulogy });
  }

  try {
    const eulogy = await generateEulogy(tombstone);

    await supabase
      .from("tombstones")
      .update({ eulogy, eulogy_generated_at: new Date().toISOString() })
      .eq("id", tombstone_id);

    return NextResponse.json({ eulogy });
  } catch (err) {
    console.error("Eulogy generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate eulogy" },
      { status: 500 }
    );
  }
}
