import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ExtractedConcepts {
  summary: string;
  concepts: {
    name: string;
    domain: string;
    difficulty: "introductory" | "intermediate" | "advanced";
    description: string;
    related_to: string[];
  }[];
}

export async function extractConcepts(
  title: string,
  text: string
): Promise<ExtractedConcepts> {
  const truncated = text.slice(0, 8000);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Analyze this article and extract key concepts.

Title: ${title}

Text: ${truncated}

Return JSON with this exact structure:
{
  "summary": "2 sentence summary",
  "concepts": [
    {
      "name": "concept name (lowercase, normalized)",
      "domain": "one of: AI, Business Strategy, Product, Finance, Design, Leadership, Marketing, Engineering, Science, Health",
      "difficulty": "introductory|intermediate|advanced",
      "description": "one sentence explaining this concept",
      "related_to": ["other concept names that relate to this one"]
    }
  ]
}

Extract 5-15 concepts. These should be IDEAS, not keywords. Focus on concepts a founder/exec would find valuable.
Return ONLY valid JSON, no markdown.`,
      },
    ],
  });

  const text_content = response.content[0];
  if (text_content.type !== "text") throw new Error("No text response");

  // Strip markdown code fences if present
  const raw = text_content.text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  return JSON.parse(raw);
}

export async function generateExploreCommentary(
  direction: string,
  knownConcepts: string[],
  articleTitle: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `You're helping a founder expand their knowledge. They understand: ${knownConcepts.join(", ")}.

They're exploring: "${direction}"
Next article: "${articleTitle}"

Write 2-3 sentences connecting this article to what they already know. Be specific, insightful, concise. Speak directly to them.`,
      },
    ],
  });

  const text_content = response.content[0];
  if (text_content.type !== "text") return "";
  return text_content.text;
}
