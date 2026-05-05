"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { ExploreCard } from "@/components/explore-card";
import type { GrowthDirection } from "@/types";

interface Progress {
  current: number;
  target: number;
  totalExposed: number;
}

export default function ExplorePage() {
  const [directions, setDirections] = useState<GrowthDirection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    fetch("/api/explore")
      .then((r) => r.json())
      .then((data) => {
        setDirections(data.directions || []);
        setMessage(data.message || "");
        if (data.progress) setProgress(data.progress);
      })
      .catch(() => setMessage("Failed to load directions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#2D3142]">Explore</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            How do you want to expand your knowledge today?
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white border border-[#E8E4DD] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : directions.length > 0 ? (
          <div className="space-y-4">
            {directions.map((dir, i) => (
              <ExploreCard key={i} direction={dir} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-3xl mb-4 text-[#6B8DB5]">✦</p>
            <p className="text-[#2D3142] font-semibold">{message || "Read a few more articles to unlock your growth map."}</p>
            <p className="text-[#6B7280] text-sm mt-2">
              ATLAS needs to understand what you know before it can guide where to grow.
            </p>
            {progress && (
              <div className="mt-8 max-w-xs mx-auto">
                <div className="flex justify-between text-xs text-[#6B7280] mb-2">
                  <span>Concept reactions</span>
                  <span>{progress.current} / {progress.target}</span>
                </div>
                <div className="w-full h-3 bg-[#E8E4DD] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7CB5A0] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((progress.current / progress.target) * 100, 100)}%` }}
                  />
                </div>
                {progress.totalExposed > 0 && (
                  <p className="text-xs text-[#6B7280] mt-2">
                    {progress.totalExposed} concepts encountered so far
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
