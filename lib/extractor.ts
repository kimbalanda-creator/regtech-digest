import Anthropic from '@anthropic-ai/sdk';
import { ScrapedItem } from './scraper';

export type DigestItem = {
  title: string;
  url: string;
  summary: string;
  sourceName: string;
  sourceType: 'regulatory' | 'vendor';
  publishedDate?: string;
};

export async function extractDigestItems(scraped: ScrapedItem[]): Promise<DigestItem[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  if (scraped.length === 0) return [];

  const prompt = scraped.map(item => `
SOURCE: ${item.source.name} (${item.source.type})
URL: ${item.url}
CONTENT:
${item.snippet}
---`).join('\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `You are a regulatory and fintech intelligence analyst. Extract news items from the provided scraped web content that are relevant to: identity verification, fraud prevention, AML/KYC compliance, regulatory updates, and regtech vendor news.

For each relevant item found, output a JSON array with objects containing:
- title: the article/announcement title (string)
- url: direct URL if available, otherwise the source URL (string)
- summary: 2-3 sentence summary focused on what changed and why it matters (string)
- sourceName: name of the source (string)
- sourceType: "regulatory" or "vendor" (string)
- publishedDate: date if visible in content, otherwise null (string or null)

Only include items published or updated recently (within the last 7 days if dates are visible). If no relevant items are found for a source, return an empty array for that source. Return ONLY valid JSON — no markdown, no explanation.`,
    messages: [{ role: 'user', content: `Extract relevant digest items from this content:\n\n${prompt}` }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Try to extract JSON array from response if wrapped in text
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return [];
      }
    }
    console.error('Failed to parse Claude response:', text.slice(0, 200));
    return [];
  }
}
