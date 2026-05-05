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
        <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
          {source} {readingTime && `· ${readingTime} min read`}
        </p>
        <h1 className="text-3xl font-black text-slate-100 leading-tight">{title}</h1>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <p className="text-xs text-slate-500 w-full mb-1">Concepts in this article:</p>
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

      <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed text-[15px]">
        {content.split("\n\n").map((paragraph, i) => (
          <p key={i} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
