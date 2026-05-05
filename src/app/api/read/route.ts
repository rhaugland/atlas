import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { article_id, time_spent_seconds } = await request.json();

  if (!article_id) {
    return NextResponse.json({ error: "Missing article_id" }, { status: 400 });
  }

  await supabase.from("user_reads").insert({
    user_id: user.id,
    article_id,
    time_spent_seconds: time_spent_seconds || 0,
  });

  // Also bump familiarity for all concepts in this article (passive exposure = score 1)
  const { data: articleConcepts } = await supabase
    .from("article_concepts")
    .select("concept_id")
    .eq("article_id", article_id);

  for (const ac of articleConcepts || []) {
    const { data: existing } = await supabase
      .from("user_concepts")
      .select("familiarity_score")
      .eq("user_id", user.id)
      .eq("concept_id", ac.concept_id)
      .single();

    if (!existing) {
      await supabase.from("user_concepts").insert({
        user_id: user.id,
        concept_id: ac.concept_id,
        familiarity_score: 1,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
