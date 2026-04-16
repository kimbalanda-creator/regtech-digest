import { NextRequest, NextResponse } from 'next/server';
import { SOURCES } from '@/lib/sources';
import { scrapeSource } from '@/lib/scraper';
import { extractDigestItems } from '@/lib/extractor';
import { writeDigestToNotion } from '@/lib/notion-writer';

export const maxDuration = 300; // 5 min — Vercel Pro limit

export async function POST(req: NextRequest) {
  // Protect the endpoint
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { scraped: 0, items: 0, errors: [] as string[] };

  try {
    // Scrape all sources in parallel
    const scrapeResults = await Promise.allSettled(
      SOURCES.map(source => scrapeSource(source))
    );

    const allScraped = scrapeResults.flatMap((r, i) => {
      if (r.status === 'fulfilled') {
        results.scraped += r.value.length;
        return r.value;
      } else {
        results.errors.push(`${SOURCES[i].name}: ${r.reason}`);
        return [];
      }
    });

    // Extract relevant items via Claude
    const digestItems = await extractDigestItems(allScraped);
    results.items = digestItems.length;

    // Write to Notion
    await writeDigestToNotion(digestItems);

    return NextResponse.json({ success: true, ...results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Allow GET for easy manual trigger from browser (with secret param)
export async function GET(req: NextRequest) {
  return POST(req);
}
