import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { ArticleReader } from "@/components/article-reader";
import { Nav } from "@/components/nav";
import type { Concept, Reaction } from "@/types";

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) redirect("/feed");

  // Get concepts for this article
  const { data: articleConcepts } = await supabase
    .from("article_concepts")
    .select("concept_id, concepts(*)")
    .eq("article_id", id);

  const concepts: Concept[] = (articleConcepts || [])
    .map((ac: any) => ac.concepts)
    .filter(Boolean);

  // Get user's existing reactions for this article
  const { data: reactions } = await supabase
    .from("user_reactions")
    .select("concept_id, reaction")
    .eq("user_id", user.id)
    .eq("article_id", id);

  const existingReactions: Record<string, Reaction> = {};
  for (const r of reactions || []) {
    existingReactions[r.concept_id] = r.reaction as Reaction;
  }

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Nav />
      <main className="px-4 py-8">
        <Link
          href="/feed"
          className="inline-block text-sm text-slate-500 hover:text-sky-400 mb-6 transition-colors"
        >
          ← Back to Feed
        </Link>
        <ArticleReader
          articleId={article.id}
          title={article.title}
          source={article.source}
          content={article.content_text || ""}
          readingTime={article.reading_time_min}
          concepts={concepts}
          existingReactions={existingReactions}
        />
      </main>
    </div>
  );
}
