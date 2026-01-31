export interface HistoricalEvent {
  year: string;
  title: string;
  description: string;
  significance: string;
}

export interface HistoricalAnalysis {
  summary: string;
  historicalEvents: HistoricalEvent[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  region: string;
  priority: "緊急" | "重要" | "通常";
  time: string;
  relatedHistory: HistoricalEvent[];
  historicalSummary?: string;
  tags: string[];
  link?: string;
  source?: string;
}

export interface RSSFeedConfig {
  name: string;
  url: string;
  region: string;
}

export interface RawRSSItem {
  title?: string;
  contentSnippet?: string;
  content?: string;
  link?: string;
  pubDate?: string;
  categories?: string[];
}
