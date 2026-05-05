export interface Profile {
  id: string;
  email: string;
  name: string | null;
  interests: string[];
  reading_volume: "light" | "moderate" | "heavy";
  onboarded: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  source: string;
  url: string;
  title: string;
  summary: string | null;
  content_text: string | null;
  reading_time_min: number | null;
  quality_score: number;
  domain: string | null;
  published_at: string | null;
  fetched_at: string;
}

export interface Concept {
  id: string;
  name: string;
  domain: string;
  difficulty: "introductory" | "intermediate" | "advanced";
  description: string | null;
}

export interface ConceptRelation {
  id: string;
  concept_a: string;
  concept_b: string;
  relation_type: "related" | "prerequisite" | "extends";
}

export interface ArticleConcept {
  article_id: string;
  concept_id: string;
}

export interface UserConcept {
  user_id: string;
  concept_id: string;
  familiarity_score: number;
  last_encountered_at: string;
  reaction_count: number;
}

export interface UserRead {
  id: string;
  user_id: string;
  article_id: string;
  time_spent_seconds: number;
  completion_pct: number;
  read_at: string;
}

export type Reaction = "knew_this" | "new_to_me" | "mind_blown";

export interface UserReaction {
  id: string;
  user_id: string;
  article_id: string;
  concept_id: string;
  reaction: Reaction;
  created_at: string;
}

export interface ArticleWithConcepts extends Article {
  concepts: Concept[];
}

export interface GrowthDirection {
  title: string;
  description: string;
  concepts: Concept[];
  articles: Article[];
}

export const TOPICS = [
  "AI",
  "Business Strategy",
  "Product",
  "Finance",
  "Design",
  "Leadership",
  "Marketing",
  "Engineering",
  "Science",
  "Health",
] as const;

export type Topic = (typeof TOPICS)[number];
