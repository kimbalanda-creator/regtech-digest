import FirecrawlApp from '@mendable/firecrawl-js';
import { Source } from './sources';

export type ScrapedItem = {
  source: Source;
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
};

export async function scrapeSource(source: Source): Promise<ScrapedItem[]> {
  const targetUrl = source.scrapeUrl ?? source.url;
  const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

  try {
    const result = await (firecrawl as any).scrape(targetUrl, {
      formats: ['markdown'],
    }) as { markdown?: string };

    if (!result.markdown) return [];

    // Pass raw markdown to Claude for extraction — return as single item
    return [{
      source,
      title: `${source.name} — latest content`,
      url: targetUrl,
      snippet: result.markdown.slice(0, 8000), // cap for Claude context
    }];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Scrape failed for ${source.name}:`, msg);
    throw new Error(`${source.name}: ${msg}`);
  }
}
