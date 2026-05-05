"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { ExploreCard } from "@/components/explore-card";
import type { GrowthDirection } from "@/types";

export default function ExplorePage() {
  const [directions, setDirections] = useState<GrowthDirection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/explore")
      .then((r) => r.json())
      .then((data) => {
        setDirections(data.directions || []);
        setMessage(data.message || "");
      })
      .catch(() => setMessage("Failed to load directions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-100">Explore</h1>
          <p className="text-slate-400 text-sm mt-1">
            How do you want to expand your knowledge today?
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : directions.length > 0 ? (
          <div className="space-y-4">
            {directions.map((dir, i) => (
              <ExploreCard key={i} direction={dir} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-3xl mb-4">✦</p>
            <p className="text-slate-300 font-semibold">{message || "Read a few more articles to unlock your growth map."}</p>
            <p className="text-slate-500 text-sm mt-2">
              ATLAS needs to understand what you know before it can guide where to grow.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
