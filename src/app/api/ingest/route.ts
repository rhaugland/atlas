import { NextResponse } from "next/server";
import { FEEDS } from "@/lib/feeds";
import { fetchAllFeeds } from "@/lib/rss";
import { extractArticleText, estimateReadingTime } from "@/lib/readability";
import { extractConcepts } from "@/lib/claude";
import { createServiceClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createServiceClient();
  const rawArticles = await fetchAllFeeds(FEEDS);

  let ingested = 0;

  for (const raw of rawArticles.slice(0, 30)) {
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("url", raw.url)
      .single();

    if (existing) continue;

    const text = await extractArticleText(raw.url);
    if (!text || text.length < 200) continue;

    const readingTime = estimateReadingTime(text);
    if (readingTime < 2 || readingTime > 20) continue;

    let extracted;
    try {
      extracted = await extractConcepts(raw.title, text);
    } catch {
      continue;
    }

    const qualityScore =
      (1 / raw.tier) * 0.4 +
      Math.min(extracted.concepts.length / 15, 1) * 0.3 +
      (readingTime >= 3 && readingTime <= 12 ? 1 : 0.5) * 0.3;

    const { data: article } = await supabase
      .from("articles")
      .insert({
        source: raw.source,
        url: raw.url,
        title: raw.title,
        summary: extracted.summary,
        content_text: text,
        reading_time_min: readingTime,
        quality_score: qualityScore,
        domain: raw.domain,
        published_at: raw.published_at,
      })
      .select("id")
      .single();

    if (!article) continue;

    for (const c of extracted.concepts) {
      const { data: concept } = await supabase
        .from("concepts")
        .upsert(
          { name: c.name, domain: c.domain, difficulty: c.difficulty, description: c.description },
          { onConflict: "name" }
        )
        .select("id")
        .single();

      if (concept) {
        await supabase
          .from("article_concepts")
          .upsert({ article_id: article.id, concept_id: concept.id });
      }
    }

    ingested++;
  }

  return NextResponse.json({ ingested, total_fetched: rawArticles.length });
}
