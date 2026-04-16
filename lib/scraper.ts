import FirecrawlApp from '@mendable/firecrawl-js';
import { Source } from './sources';

export type ScrapedItem = {
  source: Source;
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
};

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

export async function scrapeSource(source: Source): Promise<ScrapedItem[]> {
  const targetUrl = source.scrapeUrl ?? source.url;

  try {
    const result = await firecrawl.scrapeUrl(targetUrl, {
      formats: ['markdown'],
    });

    if (!result.success || !result.markdown) return [];

    // Pass raw markdown to Claude for extraction — return as single item
    return [{
      source,
      title: `${source.name} — latest content`,
      url: targetUrl,
      snippet: result.markdown.slice(0, 8000), // cap for Claude context
    }];
  } catch (err) {
    console.error(`Scrape failed for ${source.name}:`, err);
    return [];
  }
}
