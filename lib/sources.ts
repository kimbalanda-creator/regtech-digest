export type Source = {
  name: string;
  url: string;
  type: 'regulatory' | 'vendor';
  scrapeUrl?: string; // override URL for scraping (e.g. news/blog subpage)
};

export const SOURCES: Source[] = [
  // Regulatory
  { name: 'AUSTRAC', url: 'https://www.austrac.gov.au', scrapeUrl: 'https://www.austrac.gov.au/news-and-media', type: 'regulatory' },
  { name: 'APRA', url: 'https://www.apra.gov.au', scrapeUrl: 'https://www.apra.gov.au/news', type: 'regulatory' },
  { name: 'ASIC', url: 'https://asic.gov.au', scrapeUrl: 'https://asic.gov.au/about-asic/news-centre/', type: 'regulatory' },
  { name: 'FATF', url: 'https://www.fatf-gafi.org', scrapeUrl: 'https://www.fatf-gafi.org/en/topics/fatf-news.html', type: 'regulatory' },
  { name: 'FinCEN', url: 'https://www.fincen.gov', scrapeUrl: 'https://www.fincen.gov/news', type: 'regulatory' },

  // Vendors
  { name: 'FrankieOne', url: 'https://www.frankieone.com', scrapeUrl: 'https://www.frankieone.com/blog', type: 'vendor' },
  { name: 'Sardine', url: 'https://www.sardine.ai', scrapeUrl: 'https://www.sardine.ai/blog', type: 'vendor' },
  { name: 'Persona', url: 'https://withpersona.com', scrapeUrl: 'https://withpersona.com/blog', type: 'vendor' },
  { name: 'ComplyAdvantage', url: 'https://complyadvantage.com', scrapeUrl: 'https://complyadvantage.com/insights/', type: 'vendor' },
  { name: 'Onfido', url: 'https://onfido.com', scrapeUrl: 'https://onfido.com/blog/', type: 'vendor' },
];
