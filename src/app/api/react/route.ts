import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { concept_id, article_id, reaction } = await request.json();

  if (!concept_id || !article_id || !reaction) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Upsert the reaction
  await supabase.from("user_reactions").upsert(
    { user_id: user.id, article_id, concept_id, reaction },
    { onConflict: "user_id,article_id,concept_id" }
  );

  // Update user_concepts familiarity score
  const { data: existing } = await supabase
    .from("user_concepts")
    .select("familiarity_score, reaction_count")
    .eq("user_id", user.id)
    .eq("concept_id", concept_id)
    .single();

  let newScore: number;
  if (reaction === "knew_this") {
    newScore = existing ? Math.min(4, existing.familiarity_score + 1) : 2;
  } else if (reaction === "new_to_me") {
    newScore = 3;
  } else {
    // mind_blown — it's new AND impactful
    newScore = 3;
  }

  await supabase.from("user_concepts").upsert(
    {
      user_id: user.id,
      concept_id,
      familiarity_score: newScore,
      last_encountered_at: new Date().toISOString(),
      reaction_count: (existing?.reaction_count || 0) + 1,
    },
    { onConflict: "user_id,concept_id" }
  );

  return NextResponse.json({ ok: true });
}
