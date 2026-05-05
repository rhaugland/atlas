"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface DomainScore {
  domain: string;
  score: number;
  conceptCount: number;
}

export function KnowledgeRadar({ data }: { data: DomainScore[] }) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 4]}
          tick={{ fill: "#64748b", fontSize: 10 }}
        />
        <Radar
          name="Knowledge Depth"
          dataKey="score"
          stroke="#38bdf8"
          fill="#38bdf8"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
