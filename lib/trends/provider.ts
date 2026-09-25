/**
 * Google Trends-compatible Trend Provider Implementation for Swallern.
 * Server-side only. Uses native fetch with clean error handling and rate limit safety.
 */

import { RawTrendItem, TrendProvider } from './types';

export class GoogleTrendsProvider implements TrendProvider {
  providerName = 'GoogleTrends';

  /**
   * Fetches real-time trending queries from Google Trends RSS feed.
   * Degrades gracefully to structured curiosity signals if feed is unavailable.
   */
  async fetchLatestTrends(geo: string = 'US'): Promise<RawTrendItem[]> {
    const rssUrl = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(geo)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'SwallernTrendFetcher/1.0 (Educational Curiosity Engine)',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const xmlText = await res.text();
        const parsedItems = this.parseRSSXml(xmlText, geo);
        if (parsedItems.length > 0) {
          return parsedItems;
        }
      }
    } catch {
      // Graceful fallback to default structured trends on network / rate limit issues
    }

    return this.getFallbackTrends(geo);
  }

  /**
   * Simple RSS XML Item Parser (Regex based, zero extra dependencies).
   */
  private parseRSSXml(xmlText: string, geo: string): RawTrendItem[] {
    const items: RawTrendItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    let rank = 100;
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 25) {
      const itemContent = match[1];
      const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemContent);

      if (titleMatch && titleMatch[1]) {
        const cleanTitle = titleMatch[1]
          .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
          .trim();

        if (cleanTitle && cleanTitle.length > 2) {
          items.push({
            query: cleanTitle,
            source: 'GOOGLE_TRENDS_RSS',
            timestamp: new Date().toISOString(),
            popularity_score: Math.max(20, rank),
            geo,
            related_queries: [],
            raw_metadata: { source_feed: 'Google Trends RSS' },
          });
          rank -= 3;
        }
      }
    }

    return items;
  }

  /**
   * Fallback educational curiosity signals for robust offline or API rate limit operation.
   */
  private getFallbackTrends(geo: string): RawTrendItem[] {
    const fallbackQueries = [
      { q: 'How does quantum computing work', score: 95 },
      { q: 'What is artificial general intelligence', score: 92 },
      { q: 'Why do black holes emit Hawking radiation', score: 88 },
      { q: 'How does mRNA vaccine technology work', score: 85 },
      { q: 'What causes economic inflation and interest rate shifts', score: 82 },
      { q: 'How do neural networks learn patterns', score: 90 },
      { q: 'What is the CRISPR gene editing mechanism', score: 87 },
      { q: 'How does renewable fusion energy production work', score: 84 },
    ];

    return fallbackQueries.map((item) => ({
      query: item.q,
      source: 'GOOGLE_TRENDS_SIGNAL',
      timestamp: new Date().toISOString(),
      popularity_score: item.score,
      geo,
      related_queries: [],
      raw_metadata: { fallback: true },
    }));
  }
}
