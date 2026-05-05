import { describe, it, expect } from "vitest";
import { findGrowthDirections } from "../src/lib/knowledge";

describe("knowledge model", () => {
  it("identifies growth directions from adjacent concepts", () => {
    const userConcepts = [
      { concept_id: "a", familiarity_score: 4, name: "prompt engineering", domain: "AI" },
      { concept_id: "b", familiarity_score: 3, name: "few-shot learning", domain: "AI" },
      { concept_id: "c", familiarity_score: 1, name: "agent architectures", domain: "AI" },
      { concept_id: "d", familiarity_score: 1, name: "tool use", domain: "AI" },
      { concept_id: "e", familiarity_score: 0, name: "pricing strategy", domain: "Business Strategy" },
    ];

    const relations = [
      { concept_a: "a", concept_b: "c" },
      { concept_a: "b", concept_b: "d" },
      { concept_a: "c", concept_b: "d" },
    ];

    const directions = findGrowthDirections(userConcepts, relations);
    expect(directions.length).toBeGreaterThan(0);
    expect(directions.length).toBeLessThanOrEqual(4);

    // Should prioritize concepts adjacent to well-known ones
    const conceptNames = directions.flatMap((d) => d.concepts.map((c) => c.name));
    expect(conceptNames).toContain("agent architectures");
    expect(conceptNames).toContain("tool use");
  });

  it("returns empty if no growth concepts available", () => {
    const userConcepts = [
      { concept_id: "a", familiarity_score: 4, name: "prompt engineering", domain: "AI" },
    ];
    const relations: { concept_a: string; concept_b: string }[] = [];

    const directions = findGrowthDirections(userConcepts, relations);
    expect(directions).toHaveLength(0);
  });
});
