import { createClient } from "@supabase/supabase-js";
import { FEEDS } from "../src/lib/feeds";
import { fetchAllFeeds } from "../src/lib/rss";
import { extractArticleText, estimateReadingTime } from "../src/lib/readability";
import { extractConcepts } from "../src/lib/claude";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function ingest() {
  console.log("Fetching RSS feeds...");
  const rawArticles = await fetchAllFeeds(FEEDS);
  console.log(`Found ${rawArticles.length} articles`);

  let ingested = 0;
  let skipped = 0;

  for (const raw of rawArticles) {
    // Skip if already ingested
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("url", raw.url)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    // Extract article text
    const text = await extractArticleText(raw.url);
    if (!text || text.length < 200) {
      skipped++;
      continue;
    }

    const readingTime = estimateReadingTime(text);

    // Skip very long or very short articles
    if (readingTime < 2 || readingTime > 20) {
      skipped++;
      continue;
    }

    // Extract concepts via Claude
    let extracted;
    try {
      extracted = await extractConcepts(raw.title, text);
    } catch (e) {
      console.error(`Concept extraction failed for: ${raw.title}`, e);
      skipped++;
      continue;
    }

    // Calculate quality score
    const qualityScore =
      (1 / raw.tier) * 0.4 +
      Math.min(extracted.concepts.length / 15, 1) * 0.3 +
      (readingTime >= 3 && readingTime <= 12 ? 1 : 0.5) * 0.3;

    // Insert article
    const { data: article, error: articleError } = await supabase
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

    if (articleError || !article) {
      console.error(`Failed to insert article: ${raw.title}`, articleError);
      continue;
    }

    // Upsert concepts and create relations
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

        // Create relations
        for (const relatedName of c.related_to) {
          const { data: related } = await supabase
            .from("concepts")
            .select("id")
            .eq("name", relatedName)
            .single();

          if (related) {
            await supabase.from("concept_relations").upsert(
              { concept_a: concept.id, concept_b: related.id, relation_type: "related" },
              { onConflict: "concept_a,concept_b" }
            );
          }
        }
      }
    }

    ingested++;
    console.log(`✓ ${raw.title} (${extracted.concepts.length} concepts)`);
  }

  console.log(`\nDone: ${ingested} ingested, ${skipped} skipped`);
}

ingest().catch(console.error);
