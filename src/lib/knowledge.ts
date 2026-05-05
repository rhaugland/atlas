interface UserConceptRow {
  concept_id: string;
  familiarity_score: number;
  name: string;
  domain: string;
}

interface Relation {
  concept_a: string;
  concept_b: string;
}

export interface GrowthCluster {
  domain: string;
  concepts: { concept_id: string; name: string; domain: string }[];
  anchor_concepts: string[]; // well-known concepts this connects to
}

export function findGrowthDirections(
  userConcepts: UserConceptRow[],
  relations: Relation[]
): GrowthCluster[] {
  // Find well-known concepts (score 3-4)
  const strong = userConcepts.filter((c) => c.familiarity_score >= 3);
  const strongIds = new Set(strong.map((c) => c.concept_id));

  // Find growth candidates (score 0-2) that are adjacent to strong ones
  const weak = userConcepts.filter((c) => c.familiarity_score <= 2 && c.familiarity_score >= 1);
  const weakMap = new Map(weak.map((c) => [c.concept_id, c]));

  // Build adjacency from strong to weak
  const growthCandidates: Map<string, Set<string>> = new Map(); // weak_id -> connected_strong_ids

  for (const rel of relations) {
    if (strongIds.has(rel.concept_a) && weakMap.has(rel.concept_b)) {
      if (!growthCandidates.has(rel.concept_b)) growthCandidates.set(rel.concept_b, new Set());
      growthCandidates.get(rel.concept_b)!.add(rel.concept_a);
    }
    if (strongIds.has(rel.concept_b) && weakMap.has(rel.concept_a)) {
      if (!growthCandidates.has(rel.concept_a)) growthCandidates.set(rel.concept_a, new Set());
      growthCandidates.get(rel.concept_a)!.add(rel.concept_b);
    }
  }

  if (growthCandidates.size === 0) return [];

  // Rank by number of connections to strong concepts
  const ranked = [...growthCandidates.entries()]
    .map(([id, anchors]) => ({ id, anchors: [...anchors], score: anchors.size }))
    .sort((a, b) => b.score - a.score);

  // Cluster by domain
  const clusters: Map<string, GrowthCluster> = new Map();

  for (const candidate of ranked) {
    const concept = weakMap.get(candidate.id);
    if (!concept) continue;

    const domain = concept.domain;
    if (!clusters.has(domain)) {
      clusters.set(domain, { domain, concepts: [], anchor_concepts: [] });
    }

    const cluster = clusters.get(domain)!;
    if (cluster.concepts.length < 5) {
      cluster.concepts.push({ concept_id: concept.concept_id, name: concept.name, domain: concept.domain });
      cluster.anchor_concepts.push(...candidate.anchors.map((a) => strong.find((s) => s.concept_id === a)?.name || a));
    }
  }

  // Deduplicate anchor names and limit to 4 directions
  return [...clusters.values()]
    .map((c) => ({ ...c, anchor_concepts: [...new Set(c.anchor_concepts)] }))
    .slice(0, 4);
}
