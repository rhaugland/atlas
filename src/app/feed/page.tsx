import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/types";

export default async function FeedPage() {
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("interests, onboarded")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded) redirect("/onboarding");

  // Fetch articles matching user interests, ranked by quality and recency
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .in("domain", profile.interests)
    .order("quality_score", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#2D3142]">Your Feed</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Curated for you. Tap any article to read and grow.
          </p>
        </div>
        <div className="space-y-4">
          {(articles || []).map((article: Article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {(!articles || articles.length === 0) && (
            <div className="text-center py-20">
              <p className="text-[#6B7280]">No articles yet. Content is being curated for you.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
