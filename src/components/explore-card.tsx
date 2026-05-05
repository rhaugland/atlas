"use client";

import type { GrowthDirection } from "@/types";
import Link from "next/link";

export function ExploreCard({ direction }: { direction: GrowthDirection }) {
  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-sky-600 transition-all group">
      <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
        {direction.title}
      </h3>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
        {direction.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {direction.concepts.slice(0, 4).map((c) => (
          <span
            key={c.id}
            className="px-2 py-0.5 text-xs bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-md"
          >
            {c.name}
          </span>
        ))}
      </div>
      {direction.articles.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 mb-2">Start with:</p>
          <div className="space-y-2">
            {direction.articles.map((a) => (
              <Link
                key={a.id}
                href={`/read/${a.id}`}
                className="block text-sm text-slate-300 hover:text-sky-300 transition-colors"
              >
                → {a.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
