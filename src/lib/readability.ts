import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export async function extractArticleText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "ATLAS-Reader/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article?.textContent?.trim() || null;
  } catch {
    return null;
  }
}

export function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
}
