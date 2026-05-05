"use client";

import type { GrowthDirection } from "@/types";
import Link from "next/link";

const CHIP_COLORS = [
  "bg-[#D4756A]/10 text-[#D4756A] border-[#D4756A]/30",
  "bg-[#6B8DB5]/10 text-[#6B8DB5] border-[#6B8DB5]/30",
  "bg-[#7CB5A0]/10 text-[#7CB5A0] border-[#7CB5A0]/30",
  "bg-[#DFB44E]/10 text-[#DFB44E] border-[#DFB44E]/30",
  "bg-[#E8B4B4]/20 text-[#c47a7a] border-[#E8B4B4]/50",
];

export function ExploreCard({ direction }: { direction: GrowthDirection }) {
  return (
    <div className="p-6 bg-white border border-[#E8E4DD] rounded-2xl hover:border-[#6B8DB5]/40 hover:shadow-[4px_0_0_0_#6B8DB5] transition-all group">
      <h3 className="text-lg font-bold text-[#2D3142] group-hover:text-[#6B8DB5] transition-colors">
        {direction.title}
      </h3>
      <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
        {direction.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {direction.concepts.slice(0, 4).map((c, i) => (
          <span
            key={c.id}
            className={`px-2 py-0.5 text-xs border rounded-md ${CHIP_COLORS[i % CHIP_COLORS.length]}`}
          >
            {c.name}
          </span>
        ))}
      </div>
      {direction.articles.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E8E4DD]">
          <p className="text-xs text-[#6B7280] mb-2">Start with:</p>
          <div className="space-y-2">
            {direction.articles.map((a) => (
              <Link
                key={a.id}
                href={`/read/${a.id}`}
                className="block text-sm text-[#6B8DB5] hover:text-[#4A67A5] transition-colors"
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
