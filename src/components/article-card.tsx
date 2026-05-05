import Link from "next/link";
import type { Article } from "@/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/read/${article.id}`}
      className="block p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-600 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            {article.source}
            {article.domain && (
              <span className="text-slate-500 ml-2">{article.domain}</span>
            )}
          </p>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-sm text-slate-400 mt-2 line-clamp-2">{article.summary}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
        {article.reading_time_min && <span>{article.reading_time_min} min read</span>}
        {article.published_at && (
          <span>{new Date(article.published_at).toLocaleDateString()}</span>
        )}
      </div>
    </Link>
  );
}
