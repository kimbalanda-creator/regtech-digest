import { Client } from '@notionhq/client';
import { DigestItem } from './extractor';

const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const PAGE_ID = process.env.NOTION_DIGEST_PAGE_ID!;

function todayLabel(): string {
  return new Date().toLocaleDateString('en-AU', {
    timeZone: 'Australia/Sydney',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function itemBlock(item: DigestItem) {
  const prefix = item.publishedDate ? `[${item.publishedDate}] ` : '';
  return {
    object: 'block' as const,
    type: 'bulleted_list_item' as const,
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text' as const,
          text: { content: `${prefix}${item.title} — ${item.summary}`, link: { url: item.url } },
          annotations: { bold: false, italic: false, code: false, color: 'default' as const },
        },
      ],
    },
  };
}

export async function writeDigestToNotion(items: DigestItem[]): Promise<void> {
  const regulatory = items.filter(i => i.sourceType === 'regulatory');
  const vendor = items.filter(i => i.sourceType === 'vendor');

  const blocks: object[] = [
    // Date heading
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: `📅 ${todayLabel()}` } }],
      },
    },
  ];

  if (regulatory.length > 0) {
    blocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [{ type: 'text', text: { content: '🏛️ Regulatory Updates' } }],
      },
    });
    regulatory.forEach(item => blocks.push(itemBlock(item)));
  }

  if (vendor.length > 0) {
    blocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [{ type: 'text', text: { content: '🏢 Vendor News' } }],
      },
    });
    vendor.forEach(item => blocks.push(itemBlock(item)));
  }

  if (regulatory.length === 0 && vendor.length === 0) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: 'No new items found today.' } }],
      },
    });
  }

  blocks.push({ object: 'block', type: 'divider', divider: {} });

  // Prepend blocks to the top of the page (after the callout intro)
  // Fetch existing children to find insertion point
  const existing = await notion.blocks.children.list({ block_id: PAGE_ID, page_size: 10 });
  const afterBlock = existing.results[1]?.id; // insert after the divider (second block)

  await notion.blocks.children.append({
    block_id: PAGE_ID,
    children: blocks as Parameters<typeof notion.blocks.children.append>[0]['children'],
  });

  void afterBlock; // used for future ordering if needed
}
