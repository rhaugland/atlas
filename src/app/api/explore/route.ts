import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { findGrowthDirections } from "@/lib/knowledge";
import { generateExploreCommentary } from "@/lib/claude";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's concept familiarity
  const { data: userConcepts } = await supabase
    .from("user_concepts")
    .select("concept_id, familiarity_score, concepts(name, domain)")
    .eq("user_id", user.id);

  if (!userConcepts || userConcepts.length < 3) {
    return NextResponse.json({ directions: [], message: "Read more articles to unlock personalized growth directions." });
  }

  const conceptRows = userConcepts.map((uc: any) => ({
    concept_id: uc.concept_id,
    familiarity_score: uc.familiarity_score,
    name: uc.concepts.name,
    domain: uc.concepts.domain,
  }));

  // Get concept relations
  const conceptIds = conceptRows.map((c: any) => c.concept_id);
  const { data: relations } = await supabase
    .from("concept_relations")
    .select("concept_a, concept_b")
    .or(`concept_a.in.(${conceptIds.join(",")}),concept_b.in.(${conceptIds.join(",")})`);

  const directions = findGrowthDirections(conceptRows, relations || []);

  // For each direction, find relevant articles
  const enrichedDirections = await Promise.all(
    directions.map(async (dir) => {
      const dirConceptIds = dir.concepts.map((c) => c.concept_id);

      const { data: articleConcepts } = await supabase
        .from("article_concepts")
        .select("article_id, articles(*)")
        .in("concept_id", dirConceptIds)
        .limit(3);

      const articles = (articleConcepts || [])
        .map((ac: any) => ac.articles)
        .filter(Boolean)
        .slice(0, 3);

      // Generate description for this direction
      const knownNames = dir.anchor_concepts.slice(0, 5);
      const growthNames = dir.concepts.map((c) => c.name).slice(0, 3);
      const description = `You understand ${knownNames.join(", ")} deeply. Explore ${growthNames.join(", ")} — the natural next frontier of what you already know.`;

      return {
        title: `Expand: ${dir.domain}`,
        description,
        concepts: dir.concepts,
        articles,
      };
    })
  );

  return NextResponse.json({ directions: enrichedDirections });
}

export async function POST(request: Request) {
  // Generate commentary for a specific article in an explore session
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { direction_title, article_title } = await request.json();

  // Get user's strong concepts for context
  const { data: strongConcepts } = await supabase
    .from("user_concepts")
    .select("concepts(name)")
    .eq("user_id", user.id)
    .gte("familiarity_score", 3)
    .limit(10);

  const knownNames = (strongConcepts || []).map((sc: any) => sc.concepts.name);

  const commentary = await generateExploreCommentary(direction_title, knownNames, article_title);

  return NextResponse.json({ commentary });
}
