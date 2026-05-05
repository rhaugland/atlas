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

  // Check if user has reacted to any concepts yet
  const { count: reactionCount } = await supabase
    .from("user_reactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const isNewUser = (reactionCount || 0) < 10;

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
          <h1 className="text-2xl font-black text-[#1A1A1A]">Your Feed</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Curated for you. Tap any article to read and grow.
          </p>
        </div>
        {isNewUser && (
          <div className="mb-6 p-4 bg-white border border-[#E8E4DD] rounded-2xl">
            <p className="text-sm font-semibold text-[#1A1A1A]">how margin learns you</p>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              tap any article, then react to the concepts inside it — mark each one as
              <span className="text-[#7CB5A0] font-medium"> ✓ knew this</span>,
              <span className="text-[#6B8DB5] font-medium"> ✧ new to me</span>, or
              <span className="text-[#D4756A] font-medium"> ✴ mind blown</span>.
              this is how margin maps what you know and unlocks your explore + map pages.
            </p>
          </div>
        )}

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
