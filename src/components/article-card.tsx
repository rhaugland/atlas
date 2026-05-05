import Link from "next/link";
import type { Article } from "@/types";

function getDomainColor(domain: string | null | undefined): string {
  if (!domain) return "text-[#6B7280]";
  const d = domain.toLowerCase();
  if (d.includes("ai") || d.includes("machine learning") || d.includes("tech")) return "text-[#6B8DB5]";
  if (d.includes("business") || d.includes("strategy") || d.includes("finance")) return "text-[#DFB44E]";
  if (d.includes("product") || d.includes("design") || d.includes("ux")) return "text-[#D4756A]";
  return "text-[#7CB5A0]";
}

export function ArticleCard({ article }: { article: Article }) {
  const domainColor = getDomainColor(article.domain);

  return (
    <Link
      href={`/read/${article.id}`}
      className="block p-5 bg-white border border-[#E8E4DD] rounded-2xl hover:border-[#D4756A]/40 hover:shadow-[4px_0_0_0_#D4756A] transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${domainColor}`}>
            {article.source}
            {article.domain && (
              <span className="text-[#6B7280] ml-2">{article.domain}</span>
            )}
          </p>
          <h3 className="text-base font-bold text-[#2D3142] group-hover:text-[#D4756A] transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-sm text-[#6B7280] mt-2 line-clamp-2">{article.summary}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-[#6B7280]">
        {article.reading_time_min && <span>{article.reading_time_min} min read</span>}
        {article.published_at && (
          <span>{new Date(article.published_at).toLocaleDateString()}</span>
        )}
      </div>
    </Link>
  );
}
