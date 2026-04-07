/**
 * Web Scraping Helper Utilities
 * Provides functions to scrape web pages and extract data using Firecrawl or fallback fetch.
 */

export interface ScraperResult {
  html: string;
  markdown?: string;
  text: string;
  url: string;
  title: string;
  statusCode: number;
  metadata?: Record<string, any>;
}

export async function getFirecrawlClient() {
  const module = await import('@mendable/firecrawl-js');
  const Firecrawl = module.default || module;
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error('Missing FIRECRAWL_API_KEY environment variable');
  }

  return new Firecrawl({ apiKey });
}

export async function scrapeUrlWithFirecrawl(url: string) {
  const app = await getFirecrawlClient();
  const result = await app.scrape(url, { formats: ['html', 'markdown'] });
  const html = result.html || result.markdown || result?.documents?.[0]?.html || '';
  const markdown = result.markdown || result?.documents?.[0]?.markdown || '';
  const metadata = result.metadata || result?.documents?.[0]?.metadata || {};
  const title = result.title || metadata.title || extractTitleFromHtml(html);

  return {
    html,
    markdown,
    text: markdown ? stripHtmlTags(markdown) : stripHtmlTags(html),
    url,
    title,
    statusCode: 200,
    metadata
  };
}

/**
 * Fetch HTML content from a URL using native fetch API
 * Works in both Node.js and browser environments
 */
export async function fetchHtmlContent(url: string): Promise<ScraperResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const html = await response.text();
    const title = extractTitleFromHtml(html);

    return {
      html,
      text: stripHtmlTags(html),
      url,
      title,
      statusCode: response.status,
      metadata: {}
    };
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractTextFromHtml(
  html: string,
  selector?: string
): Promise<string> {
  try {
    return extractTextRegex(html, selector);
  } catch (error) {
    console.warn('Error during text extraction:', error);
    return extractTextRegex(html, selector);
  }
}

export async function extractElementData(
  html: string,
  selector: string,
  attribute?: string
): Promise<string[]> {
  try {
    const matches: string[] = [];

    if (!selector) {
      return matches;
    }

    const regex = new RegExp(`<[^>]+${selector}[^>]*>(.*?)<\/[^>]+>`, 'gi');
    let match;

    while ((match = regex.exec(html)) !== null) {
      const inner = match[1].trim();
      if (inner) {
        matches.push(attribute ? inner : stripHtmlTags(inner));
      }
    }

    return matches;
  } catch (error) {
    console.warn('Error extracting element data:', error);
    return [];
  }
}

/**
 * Regex-based HTML text extraction (fallback method)
 */
function extractTextRegex(html: string, selector?: string): string {
  let workingHtml = html;

  // If selector is provided, attempt a simplistic extraction.
  if (selector && selector !== 'body') {
    const regex = new RegExp(`<[^>]*${selector}[^>]*>([\s\S]*?)<\/[^>]+>`, 'i');
    const match = workingHtml.match(regex);
    if (match && match[1]) {
      workingHtml = match[1];
    }
  }

  // Remove script and style tags
  let text = workingHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Extract title from HTML
 */
function extractTitleFromHtml(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'No title found';
}

/**
 * Strip all HTML tags from text
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }

  return result;
}

/**
 * Extract metadata from HTML
 */
export async function extractMetadata(html: string): Promise<Record<string, string>> {
  const metadata: Record<string, string> = {};

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) metadata['title'] = titleMatch[1].trim();

  const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (descriptionMatch) metadata['description'] = descriptionMatch[1];

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  if (canonicalMatch) metadata['canonical'] = canonicalMatch[1];

  return metadata;
}

/**
 * Extract all links from HTML
 */
export async function extractLinks(html: string): Promise<Array<{ href: string; text: string }>> {
  const links: Array<{ href: string; text: string }> = [];
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*?)["'][^>]*>([^<]*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    links.push({
      href: match[1],
      text: match[2] ? match[2].trim() : ''
    });
  }

  return links;
}
