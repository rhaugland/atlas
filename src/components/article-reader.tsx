"use client";

import { useEffect, useRef } from "react";
import { ConceptChip } from "./concept-chip";
import type { Concept, Reaction } from "@/types";

interface ArticleReaderProps {
  articleId: string;
  title: string;
  source: string;
  content: string;
  readingTime: number | null;
  concepts: Concept[];
  existingReactions: Record<string, Reaction>;
}

export function ArticleReader({
  articleId,
  title,
  source,
  content,
  readingTime,
  concepts,
  existingReactions,
}: ArticleReaderProps) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    return () => {
      const seconds = Math.round((Date.now() - startTime.current) / 1000);
      if (seconds > 5) {
        fetch("/api/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ article_id: articleId, time_spent_seconds: seconds }),
        });
      }
    };
  }, [articleId]);

  return (
    <article className="max-w-2xl mx-auto">
      <header className="mb-8">
        <p className="text-xs font-semibold text-[#6B8DB5] uppercase tracking-wider mb-2">
          {source} {readingTime && `· ${readingTime} min read`}
        </p>
        <h1 className="text-3xl font-black text-[#2D3142] leading-tight">{title}</h1>
      </header>

      {concepts.length > 0 && (
        <div className="mb-6 bg-white border-2 border-[#D4756A]/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#2D3142]">tap concepts to react</p>
            <p className="text-[10px] text-[#6B7280]">{concepts.length} concepts</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {concepts.map((c) => (
              <ConceptChip
                key={c.id}
                conceptId={c.id}
                conceptName={c.name}
                articleId={articleId}
                existingReaction={existingReactions[c.id] || null}
              />
            ))}
          </div>
        </div>
      )}

      <div className="prose max-w-none text-[#2D3142] leading-relaxed text-[15px]">
        {content.split("\n\n").map((paragraph, i) => (
          <p key={i} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
